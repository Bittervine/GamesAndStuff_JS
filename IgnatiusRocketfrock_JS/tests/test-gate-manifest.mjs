// Stable test ownership and fresh-process shard topology. Keep names explicit so new tests cannot silently drift into a default gate.
export const TEST_SHARDS = Object.freeze({
    "shared-1": Object.freeze([
            "source organization and architecture map",
            "CSS shadow effects remain extinct across every shipped interface",
            "game settings persistence and menu shell",
            "OGG level music system",
            "fullscreen Electron bridge contract",
            "buffered gameplay edges survive render-only frames",
            "left and right Ctrl weapon binding",
            "gamepad triggers fire weapon",
            "keyboard interaction binding",
            "gamepad jump starts title screen",
            "gamepad haptics follow active input device",
            "timed story text layout",
            "responsive viewport scaling",
            "thought bubble tail and responsive typography",
            "selective level colour map"
    ]),
    "shared-2": Object.freeze([
            "thin platform atlas collision policy",
            "cave full-black lethal boundary",
            "Canvas world-visual performance infrastructure",
            "interactive item atlas and entity visuals",
            "cached wrench rocket glow kernels",
            "ground shadows use physical foot anchors and grounded fades",
            "unified enemy scaling",
            "state serialization and cloning",
            "rocket projectile renderer exists",
            "wizard atlas includes dedicated projectile rocket",
            "enemy projectile impact fx remain economical",
            "enemy projectile player hit carries small wizard accent flag",
            "enemy projectile visual language renderer contract"
    ]),
    "editor-1": Object.freeze([
            "level editor dense stress fixture",
            "Puppet Guide debug overlay",
            "closed cave-window spline authoring",
            "moving-platform schema and Level Editor",
            "level placement copy and cutout backing",
            "level placement transforms",
            "editor level transform runtime",
            "player start snaps to nearby ground",
            "editor dropdown contrast",
            "editor collapsible inspector panels",
            "Level Editor multi-selection and all-atlas palette"
    ]),
    "editor-2": Object.freeze([
            "enemy catalog and Level Editor integration",
            "character project workspace",
            "character atlas editor operations",
            "numbered enemy_001 authored assets",
            "character project dirty tracking",
            "character tool direct transform geometry",
            "character parent pivot constraints",
            "character MP4 motion reference",
            "character part Color Exchange",
            "data-driven wizard run animation",
            "animation editor keyframe operations",
            "frame-based animation editor workflow",
            "animation easing modes"
    ]),
    "game-1": Object.freeze([
            "temporary melee and ranged enemy tuning multipliers",
            "difficulty scales only incoming damage",
            "rendering quality scales rocket particles",
            "rocket turns fifty percent sharper",
            "boss defeat signal and iron gate",
            "living boss locks ordinary exit doors",
            "level_t02 goblin boss arena contract",
            "automatic shuttle moving platform",
            "moving-platform crush requires nearest blocked exit for three ticks",
            "two-tick crush recovery emits diagnostics",
            "moving-platform crush particles respawn cleanly",
            "rider-triggered moving platform",
            "enemy rider triggers and follows moving platform",
            "hunter plans moving-platform ride",
            "signal-triggered moving platform",
            "keyhole consumes key and triggers platform",
            "vanishing moving platforms always recover",
            "Score HUD and treasure chest collection",
            "Overdrive, Shield, and wrench power-up arsenal",
            "scripted mailbox letter",
            "one-shot location thought trigger",
            "scripted portal entrance",
            "scripted portal exit",
            "scale-aware pixmap pyramid",
            "generic runtime character project",
            "goblin runtime character projects",
            "bat frame-swap projects and flying locomotion",
            "flying bomber drops projectile",
            "bombing bat drops only with plausible clear hit",
            "flying bomber uses curved approach"
    ]),
    "game-2": Object.freeze([
            "flying bomber leaves perch platform",
            "flying bomber notices wizard below and ahead",
            "automatic enemy spawning",
            "placeable on-screen enemy spawner",
            "enemy navigation graph and jump reachability",
            "enemy navigation across overlapping solid floors",
            "baked navigation graph directional transitions",
            "navigation maze detour route",
            "hunter enemy jump and attack positioning",
            "hunter deliberate drop traversal",
            "hunter ranged attack-position selection",
            "level_t01 baked hunter navigation graphs",
            "hunter crosses and descends level_t01 central pillar",
            "engaged hunter immediately leaves pillar for last seen player",
            "hunter walks off level_t01 left ledge",
            "human hunter escapes level_t01 left ledge",
            "hunter climbs level_t01 pillar from the left",
            "hunter jumps onto level_t01 arch",
            "Skeleton Caster pursues onto level_t01 ruin",
            "hunter obstacle-clear jump run-up",
            "hunter reverse jump backs away for run-up",
            "hunter drop uses ordinary collision geometry",
            "hunter walk-off drop clears source pillar",
            "hunter crosses sloped blockable arch and drops",
            "hunter awareness is consistent behind occluders",
            "monster awareness uses distance and facing cone",
            "hunter investigates last seen position before glare",
            "zero health starts death lifecycle and disables targeting",
            "hunter reachable firing fallback"
    ]),
    "game-3": Object.freeze([
            "hunter enemy stranded fallback",
            "simulation-owned character enemy patrol",
            "ground enemies pass beneath one-way platforms",
            "ground enemies cannot drop through one-way platforms",
            "hunters do not jump-loop on one-way platforms",
            "player can drop through one-way platforms",
            "ground enemies walk up small steps",
            "character enemy aggressive chase and combo",
            "rebalanced enemy health and standard rocket hit counts",
            "character enemy rocket combat",
            "airborne enemy defers death until landing",
            "enemy contact damage uses independent invulnerability",
            "character enemy melee attack",
            "terrain shields player from enemy melee",
            "fireball goblin projectile attack",
            "tri-fireball goblin uses any clear volley trajectory",
            "human knife thrower releases three dagger projectiles",
            "ranged enemies fire beyond preferred attack range",
            "ranged enemies require clear projectile lane",
            "ranged shot lane revalidated at release",
            "musket goblin projectile attack",
            "player zero-health spark death animation",
            "player damage invulnerability",
            "damaging and killable surface hazards",
            "terrain intercepts rocket before enemy",
            "breakable crate reactive object",
            "destructible barrier reactive object",
            "headless stepping and floor collision",
            "left/right movement symmetry",
            "jump transition",
            "exact gravity-derived ordinary jump height",
            "down doubles gravity during ascent and descent",
            "attached boost and fuel drain",
            "double-jump kick and hover governor"
    ]),
    "game-4": Object.freeze([
            "boost kick cannot be tap exploited",
            "boost kick costs fuel and recharges on landing",
            "homing rocket launch",
            "rocket initial turn clears jump-height platform",
            "standard rocket one-HP secondary splash",
            "rocket target prioritizes facing direction",
            "rocket target prioritizes line of sight",
            "rocket trail tracks curved path and persists",
            "attached boost smoke and visual power",
            "attached smoke down speed tuning",
            "fall damage ignores normal double-jump height",
            "fall damage uses excess kinetic energy",
            "fuel recharge delay, ground requirement and cap",
            "fuel recharge latch after grounded start",
            "Phase 1.015 tuning defaults, debug pose blending and fuel bulb flash",
            "single jump press is not reused across catch-up substeps",
            "air boost requires release after ground jump",
            "downward camera lead",
            "wall collision",
            "automatic small-step traversal",
            "closed atlas loop creates collision area",
            "collision area rejects shallow corner entry",
            "collision area pushes embedded player to nearest side",
            "rocket impacts atlas collision lines and areas",
            "weapon launch uses dedicated projectile rocket frame",
            "rocket launch ignores unrelated atlas areas",
            "manual reset"
    ]),
    "generator-foundation": Object.freeze([
            "Atlas 004 long platforms and collision manifest",
            "automatic level generator route foundation",
            "automatic level generator variant compatibility",
            "automatic level generator playable empty cavern",
            "generated moving-platform rider clearance"
    ]),
    "generator-macro": Object.freeze([
            "macro rooms, grounded doors, and guaranteed perimeter"
    ]),
    "generator-content": Object.freeze([
            "automatic level generator encounters",
            "generated reward spacing targets",
            "automatic level generator rewards",
            "automatic level generator editor refinement",
            "automatic perimeter population and spatial culling"
    ]),
    "generator-macro-sweep": Object.freeze([
            "macro room seed sweep"
    ]),
    "smoke": Object.freeze([
            "source organization and architecture map",
            "buffered gameplay edges survive render-only frames",
            "level editor dense stress fixture",
            "editor level transform runtime",
            "Level Editor multi-selection and all-atlas palette",
            "state serialization and cloning",
            "headless stepping and floor collision",
            "manual reset"
    ])
});

export const TEST_GATE_SHARDS = Object.freeze({
    "shared": Object.freeze(["shared-1", "shared-2"]),
    "editor": Object.freeze(["editor-1", "editor-2"]),
    "game": Object.freeze(["game-1", "game-2", "game-3", "game-4"]),
    "generator": Object.freeze(["generator-foundation", "generator-macro", "generator-content", "generator-macro-sweep"]),
    "smoke": Object.freeze(["smoke"]),
    "fast": Object.freeze(["shared-1", "shared-2", "editor-1", "editor-2", "game-1", "game-2", "game-3", "game-4"]),
    "release": Object.freeze(["shared-1", "shared-2", "editor-1", "editor-2", "game-1", "game-2", "game-3", "game-4", "generator-foundation", "generator-macro", "generator-content", "generator-macro-sweep"]),
});

export const PRIMARY_TEST_SHARDS = Object.freeze(TEST_GATE_SHARDS.release);

const shardSets = new Map(Object.entries(TEST_SHARDS).map(([name, tests]) => [name, new Set(tests)]));

export function testNameInGroup(name, group = "all") {
    const normalizedGroup = String(group || "all").trim().toLowerCase();
    if (normalizedGroup === "all") return true;
    const directShard = shardSets.get(normalizedGroup);
    if (directShard) return directShard.has(name);
    const shards = TEST_GATE_SHARDS[normalizedGroup];
    if (!shards) throw new Error(`Unknown test group: ${group}`);
    return shards.some((shard) => shardSets.get(shard)?.has(name));
}

export function validateTestGateManifest(testNames) {
    const known = new Set(testNames);
    const primaryOwners = new Map();
    for (const shard of PRIMARY_TEST_SHARDS) {
        for (const name of TEST_SHARDS[shard] || []) {
            if (!known.has(name)) throw new Error(`Test manifest references missing test: ${name}`);
            const owners = primaryOwners.get(name) || [];
            owners.push(shard);
            primaryOwners.set(name, owners);
        }
    }
    const missing = testNames.filter((name) => !primaryOwners.has(name));
    const duplicate = [...primaryOwners.entries()].filter(([, owners]) => owners.length !== 1);
    if (missing.length) throw new Error(`Tests missing primary shard ownership: ${missing.join(", ")}`);
    if (duplicate.length) throw new Error(`Tests with duplicate primary shard ownership: ${duplicate.map(([name, owners]) => `${name} [${owners.join(", ")}]`).join("; ")}`);
    for (const name of TEST_SHARDS.smoke) {
        if (!known.has(name)) throw new Error(`Smoke manifest references missing test: ${name}`);
    }
    return true;
}
