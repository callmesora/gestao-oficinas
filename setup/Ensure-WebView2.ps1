$ErrorActionPreference = 'Stop'

function Find-WebViewRuntime {
    $runtimeRoots = @(
        'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients',
        'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients',
        'HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients'
    )
    foreach ($runtimeRoot in $runtimeRoots) {
        if (-not (Test-Path -LiteralPath $runtimeRoot)) { continue }
        foreach ($clientKey in Get-ChildItem -LiteralPath $runtimeRoot) {
            $client = Get-ItemProperty -LiteralPath $clientKey.PSPath
            $runtimeVersion = $null
            if ($client.name -match 'WebView2' -and
                [version]::TryParse([string]$client.pv, [ref]$runtimeVersion) -and
                $runtimeVersion -gt [version]'0.0.0.0') {
                return $runtimeVersion
            }
        }
    }
    return $null
}

$availableRuntime = Find-WebViewRuntime
if ($availableRuntime) {
    Write-Output "WebView2 runtime present: $availableRuntime"
    return
}

$installerDirectory = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [IO.Path]::GetTempPath() }
$runtimeInstaller = Join-Path $installerDirectory 'MicrosoftEdgeWebview2Setup.exe'
Invoke-WebRequest 'https://go.microsoft.com/fwlink/p/?LinkId=2124703' -OutFile $runtimeInstaller
$publisherSignature = Get-AuthenticodeSignature -LiteralPath $runtimeInstaller
if ($publisherSignature.Status -ne 'Valid' -or $publisherSignature.SignerCertificate.Subject -notmatch 'Microsoft Corporation') {
    throw 'The WebView2 bootstrapper does not have a valid Microsoft signature.'
}
$installed = Start-Process -FilePath $runtimeInstaller -ArgumentList '/silent','/install' -WindowStyle Hidden -PassThru -Wait
if ($installed.ExitCode -notin @(0,3010)) { throw "WebView2 installer failed: $($installed.ExitCode)" }
$availableRuntime = Find-WebViewRuntime
if (-not $availableRuntime) { throw 'WebView2 runtime is still absent after installation.' }
Write-Output "WebView2 runtime installed: $availableRuntime"
