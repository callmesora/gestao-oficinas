# Jobs and integrations inventory

Evidence: [project startup](My_GestaoOficinas.md), [main menu](WIN_MENU.md), [labor workflow](WIN_Tempos_Reparacao.md), [system settings](WIN_sistema.md), [terminal settings](WIN_Form_Terminais.md), and the platform-usage section of [the evidence report](../evidence-report.md).

| Integration | Observed contract | Follow-up |
|---|---|---|
| HFSQL | Local files are supplied; project code can switch all files to Client/Server from servidor.ini. | U-PRJ-01: confirm deployed topology; never infer it from local files alone. |
| Legacy schema updater | act.txt and WDModFic.exe/GestaoOficinas.wdd at startup, with local/server argument branches. | U-PRJ-03: choose target replacement later; no updater executed in Step 0. |
| INI configuration | Servidor section keys servidor, utilizador, password, port, basedados. | Keep values local; inspect actual configuration ownership during framing. |
| Command line | Menu source branches on artigos and modulo t/m to restrict/start workflows. | Preserve exact route/lifetime contracts from WIN_MENU; no new modes approved. |
| Timers/automatic labor closure | System thresholds and configured clock windows can perform database writes while labor screens are open. | Runtime timing/lock behavior remains scoped U questions; a UI refresh must not be assumed read-only. |
| Printing | Preview, report initialization and explicit/inherited print destinations; live-table report inputs. | Known-data PDFs and real printers needed for later report acceptance. |
| Barcode/touch | Keyboard dialogs and barcode/terminal controls are present. | U-INT-01: identify actual devices, suffix keys, file handoffs and timing from an owner/device session. |

U-INT-02: inventory external scheduled tasks, registry dependencies and integrations outside the supplied code/configuration. Absence from the source inspector is not proof of absence in deployment. No scheduler, email system, telemetry or replacement integration has been installed.
