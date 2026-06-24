# Electron shell

Revision 151 keeps a deliberately small Electron host around the authoritative browser game. The packaged host is fullscreen-only: it launches directly in fullscreen, hides the browser-only automatic fullscreen preference, and presents EXIT rather than a windowed-mode toggle. The pause menu also exposes **Exit to desktop**.

Install Electron as a development dependency in a working checkout, then run:

```text
npm install --save-dev electron
npm run electron
```

`electron/main.cjs` serves the project through the privileged local `ignatius://app/` scheme so ES modules, JSON fetches, images, and relative links work without disabling web security. It opens `game.html` with `contextIsolation`, sandboxing, and Node integration disabled. `electron/preload.cjs` exposes only these operations:

- `quit()`
- `getFullscreen()`
- `setFullscreen(enabled)` as a compatibility operation that can only restore fullscreen
- `onFullscreenChanged(listener)`

The in-game menu hides **Exit to desktop** in an ordinary browser and reveals it only when that bridge is present. No gameplay or renderer module imports Electron.

A later packaging step may adopt Electron Forge or another packager, add platform icons, and produce installers. That choice is intentionally not baked into the game yet.
