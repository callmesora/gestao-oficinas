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
