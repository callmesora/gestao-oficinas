import json
import sys
from pathlib import Path
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from dossier_extract import collect
from screen_layout import control_paths, layout, source_window_size, table_options


class ScopedLayoutChecks(unittest.TestCase):
    def test_named_table_options_do_not_infer_missing_values_or_confuse_distinct_scrollbar_fields(self):
        self.assertEqual(table_options(['Display/Scrollbar', 'Vert. scrollbar Always visible',
                                        'Horz. scrollbar Automatic', 'Tooltip when truncated Yes',
                                        'Remember sorts No', 'Column context menu Yes', 'Context menu mode. <None>']), {
            'vertical_scrollbar': 'Always visible', 'horizontal_scrollbar': 'Automatic',
            'truncated_tooltip': 'Yes', 'remember_sorts': 'No', 'column_context_menu': 'Yes', 'context_menu': '<None>'})
        self.assertEqual(table_options([]), {})

    def test_root_window_size_survives_missing_dossier_without_borrowing_control_or_code_values(self):
        source = '''window :
 properties :
  width : 369
  height : 217
 controls :
  -
    name : BTN_OK
    properties :
     width : 80
     height : 24
 code : |1-
  properties :
   width : 999
   height : 888
resources :
 properties :
  width : 777
  height : 666
'''
        self.assertEqual(source_window_size(source), {'width': 369, 'height': 217})
        self.assertIsNone(source_window_size('window :\n controls :\n  properties :\n   width : 80\n   height : 24\n'))

    def test_repeated_column_names_keep_their_table_and_cell_paths(self):
        source = '''controls :
 -
   name : TABLE_A
   columns :
    -
      name : COL_image
      content :
       controls :
        -
          name : SHAPE
 -
   name : TABLE_B
   columns :
    -
      name : COL_image
      content :
       controls :
        -
          name : SHAPE
'''
        self.assertEqual([item['path'] for item in control_paths(source)], [
            'TABLE_A', 'TABLE_A.COL_image', 'TABLE_A.COL_image.SHAPE',
            'TABLE_B', 'TABLE_B.COL_image', 'TABLE_B.COL_image.SHAPE'])

    def test_layout_recovers_unique_column_but_omits_ambiguous_duplicate_metadata(self):
        source = '''window :
 properties :
  width : 400
  height : 300
 controls :
  -
    name : TABLE_A
    columns :
     -
       name : COL_image
     -
       name : COL_flag
  -
    name : TABLE_B
    columns :
     -
       name : COL_image
'''
        page = ('Part 3 WINDEV window\x9bWIN_columns\x9bInformation on controls\n'
                '25/10/2026 1Synthetic\n'
                'Table : TABLE_A\nCOL_image\n39 Active Center Center\nCOL_flag\n63 Active Center Center\n'
                'Table column : TABLE_A.COL_image (1)\nTitle PT: First image\nData binding records.first\n'
                'Table column : TABLE_A.COL_flag (2)\nTitle PT: Flag\nData binding records.flag\n'
                'Table : TABLE_B\nCOL_image\n50 Active Left Center\n'
                'Table column : TABLE_B.COL_image (1)\nTitle PT: Second image\nData binding records.second\n')
        dossier = collect([page])['WINDEV window']['WIN_columns']
        dossier['controls']['COL_image']['flags'] = {'Visible': True, 'Movable': True}
        dossier['controls']['COL_flag']['flags'] = {'Visible': True}
        inspected = {'name': 'WIN_columns', 'path': 'WIN_columns.wdw', 'layout': [
            {'name': 'TABLE_A', 'kind': 'control', 'x': 10, 'y': 20, 'width': 200, 'height': 100},
            {'name': 'COL_image', 'kind': 'column', 'x': 10, 'y': 20, 'width': None, 'height': None},
            {'name': 'COL_flag', 'kind': 'column', 'x': 10, 'y': 20, 'width': None, 'height': None},
            {'name': 'TABLE_B', 'kind': 'control', 'x': 10, 'y': 140, 'width': 200, 'height': 100},
            {'name': 'COL_image', 'kind': 'column', 'x': 10, 'y': 140, 'width': None, 'height': None},
        ]}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'legacy').mkdir()
            (root / 'legacy/WIN_columns.wdw').write_text(source, encoding='utf-8')
            (root / 'inspect/code').mkdir(parents=True)
            (root / 'inspect/code/WIN_columns.wdw.json').write_text(json.dumps(inspected), encoding='utf-8')
            (root / 'dossier/windev-window').mkdir(parents=True)
            (root / 'dossier/windev-window/WIN_columns.json').write_text(json.dumps(dossier), encoding='utf-8')
            result = layout('WIN_columns', {key: str(root / key) for key in ('legacy', 'inspect', 'dossier')}, 'PT')
        tables = {control['name']: control for control in result['controls']}
        self.assertEqual([(tables[name]['x'], tables[name]['y']) for name in ('TABLE_A', 'TABLE_B')],
                         [(10, 20), (10, 140)])
        flag = next(column for column in tables['TABLE_A']['columns'] if column['name'] == 'COL_flag')
        self.assertEqual((flag['path'], flag['parent'], flag['width'], flag['h_align'], flag['title'],
                          flag['linked_item'], flag['index'], flag['flags'], flag['metadata_unresolved']),
                         ('TABLE_A.COL_flag', 'TABLE_A', 63, 'Center', 'Flag', 'records.flag', 2,
                          {'Visible': True}, False))
        self.assertIsNone(flag['input_type'])
        for name in ('TABLE_A', 'TABLE_B'):
            column = next(column for column in tables[name]['columns'] if column['name'] == 'COL_image')
            self.assertEqual((column['path'], column['parent']), (f'{name}.COL_image', name))
            self.assertTrue(column['metadata_unresolved'])
            for field in ('width', 'h_align', 'title', 'linked_item', 'index', 'flags', 'input_type'):
                self.assertIsNone(column[field], f'{name}.{field} borrowed ambiguous dossier metadata')
        self.assertTrue(any('duplicate names have ambiguous dossier metadata' in unknown and 'COL_image' in unknown
                            for unknown in result['unknown']))

    def test_code_literals_do_not_create_fake_controls(self):
        source = '''controls :
 -
   name : BTN_Run
   code : |1-
    controls :
     name : NOT_A_CONTROL
 -
   name : BTN_Close
'''
        self.assertEqual([item['name'] for item in control_paths(source)], ['BTN_Run', 'BTN_Close'])


if __name__ == '__main__':
    unittest.main()
