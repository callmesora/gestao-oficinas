import json
import sys
from pathlib import Path
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from dossier_extract import collect
from screen_layout import control_paths, layout, source_window_size, table_options


class DossierLayoutFixture(unittest.TestCase):
    def render(self, controls, source=None):
        summaries = '\n'.join(f"{control['name']} 10 20 120 28 0 {control.get('row', '')}"
                              for control in controls)
        details = '\n'.join(f"{control['kind']} : {control['name']}\n" + '\n'.join(control.get('raw', []))
                            for control in controls)
        page = ('Part 3 WINDEV window\x9bWIN_captions\x9bInformation on controls\n'
                '25/10/2026 1Synthetic\n' + summaries + '\n' + details)
        dossier = collect([page])['WINDEV window']['WIN_captions']
        for control in controls:
            dossier['controls'][control['name']].update(control.get('parsed', {}))
        if source is None:
            source = 'window :\n controls :\n' + ''.join(
                f"  -\n    name : {control['name']}\n" for control in controls)
        identities = control_paths(source)
        inspected = {'name': 'WIN_captions', 'path': 'WIN_captions.wdw', 'layout': [
            {'name': identity['name'], 'kind': 'control', 'x': 10 + index, 'y': 20 + index,
             'width': 120, 'height': 28} for index, identity in enumerate(identities)]}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'legacy').mkdir()
            (root / 'legacy/WIN_captions.wdw').write_text(source, encoding='utf-8')
            (root / 'inspect/code').mkdir(parents=True)
            (root / 'inspect/code/WIN_captions.wdw.json').write_text(json.dumps(inspected), encoding='utf-8')
            (root / 'dossier/windev-window').mkdir(parents=True)
            (root / 'dossier/windev-window/WIN_captions.json').write_text(json.dumps(dossier), encoding='utf-8')
            return layout('WIN_captions', {key: str(root / key) for key in ('legacy', 'inspect', 'dossier')}, 'PT')


class InitialImageChecks(DossierLayoutFixture):
    def test_only_image_controls_use_literal_initial_value_as_asset(self):
        result = self.render([
            {'name': 'RESTORE', 'kind': 'Image', 'parsed': {'initial_value': {'PT': r'C:\Project\Restore.gif'}}},
            {'name': 'TEXT', 'kind': 'Edit control', 'parsed': {'initial_value': {'PT': 'NotAnImage.gif'}}},
            {'name': 'IMAGE', 'kind': 'Image', 'parsed': {'image': {'PT': 'Explicit.gif'}, 'initial_value': {'PT': 'Other.gif'}}},
        ])
        self.assertEqual(result['controls'][0]['image'], 'Restore.gif')
        self.assertNotIn('image', result['controls'][1])
        self.assertEqual(result['controls'][2]['image'], 'Explicit.gif')
        self.assertEqual(set(result['assets']), {'Restore.gif', 'Explicit.gif'})


class DateEditOptionsChecks(DossierLayoutFixture):
    option_keys = ('return_format', 'calendar_button', 'calculator_button', 'blocking_validation')

    def test_date_edit_retains_all_literal_named_options_and_source_geometry(self):
        # WIN_Data/EDT_Data names all four options; the return format differs from its display mask.
        result = self.render([{'name': 'EDT_Data', 'kind': 'Edit control', 'row': 'Active Date', 'raw': [
            'Input mask PT: UseSystemMask', 'Return format AAAAMMJJ', 'Calendar button Yes',
            'Calculator button Yes', 'Blocking validation Yes', 'Horz. alignment Right',
        ]}])
        control = result['controls'][0]
        self.assertEqual({key: control.get(key) for key in self.option_keys}, {
            'return_format': 'AAAAMMJJ', 'calendar_button': 'Yes',
            'calculator_button': 'Yes', 'blocking_validation': 'Yes'})
        self.assertEqual((control['input_type'], control['input_mask'], control['h_align']),
                         ('Date', 'UseSystemMask', 'Right'))
        self.assertEqual((control['path'], control['x'], control['y'], control['width'], control['height']),
                         ('EDT_Data', 10, 20, 120, 28))

    def test_date_edit_absent_options_remain_absent_independently(self):
        result = self.render([
            {'name': 'EDT_None', 'kind': 'Edit control', 'row': 'Active Date'},
            {'name': 'EDT_One', 'kind': 'Edit control', 'row': 'Active Date',
             'raw': ['Calendar button No']},
        ])
        self.assertTrue(all(key not in result['controls'][0] for key in self.option_keys))
        self.assertEqual(result['controls'][1].get('calendar_button'), 'No')
        self.assertTrue(all(key not in result['controls'][1] for key in self.option_keys
                            if key != 'calendar_button'))

    def test_date_edit_unknown_values_are_retained_without_interpreting_or_prefix_matches(self):
        result = self.render([{'name': 'EDT_Unknown', 'kind': 'Edit control', 'row': 'Active Date', 'raw': [
            'Return format display AAAAMMJJ', 'Calendar buttons Yes', 'Calculator button <Unknown>',
            'Blocking validation <None>',
        ]}])
        control = result['controls'][0]
        self.assertEqual(control.get('return_format'), 'display AAAAMMJJ')
        self.assertNotIn('calendar_button', control)
        self.assertEqual(control.get('calculator_button'), '<Unknown>')
        self.assertEqual(control.get('blocking_validation'), '<None>')

    def test_date_named_options_do_not_leak_to_other_input_types_or_control_kinds(self):
        raw = ['Return format AAAAMMJJ', 'Calendar button Yes', 'Calculator button Yes',
               'Blocking validation Yes']
        cases = [('EDT_Text', 'Edit control', 'Active Text'),
                 ('EDT_Time', 'Edit control', 'Active Time'),
                 ('EDT_Unknown', 'Edit control', 'Active'),
                 ('STC_Date', 'Caption', 'Active Date'),
                 ('TABLE_Date', 'Table', 'Active Date')]
        result = self.render([{'name': name, 'kind': kind, 'row': row, 'raw': raw}
                              for name, kind, row in cases] + [
            {'name': 'EDT_OtherType', 'kind': 'Edit control', 'row': 'Active',
             'raw': [*raw, 'Input type Date and Time']},
        ])
        for control in result['controls']:
            with self.subTest(name=control['name']):
                self.assertTrue(all(key not in control for key in self.option_keys))

    def test_date_edit_retains_date8_and_date14_return_formats_without_normalization(self):
        result = self.render([
            {'name': 'EDT_Plain', 'kind': 'Edit control', 'row': 'Active Date',
             'raw': ['Return format AAAAMMJJ']},
            {'name': 'EDT_Timestamp', 'kind': 'Edit control', 'row': 'Active Date',
             'raw': ['Return format YYYYMMDDHHmmSS']},
        ])
        self.assertEqual([control.get('return_format') for control in result['controls']],
                         ['AAAAMMJJ', 'YYYYMMDDHHmmSS'])

    def test_duplicate_date_edit_names_keep_paths_and_geometry_without_borrowed_options(self):
        source = '''window :
 controls :
  -
    name : GROUP_A
    controls :
     -
       name : EDT_Same
  -
    name : GROUP_B
    controls :
     -
       name : EDT_Same
'''
        result = self.render([{'name': 'EDT_Same', 'kind': 'Edit control', 'row': 'Active Date', 'raw': [
            'Return format AAAAMMJJ', 'Calendar button Yes', 'Calculator button Yes',
            'Blocking validation Yes',
        ]}], source)
        controls = [control for control in result['controls'] if control['name'] == 'EDT_Same']
        self.assertEqual([(control['path'], control['x'], control['y']) for control in controls],
                         [('GROUP_A.EDT_Same', 11, 21), ('GROUP_B.EDT_Same', 13, 23)])
        for control in controls:
            self.assertTrue(all(key not in control for key in self.option_keys))
        self.assertTrue(any('duplicate names have ambiguous dossier metadata' in unknown and 'EDT_Same' in unknown
                            for unknown in result['unknown']))


class CaptionAlignmentChecks(DossierLayoutFixture):
    def test_complete_caption_summaries_retain_literal_horizontal_and_vertical_alignment(self):
        # The actual Mudar/Data prompt summaries are Active Center Center; existing RAD captions use Left Top.
        cases = [('STC_Prompt', 'Active Center Center', 'Center', 'Center'),
                 ('STC_Stock', 'Active Left Top', 'Left', 'Top'),
                 ('STC_Closed', 'Inactive Right Bottom', 'Right', 'Bottom'),
                 ('STC_Readonly', 'Read-only Justified Center', 'Justified', 'Center')]
        result = self.render([{'name': name, 'kind': 'Caption', 'row': row} for name, row, _, _ in cases])
        for index, (control, (name, _, horizontal, vertical)) in enumerate(zip(result['controls'], cases)):
            with self.subTest(name=name):
                self.assertEqual((control.get('h_align'), control.get('v_align')), (horizontal, vertical))
                self.assertEqual((control['x'], control['y'], control['width'], control['height']),
                                 (10 + index, 20 + index, 120, 28))

    def test_explicit_and_named_caption_alignment_precede_summary_independently_per_axis(self):
        result = self.render([
            {'name': 'STC_Explicit', 'kind': 'Caption', 'row': 'Active Center Center',
             'raw': ['Horz. alignment Left', 'Vert. alignment Top'],
             'parsed': {'h_align': 'Right', 'v_align': 'Bottom'}},
            {'name': 'STC_Named', 'kind': 'Caption', 'row': 'Active Center Center',
             'raw': ['Horz. alignment Left', 'Vert. alignment Top']},
            {'name': 'STC_Mixed', 'kind': 'Caption', 'row': 'Active Center Center',
             'parsed': {'h_align': 'Right'}},
            {'name': 'STC_NamedOnly', 'kind': 'Caption', 'row': 'Active Center',
             'raw': ['Vert. alignment Bottom']},
        ])
        self.assertEqual([(control.get('h_align'), control.get('v_align')) for control in result['controls']],
                         [('Right', 'Bottom'), ('Left', 'Top'), ('Right', 'Center'), (None, 'Bottom')])

    def test_incomplete_or_unrecognized_caption_summaries_do_not_guess_either_axis(self):
        rows = ['', 'Center Center', 'Active Center', 'Active Center Unknown', 'Active Unknown Top',
                'Unknown Left Top', 'Active Left Top Text', 'Active Left Top extra', 'Inactive',
                'prefix Active Left Top']
        result = self.render([{'name': f'STC_Unknown{index}', 'kind': 'Caption', 'row': row}
                              for index, row in enumerate(rows)])
        for control in result['controls']:
            with self.subTest(name=control['name']):
                self.assertNotIn('h_align', control)
                self.assertNotIn('v_align', control)

    def test_caption_fallback_does_not_reinterpret_edit_shape_or_table_summaries(self):
        result = self.render([
            {'name': 'EDT_Value', 'kind': 'Edit control', 'row': 'Active Center Center'},
            {'name': 'SHA_Preview', 'kind': 'Shape', 'row': 'Active Center Center',
             'raw': ['Vert. alignment Bottom'], 'parsed': {'v_align': 'Top'}},
            {'name': 'TABLE_Rows', 'kind': 'Table', 'row': 'Active Center Center'},
            {'name': 'EDT_Named', 'kind': 'Edit control', 'row': 'Active Center Center',
             'raw': ['Horz. alignment Right']},
        ])
        for control in result['controls']:
            with self.subTest(name=control['name']):
                self.assertNotIn('v_align', control)
                if control['name'] == 'EDT_Named':
                    self.assertEqual(control['h_align'], 'Right')
                else:
                    self.assertNotIn('h_align', control)

    def test_duplicate_caption_names_keep_paths_and_source_geometry_without_borrowed_alignment(self):
        source = '''window :
 controls :
  -
    name : GROUP_A
    controls :
     -
       name : STC_Same
  -
    name : GROUP_B
    controls :
     -
       name : STC_Same
'''
        result = self.render([
            {'name': 'STC_Same', 'kind': 'Caption', 'row': 'Active Center Center',
             'raw': ['Horz. alignment Right', 'Vert. alignment Bottom'],
             'parsed': {'h_align': 'Left', 'v_align': 'Top'}},
        ], source)
        captions = [control for control in result['controls'] if control['name'] == 'STC_Same']
        self.assertEqual([(control['path'], control['x'], control['y']) for control in captions],
                         [('GROUP_A.STC_Same', 11, 21), ('GROUP_B.STC_Same', 13, 23)])
        for control in captions:
            self.assertNotIn('h_align', control)
            self.assertNotIn('v_align', control)
        self.assertTrue(any('duplicate names have ambiguous dossier metadata' in unknown and 'STC_Same' in unknown
                            for unknown in result['unknown']))


class ScopedLayoutChecks(unittest.TestCase):
    qualified_source = '''window :
 controls :
  -
    name : TABLE_A
    columns :
     -
       name : COL_image
       content :
        controls :
         -
           name : SHA_color
  -
    name : TABLE_B
    columns :
     -
       name : COL_image
       content :
        controls :
         -
           name : SHA_color
'''

    qualified_body = '''Table : TABLE_A
SHA_color 417 64 18 18 0 Active
COL_image
39 Active Center Center
Table : TABLE_B
SHA_color 34 204 18 18 0 Inactive
COL_image
50 Active Left Center
Table : TABLE_A
Table column : TABLE_A.COL_image (5)
Title PT: First image
Data binding records.first
Anchoring <None>
Shape : TABLE_A.COL_image.SHA_color
Anchoring Right
Table : TABLE_B
Table column : TABLE_B.COL_image (1)
Title PT: Second image
Data binding records.second
Anchoring Bottom
Shape : TABLE_B.COL_image.SHA_color
Anchoring Right and bottom
'''

    def render_qualified(self, body, source=None):
        source = source or self.qualified_source
        page = ('Part 3 WINDEV window\x9bWIN_columns\x9bInformation on controls\n'
                '25/10/2026 1Synthetic\n' + body)
        dossier = collect([page])['WINDEV window']['WIN_columns']
        # Existing extraction merges these by leaf. Those flags must never leak to either scoped control.
        for name in ('COL_image', 'SHA_color'):
            if name in dossier.get('controls', {}):
                dossier['controls'][name]['flags'] = {'Visible': True, 'Movable': True}
        inspected = {'name': 'WIN_columns', 'path': 'WIN_columns.wdw', 'layout': [
            {'name': identity['name'], 'kind': 'column' if identity['name'].startswith('COL_') else 'control',
             'x': 10 + index, 'y': 20 + index,
             'width': None if identity['name'].startswith('COL_') else 18,
             'height': None if identity['name'].startswith('COL_') else 18}
            for index, identity in enumerate(control_paths(source))]}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'legacy').mkdir()
            (root / 'legacy/WIN_columns.wdw').write_text(source, encoding='utf-8')
            (root / 'inspect/code').mkdir(parents=True)
            (root / 'inspect/code/WIN_columns.wdw.json').write_text(json.dumps(inspected), encoding='utf-8')
            (root / 'dossier/windev-window').mkdir(parents=True)
            (root / 'dossier/windev-window/WIN_columns.json').write_text(json.dumps(dossier), encoding='utf-8')
            return layout('WIN_columns', {key: str(root / key) for key in ('legacy', 'inspect', 'dossier')}, 'PT')

    def test_exact_qualified_columns_and_cell_shapes_recover_only_their_own_metadata(self):
        result = self.render_qualified(self.qualified_body)
        tables = {control['name']: control for control in result['controls'] if control['kind'] == 'Table'}
        for table, width, index, title, linked, alignment in (
                ('TABLE_A', 39, 5, 'First image', 'records.first', 'Center'),
                ('TABLE_B', 50, 1, 'Second image', 'records.second', 'Left')):
            with self.subTest(table=table):
                column = tables[table]['columns'][0]
                self.assertEqual((column['path'], column['parent'], column['width'], column['index'],
                                  column['title'], column['linked_item'], column['h_align']),
                                 (f'{table}.COL_image', table, width, index, title, linked, alignment))
                self.assertFalse(column['metadata_unresolved'])
                self.assertIsNone(column['flags'])
                self.assertIsNone(column['input_type'])
        shapes = [control for control in result['controls'] if control['name'] == 'SHA_color']
        self.assertEqual([(control['path'], control['kind'], control.get('anchoring'),
                           control['x'], control['y'], control['width'], control['height']) for control in shapes], [
            ('TABLE_A.COL_image.SHA_color', 'Shape', 'Right', 12, 22, 18, 18),
            ('TABLE_B.COL_image.SHA_color', 'Shape', 'Right and bottom', 15, 25, 18, 18)])
        self.assertTrue(all('flags' not in control and 'visible' not in control for control in shapes))
        self.assertTrue(any('scoped dossier flags remain unknown' in value for value in result['unknown']))

    def test_qualified_recovery_refuses_duplicate_summary_or_detail_within_the_same_table(self):
        cases = [self.qualified_body.replace('39 Active Center Center',
                                            '39 Active Center Center\nCOL_image\n45 Active Right Center'),
                 self.qualified_body.replace('Shape : TABLE_A.COL_image.SHA_color',
                                            'Table column : TABLE_A.COL_image (5)\nTitle PT: Duplicate\n'
                                            'Shape : TABLE_A.COL_image.SHA_color')]
        for body in cases:
            with self.subTest(body=body):
                result = self.render_qualified(body)
                tables = {control['name']: control for control in result['controls'] if control['kind'] == 'Table'}
                column = tables['TABLE_A']['columns'][0]
                self.assertTrue(column['metadata_unresolved'])
                self.assertTrue(all(column[key] is None for key in ('width', 'title', 'index', 'flags')))
                # The independent table still has complete evidence and must remain usable.
                self.assertEqual(tables['TABLE_B']['columns'][0]['width'], 50)
                self.assertEqual(next(control for control in result['controls']
                                      if control['path'] == 'TABLE_A.COL_image.SHA_color')['kind'], 'control')

    def test_qualified_recovery_requires_matching_table_ownership_summary_and_column_position(self):
        cases = [self.qualified_body.replace('Table column : TABLE_A.COL_image (5)',
                                            'Table column : TABLE_OTHER.COL_image (5)'),
                 self.qualified_body.replace('Table column : TABLE_A.COL_image (5)',
                                            'Table column : TABLE_A.COL_image'),
                 self.qualified_body.replace('COL_image\n39 Active Center Center', 'COL_image\nUnknown summary'),
                 self.qualified_body.replace('Table : TABLE_A\nTable column : TABLE_A.COL_image (5)',
                                            'Table : TABLE_B\nTable column : TABLE_A.COL_image (5)')]
        for body in cases:
            with self.subTest(body=body):
                result = self.render_qualified(body)
                table = next(control for control in result['controls'] if control['path'] == 'TABLE_A')
                self.assertTrue(table['columns'][0]['metadata_unresolved'])
                self.assertIsNone(table['columns'][0]['width'])
                self.assertIsNone(table['columns'][0]['flags'])

    def test_conflicting_table_owner_for_the_same_full_path_remains_ambiguous(self):
        body = self.qualified_body.replace('Shape : TABLE_A.COL_image.SHA_color',
                                           'Table : TABLE_B\nTable column : TABLE_A.COL_image (5)\n'
                                           'Title PT: Conflicting owner\nTable : TABLE_A\n'
                                           'Shape : TABLE_A.COL_image.SHA_color')
        result = self.render_qualified(body)
        table = next(control for control in result['controls'] if control['path'] == 'TABLE_A')
        self.assertTrue(table['columns'][0]['metadata_unresolved'])
        self.assertIsNone(table['columns'][0]['width'])
        self.assertIsNone(table['columns'][0]['flags'])

    def test_qualified_recovery_does_not_use_post_code_or_unqualified_shape_details(self):
        body = self.qualified_body.replace('Shape : TABLE_A.COL_image.SHA_color', 'Shape : SHA_color')
        result = self.render_qualified(body + '\nCode\nTable : TABLE_A\n'
                                       'Table column : TABLE_A.COL_image (9)\nTitle PT: Fake\n'
                                       'Shape : TABLE_A.COL_image.SHA_color\nAnchoring Left\n')
        table = next(control for control in result['controls'] if control['path'] == 'TABLE_A')
        self.assertEqual((table['columns'][0]['index'], table['columns'][0]['title']), (5, 'First image'))
        shape = next(control for control in result['controls'] if control['path'] == 'TABLE_A.COL_image.SHA_color')
        self.assertEqual(shape['kind'], 'control')
        self.assertNotIn('anchoring', shape)

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

    def test_layout_recovers_unique_column_but_omits_unqualified_duplicate_metadata(self):
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
                'Table column : COL_image (1)\nTitle PT: First image\nData binding records.first\n'
                'Table column : TABLE_A.COL_flag (2)\nTitle PT: Flag\nData binding records.flag\n'
                'Table : TABLE_B\nCOL_image\n50 Active Left Center\n'
                'Table column : COL_image (1)\nTitle PT: Second image\nData binding records.second\n')
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
