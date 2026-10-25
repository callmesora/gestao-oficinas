# gestao-oficinas

WINDEV/HFSQL workshop application migration workspace.

Local development supports Windows and macOS. For prepared source evidence, exact runtimes, temporary SQLite data and launch commands, read [setup/LOCAL-WORKSPACE.md](setup/LOCAL-WORKSPACE.md). Current delivery and remaining work are in the [handoff](docs/runbooks/handoff.md).

All51 business windows and28 reports have initial paths. Completion is measured by verified source behaviors in the [dashboard](docs/progress/index.html); partial implementations, native acceptance and unresolved evidence remain visible.

- [Step 0 results and remaining questions](docs/runbooks/step0-report.md)
- [Handoff and next-session instructions](docs/runbooks/handoff.md)
- [All mapped units](docs/mapping/README.md)
- [Evidence coverage](docs/evidence-report.md)
- [Data profile](docs/data/profile.md) and [export verification](docs/data/export-verification.json)
- [Progress dashboard](docs/progress/index.html)

Original WINDEV evidence, databases, environments and extraction caches stay local and ignored. Source evidence confidence is separate from implemented/tested target behavior.

Follow [ROADMAP.md](ROADMAP.md) in dependency order. Accepted framing defaults are in [docs/decisions](docs/decisions); current state is in the handoff. The target uses Windows Tauri with a shared TypeScript API/PostgreSQL by default; deployed topology still needs confirmation.

From a local checkout with the private legacy inputs:

```powershell
. .\setup\Enter-Prerequisites.ps1
python scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files
python -m unittest discover -s tests -v
```

Copied playbook attribution: [third-party/playbook](third-party/playbook/README.md).


Foundation development commands (Windows):

```powershell
. .\setup\Enter-Prerequisites.ps1
npm ci
npm run verify
npm run tauri -- build --debug --no-bundle
npm run native:check
```

Normal startup opens authenticated business access; the foundation diagnostic is explicit at `?diagnostics=foundation`. For persistent local data, build once, run `npm run local:setup` once (optionally `-- --snapshot <copied-importer-snapshot>`), then `npm run local:start`. Enrollment uses the private operator-token file printed by setup; existing imported accounts require an explicit password reset. Details and native launch commands are in the [local setup guide](setup/LOCAL-WORKSPACE.md#persistent-local-app). `npm run native:probe` and `npm run native:business` exercise actual native startup and a synthetic business flow on the current host; Windows WebView2 has its separate `native:check`.

## Offline report runtime on the API host

The persistent API owns the existing Playwright/Paged.js renderer. Desktop clients receive its offline HTML/PDF; they do not need a second browser engine. Before starting the service on Windows or macOS, install the exact lockfile dependencies and provision Chromium separately. The pinned CLI can download its matching browser during this explicit provisioning step:

```shell
npm ci
npx playwright-core install chromium
```

Set all three service environment variables. `GESTAO_REPORT_CHROMIUM_EXECUTABLE` is the absolute local browser executable (Windows drive path or macOS executable inside the application bundle), `GESTAO_REPORT_CHROMIUM_SHA256` is that executable's 64-character SHA-256, and `GESTAO_REPORT_CHROMIUM_VERSION` is its exact four-part `Browser.version()` result. Keep that runtime available to the service account. These pins deliberately reject an automatic browser update until the operator validates and updates the configuration.

After provisioning, this command prints the matching installed executable, fingerprint and version for configuration; it does not download anything:

```shell
node --input-type=module -e 'import {chromium} from "playwright-core";import {readFile} from "node:fs/promises";import {createHash} from "node:crypto";const executablePath=chromium.executablePath();const browser=await chromium.launch({executablePath,headless:true});try{console.log(JSON.stringify({GESTAO_REPORT_CHROMIUM_EXECUTABLE:executablePath,GESTAO_REPORT_CHROMIUM_SHA256:createHash("sha256").update(await readFile(executablePath)).digest("hex"),GESTAO_REPORT_CHROMIUM_VERSION:browser.version()},null,2));}finally{await browser.close();}'
```

Preserve the installed `playwright-core`1.64.1, `pagedjs`0.4.3 and `@fontsource/noto-sans`5.3.0 package metadata, Paged.js distribution/license and Noto Sans Latin regular/bold WOFF2 files/license in the service deployment. The factory validates these offline assets, the executable fingerprint and a real headless launch/version before enabling reports. Normal startup never downloads or searches for another browser. No report configuration leaves the protected report API typed unavailable; incomplete, missing or mismatched configured resources fail startup with a fixed error code that omits configuration values. Native printer/device and Windows/macOS packaged acceptance remain separate gates under ADR005.

The configured-runtime test is `npm test -- apps/server/src/reports/runtime.test.ts`. It exercises real launch failures and an offline PDF with embedded fonts. On a test host whose browser is elsewhere, set `REPORT_TEST_EXECUTABLE` to that explicit executable; service configuration still uses the three production variables above.
