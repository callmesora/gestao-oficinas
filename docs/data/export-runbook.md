# HFSQL export runbook and limits

The playbook Python exporter fails on this machine with the HFSQL 28 x64 driver. An x86 .NET ODBC connection opens, but Unicode query entry points fail. scripts/windows/HfSqlOdbcAnsi.cs instead calls the installed official x86 driver's ANSI ODBC functions. This is a supported-driver read, not FIC decoding.

## Prerequisites and isolation

Use the built-in 32-bit Windows PowerShell host. The wrapper enforces a local DSN whose data and WDD paths resolve under this workspace's analysis-local/hfsql-scratch-* prefix and rejects server DSNs. Raw JSONL output must remain under analysis-local/. No DSN named MigrationCopy was altered. The dedicated Step 0 DSNs point only at the generated scratch copy.

The PowerShell process uses RemoteSigned for this invocation only so locally authored scripts can run; machine/user execution policies were not changed. No extra Python was installed. Automatic approval review rejected a proposed 32-bit Python installer twice; the successful export uses existing Windows facilities instead.

## Reproduction

1. Copy the intended local Exe data and matching WDD to a new analysis-local/hfsql-scratch-TIMESTAMP folder. Never run the legacy application against it during export.
2. Configure a new user x86 HFSQL DSN. On this driver Add-OdbcDsn created blank path fields despite supplied SetPropertyValue; explicitly verify RepFic and Analyse. Set only the new dedicated DSN's values; never reuse a production server or credentials.
3. Derive the exact expected table names from the XDD into a local JSON list. All 17 names must be present in the final manifest, including zero-row tables.
4. Run the wrapper in a 32-bit host with a fresh output directory:

```powershell
& C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File scripts/windows/export_hfsql_ansi.ps1 -Dsn GestaoOficinasStep0x86 -TablesFile analysis-local/export-tables.json -Out analysis-local/hfsql-ansi-NEWSTAMP
. .\setup\Enter-Prerequisites.ps1
python scripts/windows/convert_hfsql_ansi.py analysis-local/hfsql-ansi-NEWSTAMP --out analysis-local/data-NEWSTAMP
```

5. Check the expected table inventory, row counts, typed hashes, parsed CSV counts, null/binary counts and unchanged scratch file hashes before making this the canonical legacy/data derivative.
6. Run scripts/data_profile.py against the SQLite copy and schema draft. Keep raw data private and local.

## Fidelity

SQLGetData reads binary values as bytes and NULL separately from empty text. Decimal/integer text is not coerced through floating point. Native float/double values use round-trip strings. ANSI text uses strict Windows-1252 decoding to UTF-8. Large values use chunking; only explicit 01004 truncation warnings permit continuation, and other conversion warnings fail. The converter refuses an empty input folder, verifies every table count and closes its database handle deterministically.

The compatibility hash follows the playbook, while sha256_typed_rows adds explicit row/cell type and length frames. The latter distinguishes NULL from empty strings, text from binary, and ambiguous row concatenations.

Known limits: this is the official driver's view, not proof of undocumented storage encoding. All generated composite/link BLOBs in this copy are empty; do not infer their business meaning or use them as imported relational keys. Large-payload chunking beyond this dataset was not exercised through a synthetic HFSQL table. The scratch source was stable and unchanged; no transactional snapshot of a live server is claimed.

Focused converter tests cover binary/NUL data, NULL vs empty text, accented multiline text, values beyond 2^53, exact decimal strings, count mismatch, empty input rejection, typed hash separation and Windows handle release. Independent review and actual repeated-driver verification are recorded under docs/runbooks/reviews/ and docs/data/export-verification.json.

## Empty ANSI text correction — 24 October 2026

The PostgreSQL rehearsal exposed an exporter defect: HFSQL 28 returns indicator length 1 for an empty SQL_C_CHAR string whose first byte is its C terminator. The reader included that byte as text. CharacterCount now uses the terminator boundary and rejects inconsistent/truncated buffers; binary reads are unchanged. This follows [SQLGetData's character-buffer contract](https://learn.microsoft.com/en-us/sql/odbc/reference/syntax/sqlgetdata-function?view=sql-server-ver17), not an import rule that strips characters.

Two new scratch-driver exports agree for all 17 tables. Comparing all 159,668 rows against the historical export changes only 97,774 NUL-only cells to empty strings; every other cell and all 39 scratch files agree. Counts and hashes: [ansi-text-correction.json](ansi-text-correction.json). The current profile uses the corrected export. Historical Step 0 exports/reports remain retained; use the corrected derivative for PostgreSQL.

Local corrected input: analysis-local/data-20261024-nulfix/data.sqlite. Run `npm run db:dry-run -- analysis-local/data-20261024-nulfix/data.sqlite` for the isolated import/reconciliation/restore rehearsal. Run `scripts/windows/test_ansi_text.ps1` with Windows PowerShell for eleven decoder regression cases (also run by npm test). Unexpected embedded ANSI terminators fail export; embedded NUL text supplied to the PostgreSQL importer is quarantined and retained, never silently stripped.
