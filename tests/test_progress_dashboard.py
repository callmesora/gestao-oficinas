import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from progress_dashboard import render, summarize


class PlatformVisualProgressChecks(unittest.TestCase):
    def summary_and_page(self, docs):
        rows = [{'element': 'WIN_Form_Example', 'kind': 'window', 'status': 'implemented'}]
        units = summarize(rows, docs)
        page = render(units, {'decisions_pending': [], 'answer_sheet_open': 0,
                              'answer_sheet_done': 0, 'unresolved_items': 0}, [], [], 'Example', 'fixed')
        return units[0], page

    def record(self, docs, platform, pixel, layout, date):
        directory = docs / 'evidence' / 'visual'
        if platform == 'darwin':
            directory /= 'darwin'
        directory.mkdir(parents=True, exist_ok=True)
        filename = directory / 'WIN_Form_Example.json'
        filename.write_text(json.dumps({'pixel_similarity': pixel, 'edge_overlap': layout, 'date': date}), encoding='utf-8')
        return filename

    def test_darwin_only_measurement_is_visible_and_labelled_without_inventing_windows_evidence(self):
        with tempfile.TemporaryDirectory() as temporary:
            docs = Path(temporary)
            filename = self.record(docs, 'darwin', 98.9, 96.7, '2026-10-25')
            before = filename.read_bytes()
            unit, page = self.summary_and_page(docs)
            self.assertIsNone(unit['looks'])
            self.assertEqual(unit['visuals'], {'darwin': {'pixel': 98.9, 'layout': 96.7}})
            self.assertIn('macOS 96.7 %', page)
            self.assertIn('pixel similarity 98.9 %', page)
            self.assertNotIn('Windows 96.7', page)
            self.assertEqual(filename.read_bytes(), before)
            self.assertEqual(unit['statuses']['implemented'], 1)
            self.assertEqual(unit['done'], 0)

    def test_both_histories_remain_separate_in_fixed_order_and_legacy_looks_is_unchanged(self):
        with tempfile.TemporaryDirectory() as temporary:
            docs = Path(temporary)
            # Create the newer/higher-scoring Mac record first: neither date, score nor file order wins.
            mac = self.record(docs, 'darwin', 99.1, 97.2, '2026-10-25')
            windows = self.record(docs, 'windows', 94.5, 88.4, '2026-10-24')
            before = {filename: filename.read_bytes() for filename in (mac, windows)}
            unit, page = self.summary_and_page(docs)
            self.assertEqual(unit['looks'], {'pixel': 94.5, 'layout': 88.4})
            self.assertEqual(list(unit['visuals']), ['windows', 'darwin'])
            self.assertEqual(unit['visuals'], {'windows': {'pixel': 94.5, 'layout': 88.4},
                                             'darwin': {'pixel': 99.1, 'layout': 97.2}})
            self.assertIn('Windows 88.4 %', page)
            self.assertIn('macOS 97.2 %', page)
            self.assertLess(page.index('Windows 88.4 %'), page.index('macOS 97.2 %'))
            self.assertEqual({filename: filename.read_bytes() for filename in before}, before)

    def test_missing_histories_stay_unmeasured_without_altering_behavior_progress(self):
        with tempfile.TemporaryDirectory() as temporary:
            unit, page = self.summary_and_page(Path(temporary))
            self.assertIsNone(unit['looks'])
            self.assertEqual(unit['visuals'], {})
            self.assertIn('<td class="visual">–</td>', page)
            self.assertEqual(unit['stage'], 'building')
            self.assertEqual((unit['done'], unit['total']), (0, 1))


if __name__ == '__main__':
    unittest.main()
