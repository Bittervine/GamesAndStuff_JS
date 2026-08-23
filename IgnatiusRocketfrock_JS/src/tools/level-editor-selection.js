export function nextOverlappingHit(hits, selectedId = "") {
    const stack = Array.isArray(hits)
        ? hits.filter((hit) => hit && typeof hit === "object" && String(hit.id || ""))
        : [];
    if (!stack.length) return null;
    const currentIndex = stack.findIndex((hit) => String(hit.id) === String(selectedId || ""));
    return stack[currentIndex >= 0 ? (currentIndex + 1) % stack.length : 0] || null;
}
