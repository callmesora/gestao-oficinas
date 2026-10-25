# GS-UNITS-001 — units save and duplicate projection

Status: **spec-derived**, not recorded in legacy runtime. Source WIN_Form_unidades.wdw:34–62/332–344 and WIN_Table_unidades.wdw:180–216. ADR-011 owns target identity/failure/text-key defaults.

Using the real authenticated API and isolated PostgreSQL, create Codigo GLD with blank Descricao, edit its description to Final, then attempt a duplicate create with another description. Export Codigo/Descricao and compare without trimming to after/unidades.csv. Automatic/internal IDs are outside this logical projection; the fixture is synthetic. The named test in apps/server/src/operations/units.test.ts invokes scripts/compare_exports.py against that actual export. Browser tests exercise required/duplicate dialogs, create/edit/cancel/reload and explicit cancel/confirm deletion. Unknown locale, implicit selection, native keys/dialog behavior, report and UMC remain separate open gates.
