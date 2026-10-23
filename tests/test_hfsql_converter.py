import base64
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('ansi_converter', Path(__file__).parents[1] / 'scripts/windows/convert_hfsql_ansi.py')
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)


class ConverterChecks(unittest.TestCase):
    def test_types_precision_null_and_connection_release(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'raw'
            source.mkdir()
            values = [None, '', {'base64': base64.b64encode(b'\x00\xff\x00').decode()}, '9007199254740993', '123456789012345.123456789', 'Ação\r\nsegunda linha']
            header = {'table': 'Example', 'count': 1, 'columns': [{'name': f'c{i}'} for i in range(len(values))]}
            (source / 'Example.jsonl').write_text(json.dumps(header) + '\n' + json.dumps(values) + '\n', encoding='utf-8')
            manifest = converter.convert(source, root / 'out')
            con = sqlite3.connect(root / 'out/data.sqlite')
            try:
                row = con.execute('select * from Example').fetchone()
                self.assertEqual(row, (None, '', b'\x00\xff\x00', *values[3:]))
            finally:
                con.close()
            self.assertEqual(manifest['tables']['Example']['columns'][0]['nulls'], 1)
            # Windows refuses an exclusive rename while the converter's database handle remains open.
            (root / 'out/data.sqlite').rename(root / 'out/renamed.sqlite')

    def test_typed_hash_distinguishes_null_and_row_boundaries(self):
        def digest(rows):
            result = hashlib.sha256()
            for row in rows:
                converter.update_typed_hash(result, row)
            return result.hexdigest()
        self.assertNotEqual(digest([[None]]), digest([['']]))
        self.assertNotEqual(digest([['a'], ['bc']]), digest([['ab'], ['c']]))
        self.assertNotEqual(digest([[b'a']]), digest([['a']]))

    def test_empty_input_and_count_mismatch_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with self.assertRaises(ValueError):
                converter.convert(root, root / 'empty')
            self.assertFalse((root / 'empty').exists())
            header = {'table': 'Bad', 'count': 2, 'columns': [{'name': 'c'}]}
            (root / 'Bad.jsonl').write_text(json.dumps(header) + '\n["one"]\n')
            with self.assertRaises(ValueError):
                converter.convert(root, root / 'bad')
            self.assertFalse((root / 'bad/manifest.json').exists())


if __name__ == '__main__':
    unittest.main()
