Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runnerPath = Join-Path $PSScriptRoot 'runTests.cjs'

$nodeScript = @'
const fs = require('node:fs');
globalThis.__projectRoot = '__PROJECT_ROOT__';
eval(fs.readFileSync('__RUNNER_PATH__', 'utf8'));
'@

$nodeScript = $nodeScript.Replace('__PROJECT_ROOT__', $projectRoot.Replace('\', '\\'))
$nodeScript = $nodeScript.Replace('__RUNNER_PATH__', $runnerPath.Replace('\', '\\'))

$nodeExe = 'C:\Portable\NodeJS\node.exe'
$nodeScript | & $nodeExe --experimental-vm-modules -

exit $LASTEXITCODE
