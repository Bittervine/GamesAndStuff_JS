export const STORY_READING_START_DELAY_SECONDS = 0.5;
export const STORY_READING_CHARACTERS_PER_SECOND = 18;

export function storyCharacterCount(text) {
    return Array.from(String(text || "")).length;
}

export function storyReadingDuration(text, charactersPerSecond = STORY_READING_CHARACTERS_PER_SECOND) {
    const safeRate = Math.max(0.1, Number(charactersPerSecond) || STORY_READING_CHARACTERS_PER_SECOND);
    return STORY_READING_START_DELAY_SECONDS + storyCharacterCount(text) / safeRate;
}
