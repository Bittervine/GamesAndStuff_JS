export function createCharacterDirtyTracker() {
    return {
        character: false,
        atlas: false,
        rig: false,
        enemyCatalog: false,
        animations: new Set()
    };
}

export function markCharacterProjectDirty(tracker, kind, key = null) {
    if (!tracker) {
        return;
    }
    if (kind === "animation") {
        if (key) {
            tracker.animations.add(String(key));
        }
        return;
    }
    if (kind === "character" || kind === "atlas" || kind === "rig" || kind === "enemyCatalog") {
        tracker[kind] = true;
    }
}

export function markCharacterProjectClean(tracker, kind = null, key = null) {
    if (!tracker) {
        return;
    }
    if (!kind) {
        tracker.character = false;
        tracker.atlas = false;
        tracker.rig = false;
        tracker.enemyCatalog = false;
        tracker.animations.clear();
        return;
    }
    if (kind === "animation") {
        if (key) {
            tracker.animations.delete(String(key));
        } else {
            tracker.animations.clear();
        }
        return;
    }
    if (kind === "character" || kind === "atlas" || kind === "rig" || kind === "enemyCatalog") {
        tracker[kind] = false;
    }
}

export function characterProjectHasUnsavedChanges(tracker) {
    return Boolean(tracker?.character || tracker?.atlas || tracker?.rig || tracker?.enemyCatalog || tracker?.animations?.size);
}

export function characterProjectDirtySummary(tracker) {
    const animations = [...(tracker?.animations || [])].sort();
    return {
        character: Boolean(tracker?.character),
        atlas: Boolean(tracker?.atlas),
        rig: Boolean(tracker?.rig),
        enemyCatalog: Boolean(tracker?.enemyCatalog),
        animations,
        any: Boolean(tracker?.character || tracker?.atlas || tracker?.rig || tracker?.enemyCatalog || animations.length)
    };
}
