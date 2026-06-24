# Electron shell

Revision 151 keeps a deliberately small Electron host around the authoritative browser game. The packaged host is fullscreen-only: it launches directly in fullscreen, hides the browser-only automatic fullscreen preference, and presents EXIT rather than a windowed-mode toggle. The pause menu also exposes **Exit to desktop**.

Install Electron as a development dependency in this directory, then run:

```text
cd electron
npm install
npm run electron
```

`electron/main.cjs` serves the project through the privileged local `ignatius://app/` scheme so ES modules, JSON fetches, images, and relative links work without disabling web security. It opens `game.html` with `contextIsolation`, sandboxing, and Node integration disabled. `electron/preload.cjs` exposes only these operations:

- `quit()`
- `getFullscreen()`
- `setFullscreen(enabled)` as a compatibility operation that can only restore fullscreen
- `onFullscreenChanged(listener)`

The in-game menu hides **Exit to desktop** in an ordinary browser and reveals it only when that bridge is present. No gameplay or renderer module imports Electron.

## Portable build

All Electron-specific project files live in this directory. The build script stages the browser game into `electron/.build/app`, packages that staged app with `electron-builder`, and writes the result to `electron/dist`.

From Windows:

```text
cd electron
build.bat
```

`build.bat` uses `C:\Portable\NodeJS\npm.cmd` when it exists, otherwise it falls back to `npm.cmd` on `PATH`. It installs this directory's development dependencies if `electron-builder` is missing.

Outputs:

- `electron/dist/*portable.exe` for the default portable build.
- `electron/dist/win-unpacked/` when running `build.bat dir` for an unpacked smoke build.

The staged app includes only runtime game files: `game.html`, `assets/`, `src/`, `main.cjs`, `preload.cjs`, and a generated package manifest. Generated folders (`node_modules/`, `.build/`, and `dist/`) are intentionally ignored by git.
