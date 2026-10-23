"""Convert the ANSI ODBC bridge's typed JSONL to the playbook SQLite/CSV/manifest layout."""
import argparse
import base64
import csv
from contextlib import closing
import datetime
import hashlib
import json
from pathlib import Path
import sqlite3


def update_typed_hash(digest, row):
    """Frame rows and cells; distinguish NULL, empty text and arbitrary binary bytes."""
    digest.update(b'R' + len(row).to_bytes(4, 'big'))
    for value in row:
        if value is None:
            digest.update(b'N')
        else:
            payload = value if isinstance(value, bytes) else value.encode('utf-8')
            digest.update((b'B' if isinstance(value, bytes) else b'T') + len(payload).to_bytes(8, 'big') + payload)


def convert(source, output):
    files = sorted(source.glob('*.jsonl'))
    if not files:
        raise ValueError('No JSONL table exports found')
    output.mkdir(parents=True, exist_ok=False)
    manifest = {'exported': datetime.datetime.now().isoformat(timespec='seconds'),
                'driver': 'wd280hfo.dll', 'architecture': '32-bit ANSI ODBC',
                'adapter': 'scripts/windows/HfSqlOdbcAnsi.cs',
                'encoding': 'Windows-1252 ODBC text -> UTF-8; native float/double round-trip strings',
                'tables': {}}
    with closing(sqlite3.connect(output / 'data.sqlite')) as connection, connection:
        for file in files:
            with file.open(encoding='utf-8') as handle:
                header = json.loads(next(handle))
                name, columns = header['table'], header['columns']
                quote = lambda value: '"' + value.replace('"', '""') + '"'
                connection.execute(f'CREATE TABLE {quote(name)} (' + ', '.join(quote(c['name']) for c in columns) + ')')
                insert = f'INSERT INTO {quote(name)} VALUES (' + ','.join('?' for _ in columns) + ')'
                digest, typed_digest, count = hashlib.sha256(), hashlib.sha256(), 0
                nulls, binary = [0] * len(columns), [0] * len(columns)
                with (output / f'{name}.csv').open('w', encoding='utf-8', newline='') as destination:
                    writer = csv.writer(destination)
                    writer.writerow([c['name'] for c in columns])
                    for line in handle:
                        values = json.loads(line)
                        if len(values) != len(columns):
                            raise ValueError(f'{name}: column mismatch')
                        stored = [base64.b64decode(v['base64'], validate=True) if isinstance(v, dict) else v for v in values]
                        text = ['' if v is None else 'base64:' + base64.b64encode(v).decode('ascii') if isinstance(v, bytes) else v for v in stored]
                        connection.execute(insert, stored)
                        writer.writerow(text)
                        digest.update('\x1f'.join(text).encode('utf-8'))
                        update_typed_hash(typed_digest, stored)
                        for index, value in enumerate(stored):
                            nulls[index] += value is None
                            binary[index] += isinstance(value, bytes)
                        count += 1
                if count != header['count']:
                    raise ValueError(f'{name}: count mismatch {count} vs {header["count"]}')
                for column, empty, raw in zip(columns, nulls, binary):
                    column.update(nulls=empty, binary=raw)
                manifest['tables'][name] = {'rows': count, 'count': header['count'], 'columns': columns,
                                           'sha256_rows': digest.hexdigest(),
                                           'sha256_typed_rows': typed_digest.hexdigest()}
                print(f'{name}: {count} rows converted and checked')
        connection.execute('CREATE TABLE __export (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
        connection.execute('INSERT INTO __export VALUES (?,?)', ('manifest', json.dumps(manifest, ensure_ascii=False)))
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    convert(args.source, args.out)
