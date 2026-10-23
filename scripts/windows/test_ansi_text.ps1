$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'HfSqlOdbcAnsi.cs') -ReferencedAssemblies System.Web.Extensions
$cases = @(
    @{ Bytes=[byte[]](0,0,0); Reported=1; Rc=0; Expected=0 },
    @{ Bytes=[byte[]](0,0,0); Reported=0; Rc=0; Expected=0 },
    @{ Bytes=[byte[]](65,32,32,0); Reported=3; Rc=0; Expected=3 },
    @{ Bytes=[byte[]](231,227,111,0); Reported=3; Rc=0; Expected=3 },
    @{ Bytes=[byte[]](65,66,67,0); Reported=20; Rc=1; Expected=3 },
    @{ Bytes=[byte[]](68,69,0,0); Reported=2; Rc=0; Expected=2 }
)
foreach ($case in $cases) {
    $actual=[HfSqlOdbcAnsi]::CharacterCount($case.Bytes,$case.Reported,$case.Rc)
    if ($actual -ne $case.Expected) { throw 'ANSI text length regression' }
}
foreach ($case in @(
    @{ Bytes=[byte[]](65,66,67); Reported=3; Rc=0 },
    @{ Bytes=[byte[]](0,0,0); Reported=20; Rc=1 },
    @{ Bytes=[byte[]](65,66,0); Reported=1; Rc=0 },
    @{ Bytes=[byte[]](65,0,66,0); Reported=3; Rc=0 },
    @{ Bytes=[byte[]](0,0,0); Reported=2; Rc=0 }
)) {
    $rejected=$false
    try { [void][HfSqlOdbcAnsi]::CharacterCount($case.Bytes,$case.Reported,$case.Rc) } catch { $rejected=$true }
    if (-not $rejected) { throw 'Invalid ANSI buffer accepted' }
}
Write-Output 'ANSI text regression checks: 11 passed'
