# Authoritative PostgreSQL schema history

- This is the only production schema history; the SQLite evidence draft is not a migration.
- Never edit, rename or delete a committed migration; add the next numbered migration.
- No DROP, TRUNCATE or bulk DELETE without an explicit approved ADR referenced in the header.
- Migrations run transactionally and are tested on both an empty isolated database and the previous release schema.
- Import only copied data into an explicit test target; never connect to production.
- Constraints and transformations follow docs/data-migration.md; no silent repairs of legacy anomalies.
