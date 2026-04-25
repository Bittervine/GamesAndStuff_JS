Get-Content -Raw (Join-Path $PSScriptRoot 'serve.mjs') | & 'C:\Portable\NodeJS\node.exe' --input-type=module -
