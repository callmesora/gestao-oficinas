# Remaining legacy collection

Step 0 update: source/dossier extraction, local data export and reviewed mapping have now completed. See docs/runbooks/step0-report.md; the notes below describe the earlier collection plan, not outstanding extraction work.

## Update for guide commit 03d352d

The updated section 00 confirms that all starting inputs are already present. The earlier collection notes below are reference steps, not prerequisites to starting. Data export runs during kickoff on a scratch copy. Generated analysis SQL and separate query exports are unnecessary with a sufficient dossier. Runtime screenshots, golden scenarios and report samples are deferred until a slice needs them. No migration or collection pipeline has been started.

These are preparation steps described by the playbook, not missing development tools. The owner confirmed this laptop is the dedicated agent environment and waived sanitization. No export, extraction or legacy execution has been started.

## Data export

Use `migrate-windev-javascript/scripts/windows/export_odbc.py` through the installed HFSQL ODBC driver against the local project data copy. It produces a lossless `data.sqlite`, one CSV per table, and a `manifest.json` with source/export row counts. Use the same Python/ODBC architecture. The existing `MigrationCopy` DSN points outside this workspace and must be checked or redirected to the intended copy before use.

From the workspace, after validating the DSN, the collection command is:

```powershell
. .\setup\Enter-Prerequisites.ps1
python .\migrate-windev-javascript\scripts\windows\export_odbc.py --dsn MigrationCopy --out .\legacy\data
```

The exporter requires a fresh output directory. This command is documented here for later use and has not been run. Export is collection, not import into the new application.

See `migrate-windev-javascript/scripts/windows/README.md`.

## SQL and static screen references

- Generate analysis SQL in WINDEV only if needed because the dossier/schema draft is insufficient; the updated guide does not require this export to start.
- Export query SQL and parameters from WINDEV only if not covered by the dossier; this is not a starting blocker with the supplied dossier.
- The existing 2,303-page documentation PDF can supply query SQL, control captions and screen images through `scripts/dossier_extract.py` when the evidence phase is authorized. Its per-query coverage still needs checking. Dossier extraction and `prepare_evidence.py` have not been run.

See `migrate-windev-javascript/00-prerequisites.md` and `scripts/README.md` in that playbook.

## Runtime screenshots and scenarios

Run the old application against a local data copy, capture each required window/state, and name images after the window, for example `legacy/screenshots/WIN_Ordens_Reparacao.png`. Dossier images provide static layout references; runtime captures record actual populated states and messages.

For a golden scenario: export relevant tables before the action, perform a recorded sequence in the legacy application, export them again, and retain messages, screenshots and report PDFs with the inputs. The guide provides `templates/golden-scenario.md`. A runtime scenario requires access to a working legacy executable; WINDEV IDE access is needed for designer/analysis exports, not necessarily for running that executable.

See `migrate-windev-javascript/10-parity-and-verification.md`, sections 2–4.

## Sanitization

The guide recommends sanitized copies but does not provide a general anonymization script. The owner waived sanitization here. No anonymization work is planned, and raw legacy material remains excluded from Git.
