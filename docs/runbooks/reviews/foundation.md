# Foundation review — MIG-3

23 October 2026. Separate sequential self-review using skills/review/SKILL.md, as explicitly requested by the owner; no review agent was used for this stage. Read the source/configuration, stage brief and accepted ADRs; examined actual browser/native screenshots. No legacy parity row moved.

## Findings and fixes

- Blocking: Windows integration-test executable imported TaskDialogIndirect but lacked the Common Controls v6 manifest, causing 0xc0000139 before tests ran. The actual app already had its Tauri manifest. Moved dispatcher coverage to a real integration target and applied a Windows/MSVC test-only manifest in build.rs; no test removed or weakened. Full Rust tests and clippy then passed.
- UI behavior: native-disabled diagnostic button could lose keyboard focus during the request. Retained focus with aria-disabled/aria-busy plus a pending guard. Failure/retry flow now passes with keyboard Enter. The mock wrapper was corrected to forward the original command arguments.
- Convention: fresh Windows checkouts could change generated binding line endings. .gitattributes explicitly pins generated TypeScript to LF so deterministic drift comparison remains exact.
- Evidence reliability: native smoke initializes its report as incomplete before launch, so a failed rerun cannot retain a previous passing report. It uses an isolated WebView2 profile and only its child process gets CDP settings.

## Results and limits

Full npm run verify passes locally: TypeScript/lint, 4 Vitest tests, Rust unit/integration tests, bindings, parity and 2 Playwright browser flows. Tauri debug build and Playwright against actual WebView2/Rust IPC pass, including reload. No residual blocking/parity/convention finding in this foundation scope. CI result still needs the first push. No installer, database, business rules, skin or printer/device parity is claimed.

Sources for the test-harness fix: installed official tauri 2.12.5 build.rs test manifest pattern; Cargo build-script link-argument documentation. Native automation follows https://playwright.dev/docs/webview2 and uses no computer-use UI control.


## Fresh-checkout CI follow-up

The first hosted run (40005606973) failed at the UI harness's unconditional private-inspector prerequisite. The initial local review did not test without local extraction files; the correction now adds that condition to the method. Moved the requirement into legacyControls so every configured legacy window still requires evidence, while the foundation-only flows have no irrelevant private dependency. Verified with npm ci and both UI flows in a clean local clone lacking private data, then deliberately configured a visible diagnostic element as a negative fixture and proved the named missing-inspector error remains a failing gate. Main npm run verify rerun passes. No tests were skipped, assertions relaxed or visual floors changed.

CI actions were updated from deprecated Node-20-based versions to current official checkout/setup v7 and cache v6. Rust registry/git/build cache is lock-keyed and does not skip verification. Await the rerun result before closing MIG-3.


## Native CI preflight follow-up

Hosted run 40007248816 passes the entire verify command and native compilation but times out awaiting WebView2 CDP. Added an explicit idempotent runtime prerequisite, using Microsoft's signed official bootstrapper only if the runtime registry entry is absent; native process stderr/stdout is bounded for this metadata-only diagnostic. The native command now guarantees a packaged-assets build before launch; cargo test can overwrite the debug executable with a dev-server build, which a local rerun exposed. Local native automation passes again, including reload, using WebView2 155.0.4283.62. No assertion or timeout was relaxed. Cache restore/save is separate so even a later native failure retains reusable build dependencies without skipping checks. Hosted success remains required.
