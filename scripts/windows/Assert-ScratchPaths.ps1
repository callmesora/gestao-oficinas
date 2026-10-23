function Assert-NoReparseAncestor {
    param([Parameter(Mandatory=$true)][string]$Path)
    $currentPath = [System.IO.Path]::GetFullPath($Path)
    while (-not [string]::IsNullOrWhiteSpace($currentPath)) {
        if (Test-Path -LiteralPath $currentPath) {
            $item = Get-Item -LiteralPath $currentPath -Force
            if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw 'Reparse points are not allowed in HFSQL input or output paths.'
            }
        }
        $parentPath = Split-Path -Parent $currentPath
        if ($parentPath -eq $currentPath) { break }
        $currentPath = $parentPath
    }
}

function Get-CheckedHfSqlScratchPaths {
    param([string]$Workspace, [string]$Data, [string]$Analysis, [string]$Output)
    foreach ($candidatePath in @($Workspace, $Data, $Analysis, $Output)) {
        Assert-NoReparseAncestor -Path $candidatePath
    }
    $workspacePath = [System.IO.Path]::GetFullPath($Workspace).TrimEnd('\')
    $scratchPrefix = Join-Path $workspacePath 'analysis-local\hfsql-scratch-'
    $dataPath = (Resolve-Path -LiteralPath $Data).Path
    $analysisPath = (Resolve-Path -LiteralPath $Analysis).Path
    if (-not (Test-Path -LiteralPath $dataPath -PathType Container) -or
        -not (Test-Path -LiteralPath $analysisPath -PathType Leaf)) { throw 'Scratch data directory and WDD file are required.' }
    if (-not $dataPath.StartsWith($scratchPrefix,[StringComparison]::OrdinalIgnoreCase) -or
        -not $analysisPath.StartsWith($scratchPrefix,[StringComparison]::OrdinalIgnoreCase)) {
        throw 'The Step0 DSN must point to an analysis-local/hfsql-scratch-* copy.'
    }
    $outputPath = [System.IO.Path]::GetFullPath($Output)
    $outputPrefix = (Join-Path $workspacePath 'analysis-local') + '\'
    if (-not $outputPath.StartsWith($outputPrefix,[StringComparison]::OrdinalIgnoreCase) -or
        $outputPath.StartsWith($scratchPrefix,[StringComparison]::OrdinalIgnoreCase)) {
        throw 'Raw bridge exports must stay in analysis-local and outside the scratch inputs.'
    }
    [pscustomobject]@{ Data=$dataPath; Analysis=$analysisPath; Output=$outputPath }
}
