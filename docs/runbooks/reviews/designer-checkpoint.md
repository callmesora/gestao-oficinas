# MIG-7C2 review

## Pass 1 — modal geometry (macOS arm64, base 1a3cce4)

Two independent read-only subagents followed `skills/review/SKILL.md` in fresh contexts, reading diff/full changed files, stage brief, ADRs/porting and cited source/spec/parity. Root integrated fixes and ran checks; reviewers did not run or claim tests.

- Title gestures reached ancestor workspace dragging, including maximized titles. Consume own-modal title pointer events; assert the owning list stays put.
- Nullable `window.title` made two real forms' dialog names/restore buttons blank. Resolve generated `RADTitle` caption first; assert actual accessible names/restore captions.
- Restore buttons replaced remembered content focus through ancestor `.wd-frame`. Require nearest frame to belong to this dialog. Initial focused checks exposed the defect; final rerun checks all five forms.
- Retain mounted customer controls while minimized; source vehicle intra-container Tab order was corrected. Shared persistence serializes only existing whitelisted geometry, never drafts/records. Native/runtime acceptance and broad parity status remain open.

Both reviewers re-read the corrected code and reported no remaining concrete finding. Actual check results are recorded in handoff; this review does not establish native or legacy-recorded acceptance.

## Pass 2 — numeric entry (macOS arm64, base01205f7)

Shared numeric implementation used a separate worktree; root integrated consumers, application conversion and tests. Two independent read-only reviewers used the review skill against full changed files and actual source/spec/ADRs, then re-read fixes. No test/native claim by reviewers.

- Required-message order, actual schema ranges and unmodified NULL/oversized/exact string values were checked. Live fixtures use source mask capacities; API-seeded oversized values and customer MAX+1 above2^53 remain actual persistence assertions, not removed coverage.
- Added direct ClipboardEvent/DataTransfer tests after review showed fill alone did not exercise raw paste rejection. Invalid multiline/malformed content cancels; grouped text is allowed. This proves handler routing only, not OS clipboard insertion.
- Full verify caught incoming object-ref mutation under React compiler lint. `useImperativeHandle` now exposes the actual input and lets React handle callback/object-ref cleanup; reviewers checked installed React19/RHF7 behavior. No lint suppression or setter monkey-patch.
- A speculative regex-newline finding was retracted after checking the actual JS engine; explicit invalid-character validation and newline tests remain. Unproven drag/drop sanitization was not reported as a confirmed finding.

Final full verify passed98 TS/DB,3 Rust and83 browser cases with existing visual floors; only existing TanStack warning. No remaining concrete review finding. Native/runtime U gates and four eligible text-key assistance controls remain open target work as stated in handoff/stage11.
