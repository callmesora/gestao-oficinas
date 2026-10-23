# Legacy inventory and evidence gaps

Step 0 only; no architecture decisions or application code. Playbook copied from cce71fa. Original inputs remain local under legacy/GestaoOficinas_TesteIA/. docs/source-manifest.json records paths, sizes and SHA-256 fingerprints; no credential values are recorded here.

## Inventory

- One WINDEV 28 project, 51 application windows plus two WDFAA dialog/message skin windows, 28 reports, 30 binary queries, one unique XDD describing 17 tables (135 fields), and 14 binary MediaPlayer template window/report sources.
- All 877 generated source-seed IDs are retained in docs/parity/parity.csv. docs/mapping/README.md lists every source/table/template unit and mapping/spec coverage. Additional rows record manual designer features, caller contracts and unresolved behavior.
- Dossier: 2,303 pages; 51/51 windows have parsed flags, 989/1002 controls have flags, 688/1002 have captions/titles. A missing caption can be an image-only/template control; it is not proof the control is blank. 135/135 analysis fields have key metadata. 29/29 dossier query entries have SQL; one supplied binary query has no dossier entry.
- Extracted designer images and source layout drawings are under docs/evidence/images/. The dossier does not provide runtime proof.

## Data extraction

Official HFSQL 28 x86 ODBC driver, restricted to an analysis-local/hfsql-scratch-* copy of the supplied Exe data and WDD. The x64 Python driver crashes; .NET Unicode query calls fail. The added ANSI ODBC bridge uses the installed x86 driver and SELECT-only statements; it never decodes FIC internals.

All 17 XDD tables were read: 159,668 rows. Counts were checked before and after each table and against SQLite/CSV conversion. A second hardened export reproduced every first-export table hash. Type-aware row/cell-framed hashes also distinguish NULL, empty text, BLOB and row boundaries. 16,979 NULL cells and 23,615 driver-reported BLOB cells are preserved. The BLOB values are all empty in a generated composite/link field; their business-key meaning is not established. Use component columns to reason about keys, rather than importing that representation blindly.

All 35 copied FIC/NDX/MMO files match their source SHA-256 hashes after driver reads. Canonical data.sqlite, CSVs and manifest.json live in legacy/data/ and remain ignored. docs/data/export-verification.json holds non-record verification results; docs/data/profile.md records the data findings. No target database import or repair was performed.

The profile found 46 column findings, one automatic-key duplicate group and three orphan-link groups. In particular, some stored totals and generated IDs are constant/unused, two labor automatic IDs are duplicated, 52 orders reference absent vehicles, 54 material rows reference absent article codes, and 8 stock lines reference absent article codes. These require later import decisions; nothing was silently normalized, trimmed, rounded or removed.

## Open evidence groups

The generated docs/evidence-report.md currently lists 23 gaps. Every application unit has scoped U identifiers in its mapping note; the following groups explain how to resolve them.

| Gap | Scope | Resolution / interim treatment |
|---|---|---|
| U-INV-01 | Nine list reports have embedded query SQL not printed in the dossier | Compiler labels provide projected items, not conditions or sort. Use recorded proposals as assumed until WINDEV report-editor export or a known-data legacy print confirms them. |
| U-INV-02 | QRY_noname has no dossier SQL or literal caller | Retain seed as unmapped. Obtain query export or establish its design/runtime reachability before any exclusion decision. |
| U-INV-03 | One combined detailed material report has no dossier image | Preserve extracted report layout/code; obtain designer image or known-data PDF before visual acceptance. |
| U-INV-04 | WINDEVDIALOGBOX and WINDEVMESSAGEBOX lack dossier entries | Text code/control geometry are extracted, but designer styling/captions/flags require a runtime capture or designer export. |
| U-INV-05 | Nine list report callers are encoded button actions rather than explicit print calls | Compiled references narrow callers; keep proposed action/SQL behavior assumed until confirmed. |
| U-INV-06 | Fourteen binary MediaPlayer template sources | Preserve each source seed as unmapped; determine design-only versus inherited runtime behavior from a text export or verified comparison. No exclusion ADR is invented. |
| U-INV-07 | Partial control captions/flags and PDF glyph substitution | Consult retained dossier raw text and imagery; image readings are inferred and omitted fields remain unresolved. Do not mechanically execute PDF SQL with typographic quote substitutions. |
| U-INV-08 | Twelve runtime questions and seventeen encoded-action groups | Answer sheet docs/evidence/encoded-actions.md retains proposals. A proposal is assumed, not observed runtime evidence. Destructive Escape/default choices require explicit care. |
| U-INV-09 | Full import fidelity beyond driver representation | ANSI text is the official driver view. No storage-level Unicode proof, large-payload chunk fixture or target import is claimed. Generated binary key representation needs component-key review. |

## High-risk legacy facts for framing

- Stock document deletion appears to apply the same sign as save rather than reversing it; repair deletion can remove material rows without restoring stock. Material-detail close/save paths and multiple unchecked writes can diverge. These are source observations, not approved fixes.
- The dialog skin compares cancellation with the button position and routes Escape to that button. The configured first answer can be destructive; the generated safe proposal is not proof of the deployed result.
- Some labor timer/state operations update rows through shared buffers, with stale query state and lock cleanup questions.
- Client max+1 code allocation lacks a lock. Some CRUD failures fall through to a success result. WIN_Form_postos reads another file's NewRecord flag. Vehicle update SQL interpolates values.
- Project startup can switch all tables to HFSQL Client/Server from servidor.ini and can run WDModFic when act.txt exists. Local copied files do not establish the production topology. Step 0 did not connect to any server or execute the legacy application.

Each fact is detailed with source lines in the corresponding map and independent review report. Later framing must decide preserve-versus-fix and the actual topology; Step 0 makes no such decision.

## Secrets and operational limits

Secret hints identify source locations only. Credentials read from INI files, legacy password fields and credential-bearing updater command arguments must not be copied into new source or logs. No credentials were reused. Hardware, runtime printer behavior, installers and multi-user behavior have not been exercised.
