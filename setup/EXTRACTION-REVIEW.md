# Extraction and full-guide review

Historical pre-extraction review. Step 0 has since completed; see docs/runbooks/step0-report.md and docs/runbooks/handoff.md for actual results and current limits. The command below records the plan that was then executed with pt-PT selected; later statements that extraction has not run describe the earlier snapshot.

23 October 2026. Playbook commit reviewed: 39b0e36.

## Reading completed

README and chapters 00–10 in full; scripts/README.md; scripts/windows/README.md; templates/kickoff-prompt.md, PromptInit.md, AGENTS.template.md, mapping-prompt.md and prompt-stage.md. Also reviewed prepare_evidence.py in full and the dossier/source/export entry points and output logic.

The method is evidence → complete mapping and independent review → framing/ADRs → foundations → bounded vertical slices with review, verification, parity tracking and rolling handoff → reconciliation and rollout. WLanguage is not automatically transpiled. Business rules and UI behavior need cited evidence, including compiler-backed event labels. Unknown encoded actions use explicit proposals/assumptions rather than invented verified facts. Tests, not rendered screens, establish parity.

## Actual inputs identified

- Dossier: legacy/GestaoOficinas_TesteIA/My_GestaoOficinas_Documentation.pdf. Read with pypdf: 2,303 pages, no encryption; sampled opening pages have extractable text and identify My_GestaoOficinas.
- Sources: the same project folder, with text WDP/WDW/WDE and binary query files.
- Schema: GestaoOficinas.xdd in that folder.
- Compiler labels: My_GestaoOficinas.cpl in that folder.
- Assets: project images and Templates subfolder.
- Data: Exe/ HFSQL files. The existing external DSN is not verified; kickoff must create a scratch copy and configure a source against that copy before export.

## Extraction plan when migration is authorized

The source inspector extracts contextual code blocks, controls, raw schema, unresolved sources, encoded slots and parity seed. The dossier extractor supplies captions, masks, tab order, checkbox properties, named schema types, query SQL and designer images. The event legend pairs code events with compile labels. The evidence report checks coverage and produces navigation and proposed answers. Schema drafting combines XDD structure with dossier type names. Layout rendering produces scale drawings. A unit evidence pack gathers these outputs for mapping each unit.

prepare_evidence.py orchestrates that sequence and records paths in analysis-local/latest.json. Raw outputs remain under analysis-local; it also writes generated evidence, images, schema draft and seed under docs. It does not export HFSQL data; export_odbc.py and data_profile.py are separate steps.

The copied tree includes backup compile folders. Current automatic selection chooses a Bkp_20261022_1405 folder, so the intended command explicitly chooses the current project's compile folder and dossier:

```powershell
. .\setup\Enter-Prerequisites.ps1
python .\migrate-windev-javascript\scripts\prepare_evidence.py --legacy .\legacy --analysis .\analysis-local --docs .\docs --dossier-pdf .\legacy\GestaoOficinas_TesteIA\My_GestaoOficinas_Documentation.pdf --compile-dir .\legacy\GestaoOficinas_TesteIA\My_GestaoOficinas.cpl
```

This command is documented, not executed. Confirm the intended app language during inspection before selecting --language. Use the same explicit paths after scripts are copied to the application repository at kickoff.

## Readiness checks performed

- Installed the missing Pillow 13.0.0 and pinned it alongside pypdf and pyodbc.
- Toolkit unittest suite: 75 tests passed, using temporary synthetic fixtures.
- Enabled PYTHONUTF8=1 and PYTHONIOENCODING=utf-8 in the terminal helper after discovering Windows cp1252 breaks visual_compare.py help output.
- Checked command entry points with --help, not extraction arguments. Coverage and extraction success on the full project remain untested.

Dossier parsing labels currently target English WINDEV documentation; coverage warnings must be reviewed. Embedded report queries and runtime-only actions can remain gaps even with a dossier. Sampled readable pages do not prove every field or query is extractable.

No application source, schema, data or dossier extraction was run, and no migration code was written. The playbook itself was not modified.
