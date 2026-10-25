# Run the development workflows

These routes exercise real authenticated API/PostgreSQL operations. The runner creates a disposable database on each launch; normal persistent startup/access/navigation remains MIG-12. Source/copy databases are read-only inputs and are never overwritten. The packaged debug app still opens the foundation diagnostic.

## macOS

From the application checkout:

```sh
source setup/Enter-Prerequisites.sh
npm run dev:local
```

This imports `analysis-local/sqlite-development/data.sqlite`. For an empty synthetic workspace, use `npm run dev:workflows` instead. Open [the browser launcher](http://localhost:1431/), or start the native development window in another prepared terminal:

```sh
source setup/Enter-Prerequisites.sh
npm run desktop:mac
```

## Windows

```powershell
. ./setup/Enter-Prerequisites.ps1
$env:PYTHON = Join-Path (Get-Location) '.venv/Scripts/python.exe'
npm run dev:workflows
```

To import an available local copy, append its explicit SQLite path. The Mac projection is provisional, not an official-driver export; see [setup](../../setup/LOCAL-WORKSPACE.md) and [data migration](../data-migration.md) for provenance/quarantine and Windows provisioning. Do not reuse production connections.

## Routes and use

The launcher opens each actual list/form. Direct URLs use `http://localhost:1431/?workflow=<route>`:

| Route | Workflow |
| --- | --- |
| customers / vehicles | Clientes / Viaturas, including the real customer picker |
| units / descriptive-states | Unidades / Estados descritivos |
| terminals / postos | Terminais / Postos and actual terminal continuation |
| mechanics / repair-states | Mecânicos / Estados de reparação |
| document-types / articles / users | Documentos / Artigos / Utilizadores |
| repair-orders | Repair list, filters, state defaults and real three pickers; full form follows |
| repair-state-confirmation / date-prompt | Source-local confirmation/date dialogs |

With an empty database, create prerequisites through their real screens (for example units before articles). Use synthetic credentials for Utilizadores tests/screenshots. Public list/picker/save responses omit credentials; only selected-record editing reads the password. Original-data captures stay ignored. Each unit's screen spec/ADR owns its validation, caller and remaining acceptance details.

Stop the existing owned runner with Ctrl+C before starting another on1431 or running browser goldens. Data persists only for that running scratch database; restart creates another. `npm run ui:check` starts a clean runner automatically. The development identity/banner is ADR009; it does not implement legacy login. Browser-only folder selection returns a native_only diagnostic rather than an invented absolute client path.

## Windows native terminal acceptance

Keep the API runner active. In a separate prepared PowerShell terminal, scope debug settings to this child session:

```powershell
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=1433 --remote-debugging-address=127.0.0.1'
$env:WEBVIEW2_USER_DATA_FOLDER = Join-Path (Get-Location) ('analysis-local/native-terminal-' + [guid]::NewGuid().ToString())
npm run tauri -- dev --no-watch --config src-tauri/tauri.workflows.conf.json
```

Run `node scripts/native-terminal-check.mjs` from another prepared shell. At each of its two120second native-picker pauses, verify the initial synthetic `native-terminal-folder-choice` folder; first Cancel, then reopen and Select Folder without navigating. The check records real UI/API/database behavior in [native-terminal-check.json](native-terminal-check.json), including cancelled-path persistence and current-buffer identity. It reads no selected files. Stop the owned Tauri process before rebuilding. This narrow historical Windows test does not establish other native/device/installer, Mac or human acceptance.
