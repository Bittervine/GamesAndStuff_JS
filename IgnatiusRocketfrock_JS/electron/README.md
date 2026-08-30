# Electron shell

Revision 151 keeps a deliberately small Electron host around the authoritative browser game. The packaged host is fullscreen-only: it launches directly in fullscreen, hides the browser-only automatic fullscreen preference, and presents EXIT rather than a windowed-mode toggle. The pause menu also exposes **Exit to desktop**.

Install Electron as a development dependency in this directory, then run:

```text
cd electron
npm install
npm run electron
```

`electron/main.cjs` serves the project through the privileged local `ignatius://app/` scheme so ES modules, JSON fetches, images, and relative links work without disabling web security. It opens `game.html` with `contextIsolation`, sandboxing, and Node integration disabled. Electron prefers the WebGL2 renderer by default, while ordinary browser launches continue to default to Canvas 2D. An explicit `webgl=0` URL value can still force the fallback renderer for diagnosis. `electron/preload.cjs` exposes only these operations:

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

The packaged app keeps the browser code and runtime content in an
executable-adjacent `content/` directory. Its default resources are therefore
`content/resources/`, matching the native SDL executable. The same root can be
replaced explicitly at launch with `--resources-root <folder>` or
`--resources-root=<folder>`. Generated folders (`node_modules/`, `.build/`, and
`dist/`) are intentionally ignored by git.

The Electron game does not search the working directory or source checkout for
resources. A missing default or override root is reported as a visible startup
error.

Revision 489 keeps this portable build compatible with electron-builder 26.15.x by using `win.signExecutable: false` in the generated staging manifest. That disables Windows code signing for local unsigned builds while keeping executable resource editing enabled for the shared favicon and app metadata.
