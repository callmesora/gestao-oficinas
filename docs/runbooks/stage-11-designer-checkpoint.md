# Designer and caller acceptance checkpoint

The scheduled MIG-7C2 target work is delivered; this persistent path supports older workspace instructions. Resume from [handoff](handoff.md) and [ROADMAP](../../ROADMAP.md). Historical implementation/review evidence is in the migration history and Git.

| Area | Delivered target behavior | Remaining acceptance owner |
| --- | --- | --- |
| Forms/pickers | Source-enabled resizing, anchors and saved geometry; mounted drafts and nearest-dialog key/pointer/focus ownership | ADR003, U-SKIN-01..03 and each form's designer/native U rows |
| Numeric entry | Customer code, vehicle year/month and terminal positions retain raw/NULL/large values; invalid edits refuse before transport | ADR002/003/016, each consumer's mask/locale/native U rows |
| Tables | Real header seek, source-gated settings/scroll/truncation with fixed column keys and caller-owned queries | ADR012/013, U-SKIN-04/05 and per-table U rows |
| Assistance | Only evidenced text-key consumers opt in; explicit dirty acceptance, free text and NULL retained | ADR003, U-SKIN-06 and consumer input U rows |
| Callers | Actual customer→vehicle and terminal→Postos continuation, including stale-response ownership, is tested | Remaining distinct repair/material/labor callers stay with MIG8–10; no synthetic caller proves them |

Do not promote broad designer/whole-window rows while native/runtime/human, reports or UMC remain open. UMC has no approved exclusion. Windows and macOS native acceptance are separate; browser scores do not substitute. Current source mappings, screen specs, ADRs and parity own precise requirements. No new full gate or restart of completed C2 target work is implied.
