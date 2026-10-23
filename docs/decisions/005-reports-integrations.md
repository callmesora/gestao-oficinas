# ADR-005 — Fixed reports and narrow native adapters

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/mapping/reports.md records 28 fixed report specs, nine embedded SQL proposals and one missing report image. docs/mapping/jobs-and-integrations.md and docs/evidence-report.md inventory actual platform calls.

## Decision
Use fixed HTML/CSS report layouts with PDF output and a native printing adapter; preserve band breaks, filters and totals. No end-user designer is inferred. Migrate only evidenced devices, INI settings, command-line modes and external programs. Native commands are narrow and scoped; never expose arbitrary SQL/shell/filesystem operations. Use a deliberate CSP and minimum Tauri capabilities. Distribution initially uses a local Windows acceptance installer; signed prod/test update channels need real endpoints/keys later, never an embedded GitHub token.

## Consequences and verification
Each report needs data/text/total checks and visual comparison; printing and scanners require real native/device checks. Browser printing does not prove packaged printing. Missing external resources remain named acceptance dependencies, not stubbed verified features.
