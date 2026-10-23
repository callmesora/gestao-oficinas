# Handoff — latest stage (Gestao Oficinas)

## Stage — Foundation wiring (MIG-3), local gate passed; CI pending

23 October 2026. Branch main; commit is the MIG-3 commit containing this report (git log). Push authorized. Local verification/review completed; roadmap remains In progress until the newly added remote CI result is checked. Framing commit 13fb9b3 was pushed successfully.

Parity unchanged: 2,273 rows; 1,792 specified, 481 unmapped, zero implemented/verified/excluded. No legacy functionality is migrated yet. Full migration is authorized, using safe documented defaults. The owner prefers sequential implementation and separate self-review; use subagents only for a substantial expected benefit. Prefer Playwright/CLI to computer use.

### 1. Delivered

- Maintained React/TypeScript/Vite/Tauri 2 scaffold, correct project identity, pinned Node/npm/Rust and npm/Cargo locks. Starter greeting/logos/opener capability removed. Accepted src/application/infrastructure/ui and shared packages/domain/apps/server boundaries remain in architecture.md; empty architectural folders have no fake implementations.
- Narrow native_info command; ts-rs generated NativeInfo and command catalog; exact binding check catches changed/missing/unregistered generated files. Windows bindings use LF deterministically.
- Temporary foundation-only diagnostic and visible dev browser-preview banner. Strict response validation, failure/retry UI and keyboard flow. Non-legacy identifiers/text are documented in foundation-controls.md; no legacy window/visual fidelity claimed.
- Fastify process-liveness endpoint, no business routes or database-readiness claim. No protected functionality is exposed.
- npm run verify chains TypeScript, ESLint, Vitest, Rust format/clippy/tests, generated bindings, parity and browser flows. UI coverage/scoring harness is copied from the guide; zero legacy screens configured until built, explicitly not complete control coverage.
- Windows CI workflow, local CI instructions, deliberate production CSP, no arbitrary SQL/files/shell capability. No guard/hooks/agent settings modified.
- Actual native automation: npm run native:check uses Playwright CDP against an isolated child WebView2 process, checks the real Rust command result and reload. No persistent/global debugger setting. Machine-readable local result: native-metadata-check.json; screenshots in ignored ui-report/ inspected by the agent.
- Self-review and fixes: docs/runbooks/reviews/foundation.md. Missing Windows test manifest corrected without removing tests; keyboard retry focus and binding line-ending consistency corrected.

### 2. Assumptions and differences

All framing defaults remain in ADRs 001–007. This is framework/verification wiring only. The foundation page is a developer diagnostic; it is not the legacy menu or an accepted visual redesign. Stock app icon remains a scaffold artifact to replace during the skin/branding stage; no installer/branding acceptance is claimed.

Official supported WebView2 CDP automation substitutes for slower manual computer use and proves this actual native metadata path. It does not prove database writes, native printers, installers or business parity. Rust mock-runtime dispatch tests are labelled separately from the actual WebView2 smoke.

### 3. Checks actually executed

Windows 11 Home 10.0.22000, setup/Enter-Prerequisites.ps1 loaded:

- npm run verify: PASS. TypeScript and ESLint; 4 Vitest tests; cargo fmt; cargo clippy --locked --all-targets -- -D warnings; Rust unit test plus integration dispatch test; generated binding equality; parity; 2 Playwright browser flows (success and failure/keyboard retry).
- npm run build: PASS.
- npm run tauri -- build --debug --no-bundle: PASS; built src-tauri/target/debug/gestao-oficinas.exe.
- npm run native:check: PASS; actual WebView2 UI -> Tauri IPC -> Rust native_info -> rendered 0.1.0/windows, repeated after reload. Browser preview banner absent. Screenshots inspected.
- npm install: lock/workspace resolution complete, audit reports zero vulnerabilities; only esbuild@0.28.2 install script explicitly approved.
- git diff --check: PASS for current tracked changes; staged check is required before commit.
- Historical Step 0 verifier and 4 Python extraction tests passed during framing, same untouched legacy inputs; no target status advance.

Initial full Rust test failed with loader code 0xc0000139. Imports identified TaskDialogIndirect/comctl32; Tauri's app manifest covered the application but not the test harness. The integration target now receives its own Common Controls v6 manifest. Full verify rerun passed; the failed attempt is not hidden.

Not run: hosted CI (await first workflow push), installer packaging/install/upgrade/uninstall, PostgreSQL schema/import/reconciliation, business golden scenarios, legacy runtime, printer/scanner checks, visual parity against legacy screens. Browser tests do not substitute for these.

### 4. Remaining work

1. Commit/push explicit MIG-3 files and inspect the Windows CI result. Fix any failure and rerun relevant checks. Do not claim foundation Done merely because the local build passed.
2. Once MIG-3 is Done, begin MIG-4: read full table maps/specs/source evidence; explicit every-field mapping; real isolated PostgreSQL; schema v1, fixtures, dry-run import, quarantine/provenance and reconciliation, rollback/retry and backup/restore. No silent data repairs.
3. MIG-5 skin kit, all layouts/assets and temporary launcher; replace scaffold icon from evidenced project assets. Then bounded leaf workflows per ROADMAP, with cleanup after first 2–3 and periodically later.
4. For every stage use the guide brief, separate review/fix pass (two for risky slices), actual checks, parity/roadmap/handoff/progress, explicit-file commit and authorized push. Final migration remains a large amount of work; no completion claim.

### 5. Decisions needed from the human

No blocking decision for foundation. Previously recorded deployment, behavior-change, devices, exclusions and go-live questions remain defaults/open evidence; answer sheet retains 12 runtime questions and 17 action groups. Do not infer those answers from tests of the new application. Native hardware/legacy observations require access when the relevant stages reach acceptance.

## Playbook issues

- Windows Rust integration tests need Common Controls v6 manifest when Tauri dispatch is linked; normal tauri_build application resources only cover binaries. Added a narrowly scoped test manifest.
- Auto-discovery selects a backup compile folder; use the actual My_GestaoOficinas.cpl path from existing evidence runbooks. Official x86 ANSI export compatibility route remains documented; no legacy application or server was executed/connected.
- Shared topology adapts template src/domain and src-tauri/migrations paths to packages/domain and apps/server/migrations, per ADR-001. Guard installation remains human-owned and was not performed.
