# Query mapping — QRY_noname

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_noname.WDR`.

## Purpose and rules

U-Q04-01: Binary query has no dossier SQL; behavior cannot be established. No exclusion is assumed.

## SQL from the dossier

```sql
-- U-Q04-01: no SQL in dossier
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: none extracted.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| U-Q04-02 | No literal code caller found | Dynamic/designer usage requires review; do not silently exclude. |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q04-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q04-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q04-01: Export this query from WINDEV or identify its SQL/callers. Interim: no invented query; blocks this query implementation only.
- U-Q04-02: Establish reachability from project/designer before excluding; interim: retain parity row.
