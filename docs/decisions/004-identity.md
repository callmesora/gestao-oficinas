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

MIG12 persistent access (before implementation): inspected SQLite credentials are TEXT without a recognized hash envelope; do not adopt them or the menu bootstrap literal. Use explicit enrollment/reset through a one-use random operator token read from a protected server-side file, never logged. Persist consumption so deleting accounts cannot reopen enrollment. Only an actually empty user table may create Codigo1/Administrador; otherwise enroll a selected existing account. Preserve source Codigo selection, 15-character bound and uppercase input; add no roles or self/last-user restrictions.

Store versioned async Node scrypt hashes (N131072/r8/p1, random16-byte salt,64-byte key,maxmem256MiB), with bounded concurrent hashing and10 attempts/minute per address+code as reversible defaults. Parameters follow [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt) and the pinned [Node24 API](https://nodejs.org/docs/latest-v24.x/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback). Add immutable migration0002; never edit0001. Business user reads return no password/hash: masked editing starts blank with an explicit unchanged flag. Reset/delete revokes sessions atomically; isolated DEV maintenance remains separate.

Issue32 random-byte bearer tokens, storing only SHA256 digests with8-hour absolute expiry and live user/credential-version checks. Client tokens stay in RAM; logout revokes, server restart preserves valid sessions, client restart requires login. Pre-login picker exposes only Codigo/Descricao; every protected route denies anonymous access. Deployment PostgreSQL settings stay server-side. Default bind127.0.0.1:3210 with exact origin allowlist and matching narrow desktop CSP; shared HTTPS needs explicit API/CSP configuration. No INI credential reuse, marker execution or WDModFic. New setup/throttle outcomes are typed target defaults; they establish no captured legacy message or native parity.
