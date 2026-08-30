# Experimental Electron DevTool

This is a separate Electron host for the HTML development tools. It is not
part of the normal WebView2 `IgnatiusDevTool.exe` build.

Build the native Release targets first, then from this directory run:

```text
build.bat dir
```

The unpacked output is written under `dist/win-unpacked/`. The package keeps
the same portable runtime layout as the native tools:

```text
IgnatiusDevTool.exe
IgnatiusSDL.exe
SDL*.dll
content/
    resources/
    src/
    level-editor.html
    ...
```

Without an override, both Electron applications use the exact executable-
adjacent `content/resources` folder. An explicit override is accepted in both
forms below and is passed through to native SDL playtests:

```text
IgnatiusDevTool.exe --resources-root "D:\\Ignatius\\resources"
"Ignatius Rocketfrock.exe" --resources-root="D:\\Ignatius\\resources"
```

The selected project root is read and written through the Electron main
process. The renderer receives only the narrow project-message bridge; Node
integration remains disabled and the renderer remains sandboxed.
