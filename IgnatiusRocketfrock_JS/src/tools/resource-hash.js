function isArrayBuffer(value) {
    return value instanceof ArrayBuffer || Object.prototype.toString.call(value) === "[object ArrayBuffer]";
}

async function digestBytes(input) {
    if (typeof input === "string") return new TextEncoder().encode(input);

    if (ArrayBuffer.isView(input)) {
        const source = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
        return Uint8Array.from(source);
    }

    if (isArrayBuffer(input)) return Uint8Array.from(new Uint8Array(input));

    if (input && typeof input.arrayBuffer === "function") {
        return await digestBytes(await input.arrayBuffer());
    }

    throw new TypeError("SHA-256 input must be a string, Blob/File, ArrayBuffer, or ArrayBuffer view.");
}

export async function sha256Hex(input) {
    const bytes = await digestBytes(input);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
