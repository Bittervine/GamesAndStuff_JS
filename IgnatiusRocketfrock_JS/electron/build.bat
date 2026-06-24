@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

set "NODE_PORTABLE=C:\Portable\NodeJS"
if exist "%NODE_PORTABLE%\npm.cmd" (
  set "NPM_CMD=%NODE_PORTABLE%\npm.cmd"
  set "PATH=%NODE_PORTABLE%;%PATH%"
) else (
  where npm.cmd >nul 2>nul
  if errorlevel 1 (
    echo ERROR: npm was not found. Install Node.js or update NODE_PORTABLE in this file.
    exit /b 1
  )
  for /f "delims=" %%N in ('where npm.cmd') do if not defined NPM_CMD set "NPM_CMD=%%N"
)

if not exist "node_modules\.bin\electron-builder.cmd" (
  echo Installing Electron build dependencies...
  call "%NPM_CMD%" install
  if errorlevel 1 exit /b %ERRORLEVEL%
)

if /I "%~1"=="dir" (
  call "%NPM_CMD%" run build:win-dir
) else (
  call "%NPM_CMD%" run build:win-portable
)
if errorlevel 1 exit /b %ERRORLEVEL%

exit /b 0
