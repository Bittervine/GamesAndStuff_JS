import { CHARACTER_SOUND_SLOTS, normalizeCharacterSounds } from "../shared/character-sound-data.js";

const EVENT_EFFECTS = Object.freeze({
    EDITOR_LEVEL_APPLIED: "levelStart",
    LEVEL_TRANSITION_REQUESTED: "levelExit",
    PLAYER_DAMAGED: "playerDamage",
    PLAYER_JUMPED: "playerJumping",
    PLAYER_LANDED: "playerLanding",
    PLAYER_FALL_DAMAGE: "playerLandingDamage",
    PLAYER_DEFEATED: "wizardDeath",
    PLAYER_DEATH_ANIMATION_STARTED: "wizardDeath",
    LEVER_SWITCH_TOGGLED: "trigger",
    KEYHOLE_UNLOCKED: "trigger",
    PROXIMITY_SIGNAL_TRIGGERED: "trigger",
    SIGNAL_CHANNEL_EMITTED: "trigger",
    PORTAL_OPENED: "portalOpen",
    PORTAL_EXIT_OPENED: "portalOpen",
    REACTIVE_OBJECT_STATE_CHANGED: "reactiveObject",
    PLAYER_QUESTION_MARK_TRIGGERED: "playerQuestionMark",
    PLAYER_EXCLAMATION_MARK_TRIGGERED: "playerExclamationMark",
    ROCKET_LAUNCHED: "rocketLaunch",
    ROCKET_SEQUENCE_SHOT_LAUNCHED: "rocketLaunch",
    ROCKET_IMPACTED: "rocketExplosion",
    POWER_UP_PICKUP_COLLECTED: "pickupChime",
    SCORE_PICKUP_COLLECTED: "pickupChime",
    ITEM_PICKUP_COLLECTED: "pickupChime",
    PLAYER_UPGRADE_COLLECTED: "permanentUpgradePickup",
    TREASURE_CHEST_COLLECTED: "pickupChime",
    CHECKPOINT_ACTIVATED: "checkpointChime"
});

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

function normalizeFileReference(value) {
    return String(value || "").trim().replace(/\\/g, "/");
}

function rocketLifetimeExplosionIsOffscreen(event, state) {
    if (event?.type !== "ROCKET_IMPACTED" || event?.reason !== "lifetime") return false;
    const x = Number(event.x);
    const y = Number(event.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const camera = state?.camera;
    if (!camera || typeof camera !== "object") return false;
    const width = Math.max(1, Number(camera.viewportWidth) || 1280);
    const height = Math.max(1, Number(camera.viewportHeight) || 720);
    const centerX = Number(camera.currentTransform?.x);
    const centerY = Number(camera.currentTransform?.y);
    if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) return false;
    const left = centerX - width * 0.5;
    const top = centerY - height * 0.56;
    return x < left || x > left + width || y < top || y > top + height;
}

function selectedEffectsForTick(events, resolveCharacterEffect, state) {
    const result = [];
    const emitted = new Set();
    for (const event of events) {
        if (!event) continue;
        if (rocketLifetimeExplosionIsOffscreen(event, state)) continue;
        const effectId = EVENT_EFFECTS[event.type] || resolveCharacterEffect(event);
        if (!effectId || emitted.has(effectId)) continue;
        emitted.add(effectId);
        result.push(effectId);
    }
    return result;
}

export function createSoundEffectsDirector({ baseUrl = "resources/", volume = 0.8, audioElementFactory = () => new Audio() } = {}) {
    let masterVolume = clamp01(volume);
    let muted = false;
    let unlocked = false;
    let disposed = false;
    let catalog = { effects: {} };
    let characterSounds = new Map();
    let characterEffects = new Map();
    let dynamicEffects = new Map();
    const pools = new Map();
    const pendingEffects = new Set();
    let processedEvents = new WeakSet();

    function resolvedBaseUrl() {
        const documentBase = globalThis.document?.baseURI || globalThis.location?.href || "http://localhost/";
        return new URL(baseUrl, documentBase);
    }

    function voiceGain(pool) {
        const envelope = pool.definition.loop ? pool.loopEnvelope : 1;
        return muted ? 0 : clamp01(masterVolume * clamp01(pool.definition.volume ?? 1) * envelope);
    }

    function rebuildCharacterEffects() {
        characterEffects = new Map();
        dynamicEffects = new Map();
        const catalogEffectByFile = new Map();
        for (const [id, definition] of Object.entries(catalog.effects || {})) {
            const file = normalizeFileReference(definition?.file);
            if (file && !catalogEffectByFile.has(file)) catalogEffectByFile.set(file, id);
        }
        for (const [characterId, sounds] of characterSounds) {
            for (const slot of CHARACTER_SOUND_SLOTS) {
                const file = normalizeFileReference(sounds?.[slot]);
                if (!file) continue;
                let effectId = catalogEffectByFile.get(file);
                if (!effectId) {
                    effectId = `characterSound:${file}`;
                    if (!dynamicEffects.has(effectId)) {
                        dynamicEffects.set(effectId, { file, volume: 0.55, maxInstances: 6 });
                    }
                }
                characterEffects.set(`${characterId}:${slot}`, effectId);
            }
        }
    }

    function destroyPool(pool) {
        for (const voice of pool?.voices || []) {
            voice.pause?.();
            voice.removeAttribute?.("src");
        }
    }

    function createPool(definition) {
        const count = Math.max(1, Math.min(8, Math.floor(Number(definition.maxInstances) || 1)));
        const voices = [];
        for (let index = 0; index < count; index += 1) {
            const voice = audioElementFactory();
            if (!voice) continue;
            voice.preload = "auto";
            voice.loop = definition.loop === true;
            voice.src = new URL(normalizeFileReference(definition.file), resolvedBaseUrl()).href;
            voices.push(voice);
        }
        const pool = { definition, voices, nextVoice: 0, loopEnvelope: 0, loopTarget: false };
        for (const voice of voices) voice.volume = voiceGain(pool);
        return pool;
    }

    function rebuildPools() {
        for (const pool of pools.values()) destroyPool(pool);
        pools.clear();
        const definitions = new Map(Object.entries(catalog.effects || {}));
        for (const [id, definition] of dynamicEffects) definitions.set(id, definition);
        for (const [id, definition] of definitions) pools.set(id, createPool(definition));
    }

    function rebuildDynamicPools() {
        for (const [id, pool] of [...pools]) {
            if (!id.startsWith("characterSound:") || dynamicEffects.has(id)) continue;
            destroyPool(pool);
            pools.delete(id);
        }
        for (const [id, definition] of dynamicEffects) {
            if (!pools.has(id)) pools.set(id, createPool(definition));
        }
    }

    function setCatalog(nextCatalog) {
        catalog = nextCatalog && typeof nextCatalog === "object" ? nextCatalog : { effects: {} };
        rebuildCharacterEffects();
        rebuildPools();
    }

    function setCharacterSounds(entries) {
        const next = new Map();
        const source = entries instanceof Map
            ? entries.entries()
            : Array.isArray(entries)
                ? entries.map((entry) => [entry?.characterId, entry?.sounds])
                : Object.entries(entries || {});
        for (const [characterIdValue, soundsValue] of source) {
            const characterId = String(characterIdValue || "").trim();
            if (!characterId) continue;
            next.set(characterId, normalizeCharacterSounds(soundsValue));
        }
        characterSounds = next;
        rebuildCharacterEffects();
        rebuildDynamicPools();
    }

    function resolveCharacterEffect(event) {
        const slot = (event?.type === "ENEMY_ATTACK_STARTED" && event?.attackMode !== "projectile")
            || event?.type === "ENEMY_PROJECTILE_FIRED"
            || event?.type === "ENEMY_PROJECTILE_LAUNCHED"
            ? "attack"
            : event?.type === "ENEMY_DAMAGED"
                ? "hurt"
                : event?.type === "ENEMY_DEFEATED"
                    ? "death"
                    : "";
        if (!slot) return "";
        const characterId = String(event?.characterId || "").trim();
        return characterEffects.get(`${characterId}:${slot}`) || "";
    }

    async function load(url = new URL("sfx/sound-effects.json", resolvedBaseUrl()).href) {
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Unable to load sound effects: ${response.status}`);
        setCatalog(await response.json());
        return catalog;
    }

    function updateVoiceVolumes() {
        for (const pool of pools.values()) {
            const gain = voiceGain(pool);
            for (const voice of pool.voices) voice.volume = gain;
        }
    }

    function flushPendingEffects() {
        if (!unlocked || disposed || muted || masterVolume <= 0 || pendingEffects.size <= 0) return;
        const queued = [...pendingEffects];
        pendingEffects.clear();
        for (const effectId of queued) play(effectId);
    }

    function play(effectId) {
        if (disposed || muted || masterVolume <= 0) return false;
        const pool = pools.get(effectId);
        if (!pool?.voices.length || pool.definition.loop) return false;
        let voice = pool.voices.find((candidate) => candidate.paused || candidate.ended);
        if (!voice) {
            voice = pool.voices[pool.nextVoice % pool.voices.length];
            pool.nextVoice = (pool.nextVoice + 1) % pool.voices.length;
        }
        voice.volume = voiceGain(pool);
        try { voice.currentTime = 0; } catch {}
        try {
            void Promise.resolve(voice.play?.()).then(() => {
                const wasUnlocked = unlocked;
                unlocked = true;
                if (!wasUnlocked) flushPendingEffects();
            }).catch(() => {
                // A one-shot can be emitted during the same gesture that is still
                // unlocking browser audio. Keep one pending cue per effect so the
                // event is not permanently lost when that first play is blocked.
                if (!unlocked) pendingEffects.add(effectId);
            });
        } catch {
            if (!unlocked) pendingEffects.add(effectId);
            return false;
        }
        return true;
    }

    function processEvents(events, state = null) {
        const fresh = [];
        for (const event of events || []) {
            if (!event || processedEvents.has(event)) continue;
            processedEvents.add(event);
            fresh.push(event);
        }
        const byTick = new Map();
        for (const event of fresh) {
            const key = Number.isFinite(Number(event.tick)) ? Number(event.tick) : -1;
            if (!byTick.has(key)) byTick.set(key, []);
            byTick.get(key).push(event);
        }
        for (const tickEvents of byTick.values()) {
            for (const effectId of selectedEffectsForTick(tickEvents, resolveCharacterEffect, state)) play(effectId);
        }
    }

    function setLoopTarget(effectId, active) {
        const pool = pools.get(effectId);
        if (!pool?.definition.loop || !pool.voices.length) return;
        pool.loopTarget = Boolean(active);
        const voice = pool.voices[0];
        if (pool.loopTarget && (voice.paused || voice.ended)) {
            try { voice.currentTime = 0; } catch {}
            voice.volume = voiceGain(pool);
            void Promise.resolve(voice.play?.()).then(() => { unlocked = true; }).catch(() => {});
        }
    }

    function processState(state, dt = 1 / 60) {
        const story = state?.story?.mailboxEvent;
        setLoopTarget("playerReading", Boolean(story?.active && story.phase === "letter"));
        setLoopTarget("playerThinking", Boolean(story?.active && story.phase === "thought"));
        setLoopTarget("rocketBoost", Boolean(state?.equipment?.rocket?.attachedBoosting));
        const safeDt = Math.max(0, Math.min(0.25, Number(dt) || 0));
        for (const pool of pools.values()) {
            if (!pool.definition.loop || !pool.voices.length) continue;
            const target = pool.loopTarget ? 1 : 0;
            const fadeSeconds = Math.max(0.01, Number(
                target > pool.loopEnvelope
                    ? (pool.definition.fadeInSeconds ?? pool.definition.fadeSeconds)
                    : (pool.definition.fadeOutSeconds ?? pool.definition.fadeSeconds)
            ) || 0.2);
            const step = safeDt / fadeSeconds;
            pool.loopEnvelope = target > pool.loopEnvelope
                ? Math.min(target, pool.loopEnvelope + step)
                : Math.max(target, pool.loopEnvelope - step);
            const voice = pool.voices[0];
            voice.volume = voiceGain(pool);
            if (!pool.loopTarget && pool.loopEnvelope <= 0.0001 && !voice.paused) {
                voice.pause?.();
                try { voice.currentTime = 0; } catch {}
            }
        }
    }

    async function unlock() {
        if (unlocked || disposed) return unlocked;
        const first = [...pools.values()].find((pool) => pool.voices.length)?.voices[0];
        if (!first) return false;
        const previousVolume = first.volume;
        first.volume = 0;
        try {
            await first.play?.();
            first.pause?.();
            first.currentTime = 0;
            unlocked = true;
            flushPendingEffects();
        } catch {}
        first.volume = previousVolume;
        return unlocked;
    }

    return {
        load,
        setCatalog,
        setCharacterSounds,
        play,
        processEvents,
        processState,
        unlock,
        reset() {
            processedEvents = new WeakSet();
            pendingEffects.clear();
        },
        setVolume(value) { masterVolume = clamp01(value); updateVoiceVolumes(); },
        setMuted(value) { muted = Boolean(value); updateVoiceVolumes(); },
        isUnlocked() { return unlocked; },
        dispose() {
            disposed = true;
            pendingEffects.clear();
            catalog = { effects: {} };
            characterSounds = new Map();
            rebuildCharacterEffects();
            rebuildPools();
        }
    };
}
