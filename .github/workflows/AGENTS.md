# CI rules

- Signing keys/tokens come only from CI secrets or environment variables, never files, URLs or logs.
- Never embed a reusable token in desktop update code.
- CI uses synthetic fixtures, never private legacy input. No production database credentials.
- Keep the same npm run verify command locally and in CI; native Windows checks are separate evidence.
