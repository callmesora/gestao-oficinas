# Independent extraction and HFSQL export review

Review date: 23 October 2026. Scope: extraction evidence and the new ANSI ODBC bridge, independently of the reviewer's own CRUD mapping documents. No original source/data, exporter scripts or datasets were modified. Only synthetic temporary converter fixtures were created. No legacy code was executed and no record or credential values are reproduced here.

## Result

The extraction pipeline supplies usable Step 0 evidence, and the observed export contains 17 tables and 159,668 rows with counts matching SQLite. This establishes successful extraction through the official driver, not complete proof of every source value's fidelity or runtime business parity. The first export adapter review found warning-handling and checksum weaknesses; the main agent hardened both while this review was in progress. The revised warning code was inspected, and revised typed-hash framing passed independent synthetic checks. All three focused `tests.test_hfsql_converter` regression tests were independently rerun and passed, including output-handle release, empty/count-mismatch failure and type/row-boundary fidelity. A fresh driver export remains the main agent's responsibility.

## Findings and disposition

1. **Data-warning handling could silently corrupt a column — corrected in the revised source; live rerun still required.** Initially `Value` treated every SQL_SUCCESS_WITH_INFO as chunk truncation and appended the full 65,535 text bytes or 65,536 binary bytes. A conversion warning without a full buffer could therefore append padding or conceal a conversion problem. The revised `CheckData` in `scripts/windows/HfSqlOdbcAnsi.cs:26` enumerates all diagnostic records, rejects warnings except 01004 for chunked reads, rejects all floating-point conversion warnings, and checks inconsistent truncation indicators. This is an appropriate correction to the observed logic. This review did not inject a mock ODBC diagnostic stream or independently rerun a real driver connection after the edit.

2. **Legacy row checksum is ambiguous — corrected by an additional typed digest.** The original converter rendered NULL as empty CSV text, joined cells with a literal separator, and streamed row payloads without a row delimiter. Synthetic fixtures proved equal `sha256_rows` for NULL versus empty text, and for two single-column rows `a` / `bc` versus `ab` / `c`. These examples have equal row counts; count validation does not resolve the collision. `scripts/windows/convert_hfsql_ansi.py:12` now adds a typed, length-framed digest including row/cell boundaries and NULL/text/binary tags, retained as `sha256_typed_rows`. Independent checks confirm different typed hashes for both repro cases and binary versus identical text bytes. Preserve the original digest for compatibility only; integrity claims should cite the typed digest and fresh independent SQLite recomputation.

3. **Converter accepted an empty input directory — corrected; partial inventory remains an invocation check.** The original converter looped over whatever JSONL files existed, including none. A synthetic empty directory produced a valid-looking manifest containing zero tables and a database containing only `__export`, with no exception. Revised `scripts/windows/convert_hfsql_ansi.py:24` explicitly rejects empty input before creating output; the independent focused regression test passed. A partially populated directory still lacks an expected table-inventory check. The observed 17-table export is unaffected because the reviewer counted its tables independently; unattended reuse should require the expected schema table set.

4. **SQLite handle lifetime was nondeterministic — corrected and tested.** The original `with sqlite3.connect(...) as connection` controlled transaction commit/rollback but did not explicitly close the connection. The fixture run completed conversions, then temporary-directory cleanup failed with Windows WinError 32 on an output `data.sqlite` until process termination/garbage collection. Revised `scripts/windows/convert_hfsql_ansi.py:36` wraps the transaction in `contextlib.closing`; the independent focused test confirms the output can be reopened/moved after return. This did not demonstrate row corruption in the earlier export.

5. **CSV alone loses NULL versus empty text — format limitation.** `writer.writerow(text)` deliberately emits empty text for both. SQLite and JSONL preserve the distinction; per-column manifest NULL counts preserve aggregate counts only. Binary CSV uses `base64:` and can collide textually with an actual text value of that spelling unless the column metadata is retained. Consume SQLite or typed JSONL for fidelity-sensitive import; CSV is a supplementary inspection format.

6. **All observed composite-key BLOBs are empty — requires explanation before using them as import keys.** The exported `lin_stocks.Documento_codigodocumento_numero` column has 23,615 BLOB values, all zero length in SQLite. This is a key-shaped HFSQL field and may be the driver's representation of a computed composite key. Neither row counts nor a downstream digest can prove the source representation is faithfully captured. Do not infer usable composite-key bytes from this export; establish the key from schema components and verify driver semantics or a legacy designer/golden observation. No FIC decoding was attempted.

7. **Scratch isolation is an invocation contract, not enforced by the wrapper.** `scripts/windows/export_hfsql_ansi.ps1` accepts any named DSN. The C# constructor connects with `DSN=<name>`; it does not enforce a scratch path or driver read-only connection. Export SQL itself consists only of SELECT/COUNT and quoted identifiers, but the driver may still maintain its own files. The main agent identified a dedicated scratch-copy DSN and is producing original-versus-scratch hash verification. This review read its recorded provenance but did not independently inspect the effective DSN registry configuration or certify that hash comparison. Do not run the wrapper against an unverified DSN.

## Fidelity checks

- Native SQL float/double is fetched into the matching binary buffer and converted using invariant round-trip formatting; SQLite stores the resulting text. This avoids JavaScript-number or SQLite-affinity rounding during export. It does not convert legacy real-valued money into exact decimal money or establish financial rounding rules.
- Integer, bigint, decimal, date/time and ordinary text values are fetched as driver text and inserted as text into untyped SQLite columns. A synthetic fixture preserved a greater-than-2^53 integer string and a high-precision decimal string exactly. Actual scale, lexical formatting and date sentinels remain the driver's representation; schema and golden examples are required before production normalization.
- SQL_NULL_DATA returns null; observed SQLite contains 16,979 NULL cells. All 23,615 binary cells are SQLite BLOBs. A synthetic NUL-containing binary value round-tripped exactly via base64 JSONL into BLOB.
- The adapter decodes SQL_C_CHAR bytes strictly as Windows-1252 and writes UTF-8 JSONL/CSV. A synthetic accented text/euro fixture preserved that conversion stage. This does not establish that an ANSI driver never substitutes a character before returning bytes. No wide-character SQL column types were present in the manifest's reported type inventory, but source Unicode capability is not independently certified.
- The observed source SQL-type inventory contains CHAR, BIGINT, TINYINT, INTEGER, DOUBLE, TIMESTAMP, LONGVARCHAR, DECIMAL, DATE, SMALLINT, TIME and LONGVARBINARY. All populated non-NULL/nonbinary values in SQLite are TEXT, as intended for evidence preservation.
- Longest exported text/memo payload observed was 613 bytes, below the 65,535-byte text chunk size; observed BLOB payload length is zero. The current data therefore does not exercise multi-chunk text/binary extraction or JavaScriptSerializer's maximum serialized-row length. Those paths need synthetic driver fixtures before claiming general large-payload support.
- Count queries run before and after each table; exported row count and both COUNT values must agree. There is no snapshot transaction. Equal-count updates can evade this test if another process mutates the scratch database. A quiescent scratch copy is necessary.
- Statements are freed in finally blocks; connection/environment handles are released in Dispose. Failed constructors can leave allocated handles until process exit because construction has not completed; partial output files/directories can remain on failure. A complete manifest plus independent expected-table/count/hash validation must be the completion criterion, not directory existence.

## Independent extraction spot checks

Compared inspector block contents against the specified original source line ranges, stripping indentation only; no event code or literal changed:

| Unit / event context | Original source | Lines compared | Result |
|---|---|---:|---|
| WIN_Acesso / EDT_palavra_passe / raw 66049 | legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:274-276 | 3 | Exact after indentation |
| WIN_Ordens_Reparacao_Form / EDT_matricula / raw 16 | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:273-336 | 64 | Exact after indentation |
| WIN_Material_reparacao_form / BTN_NoName1 / raw 18 | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:284-308 | 25 | Exact after indentation |
| WIN_Tempos_Reparacao / BTN_seguinte / raw 18 | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:210-214 | 5 | Exact after indentation |
| RPT_Tempos_Ordem_Reparacao / BODY.ITEM_tempo / raw 327692 | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao.wde:326-332 | 7 | Exact after indentation |

Independently reloaded every parsed window/query/report/analysis JSON and recalculated `scripts/dossier_extract.py:443` coverage. Results exactly matched the extraction index/latest snapshot:

| Metric | Recomputed |
|---|---:|
| PDF pages | 2,303 |
| Windows with flags | 51/51 |
| Controls with caption/title | 688/1,002 |
| Controls with flags | 989/1,002 |
| Analysis items with key metadata | 135/135 |
| Queries with SQL | 29/29 |
| Reports with embedded query | 9 |

The page count was read from the PDF extraction index; it was not a second independent PDF-parser run. Folder counts include `_general.json`: 52 window JSON files represent 51 windows, and 30 query JSON files represent 29 queries. `docs/evidence-report.json` records 127 covered elements: 53 source windows, 29 queries, 28 reports and 17 tables; this differs from dossier-window count because source-only/template coverage is also inventoried. It records 582 code blocks, 233 encoded-only event slots, 23 gaps and 12 runtime questions.

No warning in the extraction index means no parser threshold warning, not complete metadata recovery: 314 controls lack a parsed caption/title and 13 lack flags. Report embedded SQL remains a known evidence gap. These counts must not be described as 100% visual or behavioral coverage.

## Review boundary

The exporter is an evidence snapshot tool, not an application database migration. Counts, SQLite storage classes, synthetic converter fidelity and block-line checks were independently verified. Production import constraints, NULL normalization, key repair, monetary types, report output, runtime screen behavior and user acceptance remain outside this extraction review. No business or architecture decision is approved here.
