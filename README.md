# gestao-oficinas

WINDEV/HFSQL workshop application migration workspace.

**Step 0 evidence/mapping complete; full migration authorized. Framing is recorded; foundation has local verification and native IPC smoke evidence. Business slices remain unmigrated.**

- [Step 0 results and remaining questions](docs/runbooks/step0-report.md)
- [Handoff and next-session instructions](docs/runbooks/handoff.md)
- [All mapped units](docs/mapping/README.md)
- [Evidence coverage](docs/evidence-report.md)
- [Data profile](docs/data/profile.md) and [export verification](docs/data/export-verification.json)
- [Progress dashboard](docs/progress/index.html)

The original WINDEV project, dossier, HFSQL data, Python environment and raw extraction cache stay local and ignored. This repository contains the tools, specifications, source fingerprints, review findings and behavior-parity matrix. Source evidence confidence is separate from implemented/tested target behavior: no behavior is marked implemented or verified yet.

Follow [ROADMAP.md](ROADMAP.md) in dependency order. Accepted framing defaults are in [docs/decisions](docs/decisions); current state is in the handoff. The target uses Windows Tauri with a shared TypeScript API/PostgreSQL by default; deployed topology still needs confirmation.

From a local checkout with the private legacy inputs:

```powershell
. .\setup\Enter-Prerequisites.ps1
python scripts/verify_step0.py
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

`npm run dev` shows an explicitly labelled browser preview with simulated native metadata. It is a temporary foundation diagnostic, not a migrated legacy window. `npm run native:check` uses Playwright with the built app’s actual WebView2 and Rust command. Schema/import, skin kit and business workflows follow the roadmap.
