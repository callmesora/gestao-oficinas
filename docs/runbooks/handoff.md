# Handoff — Gestao Oficinas

## Latest checkpoint — MIG-15S Windows first access

Windows x64, owner requests production-oriented, seamless first access and a complete installer. The old Notepad code handoff is replaced by a private pipe from the owned launcher to its desktop child and a main-window-only IPC; the server's one-use check remains authoritative. Existing profiles and original legacy data are untouched. The prior trial ZIP predates this change; prior stages are in migration-history.

On a fresh isolated profile, the actual launcher and a development probe running the real Windows WebView UI completed first enrollment without displaying a token, shut down their service, restarted, logged in, and refused reuse of the setup code. Main-window IPC restriction, bounded token validation, a real-process service-exit check during acknowledgement/fallback, and a lost-ack-response UI case passed. The manual browser fallback also passed. Independent review found lifecycle and fallback races; fixes were re-reviewed with no further concrete blocker. The release desktop binary and old-client fallback OS dialog remain unautomated for this change.

The owner also approved cleanup of generated test databases. Two stale test PostgreSQL processes were stopped after verifying their identities. Automatic approval review rejected recursive deletion of an identified disposable test folder as “blocked by policy”; no bypass was attempted. Reversible compression freed space. The owner was told the superseded `windows-runtime-reviewed` staging folder could be removed. Preserve the original HFSQL, the user-created `GestaoOficinasTrial` profile, the working Downloads ZIP, `toolchain`, and any data needed by an active service.

**Next:** build a complete NSIS installer that runs the owning launcher and bundles the service, not the existing client-only installer. Implement and exercise safe backup/restore, version migration and crash recovery, then verify fresh installation, upgrade and uninstall on a clean Windows host. Signing, physical printing/devices and actual colleague data reconciliation remain separate. No full production claim.

Typecheck, focused ESLint, generated-binding check, Windows Rust format/Clippy and targeted checks passed; a native acceptance retry initially hit insufficient disk space, then passed after compression. Full automated suites and Computer Use were intentionally not rerun. See `docs/runbooks/current-stage.md` for details.

Parity/source confidence and the functional evidence inventory are unchanged. The compatibility gate marks prior Mac functional witnesses pending because native/build/test files changed; this is not a claim all workflows failed. Guard/hooks/settings are untouched.
