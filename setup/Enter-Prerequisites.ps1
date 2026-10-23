# Dot-source this file in a PowerShell terminal before using the migration tools:
# . .\setup\Enter-Prerequisites.ps1
$workspacePath = Split-Path -Parent $PSScriptRoot
$pythonScriptsPath = Join-Path $workspacePath '.venv\Scripts'
if (-not (Test-Path (Join-Path $pythonScriptsPath 'python.exe'))) {
    throw 'The prerequisite Python environment is missing.'
}
$env:Path = $pythonScriptsPath + ';' +
    [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
    [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + $env:Path
$env:VIRTUAL_ENV = Join-Path $workspacePath '.venv'
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
Write-Output 'Prerequisite environment loaded.'
