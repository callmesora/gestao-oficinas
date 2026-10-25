import sys
from pathlib import Path, PurePosixPath, PureWindowsPath
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from ui_inputs import ordered_paths


class UIInputPathChecks(unittest.TestCase):
    def test_asset_candidates_choose_the_same_canonical_copy_for_both_path_flavors(self):
        identities = ['legacy/project/cache/MediaPlayer_Table.gif', 'legacy/project/MediaPlayer_Table.gif']
        expected = ['legacy/project/MediaPlayer_Table.gif', 'legacy/project/cache/MediaPlayer_Table.gif']
        for flavor in (PurePosixPath, PureWindowsPath):
            with self.subTest(flavor=flavor.__name__):
                paths = [flavor(identity) for identity in identities]
                ordered = ordered_paths(paths)
                self.assertEqual([path.as_posix() for path in ordered], expected)
                self.assertIs(ordered[0], paths[1])

    def test_manifest_outputs_have_the_same_explicit_case_order_for_both_path_flavors(self):
        identities = ['public/skin/btn_new.png', 'src/ui/legacy/WIN_Table_A.layout.json',
                      'public/skin/MediaPlayer_Table.png', 'public/skin/Btn_Close.png',
                      'src/ui/legacy/WIN_Form_A.layout.json']
        expected = ['public/skin/Btn_Close.png', 'public/skin/MediaPlayer_Table.png', 'public/skin/btn_new.png',
                    'src/ui/legacy/WIN_Form_A.layout.json', 'src/ui/legacy/WIN_Table_A.layout.json']
        for flavor in (PurePosixPath, PureWindowsPath):
            with self.subTest(flavor=flavor.__name__):
                paths = [flavor(identity) for identity in identities]
                ordered = ordered_paths(paths)
                self.assertEqual([path.as_posix() for path in ordered], expected)
                self.assertEqual({id(path) for path in ordered}, {id(path) for path in paths})


if __name__ == '__main__':
    unittest.main()
