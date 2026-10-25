# Local workspace and macOS development setup

Owner request: clone the existing application and current migration guide, prepare legacy evidence and future-agent instructions, then make development work on macOS as well as Windows and use the available SQLite snapshot temporarily.

## Bounded scope

Preserve the existing migration and original sources. Add local environment/setup documentation, portable development PostgreSQL selection, equivalent C# decoder testing on macOS, a macOS bundle override/native picker, and a read-only snapshot-to-importer adapter. Keep production schema/history, behavior/parity statuses, Windows verification gates and the next business stage unchanged. ADR-017 records these decisions.

## Acceptance

- Both repositories cloned with their actual Git history/remotes.
- Private source copy checked against originals and committed fingerprints; evidence regenerated into ignored local output.
- Exact project runtimes/dependencies available locally.
- Application verification runs on this Mac without skipped TypeScript tests or reduced visual floors.
- Native macOS binary and local .app build.
- Temporary SQLite data imports into a fresh isolated PostgreSQL database, preserving unsupported original values in quarantine; original hash unchanged.
- Real customer browser UI and authenticated API demonstrate the imported 2,165-customer dataset.
- Future-agent instructions describe the exact local state and the existing next stage MIG-7C2.

## Review

Follow `skills/review/SKILL.md` in a separate sequential self-review pass as authorized by ADR-007. Record actual commands/results and any platform-specific acceptance limits in `setup/LOCAL-WORKSPACE.md`. No independent/fresh-context review claim. The owner subsequently explicitly requested committing and pushing the setup branch.
