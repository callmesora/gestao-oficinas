# Gestao Oficinas — evidence and mapping

Current authorization: Step 0 only (HFSQL copy/export, evidence extraction, mapping and independent review). Stop before framing decisions, application scaffolding and implementation. No application functionality is migrated yet. Do not run the kickoff prompt.

Read docs/runbooks/handoff.md when present, docs/mapping/README.md, and the unit's mapping/spec/parity files before changes. User confirmed this laptop is the dedicated environment and waived sanitization for preparation. Keep raw legacy data and credentials out of Git.

## Layout

- legacy/GestaoOficinas_TesteIA/ — immutable original project copy; never execute legacy code.
- GestaoOficinas_TesteIA/ — original supplied folder, do not modify.
- migrate-windev-javascript/ — separate playbook checkout, read-only.
- scripts/, templates/, skills/ — copied playbook tools and workflows.
- analysis-local/ — ignored extracts and scratch data; only the main agent writes here.
- docs/mapping/, docs/screens/, docs/reports/ — reviewed legacy specifications.
- docs/parity/ — one CSV per mapped unit; main agent consolidates parity.csv.
- docs/runbooks/ — handoff and stage checks.

## Rules

1. Read the full unit source and evidence. Cite legacy/path:line, dossier: Unit/field, or docs references; never cite analysis-local paths as durable evidence.
2. Follow skills/map-element/SKILL.md for mapping and skills/review-mapping/SKILL.md for review. Read docs/wlanguage-traps.md and docs/porting.md when present.
3. Confidence describes evidence: verified, inferred, assumed or unresolved. Stage 0 statuses are specified or unmapped, never implemented or verified.
4. Keep every SRC seed ID. Encoded proposals are assumed, not verified facts. Every unsolved point needs a U-UNIT-nn ID.
5. No business or architecture decisions here. Planned target patterns in docs/porting.md are proposals for framing, not accepted ADRs.
6. Preserve original source and data. Export only a scratch copy through the official HFSQL driver. Never decode FIC manually or connect to production.
7. Never copy secret values into notes, tools output or commits; record locations only.
8. One writer per file. Agents write only assigned notes/specs/per-unit CSVs. Never stash/reset/clean/rebase or stage other agents' work.
9. Do not install or modify guard hooks or agent settings. No force pushes or bypasses.
10. Commit explicit files only; no git add -A. Do not push Step 0 results without user authorization.

## Commands

Use .venv/Scripts/python.exe, with PYTHONUTF8=1 and PYTHONIOENCODING=utf-8; or load setup/Enter-Prerequisites.ps1.

- python scripts/unit_evidence.py UNIT --out analysis-local/units/UNIT.json (main agent only)
- python scripts/parity_check.py docs/parity/UNIT.csv --seed docs/parity/parity-seed.csv --element UNIT --check-files --note docs/mapping/UNIT.md
- python scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files
- python scripts/progress_dashboard.py --title "Gestao Oficinas"

Do not run npm scaffolding or builds: the application has not been created. Extractor/schema drafts are evidence, not production migrations.
