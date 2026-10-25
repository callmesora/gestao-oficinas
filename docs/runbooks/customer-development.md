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
