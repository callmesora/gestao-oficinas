import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


@unittest.skipUnless(os.name == 'nt', 'Windows path and junction validation')
class ScratchPathChecks(unittest.TestCase):
    def test_lexical_and_junction_escapes_are_rejected(self):
        helper = Path(__file__).parents[1] / 'scripts/windows/Assert-ScratchPaths.ps1'
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            workspace = root / 'workspace'
            scratch = workspace / 'analysis-local/hfsql-scratch-test'
            data = scratch / 'Exe'
            data.mkdir(parents=True)
            analysis = scratch / 'schema.wdd'
            analysis.write_bytes(b'synthetic')
            outside = root / 'outside'
            outside.mkdir()
            (outside / 'schema.wdd').write_bytes(b'synthetic')
            (outside / 'Exe').mkdir()
            config = root / 'paths.json'
            config.write_text(json.dumps({'helper': str(helper), 'workspace': str(workspace), 'data': str(data),
                                          'analysis': str(analysis), 'outside': str(outside)}), encoding='utf-8')
            script = root / 'test.ps1'
            script.write_text(r'''
param([string]$Config)
$ErrorActionPreference='Stop'
$p = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
. $p.helper
$good = Join-Path $p.workspace 'analysis-local\fresh-output'
$null = Get-CheckedHfSqlScratchPaths -Workspace $p.workspace -Data $p.data -Analysis $p.analysis -Output $good
$rejected=0
foreach ($bad in @($p.outside, (Join-Path $p.workspace 'legacy\bad'), (Join-Path $p.data 'bad'))) {
 try { $null=Get-CheckedHfSqlScratchPaths -Workspace $p.workspace -Data $p.data -Analysis $p.analysis -Output $bad }
 catch { $rejected++; continue }
 throw 'Unbounded output was accepted.'
}
$link=Join-Path $p.workspace 'analysis-local\hfsql-scratch-junction'
$null=New-Item -ItemType Junction -Path $link -Target $p.outside
try {
 try { $null=Get-CheckedHfSqlScratchPaths -Workspace $p.workspace -Data (Join-Path $link 'Exe') -Analysis (Join-Path $link 'schema.wdd') -Output $good }
 catch { $rejected++ }
 try { $null=Get-CheckedHfSqlScratchPaths -Workspace $p.workspace -Data $p.data -Analysis $p.analysis -Output (Join-Path $link 'new-output') }
 catch { $rejected++ }
 if($rejected -ne 5) { throw 'Junction escape was accepted.' }
} finally { (Get-Item -LiteralPath $link).Delete() }
Write-Output 'Five escapes rejected; ordinary scratch paths accepted.'
''', encoding='utf-8')
            host = Path(os.environ['WINDIR']) / 'SysWOW64/WindowsPowerShell/v1.0/powershell.exe'
            result = subprocess.run([str(host), '-NoProfile', '-ExecutionPolicy', 'RemoteSigned', '-File', str(script), '-Config', str(config)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertTrue((outside / 'schema.wdd').is_file())


if __name__ == '__main__':
    unittest.main()
