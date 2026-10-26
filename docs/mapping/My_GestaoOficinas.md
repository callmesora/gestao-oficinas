# Project mapping — My_GestaoOficinas

Evidence: legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:697-773; docs/navigation.md; docs/mapping/WIN_MENU.md.

## Purpose and startup contract

The project declares shared strings for the report company caption, login/connection configuration and gsValor_entrada. The company caption is initialized once and read by report Open events. The source is WINDEV 28 with English WLanguage keywords and Portuguese user-facing text.

## Events and operational rules

The single nonempty project code block is initialization, lines 697–773, with raw event type **196608** recorded immediately after the block at legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:774. The startup meaning follows the declarations and connection/update code in that block; it does not establish a single-window or single-user deployment.

1. If act.txt exists next to the executable, read servidor.ini section Servidor. Keys servidor, utilizador, password, port and basedados choose a server schema-update command when servidor is nonempty. Run WDModFic.exe with the WDD and server connection arguments, wait for completion, then delete act.txt after successful process launch/result. On failure, display the automatic-data-modification error plus the command line and return. Credential-bearing command arguments must never be reproduced in logs or target UI.
2. If act.txt exists but servidor is empty, run local WDModFic.EXE -report with WDD and DIR arguments. Success removes act.txt; failure displays the exact text "falha".
3. Independently of that update branch, reread the server keys from servidor.ini. A nonempty servidor constructs an HFSQL Client/Server connection with the configured user/password/server/database and hCryptNo, calls HOpenConnection, then HChangeConnection("*", connection) on success. The separate port value is passed into the earlier WDModFic server command (lines 709–728). The later connection rereads port (lines 752–753) but sets Server=servidor (line 762) without explicitly combining or applying that separate port before HOpenConnection (line 765). Do not infer a server:port endpoint for this connection; deployed endpoint behavior remains U-PRJ-01.
4. A successful server connection displays "Ligação ao servidor efectuada com sucesso.". Failure displays "HFSQl" plus HError() and ends the program. An empty servidor leaves the project using its default/local file context; this does not prove how users deploy it.

## Data and integration contracts

- Inputs: executable directory, act.txt existence, GestaoOficinas.wdd, servidor.ini keys and installed WDModFic executable.
- Outputs: global report caption, optional global HFSQL connection replacement, optional schema-update process, removal of the update marker and messages/termination.
- No startup schema updater, executable, legacy app or network connection was run in Step 0. Only copied Classic data files were read through the installed official driver.
- No transaction encloses external update launch and marker deletion. Local/server update paths and subsequent data connection are distinct phases.
- The source can connect to a server. Later framing must establish the actual deployment topology rather than infer SQLite from the presence of local FIC files.

## Behavior checklist and proposed changes

Runtime startup order relative to first-window loading, command-line routes and UI login is governed by project configuration plus WIN_MENU code. The menu/window maps contain the visible launch paths. No automatic updater replacement, authentication redesign, error-text change or target architecture is approved in Step 0.

Proposed for framing: avoid exposing credentials in a command-line error; replace the legacy update marker/process with a versioned target migration owner. These are proposals, not accepted target behavior.

## Unresolved

- U-PRJ-01: Confirm deployed local versus shared/server mode, actual servidor.ini presence, configuration ownership and endpoint/port behavior. The updater applies the separate port; the later connection does not explicitly apply it. Resolve with an owner deployment description or controlled endpoint configuration evidence; interim: retain both source branches and the phase distinction in mapping, do not connect to any configured server.
- U-PRJ-02: Confirm first-window/command-line ordering and startup update failure behavior from a recorded test. Interim: preserve source order without inventing an installer/update path.
- U-PRJ-03: Decide replacement for schema-update command and credential-bearing diagnostics during framing. No code or destructive schema action is authorized here.

## Initial target checkpoint

ADR001/004/017 now supply the target defaults: the protected shared API/PostgreSQL also supports an operator-owned local service, versioned checked migrations run before serving, and ordinary browser/Tauri startup uses persistent enrollment/login and actual business windows. `src/ui/production-startup.tsx` retains the authenticated session and offers an explicit retry after initialization failure; sanitized diagnostics never echo server replies/configuration. `apps/server/src/local/service.ts` owns setup/start/cleanup; no normal startup reimports data. Actual legacy topology and first-window/updater ordering remain U-PRJ-01..03; the legacy INI/act.txt/WDModFic phases were neither executed nor copied into target commands. Checks: `ui-check/production-startup.flows.spec.ts`, `ui-check/local-reports.flows.spec.ts` and `scripts/native-business-probe.mjs`; native save/print, other-host and legacy acceptance remain separate.

Non-legacy test ID: `startup-retry` identifies the target recovery action.
