-- ADR004/017: explicit enrollment only; no imported password is read, copied or adopted.
-- Logical user linkage preserves the legacy app schema/anomalies; every use joins a live user.
CREATE SCHEMA auth;
CREATE TABLE auth.credentials (
  user_id bigint PRIMARY KEY,
  password_hash text NOT NULL,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  changed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE auth.sessions (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  user_id bigint NOT NULL REFERENCES auth.credentials(user_id) ON DELETE CASCADE,
  credential_version bigint NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_user_id ON auth.sessions(user_id);
CREATE INDEX sessions_expiry ON auth.sessions(expires_at);
CREATE TABLE auth.enrollment (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  consumed boolean NOT NULL DEFAULT false
);
INSERT INTO auth.enrollment (singleton,consumed) VALUES (true,false);
