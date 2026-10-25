# MIG-7C2 review

## Pass 1 — modal geometry (macOS arm64, base 1a3cce4)

Two independent read-only subagents followed `skills/review/SKILL.md` in fresh contexts, reading diff/full changed files, stage brief, ADRs/porting and cited source/spec/parity. Root integrated fixes and ran checks; reviewers did not run or claim tests.

- Title gestures reached ancestor workspace dragging, including maximized titles. Consume own-modal title pointer events; assert the owning list stays put.
- Nullable `window.title` made two real forms' dialog names/restore buttons blank. Resolve generated `RADTitle` caption first; assert actual accessible names/restore captions.
- Restore buttons replaced remembered content focus through ancestor `.wd-frame`. Require nearest frame to belong to this dialog. Initial focused checks exposed the defect; final rerun checks all five forms.
- Retain mounted customer controls while minimized; source vehicle intra-container Tab order was corrected. Shared persistence serializes only existing whitelisted geometry, never drafts/records. Native/runtime acceptance and broad parity status remain open.

Both reviewers re-read the corrected code and reported no remaining concrete finding. Actual check results are recorded in handoff; this review does not establish native or legacy-recorded acceptance.
