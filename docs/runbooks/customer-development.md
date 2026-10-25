# Run the real customer workflow during MIG-7A

From this repository in PowerShell:

```powershell
. ./setup/Enter-Prerequisites.ps1
$env:PYTHON = Join-Path (Get-Location) '.venv/Scripts/python.exe'
npm run dev:workflows
```

Open http://localhost:1431/?workflow=customers and click the customer-list title. The runner creates a fresh isolated loopback PostgreSQL database under analysis-local, applies the existing migrations and starts the real API plus Vite proxy. The empty database is intentional: create customers through Novo/Validar. Browser refresh keeps committed data for that running instance; subsequent runner invocations create separate databases and preserve the old scratch directories.

The same runner now serves http://localhost:1431/?workflow=vehicles (Viaturas). Open its list title, use Novo, choose a real customer from COMBO_Codigo or BTN_VISION, fill registration/make/model and validate. BTN_VISION awaits the same actual customer list/form and returns Codigo; cancel leaves the vehicle form alive. The vehicle selector development button exercises registration/origin return; the production repair-order caller remains MIG-8. Both workflows use actual authenticated HTTP operations and PostgreSQL, not mocks. ADR-010 governs vehicle writes/text-key defaults; reports, complete designer/native parity and U items remain open.

Unidades is at http://localhost:1431/?workflow=units: open the list, Novo, enter a text code of at most three characters and validate. Description may be blank. Select a row and Modificar to edit its description; code stays locked. Delete rejects units used by articles before asking for confirmation. ADR-011 governs exact text keys and the transactional selected-record boundary. These three real pairs are the initial six usable windows; their designer/report/native follow-ups remain scheduled. For publishable screenshots use a fresh empty runner or synthetic scenario data, keeping imported-original captures ignored.

To exercise the imported demo copy instead of an empty database:

```powershell
npm run dev:workflows -- analysis-local/data-20261024-nulfix/data.sqlite
```

The source is opened read-only through the existing official-driver export importer. No production endpoint, legacy execution or original data mutation is involved. Stop the existing runner before starting another on port 1431.

The visible development banner and bootstrap identity are ADR-009 fixtures. Requests still use random bearer sessions, and ordinary API startup denies customer operations without an authenticator/database. This does not implement the legacy access screen. New transport/failure kinds appear as developer diagnostics while U-C286277B-03/U-CC16AB27-03 remain open; they are not approved legacy messages.

`npm run ui:check` now starts this real isolated runner when port 1431 is free. Customer browser flows create their own synthetic scenario records through the actual API; no mock replaces customer reads or writes. The other foundation fixtures remain component tests. Set PYTHON explicitly as above: the generic Windows `py` launcher may select an interpreter without Pillow even after the prerequisite script loads the virtual environment.

MIG-7A remains in progress until its complete review/parity/golden/native gates are recorded. Print, source-hidden UMC, unknown table features/selection edge behavior, native modal behavior and human visual approval remain open. Browser scores alone do not close those gaps.

Artigos core (stage20) uses `?workflow=articles`: source list/form, exact decimal price and readonly stock, existing Unidades combo by Codigo, active/inactive filters and ordinary code selector. Create synthetic units through `?workflow=units` first when using an empty runner. Imported development data already supplies units/articles. Mode buttons clear effective filters while preserving checkbox appearance, matching the source. Development-only selector results do not prove future material/stock/menu callers. Movement/reconstruction/report/virtual keyboard/native/HFSQL/UMC remain scheduled; this route does not establish persistent production startup.

Utilizadores maintenance (stage21) uses `?workflow=users`, with the existing RAD table/form controls. Code/name/password are required; passwords are unconditionally uppercased on save, including unchanged loaded values, preserving the source rule. Public browsing/selection/save responses contain only id/code/name; editing uses a narrow authenticated no-store selected-record read. Use synthetic credentials for screenshots/tests. Original-data smoke reads public fields only. DEV selection is at `?workflow=users&selecting=1&origin=Original`; real repair/access/menu continuations and bootstrap/session policy remain their consuming stages. No role/self/last-user deletion guard is inferred; print/UMC/native/runtime/HFSQL gates stay open.

Estados descritivos: http://localhost:1431/?workflow=descriptive-states. Novo accepts code text3 and an optional description text100; select a row to edit its description or explicitly delete. Header magnifiers seek without filtering the rows. Direct real selector mode is http://localhost:1431/?workflow=descriptive-states&selecting=1&origin=Original; its development result output exposes Descricao or original cancellation value. This uses the actual screen/API/PostgreSQL, not the future labor caller. ADR-015 governs writes. Source labor continuation remains MIG-10, report MIG-13, exact designer/native/UMC obligations open.

Terminais: http://localhost:1431/?workflow=terminals. Source code/description are required; all eight fields use the real API/PostgreSQL. Direct selector ?workflow=terminals&selecting=1&origin=Original returns Codigo and keeps CRUD visible. Folder path is read-only; its button first prepares the source current buffer through the API, then invokes the local native picker. A browser cannot supply an absolute client OS folder and shows only a native_only developer diagnostic; no fake folder is returned.

For actual native business/folder testing, keep the isolated runner on1431 and start Tauri development in a separate PowerShell session (child-only environment):

```powershell
. ./setup/Enter-Prerequisites.ps1
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=1433 --remote-debugging-address=127.0.0.1'
$env:WEBVIEW2_USER_DATA_FOLDER = Join-Path (Get-Location) ('analysis-local/native-terminal-' + [guid]::NewGuid().ToString())
npm run tauri -- dev --no-watch --config src-tauri/tauri.workflows.conf.json
```

Then run node scripts/native-terminal-check.mjs from another prepared shell. It performs actual UI/API/PostgreSQL assertions, pauses for two real Windows picker actions (120s each), then writes native-terminal-check.json. At step1 confirm the dialog address is the synthetic native-terminal-folder-choice directory and click Cancel; at step2 confirm the same initial address and Select Folder without navigating elsewhere. Human or Computer Use may operate those two native buttons. The helper verifies cancellation clears/persists and a new form's folder seek changes the existing save identity; it never reads selected files. Stop the owned Tauri dev process before a native rebuild. No global debug setting, production access or installer acceptance follows from this test.
