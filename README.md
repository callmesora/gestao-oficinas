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

Backup and fresh-profile restore commands are in [data recovery](docs/data-migration.md#reconciliation-and-recovery). They require the source service stopped and explicitly provisioned PostgreSQL18.4 tools; recovery tests use separate profiles and never interrupt your running demo.

## Offline report runtime on the API host

The API renders reports with the existing Paged.js/Playwright engine and embedded Noto Sans fonts. Install the lockfile dependencies and explicitly provision a local Chromium executable (the pinned download is `npx playwright-core install chromium`, if needed). With the local service stopped, save its validated path/hash/version once:

```shell
npm run local:reports -- --executable <absolute-browser-executable>
npm run local:start
```

Use `--profile <existing-profile-directory>` for another local profile and `--replace` only for an intentional runtime update. Provisioning checks a real offline PDF before saving private, profile-bound pins; ordinary startup never downloads or selects another browser. This Mac explicitly uses `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Browser updates require explicit revalidation.

Set `WORKSHOP_REPORT_COMPANY` in the service environment to supply the company header for every report; exact text is preserved. For example on this Mac: `WORKSHOP_REPORT_COMPANY='Minha oficina' npm run local:start`.

A separately deployed API may instead set all three variables: `GESTAO_REPORT_CHROMIUM_EXECUTABLE`, `GESTAO_REPORT_CHROMIUM_SHA256` (64 hex characters) and `GESTAO_REPORT_CHROMIUM_VERSION` (exact four-part `Browser.version()`). Explicit partial/invalid settings fail without falling back to saved pins. Missing configuration leaves reports typed unavailable.

Preserve `playwright-core`1.64.1, `pagedjs`0.4.3, `@fontsource/noto-sans`5.3.0, offline assets and their licenses on the API host. Tests: `npm test -- apps/server/src/local/report-runtime.test.ts apps/server/src/reports/runtime.test.ts`; a test host may select its browser with `REPORT_TEST_EXECUTABLE`. Native dialogs, physical printing and other-host acceptance remain separate.

## Configured scanner file on the desktop host

Set `GESTAO_SCANNER_FILES_CONFIG` in the desktop application's launch environment to an absolute local JSON manifest. Provision it outside the checkout with permissions limited to the app's OS user (0600 on macOS; that user's ACL on Windows). This is a trusted native grant, never a browser/API setting. Example with synthetic paths:

```json
{"version":1,"terminals":[{"terminalCode":"T01","sourceFolder":"C:\\Scanner","sourceFilename":"scan.txt","localFile":"/Users/example/Scanner/scan.txt","encoding":"utf-8"}]}
```

`terminalCode`, `sourceFolder` and `sourceFilename` must exactly match the terminal selected by Postos Codigo1, including case/spaces. Keep database paths unchanged. Set `localFile` to the actual absolute native file (for Windows, for example `C:\\Scanner\\scan.txt` in JSON); no C-drive/UNC translation is attempted on macOS. Manifest and input must have real directory components, without symlinks/reparse points. The manifest is at most 64 KiB/128 unique terminals; each input is a regular stable file of at most 4 MiB.

Explicit decoder values are `utf-8`, `windows-1252` or `utf-16le`. Malformed UTF, odd UTF16/surrogates and undefined CP1252 bytes fail; no encoding detection, replacement, BOM removal or text normalization occurs. Confirm the scanner's actual format before provisioning: the original WINDEV project charset is unproved. Export the variable before `npm run desktop:mac`, or set `$env:GESTAO_SCANNER_FILES_CONFIG` before launching the Windows executable; a packaged GUI launch must receive the same variable.

Missing configuration is typed unavailable. A native read failure shows the source read-failure Info and cancels that reader; it never selects another file. Input remains intact after confirmation/cancellation and can be read again. Native only reads explicitly granted files; it exposes no path, grant-edit, write, move or delete command. Physical scanner, Windows/macOS host permissions and native focus remain separate acceptance checks.
