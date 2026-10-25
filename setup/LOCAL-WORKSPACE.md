# Local checkout setup — 25 October 2026

This report supplements the existing roadmap/handoff with facts about this newly prepared Mac. Historical Windows test results and running process handles in the handoff belong to the previous machine; they are not local running services or checks rerun here.

Current delivery policy: follow ADR-007, commit tested work locally on main, use helpful subagents, and leave all pushing to the owner. Earlier branch/publication notes below describe setup history.

## Checkouts and source copy

- Application: `https://github.com/callmesora/gestao-oficinas`, main at `335a44dfff97e4e667d24ce3fbd40e353a18ea1e`.
- Local setup work is on `codex/local-macos-setup`, based on that commit. All local results below were obtained from the macOS/arm64 working tree before committing; they are not Windows/hosted CI results. The owner subsequently authorized commit/push; Git history identifies the delivery commit.
- Separate read-only playbook: `migrate-windev-javascript/`, `https://github.com/pazevedo-hyland/migrate-windev-javascript`, main at `cce71fa55040483c31861923c9398264a8880503`.
- The original project is the parent folder. A full copy excluding the newly cloned application, tooling, .git and outer .DS_Store lives at `legacy/GestaoOficinas_TesteIA/`. All 2,519 copied files (541,349,536 bytes) match their originals by SHA-256; copied files have write permissions removed. Original file contents/permissions are unchanged.
- All 128 committed source fingerprints in `docs/source-manifest.json` match the copy, with no missing files. Local manifests: `analysis-local/local-source-copy.json` and `analysis-local/local-source-check.json`.
- The old parent `tools/windev-to-typescript/` checkout is preserved and is not the current playbook.
- The guide is newer than the application's vendored toolkit. Existing application scripts/templates/skills are preserved. A toolkit upgrade requires its own reviewed change and the guide's upgrade checks.

The original dossier and its backup have the same SHA-256. Evidence extraction writes generated documents under `analysis-local/evidence-docs/`, preserving the tracked mapping, schema, runtime answer sheet and parity seed. `analysis-local/latest.json` identifies the local outputs. For an intentional later refresh, use explicit primary paths:

```sh
source setup/Enter-Prerequisites.sh
python scripts/prepare_evidence.py --legacy legacy --analysis analysis-local \
  --docs analysis-local/evidence-docs --language PT \
  --dossier-pdf legacy/GestaoOficinas_TesteIA/My_GestaoOficinas_Documentation.pdf \
  --compile-dir legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl
```

## Resume point

The cloned handoff originally identified MIG-7C2; its scheduled target work is now delivered. The retained `docs/runbooks/stage-11-designer-checkpoint.md` lists remaining designer/native acceptance. Resume from the current handoff and roadmap, with the accepted shared API/PostgreSQL architecture. This setup report records historical local checks; do not restart mapping/framing or scaffold over the application.

Windows and macOS Codex agents collaborate on this project. Read `docs/runbooks/cross-platform-agents.md` for stage/file ownership, separate branches/worktrees, integration of shared tracking and OS/commit-labelled test evidence. Do not reuse the earlier Windows session/process handles on this Mac.

## Dependencies and commands

Installed `.venv/` with Python 3.12.0 and all exact pins from `setup/requirements.txt`: pypdf 6.21.2, pyodbc 5.3.0, Pillow 13.0.0. `pip check` passes. Recreate with `python3 -m venv .venv` then `.venv/bin/python -m pip install -r setup/requirements.txt`. Source `setup/Enter-Prerequisites.sh` for repository-local PATH, PYTHON and UTF-8 settings.

Installed exact Node 24.22.1/npm 11.19.1 under ignored `analysis-local/toolchain/`; the helper selects them without changing global Node settings. Rust 1.99.1 with rustfmt/clippy is installed through rustup. Xcode Command Line Tools and the macOS SDK were already installed. The Mac decoder regression harness uses the installed .NET SDK 9.0.107; Windows keeps its existing full-adapter PowerShell test. Google Chrome is installed for Playwright.

To reproduce the runtimes on another Mac before sourcing the helper:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r setup/requirements.txt
npm install --prefix analysis-local/toolchain node@24.22.1 npm@11.19.1 --no-audit --no-fund
rustup toolchain install 1.99.1 --profile minimal --component rustfmt --component clippy
# Install .NET SDK 9 and Chrome if absent. Xcode Command Line Tools are required.
source setup/Enter-Prerequisites.sh
npm ci
```

ADR-017 records macOS/Windows development support: optional native PostgreSQL binaries from the same pinned release; real loopback database/API tests; native folder picker on both OSes; a macOS app/dmg bundle override. Production persistence/schema and Windows native gates are unchanged. macOS visual history goes to `docs/evidence/visual/darwin/` using the same source images and floors.

```sh
source setup/Enter-Prerequisites.sh
python scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files
python scripts/ui_inputs.py
python -m unittest discover -s tests -v
python scripts/unit_evidence.py WIN_Form_Clientes --out analysis-local/units/WIN_Form_Clientes.json
```

Fresh test hosts explicitly provision PostgreSQL18.4 clients with `python setup/provision-backup-test-tools.py --directory analysis-local/toolchain/postgres-clients-18.4`; existing directories are refused. The script documents Windows build prerequisites and prints the canonical `WORKSHOP_TEST_BACKUP_TOOLS` path. CI provisions this before the unchanged `npm run verify`; normal startup never builds/downloads tools. Actual Windows source-build acceptance remains open.

Use `setup/Enter-Prerequisites.ps1` on Windows. Follow its existing prerequisite documentation and exact Node/npm/Rust pins before `npm ci`, `npm run verify` or native build commands.

## Run imported workflows on macOS

The existing snapshot is in `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/GestaoOficinas.sqlite`, identical to `../../GestaoOficinas.sqlite` in Downloads. It passes quick_check. Original SHA-256: `5efd4f6b843d8a7b9f1e5453d4a1ae4c6e61fb6271373119413d68d455bd39af`.

Its 17 business tables/159,668 rows were adapted into a fresh importer-compatible snapshot at `analysis-local/sqlite-development/data.sqlite`. Preparation reads the original only, retains mapped text/BLOB/NULL values and records omitted composite columns/metadata. No encoding is guessed. This is provisional development input, not a verified official HFSQL export. The existing importer accounts for every row: 136,053 imported, 23,615 quarantined stock rows with text instead of binary link cells, zero reconciliation mismatches. Quarantine preserves original values. Customers/vehicles/lookup data are available.

The projection is already prepared here. On a fresh machine, run once with a fresh output directory:

```sh
python scripts/prepare_local_sqlite.py legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/GestaoOficinas.sqlite --out analysis-local/sqlite-development
```

Terminal 1, from the application root:

```sh
source setup/Enter-Prerequisites.sh
npm run dev:local
```

After the import completes, open `http://localhost:1431/?workflow=menu` and choose the explicit development entry. Direct routes such as `customers`, `vehicles`, `units`, `descriptive-states` and `terminals` remain available. Terminal 2 for the real desktop development window:

```sh
source setup/Enter-Prerequisites.sh
npm run desktop:mac
```

The Mac workflow config opens the development menu; the existing Windows terminal-test config remains unchanged. `dev:local` always creates a new isolated PostgreSQL database and writes an import summary in that cluster's `analysis-local/postgres-test-*/import-report.json`. Restarting it starts a fresh database; older scratch clusters remain on disk. Stop it with Ctrl+C. Never run browser golden tests against a manually populated server: stop it first so Playwright starts a clean synthetic runner.

`npm run build:mac` builds a local debug `.app` under `src-tauri/target/debug/bundle/macos/`. The original setup bundle exposed foundation diagnostics; current business startup and persistent commands are below. Release signing/notarization remain separate.

## Local verification and remaining acceptance gates

- Parity with `--check-files` passes: 2,273 rows; 23 verified, 132 implemented, 1,637 specified, 481 unmapped, zero excluded. These are existing migration statuses; setup did not promote any rows.
- UI input integrity passes: 53 layouts and 154 PNGs.
- Application Python tests: 10 discovered, 9 passed, 1 Windows junction test skipped. New adapter tests prove large ID/text/NULL/BLOB retention, case mapping, original hash stability, refusal of existing output/missing schema/ambiguous numeric storage.
- Separate playbook tests: 75 passed. Full private evidence pipeline completed; the generated seed passes against existing parity. Corrected auto-discovery of a backup compile folder by explicitly using the main project compile folder; recovered the expected 79-element event legend. Three unit evidence packs were generated for customer/vehicle/terminal forms.
- npm dependencies installed after selecting matching optional native binaries. Full 87-test TypeScript suite includes real PostgreSQL and the same eleven C# decoder assertions; no TypeScript test was skipped. Initial Windows-only PowerShell and hardcoded mock IPC origin assumptions were found and corrected.
- `cargo check --locked` and native macOS executable build pass; `npm run build:mac` produced the debug `.app`. Build logs are in `analysis-local/macos-native-build.log` and `analysis-local/macos-app-bundle.log`.
- Real imported browser/customer API smoke passes with all 2,165 customers: `analysis-local/imported-browser-check.json`. Import summary is retained under the scratch cluster; no raw records are published.
- Full `npm run verify` exited 0 on macOS arm64: typecheck, lint (one existing TanStack compiler warning), all 87 TypeScript/domain/API/PostgreSQL tests, fmt/clippy, all 3 Rust tests, generated bindings, parity, 53 layout/154 PNG integrity checks and all 71 browser tests. Log: `analysis-local/macos-verify.log`. The initial pass exposed a mock IPC test hardcoded to the Windows URL; it now uses the actual webview URL, retaining handler/response assertions.
- The final skin-component output routing was then corrected to the same Darwin subfolder as whole-window scores; both comparators and both focused browser tests passed (`analysis-local/macos-final-skin-tests.log`). Windows records remain byte-for-byte unchanged. No visual floor/tolerance/assertion changed.
- Windows native/WebView2, actual macOS native interactive picker/window acceptance, printer/device checks and hosted CI remain separate unrun gates for these changes. CI now includes both OSes, retaining Windows native checks.
- `legacy/data/` still lacks the previous official HFSQL export/CSV/manifest. The temporary snapshot supports development while that is recovered or exported on Windows from a scratch copy with the correct driver. Never reuse an old production DSN; use a fresh output directory and validate counts/hashes.
- `scripts/verify_step0.py` is historical: it asserts zero implemented/verified parity rows. It is not a valid current-state acceptance command and additionally needs the missing export. Use the ongoing parity gate above.

Business behavior, schema/migrations, parity statuses and roadmap ordering are unchanged. Shared Windows/Mac instructions are in AGENTS and the coordination runbook; no guard/hooks or runtime agent settings were installed/changed. Run Git inside the application or playbook checkout; the parent inherits an unrelated ancestor repository. Kickoff prompts are supplied in chat, not maintained as another repository document.

Review mode: two disclosed sequential self-review passes in the same context under ADR-007 and `skills/review/SKILL.md`; see `docs/migration-history.md#local-macos`. No independent reviewer claim. Owner-requested shared Windows/Mac collaboration instructions live in `docs/runbooks/cross-platform-agents.md` and are linked from both AGENTS files and the handoff.

Final launch smoke: `npm run dev:local` imported the provisional data and served the real API; `npm run desktop:mac` built and started `target/debug/gestao-oficinas` against the customer workflow without a startup error. Native interactive controls/picker were not automated. Both owned development processes were then stopped with Ctrl+C; restart with the commands above. Source and copied SQLite hashes were rechecked and remain identical. Other machines can obtain the setup branch through authorized Git sharing; private snapshots, extracts and environments remain local and must be provisioned separately.

## Initial full-screen demo

The stock derivative is already prepared on this Mac. Run `npm run dev:local:stock`, then `npm run desktop:mac` in a second prepared terminal, or open `http://localhost:1431/?workflow=menu`. Choose **Abrir ambiente de desenvolvimento**; real legacy credentials are unnecessary for that entry. Each restart recreates the disposable database.

On a fresh machine only, prepare a fresh derivative with `python scripts/prepare_local_sqlite.py legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/GestaoOficinas.sqlite --out analysis-local/sqlite-development-stock --stock-development-derivative`. An existing output is deliberately refused. Exact fingerprint/count/hash gates are ADR017; originals and ordinary projection stay unchanged. Disposable import:159668rows/0quarantine/0mismatch; official full-database fidelity remains open.

## Persistent local app

From the application directory, source `setup/Enter-Prerequisites.sh` (Windows: `setup/Enter-Prerequisites.ps1`). Build and explicitly set up a fresh private local profile once:

```sh
npm run build
npm run local:setup -- --snapshot analysis-local/sqlite-development-stock/data.sqlite
npm run local:start
```

Omit `--snapshot` for an empty demo. Setup refuses existing state and prints only the private operator-token file path; use its contents in **Definir acesso**, select an imported account and set a new password. Never reuse legacy credentials. Ordinary `local:start` preserves data and sessions and requires free ports3210/54329; Ctrl+C stops only its owned service. Open `http://127.0.0.1:3210/` or build/open the Mac app with `npm run build:mac` and `open 'src-tauri/target/debug/bundle/macos/Gestao Oficinas.app'`. The native client expects this running API; the DEV launcher remains disposable.

Actual macOS arm64 checks over e7d26c7 plus the persistent-startup tree passed native enrollment/customer save/logout/login and four native argument/exit cases. The ordinary built-browser flow also passed full PostgreSQL/API restart persistence and reload/login, with no Vite or DEV-session requests. OS save/print dialogs, physical devices, Windows and official HFSQL fidelity remain separate. For reports, stop the service and run `npm run local:reports -- --executable '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` once, then restart normally. Existing pins require explicit `--replace`; full provisioning details are in [README](../README.md#offline-report-runtime-on-the-api-host).
