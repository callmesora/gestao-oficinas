# gestao-oficinas

WINDEV/HFSQL workshop application migration workspace.

**Step 0: evidence extraction and reviewed mapping complete. Application implementation has not started.**

- [Step 0 results and remaining questions](docs/runbooks/step0-report.md)
- [Handoff and next-session instructions](docs/runbooks/handoff.md)
- [All mapped units](docs/mapping/README.md)
- [Evidence coverage](docs/evidence-report.md)
- [Data profile](docs/data/profile.md) and [export verification](docs/data/export-verification.json)
- [Progress dashboard](docs/progress/index.html)

The original WINDEV project, dossier, HFSQL data, Python environment and raw extraction cache stay local and ignored. This repository contains the tools, specifications, source fingerprints, review findings and behavior-parity matrix. Source evidence confidence is separate from implemented/tested target behavior: no behavior is marked implemented or verified yet.

Stop before framing, scaffolding or application code until the owner authorizes the next stage. The startup can support local or server HFSQL; the target topology has not been chosen.

From a local checkout with the private legacy inputs:

```powershell
. .\setup\Enter-Prerequisites.ps1
python scripts/verify_step0.py
python -m unittest discover -s tests -v
```

Copied playbook attribution: [third-party/playbook](third-party/playbook/README.md).
