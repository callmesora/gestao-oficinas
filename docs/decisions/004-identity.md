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

MIG9/10 parallel mechanic callers: preserve actual source mechanic/password/inactive checks at a narrow server operation, returning public identity only. Keep typed proof in volatile modal/request memory, revalidate it at protected mutation boundaries and clear it on modal close; never persist/log/return stored or submitted secrets, nor trust a client authenticated flag. This minimal target adaptation keeps the source cached-mechanic experience without adding a second token/session store. No legacy credential is adopted as a new hash, and no menu credential literal is reused; the full supported credential transition remains MIG12.

MIG12 initial development access (before translation): inside the existing authenticated isolated-development context, compare submitted uppercase text with the selected stored user password as source does; return only public user/result data. This check grants no production session or bootstrap credential. Missing users remain silent/source-controlled; no copied legacy password literal or universal fallback. Production credential transition and session lifecycle remain open.
