@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

if not exist "package.json" (
  echo ERROR: package.json was not found. Run this file from the IgnatiusRocketfrock_JS project root.
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Install Node.js, then run this file again.
  exit /b 1
)

if not exist ".build" mkdir ".build"
set "LOG=.build\full-test-output.txt"

set "TEST_COMMAND=npm test"
if /I "%~1"=="resume" set "TEST_COMMAND=npm run test:release:resume"

> "%LOG%" echo Ignatius Rocketfrock full test run
>> "%LOG%" echo Command: %TEST_COMMAND%
>> "%LOG%" echo Started: %DATE% %TIME%
>> "%LOG%" echo.

echo Running %TEST_COMMAND%
echo Writing complete output to %LOG%
echo.

cmd /d /s /c "%TEST_COMMAND%" >> "%LOG%" 2>&1
set "RESULT=%ERRORLEVEL%"

>> "%LOG%" echo.
>> "%LOG%" echo Finished: %DATE% %TIME%
>> "%LOG%" echo Exit code: %RESULT%

type "%LOG%"
echo.
echo Full test log saved to %LOG%
if not "%RESULT%"=="0" (
  echo Tests failed. Please send the contents of %LOG%.
) else (
  echo Tests passed.
)

exit /b %RESULT%
