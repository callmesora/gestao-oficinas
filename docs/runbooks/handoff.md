# Handoff — Gestao Oficinas

## Stage — MIG-8.1 repair list

macOS arm64, local `main`, base `0062d9d` plus this integrated tree. No push. Preserve the unowned `.handoff.md.swp`, originals, backup and read-only playbook. Root owns integration; isolated writer copies are stale after integration and must not overwrite main.

### 1. Delivered

Actual repair-order list, protected PostgreSQL/API reads and flag-only state-default save, four date bounds, filters, exact selection/timer ownership and real customer/vehicle/mechanic pickers. Shared RAD controls now include lossless DateTime and a common Date8/DateTime calendar; qualified metadata resolves six columns/four Shapes across two windows. New/Edit/Delete/Information/Print remain their next consuming stages.

Parity:2,273 rows —23 verified,343 implemented,1,426 specified,481 unmapped,0 excluded. Exactly18 existing repair-list source rows move to implemented; all95 unit rows match aggregate. Twenty-five development windows,0/53 whole windows complete. No native/runtime/human approval or feature exclusion implied.

### 2. Assumptions and differences

ADRs002/003/006/009/012 preserve raw dates/large IDs/join multiplicity, exact typed ordering, nullable state flags, whole programmatic plate filters and source caller sequencing. Native precision, first custom mechanic row, NULL/ties/keyboard/timer overlap remain U-W53605A-01..05. Gravar updates only current lancar_defa under a lock/transaction. Date controls disable together while busy; detached picker continuations cannot open dialogs or write.

The source mappings/specs/parity and ADRs are authoritative. Details: [stage24](stage-24-repair-list.md), [review](reviews/repair-list.md). Historical stage reports belong in Git, not this rolling handoff.

### 3. Checks actually executed

- Focused35 domain/DateTime/realPG/API/golden pass; GS-REPAIR-LIST-001 compares8joined/2filtered/4persisted state rows.
- Actual width-required mount fails before recovery. Python35run34pass/one existing Windows-only skip. Exact metadata audit preserves other payload/geometry/154PNG/45asset records.
- Actual delayed Defa/closed vehicle-picker regressions fail before fixes; all30repair+oldDate browser flows pass afterward. Full-window visual96.2pixel/76.8edge inspected, floors unchanged.
- Read-only imported API compares15667 joined rows/all11public raw fields/multiplicity/numeric order; real historical browser9rows, writes0/both inputs unchanged. Import136053/quarantine23615/zero mismatch unchanged.
- Full `npm run verify` exits0:327TS/DB52files,9Rust,197browser/twelve DB goldens; types/lint/fmt/clippy/bindings/parity and53layouts154PNG pass. Existing TanStack/ts-rs diagnostics retained. Debug Mac bundle exits0/30.25MiB, foundation entry only. Owned PostgreSQL0 after shutdown. Logs: analysis-local/repair-list-{verify,macos-bundle}.log; exact final audit/progress pass. Both fresh independent reviewers closed all four categories after final code/evidence/tracking reread; no remaining finding.

Not run: Windows/WebView2/shared build, actual native interactive calendar/pickers, legacy/runtime/human/device acceptance and official scratch-copy HFSQL reconciliation. The available SQLite remains provisional; preserve quarantine and both inputs.

### 4. Remaining work

1. Commit the reviewed explicit owned files locally. Never push or modify/bypass guards/hooks/settings.
2. User-requested documentation consolidation before the next implementation: short rolling handoff, fewer repeated completed-stage/review narratives, operational procedures and source evidence preserved. Guide04 explicitly supports this. Make a separate reviewed commit.
3. MIG-8.2: full repair form and actual New/Edit/Delete callers. Read all18 form blocks/map/spec/70rows and query SQL; freeze gnCliente capture,18writes/8omitted parameters, required-before-Date-prompt continuation and current-value preservation in existing ADRs before code. Read-only contract report is in this chat; reread sources before implementation.
4. Continue materials/labor/stock, persistent startup/access/navigation (MIG-12), reports (MIG-13), native/transition rehearsal. Packaged entry is still the foundation diagnostic; development routes are not finished persistent startup. Source `setup/Enter-Prerequisites.sh`; use `npm run dev:local` for disposable imported development.

### 5. Decisions needed

No blocking owner decision. Follow delegated safe defaults with honest U status. External native/Windows/HFSQL/human gates do not stop independent work. Full migration remains active; a bounded delivery is not the end of the assignment.
