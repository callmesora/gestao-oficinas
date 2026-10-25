import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from dossier_extract import collect, parse_rows


class ColumnSummaryChecks(unittest.TestCase):
    def test_column_rows_retain_required_metadata_without_an_input_type(self):
        rows = parse_rows([
            '63 Active Center Center',  # A summary without a preceding name is not a column.
            'COL_missing_state', '63 Center Center',
            'COL_missing_alignment', '63 Active Center',
            'COL_interrupted', 'not a summary', '63 Active Center Center',
            'COL_flag', ' 63 Active Center Center ',
            'COL_other_flag', '102 Active Center Center',
            'COL_image', '31 Active Left Center',
        ])
        self.assertEqual(rows, {
            'COL_flag': {'width': 63, 'state': 'Active', 'h_align': 'Center', 'v_align': 'Center'},
            'COL_other_flag': {'width': 102, 'state': 'Active', 'h_align': 'Center', 'v_align': 'Center'},
            'COL_image': {'width': 31, 'state': 'Active', 'h_align': 'Left', 'v_align': 'Center'},
        })

    def test_existing_column_input_types_are_preserved(self):
        self.assertEqual(parse_rows([
            'COL_code', '61 Read-onl Right Center Numeric',
            'COL_description', '244 Active Left Top Text',
            'COL_when', '100 Inactive Center Bottom Date and Time',
        ]), {
            'COL_code': {'width': 61, 'state': 'Read-onl', 'h_align': 'Right', 'v_align': 'Center',
                         'input_type': 'Numeric'},
            'COL_description': {'width': 244, 'state': 'Active', 'h_align': 'Left', 'v_align': 'Top',
                                'input_type': 'Text'},
            'COL_when': {'width': 100, 'state': 'Inactive', 'h_align': 'Center', 'v_align': 'Bottom',
                         'input_type': 'Date and Time'},
        })

    def test_collect_merges_untyped_summary_with_scoped_column_details(self):
        page = ('Part 3 WINDEV window\x9bWIN_columns\x9bInformation on controls\n'
                '25/10/2026 1Synthetic\n'
                'Table : TABLE_records\n'
                'COL_flag\n63 Active Center Center\n'
                'COL_code\n61 Active Right Center Numeric\n'
                'Table column : TABLE_records.COL_flag (1)\n'
                'Title PT: Flag\nData binding records.flag\n'
                'Table column : TABLE_records.COL_code (2)\n'
                'Title PT: Code\nData binding records.code\n'
                'Code\nCOL_fake\n999 Active Left Center Text\n')
        window = collect([page])['WINDEV window']['WIN_columns']
        flag = window['controls']['COL_flag']
        self.assertEqual(flag.get('width'), 63)
        self.assertEqual((flag['kind'], flag['path'], flag['column_index'], flag['title'], flag['linked_item']),
                         ('Table column', 'TABLE_records.COL_flag', 1, {'PT': 'Flag'}, 'records.flag'))
        self.assertEqual((flag['state'], flag['h_align'], flag['v_align']), ('Active', 'Center', 'Center'))
        self.assertNotIn('input_type', flag)
        self.assertEqual(window['controls']['COL_code']['input_type'], 'Numeric')
        self.assertIn('63 Active Center Center', window['lines'])
        self.assertNotIn('COL_fake', window['controls'])


if __name__ == '__main__':
    unittest.main()
