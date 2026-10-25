# Architecture — accepted framing

The owner authorized the complete guide on 23 October 2026. ADRs 001–007 record initial framing; ADRs 008–011 define the implemented customer, vehicle and unit write/development contracts. Full application parity remains pending.

## Structure and rule ownership

- src/ui: React legacy screens and MediaPlayer primitives in src/ui/legacy.
- packages/domain: the single pure TypeScript home for calculations, decisions and explicit WLanguage helpers.
- src/application: per-window/workflow state, command builders and interfaces.
- src/infrastructure: typed HTTP/native adapters. The customer, vehicle and unit repositories use workflow-http.ts/isolatedWorkflowPost for an individual expiring development session and real API requests. Synthetic native-preview metadata remains separate.
- apps/server: Fastify, runtime input validation, authentication and transaction-owning operations over PostgreSQL.
- apps/server/migrations: sole ordered production schema history, with local instructions.
- src-tauri/src/commands: narrow native operations, not a second home for business rules.
- src/bindings: generated native contract types, with local instructions.

A user save becomes one API operation and one transaction. State-dependent invariants run inside that transaction; pure domain prechecks never replace authoritative checks. SQL parameters, exact decimals, string IDs and typed error results cross explicit boundaries. Frontend packages cannot import server libraries or database credentials.

## UI and native boundary

Generate every screen layout from evidence, preserve legacy control names/captions and use the shared skin kit. Independent window state replaces HFSQL current-record buffers. Modal calls and messages are awaited. The API owns authorization. Native commands restrict paths/actions; CSP and capabilities are deliberate. See ADRs 003–005.

An explicit source cross-file dependency is retained narrowly: the actual Postos caller reads a client-owned TerminalFileContext when opening its form (ADR-016). Terminal reset/explicit positioning updates that small state; forms retain their own drafts/save identities. This is not a generic HFSQL buffer emulator or server-global session state.

## Delivery and verification

ROADMAP.md owns dependencies. Each bounded stage follows templates/prompt-stage.md. Customer, vehicle and unit list/form flows have executed real API/PostgreSQL, browser and spec-derived golden checks through the opt-in development runner. DatabaseConnection in apps/server/src/db/connection.ts supplies a connected client per operation; each operation retains its own lock order and transaction. C3 shares only operation-owned connection error handling and best-effort failure rollback/close; query promises preserve typed outcomes and original duplicate classification. Lost COMMIT acknowledgement remains unresolved and never triggers an automatic retry. No generic transaction/CRUD abstraction changes their different identity predicates.

Foundation checks cover TypeScript, Rust, bindings, parity, generated layouts and browser flows. Native IPC metadata has separate built WebView2 evidence; native business persistence, installer, printing, devices and full legacy parity remain separate acceptance gates. See docs/runbooks/handoff.md for executed checks and retained limits.

MIG-7H Mecânicos preserves the existing API/PostgreSQL boundary: public list/picker/save replies omit credential fields; only authenticated selected-record read returns the masked form password with no-store. Automatic source identity/immutable edit code follow ADR-008; checkbox NULL display and password-eye defaults follow ADR-003. No schema, auth-model or password-hash migration is introduced by this leaf.
