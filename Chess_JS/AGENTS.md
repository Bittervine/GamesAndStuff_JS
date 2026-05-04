# Chess_JS Agent Notes

- Keep this project compatible with Kindle Paperwhite ebook readers.
- Avoid modern browser features unless they are already known to work on Kindle Paperwhite.
- Prefer conservative, widely supported JavaScript and DOM APIs.
- Do not rely on features like `Promise`, `async`/`await`, `IntersectionObserver`, `ResizeObserver`, `requestIdleCallback`, or similar modern-only browser APIs unless there is a strong compatibility check and fallback.
- Prefer simple timers, plain event handlers, and direct DOM updates over newer abstractions.
- If a change might reduce Kindle compatibility, stop and confirm before implementing it.
