import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from screen_layout import control_paths, source_window_size


class ScopedLayoutChecks(unittest.TestCase):
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
