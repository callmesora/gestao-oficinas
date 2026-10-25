# ADR-004 — Preserve observed access checks at the service boundary

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/mapping/permissions.md and docs/mapping/WIN_Acesso.md identify user/mechanic credential checks; no new Groupware model is established.

## Decision
Preserve the mapped user/mechanic selection and access semantics, enforce checks on the API, and keep desktop visibility checks as presentation only. Never publish, log or embed legacy credentials. Do not import legacy credentials directly as a new password hash. Implement a supported one-time rehash or explicit reset flow only after the authentication slice inspects the stored format and records its detailed decision. No unsolicited OIDC/role redesign.

## Consequences and verification
Authentication is not complete until success/failure, mechanic checks, sessions and direct API denial are tested. Authentication-format unknowns stay unresolved; the API must deny protected operations until authenticated. Synthetic account credentials are opt-in local fixtures only.

Utilizadores maintenance (MIG-7L.1, before translation) uses the existing protected-session boundary, without inventing roles/self/last-user restrictions. Public list/picker/save replies expose only internal id, Codigo and Descricao; an authenticated selected-id read alone supplies utilizadoresID/palavra_passe for masked editing, Cache-Control:no-store and no request/response logging. Original import replay reads only the public projection, never original passwords; golden and interaction credentials are synthetic only. Source form uppercases passwords before writing under ADR008; that observed maintenance rule does not establish a hash/transition/bootstrap policy. Never reuse or reproduce the menu's credential literal. Full access/bootstrap/rehash/session parity remains MIG12.
