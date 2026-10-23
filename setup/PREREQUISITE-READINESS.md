# WINDEV migration prerequisite readiness

Current status: Step 0 has now been executed and validated. This file retains the historical prerequisite checks; docs/runbooks/step0-report.md and docs/runbooks/handoff.md supersede statements below saying extraction has not run. Application implementation has not started.

## Full-guide review update

Reviewed README, chapters 00–10 in full, scripts documentation, evidence orchestrator, kickoff and the framing/mapping/implementation templates against commit `39b0e36`. Installed the missing Pillow 13.0.0 and pinned it in setup/requirements.txt. The toolkit's 75 tests passed on temporary fixtures; these tests did not extract the application. The terminal helper now enables UTF-8 because visual_compare.py --help failed under Windows cp1252. All 13 extraction/support entry points are rechecked with UTF-8 below in the extraction review note.

Confirmed the exact dossier at legacy/GestaoOficinas_TesteIA/My_GestaoOficinas_Documentation.pdf: 2,303 unencrypted pages, text is extractable, and the opening pages identify My_GestaoOficinas. Full coverage remains to be measured by an actual extraction.

Important discovery: automatic compile-folder selection currently chooses a folder inside Bkp_20261022_1405. Use the explicit canonical --compile-dir and --dossier-pdf paths recorded in setup/EXTRACTION-REVIEW.md. No real-project extraction or migration has been started.

Checked: 23 October 2026 (Europe/Lisbon), rechecked against updated guide commit `03d352d`.
Scope: `migrate-windev-javascript/00-prerequisites.md`, sections A–E, with the Windows export instructions and infrastructure chapter for context.

## Decision

**Ready to start under the updated section 00 checklist.** All four starting inputs are present: text sources with compile folder and images, the dossier PDF, XDD schema, and local HFSQL data files. The toolchain, dedicated laptop and Git repository are ready. No additional installation is needed. The owner waived sanitization for this preparation.

The updated guide accepts raw HFSQL files at the start; export is performed during kickoff. Generated analysis SQL and separate query exports are unnecessary with a sufficient dossier. Runtime screenshots, golden scenarios and sample report PDFs are collected later when a slice needs them. These are not starting blockers. WINDEV runtime access remains unverified but is not required to begin from the supplied project folder.

Recheck results: Node v24.22.1, npm 11.19.1, Rust/Cargo 1.99.1, Python 3.12.10, pypdf 6.21.2, pyodbc 5.3.0, pip check passed, HFSQL driver available, dossier readable (2,303 pages), C++ tools and WebView2 present. Copied Exe/ contains 17 FIC, 16 NDX and 2 MMO files. Local main and remote main both match b5054ea773f66d865171f69c1652a99ad767df26. Data-driver connectivity and successful export remain untested; do not use the existing external MigrationCopy DSN without validation.

No migration was started. No evidence extraction, mapping, schema conversion, application scaffolding, database connection/export/import, or legacy application execution was performed. The playbook repository is unchanged.

## Preparation completed

- Created `.venv/` using the existing Python 3.12.10 (64-bit), with `pypdf==6.21.2` and `pyodbc==5.3.0`. Versions are recorded in `setup/requirements.txt`.
- Created `setup/Enter-Prerequisites.ps1` to load that Python environment and refresh Node/Rust discovery from the persisted Windows PATH. The existing Codex terminal had an old PATH and its default `python` resolved to 3.7.9. No global Python alias or existing installation was replaced.
- Copied the entire original `GestaoOficinas_TesteIA/` folder into `legacy/GestaoOficinas_TesteIA/`, including backups, images, compile folders and executable/data files. Original files were preserved. Both trees have 2,517 files and 528,310,220 bytes; SHA-256 comparison of every file found zero mismatches.
- Added a workspace `.gitignore` covering both legacy copies, `.venv/`, and `analysis-local/`. The workspace is now the application Git repository; these exclusions are active. The separate playbook checkout is also excluded.
- Existing system prerequisites were already installed; no system reinstall or upgrade was needed.

## A — Accounts and Git

| Item | Result |
|---|---|
| Coding agent | This Codex session is operational; subscription/billing was not inspected. |
| Git host | The cloned playbook has a GitHub origin; a noninteractive `ls-remote` can read HEAD. This does not prove authenticated private access or push permissions. |
| Git credentials | Git Credential Manager is configured (`credential.helper=manager`). No credentials were read or printed. |
| Application repository | Initialized this workspace and pushed `main` to `https://github.com/callmesora/gestao-oficinas.git`, as explicitly requested. Commit `b5054ea773f66d865171f69c1652a99ad767df26` contains only README.md and .gitignore. The remote is public; legacy files, data, playbook clone and Python environment remain excluded. Remote HEAD matches the local commit, proving push access. |
| Commit identity | Configured repository-local identity `Pedro Azevedo <61661948+callmesora@users.noreply.github.com>`, using the supplied GitHub account and its verified public account ID. No global Git identity was changed. |

## B — Development tools

| Tool | Verified result |
|---|---|
| Git | 2.46.0.windows.1 |
| Node.js / npm | v24.22.1 / 11.19.1; Node 24 is a supported LTS branch at the check date. |
| Rust / Cargo | 1.99.1 / 1.99.1; default target `x86_64-pc-windows-msvc`. |
| Rust components | rustfmt and clippy installed, alongside rustc, Cargo and standard library. |
| C++ Build Tools | Visual Studio Build Tools 2022 17.14.42 with x64/x86 C++ tools; installation complete, no reboot required per installer metadata. |
| Windows SDK | 10.0.26100.0 libraries present. |
| Native linker | A temporary Rust executable compiled, linked through MSVC and ran successfully outside the project. |
| WebView2 | Microsoft Edge WebView2 Runtime 155.0.4283.62 installed. |
| Python | 3.12.10 via `py -3.12` and the new `.venv`; meets 3.10+ requirement. |
| Python packages | `pypdf` and `pyodbc` imports passed; `pip check` found no broken requirements. |
| Editor | Visual Studio Code 1.110.1 installed; Codex is also available. |
| SQLite | Python's embedded SQLite passed an in-memory query; no server installation needed. |
| PostgreSQL | Not installed/provisioned for this task; conditional on a future server topology decision. |

Tauri itself and frontend application dependencies belong in the future application repository. They were not installed or scaffolded. A full Tauri build, installer and native UI test have not been performed. Pin actual Node/Rust versions and commit application lockfiles when that repository is created.

## C — Legacy Windows environment

- Source headers identify **WINDEV 28.0**, with readable text-format `.wdp` and `.wdw` sources. No format conversion is needed for these files.
- HFSQL 28 ODBC drivers are registered for both 32-bit and 64-bit Windows. The Python 64-bit process lists the HFSQL driver successfully.
- A user DSN named `MigrationCopy` exists and its configured local data directory exists. No server name is configured. The directory is **outside this workspace**; its safety, sanitization and relationship to this project's data were not established. The DSN was not changed or connected to.
- A WINDEV 28 IDE installation/license and the ability to run the legacy application against a safe copy have not been verified. Installed HFSQL drivers alone do not establish that runtime capability.
- The project includes a legacy executable and 17 `.fic` files under `Exe/`. Raw files are not equivalent to a validated lossless export. No hand decoding was attempted.

## D — Agent isolation

The owner confirmed that this laptop is the dedicated, isolated agent environment. This prerequisite is accepted as satisfied; an additional VM is not required for this setup. No server, production connection or nightly job was provisioned. A separate nightly test machine remains a recommendation.

## E — Collected material

| Material | Status |
|---|---|
| Complete project copy | Prepared under `legacy/GestaoOficinas_TesteIA/`. |
| Text project/windows/reports | Present: one project, 51 windows and 28 report files at the project root. |
| Compile labels | `My_GestaoOficinas.cpl/` included. |
| Images and templates | Included unchanged with all project subfolders. Completeness against any external skin folder is not yet verified. |
| XDD analysis | `GestaoOficinas.xdd` present. |
| Documentation dossier | `My_GestaoOficinas_Documentation.pdf` present, unencrypted, 2,303 pages; readable using pypdf. It was not extracted. |
| Queries | 30 `.WDR` files present. No standalone SQL exports found. The dossier may provide their SQL in the later evidence phase; coverage has not been checked. |
| Generated analysis SQL | Not required by updated guide: the schema draft replaces it. |
| Lossless data export | Raw HFSQL data files satisfy the starting requirement. SQLite, CSVs and manifest are generated during kickoff through supported tooling on a scratch copy. No export has been attempted. |
| Sanitized data | Owner explicitly waived sanitization. It is not a prerequisite blocker for this task. Raw legacy data remains local and excluded from Git. |
| Runtime screenshots / golden scenarios | Deferred until a relevant slice needs them, as the updated guide states. Dossier images are available for static references. |
| Sample printed reports and inputs | Deferred until report slices need them; not a starting requirement. |
| Operational inventory | Still to record/confirm: language, HFSQL operating mode, printers/scanners, INI/registry settings, scheduled tasks and integrations. This task did not perform behavioral analysis. |

## Using the prepared tools later

In a PowerShell terminal opened at this workspace, dot-source:

```powershell
. .\setup\Enter-Prerequisites.ps1
```

`python` will then use `.venv` and Node/Rust commands will be discoverable. Restarting Codex will also refresh its inherited system PATH, but the helper remains useful for selecting the correct Python. Recreate the Python environment, if needed, with `py -3.12 -m venv .venv` followed by `.\.venv\Scripts\python.exe -m pip install -r setup/requirements.txt`.

Do not launch the kickoff or `prepare_evidence.py` until the user explicitly starts the migration.

## Reference documentation

- Local guide: `migrate-windev-javascript/00-prerequisites.md`.
- [Official Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).
- [Official Node.js release status](https://nodejs.org/en/about/previous-releases).
- [Official Rust installation instructions](https://rust-lang.org/tools/install/).
