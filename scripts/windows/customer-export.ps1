param(
    [Parameter(Mandatory=$true)][string]$Data,
    [Parameter(Mandatory=$true)][string]$Analysis,
    [Parameter(Mandatory=$true)][string]$Workspace,
    [Parameter(Mandatory=$true)][string]$Id
)
$ErrorActionPreference = 'Stop'
if ([IntPtr]::Size -ne 4 -or $Id -notmatch '^[0-9a-f]{32}$') { throw 'Invalid export invocation.' }
. (Join-Path $PSScriptRoot 'Assert-ScratchPaths.ps1')
foreach ($path in @($Data, $Analysis, $Workspace)) { Assert-NoReparseAncestor -Path $path }
$dataPath = (Resolve-Path -LiteralPath $Data).Path.TrimEnd('\')
$analysisPath = (Resolve-Path -LiteralPath $Analysis).Path
$workspacePath = (Resolve-Path -LiteralPath $Workspace).Path.TrimEnd('\')
if (-not (Test-Path -LiteralPath $dataPath -PathType Container) -or -not (Test-Path -LiteralPath $analysisPath -PathType Leaf)) { throw 'Data directory and analysis file are required.' }
if ($analysisPath -notmatch '\.wdd$' -or $workspacePath.StartsWith($dataPath + '\', [StringComparison]::OrdinalIgnoreCase) -or $workspacePath.Equals($dataPath, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid source or workspace.' }
$driver = (Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\ODBC\ODBCINST.INI\HFSQL').Driver
if (-not $driver -or -not (Test-Path -LiteralPath $driver -PathType Leaf) -or [IO.Path]::GetFileName($driver) -ine 'wd280hfo.dll') { throw 'The official 32-bit HFSQL 28 ODBC driver is required.' }

# Enumerate before descending: never follow a junction or a symbolic link.
function Get-SourceFiles([string]$Root) {
    $pending = [Collections.Generic.Stack[string]]::new(); $pending.Push($Root)
    $result = [Collections.Generic.List[string]]::new()
    while ($pending.Count -gt 0) {
        $directory = $pending.Pop()
        foreach ($entry in Get-ChildItem -LiteralPath $directory -Force) {
            if (($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Source contains a reparse point.' }
            if ($entry.PSIsContainer) { $pending.Push($entry.FullName) } else { $result.Add($entry.FullName) }
        }
    }
    return @($result | Sort-Object)
}
function Get-Sha256([string]$File) {
    $stream = [IO.File]::Open($File, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
    $hash = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-', '') }
    finally { $hash.Dispose(); $stream.Dispose() }
}
$files = @(Get-SourceFiles $dataPath)
if ($files.Count -eq 0) { throw 'The selected data directory is empty.' }
$scratchBase = Join-Path $workspacePath 'analysis-local'
if (-not (Test-Path -LiteralPath $scratchBase)) { New-Item -ItemType Directory -Path $scratchBase | Out-Null }
Assert-NoReparseAncestor -Path $scratchBase
$scratch = Join-Path $scratchBase "hfsql-scratch-$Id"
$copiedData = Join-Path $scratch 'data'
$copiedAnalysis = Join-Path $scratch 'analysis.wdd'
$output = Join-Path $scratchBase "hfsql-ansi-$Id"
if ((Test-Path -LiteralPath $scratch) -or (Test-Path -LiteralPath $output)) { throw 'Export target already exists.' }
New-Item -ItemType Directory -Path $copiedData | Out-Null
$analysisHash = Get-Sha256 $analysisPath
$hashes = @{}
Copy-Item -LiteralPath $analysisPath -Destination $copiedAnalysis
if ((Get-Sha256 $copiedAnalysis) -ne $analysisHash) { throw 'Analysis copy changed.' }
foreach ($file in $files) {
    $relative = $file.Substring($dataPath.Length).TrimStart('\')
    $destination = Join-Path $copiedData $relative
    $parent = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    $hash = Get-Sha256 $file
    $hashes[$relative] = $hash
    Copy-Item -LiteralPath $file -Destination $destination
    if ((Get-Sha256 $destination) -ne $hash -or (Get-Sha256 $file) -ne $hash) { throw 'Source changed during copy.' }
}
if (((Get-SourceFiles $dataPath) -join "`0") -cne ($files -join "`0") -or (Get-Sha256 $analysisPath) -ne $analysisHash) { throw 'Source inventory changed during copy.' }
foreach ($file in $files) { $relative = $file.Substring($dataPath.Length).TrimStart('\'); if ((Get-Sha256 $file) -ne $hashes[$relative]) { throw 'Source changed during copy.' } }

$paths = Get-CheckedHfSqlScratchPaths -Workspace $workspacePath -Data $copiedData -Analysis $copiedAnalysis -Output $output
$dsn = 'GO' + $Id.Substring(0, 24) # ODBC limits DSNs to 32 characters.
$base = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Software\ODBC\ODBC.INI', $true)
if ($null -eq $base) { throw 'ODBC user configuration unavailable.' }
$sources = $base.OpenSubKey('ODBC Data Sources', $true)
if ($null -eq $sources -or $null -ne $base.OpenSubKey($dsn) -or $null -ne $sources.GetValue($dsn)) { throw 'Cannot reserve unique DSN.' }
$created = $false
try {
    $key = $base.CreateSubKey($dsn); $created = $true
    try {
        foreach ($pair in @(@('Driver',$driver), @('RepFic',$paths.Data), @('Analyse',$paths.Analysis), @('Database',''), @('Server Name',''), @('Server Port',''), @('IntegrityCheck','0'))) { $key.SetValue($pair[0], $pair[1], [Microsoft.Win32.RegistryValueKind]::String) }
    } finally { $key.Dispose() }
    $sources.SetValue($dsn, 'HFSQL', [Microsoft.Win32.RegistryValueKind]::String)
    Add-Type -Path (Join-Path $PSScriptRoot 'HfSqlOdbcAnsi.cs') -ReferencedAssemblies System.Web.Extensions
    $mapping = Get-Content -LiteralPath (Join-Path $PSScriptRoot '..\..\apps\server\src\db\column-mapping.v1.json') -Raw | ConvertFrom-Json
    $connection = New-Object HfSqlOdbcAnsi($dsn)
    try { $connection.Export([string[]]@($mapping.tables | ForEach-Object { $_.name }), $paths.Output) }
    finally { $connection.Dispose() }
    if ((Get-Sha256 $copiedAnalysis) -ne $analysisHash) { throw 'Scratch analysis changed during export.' }
    $copiedFiles = @(Get-SourceFiles $copiedData)
    if ($copiedFiles.Count -ne $files.Count) { throw 'Scratch inventory changed during export.' }
    foreach ($file in $copiedFiles) { $relative = $file.Substring($copiedData.Length).TrimStart('\'); if (-not $hashes.ContainsKey($relative) -or (Get-Sha256 $file) -ne $hashes[$relative]) { throw 'Scratch source changed during export.' } }
} finally {
    if ($created) { $sources.DeleteValue($dsn, $false); $base.DeleteSubKeyTree($dsn, $false) }
    $sources.Dispose(); $base.Dispose()
}
