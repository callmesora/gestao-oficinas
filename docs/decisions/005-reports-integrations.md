# ADR-005 — Fixed reports and narrow native adapters

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/mapping/reports.md records 28 fixed report specs, nine embedded SQL proposals and one missing report image. docs/mapping/jobs-and-integrations.md and docs/evidence-report.md inventory actual platform calls.

## Decision
Use fixed HTML/CSS report layouts with PDF output and a native printing adapter; preserve band breaks, filters and totals. No end-user designer is inferred. Migrate only evidenced devices, INI settings, command-line modes and external programs. Native commands are narrow and scoped; never expose arbitrary SQL/shell/filesystem operations. Use a deliberate CSP and minimum Tauri capabilities. Distribution initially uses a local Windows acceptance installer; signed prod/test update channels need real endpoints/keys later, never an embedded GitHub token.

## Repair-state color adapter (MIG-7I, before translation)

Source WIN_Form_estados_reparacao.wdw:237–240 passes an integer by reference to SelectColor(scAnyColor), ignores its Boolean result and always copies that integer to preview/input. [PC SOFT](https://doc.pcsoft.fr/fr-FR/?3013045=&name=SelectCouleur) documents OK mutation/cancel; [PixelColor](https://doc.windev.com/en-US/?1000024335=) documents R+256G+65536B. Installed rfd0.17.2 has no color chooser. Use one awaited narrow Tauri command with nullable unsigned32 input and distinct selected/cancelled results; errors reject without new user-facing text. Preserve raw input on cancellation, including NULL/high bits; never mask stored Cor to24bit. Initialize unsupported/null values with picker black only (assumed reversible default); selection returns an ordinary24bit WINDEV color.

Use direct platform APIs rather than a generic shell or bundled C dependency: macOS /usr/bin/osascript with a fixed embedded Standard Additions `choose color` script and validated numeric argv, no caller script/title/path. AppleScript -128 is cancellation, other errors fail;8bit↔16bit uses×257/nearest rounding by default. [Apple chooser](https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/PromptforaColor.html), [error reference](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/reference/ASLR_cmds.html). Windows uses owned ChooseColorW/CHOOSECOLORW on the Tauri UI thread, CC_RGBINIT|CC_ANYCOLOR, local16-color storage; FALSE+CommDlgExtendedError0 cancels, nonzero fails. [Microsoft contract](https://learn.microsoft.com/windows/win32/dlgbox/color-dialog-box). Declare the already locked windows-sys dependency/features directly. No arbitrary process/SQL/filesystem command is exposed. Allow only one color dialog at a time, reject a competing request, and discard detached UI results. Native ownership/focus/app-close behavior, exact special-color handling and WINDEV chooser appearance remain explicit OS/U acceptance gates; browser injection proves only caller continuation.

## Consequences and verification
Each report needs data/text/total checks and visual comparison; printing and scanners require real native/device checks. Browser printing does not prove packaged printing. Missing external resources remain named acceptance dependencies, not stubbed verified features.
