# Current stage — MIG-14F functional readiness closed

macOS arm64/main over `d45ab60`; no push. Three isolated workers supplied list printing, operations and menu/report caller tests; root integrated/tracked, with fresh independent reviews. All227 unchanged functional requirements pass across53 screens/28 reports. Proofs:`analysis-local/functional-sweep/`; latest results:`docs/runbooks/handoff.md`.

Use `python scripts/functional_acceptance.py --require-complete` and regenerate progress after changes. Functional100% remains separate from strict source parity and cutover (ADR-007). Next gates: host-labelled installation/native dialogs/printing/devices/recovery, Windows acceptance, official import reconciliation and source questions;11 platform checks remain pending. Existing native macOS business smoke passes.

Preserve source/confidence/seed/U IDs, original backups,17 historical import-copy differences, owner demo3210/profile and unowned swap. Keep one integration owner and isolated writers. Strict rows need their own proof; application/test edits invalidate functional witnesses. Guide checkouts remain unchanged.
