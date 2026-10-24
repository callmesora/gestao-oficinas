# GS-VEHICLES-001 — vehicle registration write projection

Status: **spec-derived**, not recorded from legacy runtime. Evidence: WIN_Form_Viaturas.wdw:34–70; dossier QRY_select_viaturas/sql and QRY_select_viatura_matricula/sql. ADR-010 records text comparison, identity and transaction defaults.

In an isolated migrated PostgreSQL database, create customer Codigo 9007199254740993, then create registration golden-01 with that exact customer, make Marca, model Inicial, year/month zero. Edit by original uppercase registration to model Final. Attempt another create with the same registration; it must not overwrite the first record. Export the six form-bound fields for GOLDEN-01 and compare against after/Viaturas.csv without trimming. Automatic/internal identifiers are outside this logical projection. The committed fixture is synthetic.

The named test in apps/server/src/operations/vehicles.test.ts exercises the actual API, PostgreSQL operation and scripts/compare_exports.py. Browser flows additionally cover required messages, nested real customer selection and cancellation, create/edit/reload, query-filter state, duplicates, explicit delete and caller return. Runtime-recorded replay, locale equivalence, native persistence/keyboard/printing and full designer parity remain separate gates and U items.
