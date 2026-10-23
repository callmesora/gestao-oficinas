# Domain rules

- Pure functions/types only; no React, Tauri, Node, I/O, fetch, current clock or random values without injection.
- Every exported business rule has a meaningful test named with its parity ID.
- Follow docs/decisions/002-data-representation.md; no JS number for money/quantity arithmetic.
- Each rule lives once here; API and desktop consume the same implementation.
- Cite source-backed rules and record assumed/unresolved choices. Follow docs/porting.md before translating.
