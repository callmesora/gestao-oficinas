# Architecture — accepted framing

The owner authorized the complete guide on 23 October 2026. ADRs 001–007 record the initial framing choices, including defaults that may be superseded by evidence. This document describes intended boundaries, not implemented functionality.

## Structure and rule ownership

- src/ui: React legacy screens and MediaPlayer primitives in src/ui/legacy.
- packages/domain: the single pure TypeScript home for calculations, decisions and explicit WLanguage helpers.
- src/application: per-window/workflow state, command builders and interfaces.
- src/infrastructure: typed HTTP/native adapters; browser preview installs a visible fake backend only in development.
- apps/server: Fastify, runtime input validation, authentication and transaction-owning operations over PostgreSQL.
- apps/server/migrations: sole ordered production schema history, with local instructions.
- src-tauri/src/commands: narrow native operations, not a second home for business rules.
- src/bindings: generated native contract types, with local instructions.

A user save becomes one API operation and one transaction. State-dependent invariants run inside that transaction; pure domain prechecks never replace authoritative checks. SQL parameters, exact decimals, string IDs and typed error results cross explicit boundaries. Frontend packages cannot import server libraries or database credentials.

## UI and native boundary

Generate every screen layout from evidence, preserve legacy control names/captions and use the shared skin kit. Independent window state replaces HFSQL current-record buffers. Modal calls and messages are awaited. The API owns authorization. Native commands restrict paths/actions; CSP and capabilities are deliberate. See ADRs 003–005.

## Delivery and verification

ROADMAP.md owns dependencies. Each bounded stage follows templates/prompt-stage.md. Foundation establishes npm verification, Rust checks, bindings drift, parity, preview/UI flows and Windows CI. Native UI/IPC, persistence, installer, printing and devices need their own real checks; mocked browser tests prove presentation only. No application behavior has yet passed target verification.
