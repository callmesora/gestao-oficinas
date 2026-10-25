-- ADR004: explicit production mechanic resets only; no copied credential adoption or legacy schema repair.
-- The logical link preserves imported anomalies. Every check resolves the current selected mechanic.
CREATE TABLE auth.mechanic_credentials (
  mechanic_id bigint PRIMARY KEY,
  password_hash text NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  changed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
