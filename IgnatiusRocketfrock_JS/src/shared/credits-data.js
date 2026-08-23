export const CREDITS_RESOURCE_PATH = "ui/credits.md";
export const CREDITS_DESTINATION_LEVEL = "credits";
export const CREDITS_SCROLL_PIXELS_PER_SECOND = 44;

export function isCreditsDestinationLevel(value) {
    return String(value ?? "").trim().toLowerCase() === CREDITS_DESTINATION_LEVEL;
}

export function parseCreditsMarkdown(markdown) {
    return String(markdown ?? "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((sourceLine) => {
            const line = sourceLine.trim();
            if (!line) return Object.freeze({ type: "spacer", text: "" });
            if (line.startsWith("# ")) {
                return Object.freeze({ type: "heading", text: line.slice(2).trim() });
            }
            return Object.freeze({ type: "row", text: line });
        });
}
