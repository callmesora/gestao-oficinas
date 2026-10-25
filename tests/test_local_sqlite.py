import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from prepare_local_sqlite import prepare
from convert_hfsql_ansi import update_typed_hash


def typed_hash(rows):
    digest = hashlib.sha256()
    for row in rows:
        update_typed_hash(digest, row)
    return digest.hexdigest()


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

    def test_stock_derivative_refuses_unknown_fingerprint_before_any_output(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'synthetic.sqlite'
            with sqlite3.connect(source) as db:
                db.execute('CREATE TABLE lin_stocks (Documento_codigodocumento_numero)')
                db.execute('INSERT INTO lin_stocks VALUES (?)', ('',))
            before = source.read_bytes()
            mapping = {'version': 1, 'tables': [{'name': 'lin_stocks', 'columns': [{'sourceName': 'Documento_codigodocumento_numero'}]}]}
            with self.assertRaisesRegex(ValueError, 'exact ADR-017 source fingerprint'):
                prepare(source, root / 'refused', mapping, stock_development_derivative=True)
            self.assertFalse((root / 'refused').exists())
            self.assertEqual(source.read_bytes(), before)
            # Opt-in stays off: ordinary output retains the original TEXT representation.
            ordinary = prepare(source, root / 'ordinary', mapping)
            self.assertNotIn('development_repair', ordinary)
            with sqlite3.connect(root / 'ordinary/data.sqlite') as db:
                self.assertEqual(db.execute('SELECT typeof(Documento_codigodocumento_numero) FROM lin_stocks').fetchone(), ('text',))

    def test_stock_derivative_finite_proof_changes_only_link_type_and_preserves_original_and_ordinary_projection(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'synthetic.sqlite'
            rows = [('18446744073709551615', '', None, b'\x00\xff'), ('2', '', ' Á  ', b'')]
            with sqlite3.connect(source) as db:
                db.execute('CREATE TABLE lin_stocks (id, Documento_codigodocumento_numero, text_value, payload)')
                db.executemany('INSERT INTO lin_stocks VALUES (?,?,?,?)', rows)
            columns = ['id', 'Documento_codigodocumento_numero', 'text_value', 'payload']
            mapping = {'version': 1, 'tables': [{'name': 'lin_stocks', 'columns': [{'sourceName': name} for name in columns]}]}
            source_bytes = source.read_bytes()
            prepare(source, root / 'ordinary', mapping)
            ordinary_bytes = (root / 'ordinary/data.sqlite').read_bytes()
            ordinary_manifest = (root / 'ordinary/manifest.json').read_bytes()
            transformed = [row[:1] + (b'',) + row[2:] for row in rows]
            # Test-only policy proof for a disposable synthetic source; real CLI constants remain fixed.
            with patch.multiple('prepare_local_sqlite', _STOCK_SOURCE_SHA256=hashlib.sha256(source_bytes).hexdigest(), _STOCK_ROWS=2,
                                _STOCK_BEFORE_SHA256=typed_hash(rows), _STOCK_AFTER_SHA256=typed_hash(transformed)):
                manifest = prepare(source, root / 'derivative', mapping, stock_development_derivative=True)
                with self.assertRaises(FileExistsError):
                    prepare(source, root / 'derivative', mapping, stock_development_derivative=True)
            with sqlite3.connect(root / 'derivative/data.sqlite') as db:
                self.assertEqual(db.execute('SELECT * FROM lin_stocks ORDER BY rowid').fetchall(), transformed)
                self.assertEqual(db.execute('SELECT typeof(Documento_codigodocumento_numero) FROM lin_stocks').fetchall(), [('blob',), ('blob',)])
                self.assertEqual(json.loads(db.execute("SELECT value FROM __export WHERE key='manifest'").fetchone()[0]), manifest)
            self.assertEqual(manifest['tables']['lin_stocks']['sha256_typed_rows'], typed_hash(transformed))
            self.assertEqual(manifest['development_repair']['changed_cells'], 2)
            self.assertIn('provisional-stock-development-derivative', manifest['provenance'])
            self.assertEqual(source.read_bytes(), source_bytes)
            self.assertEqual((root / 'ordinary/data.sqlite').read_bytes(), ordinary_bytes)
            self.assertEqual((root / 'ordinary/manifest.json').read_bytes(), ordinary_manifest)

    def test_stock_derivative_requires_count_before_after_hash_and_every_empty_text_cell_before_publication(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'synthetic.sqlite'
            rows = [('1', '')]
            with sqlite3.connect(source) as db:
                db.execute('CREATE TABLE lin_stocks (id, Documento_codigodocumento_numero)')
                db.executemany('INSERT INTO lin_stocks VALUES (?,?)', rows)
            mapping = {'version': 1, 'tables': [{'name': 'lin_stocks', 'columns': [{'sourceName': 'id'}, {'sourceName': 'Documento_codigodocumento_numero'}]}]}
            proof = {'_STOCK_SOURCE_SHA256': hashlib.sha256(source.read_bytes()).hexdigest(), '_STOCK_ROWS': 1,
                     '_STOCK_BEFORE_SHA256': typed_hash(rows), '_STOCK_AFTER_SHA256': typed_hash([('1', b'')])}
            for key, bad_value, expected_error in [('_STOCK_ROWS', 2, 'row-count'), ('_STOCK_BEFORE_SHA256', '0' * 64, 'before typed-hash'), ('_STOCK_AFTER_SHA256', '0' * 64, 'after typed-hash')]:
                with self.subTest(key=key), patch.multiple('prepare_local_sqlite', **{**proof, key: bad_value}):
                    with self.assertRaisesRegex(ValueError, expected_error):
                        prepare(source, root / 'refused', mapping, stock_development_derivative=True)
                self.assertFalse((root / 'refused').exists())
            for value in [None, b'', 'nonempty', '\x00']:
                with sqlite3.connect(source) as db:
                    db.execute('UPDATE lin_stocks SET Documento_codigodocumento_numero=?', (value,))
                with self.subTest(value=value), patch.multiple('prepare_local_sqlite', **{**proof, '_STOCK_SOURCE_SHA256': hashlib.sha256(source.read_bytes()).hexdigest()}):
                    with self.assertRaisesRegex(ValueError, 'every link cell to be empty TEXT'):
                        prepare(source, root / 'refused', mapping, stock_development_derivative=True)
                self.assertFalse((root / 'refused').exists())
            self.assertFalse(list(root.glob('.stock-development-*')))
