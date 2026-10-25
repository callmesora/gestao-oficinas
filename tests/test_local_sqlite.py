import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from prepare_local_sqlite import prepare


class LocalSnapshotChecks(unittest.TestCase):
    def test_projection_preserves_large_ids_null_blob_and_source(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'original.sqlite'
            with sqlite3.connect(source) as db:
                db.execute('CREATE TABLE Example (id, data, payload, extra)')
                db.execute('INSERT INTO Example VALUES (?,?,?,?)', ('18446744073709551615', None, b'\x00\xff', 'retained in original'))
                db.execute('CREATE TABLE __metadata (value)')
            before = hashlib.sha256(source.read_bytes()).hexdigest()
            mapping = {'version': 1, 'tables': [{'name': 'Example', 'columns': [{'sourceName': c} for c in ('id', 'DATA', 'payload')]}]}
            manifest = prepare(source, root / 'copy', mapping)
            self.assertEqual(before, hashlib.sha256(source.read_bytes()).hexdigest())
            self.assertEqual(manifest['omitted_columns'], {'Example': ['extra']})
            self.assertEqual(manifest['omitted_tables'], ['__metadata'])
            with sqlite3.connect(root / 'copy/data.sqlite') as db:
                self.assertEqual(db.execute('SELECT * FROM Example').fetchone(), ('18446744073709551615', None, b'\x00\xff'))
                self.assertEqual(json.loads(db.execute("SELECT value FROM __export WHERE key='manifest'").fetchone()[0]), manifest)
            with self.assertRaises(FileExistsError):
                prepare(source, root / 'copy', mapping)

    def test_missing_schema_and_numeric_storage_are_not_guessed(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'original.sqlite'
            with sqlite3.connect(source) as db:
                db.execute('CREATE TABLE Example (id)')
                db.execute('INSERT INTO Example VALUES (1.25)')
            with self.assertRaisesRegex(ValueError, 'Missing required column'):
                prepare(source, root / 'missing', {'version': 1, 'tables': [{'name': 'Example', 'columns': [{'sourceName': 'unknown'}]}]})
            self.assertFalse((root / 'missing').exists())
            with self.assertRaisesRegex(ValueError, 'numeric storage'):
                prepare(source, root / 'numeric', {'version': 1, 'tables': [{'name': 'Example', 'columns': [{'sourceName': 'id'}]}]})
