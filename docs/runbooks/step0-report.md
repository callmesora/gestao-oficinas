# Step 0 — results

23 October 2026. **Extraction and reviewed mapping work. No application implementation or architecture decisions have started.**

## What was processed

| Input/output | Result |
|---|---|
| Technical dossier | All 2,303 pages processed; 51 application windows; 29 query SQL definitions; 135 analysis fields with key properties. |
| Source evidence | 128 fingerprinted source files; 877 generated source-seed behaviors retained exactly. |
| Visual evidence | 106 dossier images and 53 source layout drawings. 27 of the 28 report units have a dossier image. |
| Mapping | 143 source/table/template units; 53 window specs and 28 report specs. |
| Data | 17 tables, 159,668 rows read from a scratch copy through the official HFSQL driver; SQLite, CSVs and manifest available locally. |
| Consolidated parity | 2,273 rows: 1,792 specified and 481 explicitly unresolved/unmapped. Zero implemented, verified-as-target or excluded rows. |
| Review | Independent first reviews and second adversarial window/report/export reviews; all actionable documentation/tool findings corrected. |

The 481 unresolved rows are recorded questions about runtime, designer, import and binary-template behavior, not 481 extraction crashes. The 326 assumed-confidence rows cite explicit proposals; they are not promoted to observed legacy facts. The [mapping index](../mapping/README.md) and [validation JSON](step0-validation.json) give exact coverage.

## Verification

- All 143 per-unit parity checks and mapping/spec U-item lints pass. The consolidated parity gate passes with every source seed retained and evidence-file checks enabled.
- All 17 source table counts agree before and after reads. A second hardened driver read reproduced each table's first-export hash.
- Actual SQLite counts, parsed CSV counts, typed row hashes, 16,979 NULL values and 23,615 BLOB values agree with the manifest and independent verification. All 35 scratch FIC/NDX/MMO files remain unchanged after reads.
- The draft schema loads into an in-memory SQLite database with 17 tables. This is a syntax/structure check, not a target database migration.
- Four local export/conversion/path-containment tests pass. The playbook's 75 toolkit tests pass; its existing Pillow deprecation/resource warnings are nonfatal and remain upstream issues.
- No native application, printer, scanner, legacy runtime scenario or target import was executed. No npm/Tauri project was scaffolded.

## Important remaining evidence

1. Nine list reports use embedded query SQL that the dossier does not print. Compiler data establishes selected items; conditions/sort proposals remain assumed.
2. QRY_noname has no dossier SQL or established caller. Fourteen binary MediaPlayer template files remain unmapped pending design-only/inherited-behavior classification.
3. One report lacks a dossier image. The two WDFAA dialog/message skin windows lack dossier entries. Some captions/flags need image or runtime evidence.
4. Twelve runtime questions and seventeen encoded-action groups are recorded in the [answer sheet](../evidence/encoded-actions.md). The dialog skin contains a potentially destructive Escape/default-button interaction; a safe proposal is not proof of the legacy result.
5. The data profile records duplicate labor IDs, orphan references, sentinel/empty values and unused totals/link fields. No source values were repaired. The official driver returns empty BLOBs for a generated composite/link field; use component keys for later interpretation.
6. ANSI text is the official driver-reported Windows-1252 view, not proof of undocumented storage encoding. Native-driver large-payload chunking beyond this dataset remains untested.

Full gap groups and source-backed risk descriptions: [legacy inventory](../legacy-inventory.md).

## What the next stage should decide

Review the source-observed stock/delete, labor-state, CRUD failure and delete-dialog behavior before deciding preserve versus fix. Confirm actual local/shared/server deployment, device/printer requirements and which old features remain in scope. The project has an optional HFSQL Client/Server branch; copied local data does not establish the production topology.

The owner may now review this evidence before authorizing framing or a bounded kickoff. Do not blindly restart extraction: use the handoff, existing maps and explicit current dossier/compile-folder paths. No application code should be written while the current Step 0-only instruction remains in force.
