param(
    [Parameter(Mandatory=$true)][string]$Dsn,
    [Parameter(Mandatory=$true)][string]$TablesFile,
    [Parameter(Mandatory=$true)][string]$Out
)
$ErrorActionPreference='Stop'
if ([IntPtr]::Size -ne 4) { throw 'Use the 32-bit PowerShell host.' }
$workspacePath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$configuration = Get-ItemProperty -LiteralPath "HKCU:\Software\ODBC\ODBC.INI\$Dsn"
if (-not [string]::IsNullOrWhiteSpace($configuration.'Server Name')) { throw 'Server DSNs are prohibited for this scratch exporter.' }
. (Join-Path $PSScriptRoot 'Assert-ScratchPaths.ps1')
$checkedPaths = Get-CheckedHfSqlScratchPaths -Workspace $workspacePath -Data $configuration.RepFic -Analysis $configuration.Analyse -Output $Out
Add-Type -Path (Join-Path $PSScriptRoot 'HfSqlOdbcAnsi.cs') -ReferencedAssemblies System.Web.Extensions
$names = Get-Content -LiteralPath $TablesFile -Raw | ConvertFrom-Json
$connection = New-Object HfSqlOdbcAnsi($Dsn)
try { $connection.Export([string[]]$names, $checkedPaths.Output) }
finally { $connection.Dispose() }
