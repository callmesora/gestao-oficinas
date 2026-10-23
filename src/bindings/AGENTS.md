# Generated native bindings

- Generated from Rust command signatures with ts-rs; never edit generated TypeScript.
- Foundation must establish npm run bindings:generate and npm run bindings:check before native contracts are used.
- A Rust command change requires regenerated bindings in the same commit.
- The check must detect changed and missing/new files, not merely an empty git diff.
- IDs above 2^53 and exact decimal values cross as strings per ADR-002.
