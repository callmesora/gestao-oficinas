# Porting patterns — Step 0 proposals

These are mapping vocabulary and proposed implementation shapes, not accepted architecture decisions. No application code exists. Framing will confirm their locations and concrete types before implementation. All units preserve observed behavior and cite the same patterns.

| Legacy construct | Trap/reference | Proposed shape for later framing |
|---|---|---|
| HRead/HReadSeek/HReadNext, File.Item | wlanguage-traps.md, HFSQL current buffers | Explicit repository result; caller/callee contract lists buffer and cursor changes. |
| HFilter, query parameters | wlanguage-traps.md, persistent filters/omitted conditions | Explicit query/filter DTO preserving empty/omitted distinctions. |
| HAdd/HModify/HDelete, ScreenToFile/FileToScreen | wlanguage-traps.md, current record/binding | Explicit mapped entity; one business save command and transaction. |
| HTransaction and stock writes | scope/architecture chapter 03 | Proposed transaction boundary includes every related mutation; exact legacy order documented first. |
| Open/Close/ReturnedValue | wlanguage-traps.md, modal flow | Awaited dialog result; document following caller code and side effects. |
| Info/Error/YesNo/Dialog | wlanguage-traps.md, events/UI | One dialog service preserving text, labels, result and sequence. Esc/default stays unresolved unless evidenced. |
| TableDisplay/TableSelect and file-browsed tables | wlanguage-traps.md, HFSQL/table context | Explicit selection and refresh state; source/dossier features get parity rows. |
| EDT/BTN/COL flags and dynamic properties | chapter 10 UI fidelity | Legacy control names, masks, tab order and runtime state; screen spec is authoritative. |
| ExecuteProcess | wlanguage-traps.md, event reuse | Shared named handler; preserve event order and arguments. |
| INIRead/INIWrite, CommandLine, ExeRun | chapter 07 desktop integrations | Scoped configuration and native adapter proposals, exact filenames/keys/arguments recorded in mapping. |
| iPreview/iPrintReport and report presets | chapter 07 reports, chapter 10 | Explicit report input, destination, band/reset and page contract. Embedded SQL proposals are assumed. |
| Stock quantities, totals, dates, durations | chapters 08–09 | No silent float/date normalization; record formulas, units, rounding and sentinel values for later ADR. |
| Strings/arrays/by-reference parameters | chapter 09 | 1-based helpers and explicit outputs; preserve locale, accents and spaces. |
| Encoded predefined action | answer sheet and event legend | Answer if present, otherwise proposal labelled assumed; no verified implementation claim at Step 0. |

Runtime and data edge cases without evidence receive U-UNIT-nn identifiers. No redesign or bug fix is approved here.
