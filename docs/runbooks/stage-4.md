# MIG-5 — skin foundation

Read handoff, AGENTS, ROADMAP, ADR-003/007 and the relevant mapping/spec/parity evidence. Synchronize safely before changes. No business workflow or parity claim follows from a rendered layout.

1. MIG-5a: generate all 53 layouts with screen_layout.py; export referenced project skin images/states with skin_assets.py; reject ambiguous/missing assets; record hashes and unresolved designer metadata. Verify regeneration locally and artifact integrity without private inputs in CI.
2. MIG-5b: adapt shared window/button/edit/table/message primitives to the accepted in-app workspace, generated layouts and real assets. No native-window close/minimize handlers on child windows. Add the temporary launcher, control/caption/asset/keyboard checks and visual comparisons. Unknown dialog properties remain identified U items.

Keep each substage bounded. Do not implement screen-specific saves/queries, invent designer properties, lower visual floors or advance business parity here. Review separately with skills/review; run npm run verify plus relevant source/visual checks; update the roadmap, current parity/progress and concise rolling handoff; commit explicit files and push. MIG-5 remains open until the shared primitives and visual gates pass.
