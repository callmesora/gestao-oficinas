# Current stage — consolidate initial screen breadth

MIG11/12/13 initial implementation is integrated on local main over 258b9aa, macOS arm64. Root owns integration/shared tracking; no push. All 51 application windows and 28 reports have initial paths; shared built-in dialogs remain in use. Isolated stock/startup/report writers are finished. Full verification (443 TS/9 Rust/237 browser) and Mac bundle/import/menu smoke passed; details stay in the rolling handoff.

Next bounded work follows actual defects and existing U/spec obligations:

- Consolidate repeated screen bindings/query adapters only where multiple real consumers establish the pattern. Keep metadata generation, shared controls and one reporting engine.
- Exercise the full demo through real menu workflows; fix reproducible data/layout/cancellation failures without silently changing source quirks. Document unresolved differences in existing specs.
- Production access/session/bootstrap/updater and packaged business entry remain MIG12 work. Preserve the explicit development entry and current authorization boundaries.
- Packaged Chromium/fonts, native preview/download/printing, scanner configured-path/encoding and Windows/macOS device/window acceptance need their actual host/runtime evidence.
- Resolve report source/designer/Resumo assumptions and repair Information locking from evidence; no invented behavior or automatic parity promotion. Reconcile 17 historical table aggregate/per-unit differences separately.

Owner prioritizes implementation and fixes over independent review rounds (ADR007). Coordinator runs meaningful integration checks and commits tested batches. Preserve originals/backup/playbook, source IDs/seed, existing visual floors, guards and the unowned handoff swap. No additional per-agent runbooks.
