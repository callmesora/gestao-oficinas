# Historical Step 0 evidence — 23 October 2026

This records source inspection/export evidence from the original Windows stage, before implementation. It is not a current-host test or an instruction to restart the migration. Current delivery is in [handoff](handoff.md).

| Evidence | Historical result |
| --- | --- |
| Dossier/source | 2,303 pages;51 application windows;29 query definitions;135 keyed analysis fields;128 source fingerprints |
| Mapping/specs | 143 units,53 window specs,28 report specs;877 source-seed behaviors preserved |
| Images | 106 dossier images and53 layout drawings; one report and both WDFAA windows lack dossier references |
| Driver export | 17 tables/159,668 rows from a scratch copy; repeated counts/typed hashes matched historical manifest, including16,979NULL/23,615BLOB cells;35 source files unchanged |
| Initial parity | 2,273 rows:1,792specified/481unmapped,326 assumed-confidence rows; zero target implementation or acceptance at that stage |
| Checks | 143 unit checks, source-seed/U lints, schema syntax,4 export/path tests and75 playbook tests passed; no legacy/native/target workflow replay |

Canonical evidence: [validation JSON](step0-validation.json), [export verification](../data/export-verification.json), [mapping index](../mapping/README.md), [legacy inventory](../legacy-inventory.md), [question summary](../evidence/question-summary.md) and [answer sheet](../evidence/encoded-actions.md). Full original report is recoverable from Git8188064.

Retain embedded-report SQL proposals, QRY_noname uncertainty,14 binary templates,12 runtime questions/17encoded-action groups, data anomalies and driver encoding/payload limitations in those canonical sources. Generated composite/link cells do not establish business-key encoding; use evidenced component keys. Current Mac input is the separate provisional SQLite projection described in setup/LOCAL-WORKSPACE.md, with23,615stock rows quarantined; historical export evidence does not establish current whole-export fidelity.
