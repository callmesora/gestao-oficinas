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

`npm run dev` without a workflow still shows the foundation diagnostic. Use the imported menu commands in the local setup guide for working business screens. Persistent authenticated packaged startup is the active MIG12 slice. `npm run native:check` exercises the built Windows WebView2 app separately from browser checks.
