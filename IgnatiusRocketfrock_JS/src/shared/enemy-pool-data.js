function enemyNumber(id) {
    const match = /(\d+)$/.exec(String(id));
    return match ? Number(match[1]) : NaN;
}

function rangeListIncludes(ranges, value) {
    return ranges.some(([start, end]) => value >= start && value <= end);
}

export function parseEnemySelection(expression, availableEnemyIds = []) {
    const source = String(expression ?? "").trim();
    const available = [...new Set((availableEnemyIds || []).map((id) => String(id)).filter(Boolean))]
        .map((id) => ({ id, number: enemyNumber(id) }))
        .filter((entry) => Number.isInteger(entry.number) && entry.number >= 0)
        .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
    const errors = [];
    if (!source) {
        return { valid: false, expression: source, resolvedIds: [], errors: ["Enter at least one enemy number or range."] };
    }

    const includeRanges = [];
    const excludeRanges = [];
    for (const rawToken of source.split(",")) {
        const token = rawToken.trim();
        if (!token) {
            errors.push("Empty enemy-selection token.");
            continue;
        }
        const excluded = token.startsWith("!");
        const body = excluded ? token.slice(1).trim() : token;
        const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(body);
        if (!match) {
            errors.push(`Invalid enemy token “${token}”.`);
            continue;
        }
        const start = Number(match[1]);
        const end = match[2] === undefined ? start : Number(match[2]);
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < 0) {
            errors.push(`Enemy token “${token}” is outside the supported range.`);
            continue;
        }
        if (start > end) {
            errors.push(`Enemy range “${token}” runs backwards.`);
            continue;
        }
        (excluded ? excludeRanges : includeRanges).push([start, end]);
    }

    if (!includeRanges.length && !errors.length) {
        includeRanges.push([0, Number.MAX_SAFE_INTEGER]);
    }
    const resolvedIds = available
        .filter((entry) => rangeListIncludes(includeRanges, entry.number) && !rangeListIncludes(excludeRanges, entry.number))
        .map((entry) => entry.id);
    return {
        valid: errors.length === 0,
        expression: source,
        resolvedIds,
        errors
    };
}
