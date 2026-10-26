# Current stage — MIG-15W Windows validation

Owner requested latest GitHub main and actual Windows execution. Root owns this isolated worktree over `6b1fda4` on Windows x64; the original laptop checkout and its unfinished edits are preserved. No push or production operation. Prior Mac delivery remains in the handoff/history stage 38.

Native checkpoint: formatting, Clippy, bindings, 25 Rust tests, packaged WebView2 metadata/reload, four startup cases, scanner-file IPC and real enrollment/1001-customer search/save/report/logout/login passed. Fixes scope Unix-only mutability, unit-harness Common-Controls manifest, Windows fixture paths/file-time handles and startup URL readiness. Separate reviewer found no defects in these fixes; Mac rerun remains unavailable. No business/parity promotion.

API/PG/PDF sweep plus focused retries: 817/819 passed. Retain CLI SIGTERM/exit cleanup timeout on Windows and symlink-fixture EPERM as failures; do not weaken/skip assertions. Native backup clients18.4 were built from the checked source using ignored portable Perl and existing MSVC. Full logs: ignored `analysis-local/windows-acceptance/`.

Laptop shutdown interrupted browser execution after146 passes and two stock safe-dismissal timeouts. Original log/artifacts preserved. Resume645 exact unpassed cases using `browser-passed-before-shutdown.txt`; this is continuation, not test exclusion. Finish the suite, investigate concrete failures, run remaining Python/parity/acceptance checks, provide a local app launch and update handoff/history/progress with honest host limits.

Retained UI gaps: statement/labor preview assets and Tab sequences; stock/labor list Tab order; report-title NoAnchor, repair-order state caption Right anchor and labor/observation caption placement/alignment. Partial contracts also lack specific NULL/edit/mask/native witnesses. Preserve originals/backups, owner demo on 3210 and its profile, unowned swap, 17 import-copy differences and 11 pending platform checks. No push.
