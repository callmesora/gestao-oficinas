"""Generate the guide's UI inputs, or verify their committed hashes without private data."""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import struct
import tempfile
import re

import screen_layout
import skin_assets

LAYOUTS = Path('src/ui/legacy')
SKIN = Path('public/skin')
MANIFEST = Path('docs/evidence/ui-inputs.json')
PROJECT = Path('legacy/GestaoOficinas_TesteIA')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ordered_paths(paths):
    """Order paths consistently for source selection and manifest output."""
    return sorted(paths, key=lambda path: path.as_posix())


def generate(destination):
    latest = screen_layout.load(Path('analysis-local/latest.json'))
    units = sorted(path.stem for path in Path('docs/screens').glob('*.md'))
    layouts = [screen_layout.layout(unit, latest, 'PT') for unit in units]
    inspected = {}
    for path in Path(latest['inspect'], 'code').rglob('*.json'):
        source = screen_layout.load(path)
        name = source.get('name')
        if name in inspected:
            raise ValueError(f'Ambiguous inspected unit: {name}')
        inspected[name] = source
    for unit, layout in zip(units, layouts):
        expected = Counter(item['name'] for item in inspected[unit].get('layout', []))
        retained = Counter(control['name'] for control in layout['controls'])
        retained.update(column['name'] for control in layout['controls'] for column in control.get('columns', []))
        if expected != retained:
            raise ValueError(f'Generated layout loses source controls/columns: {unit}')
    files = defaultdict(list)
    for path in PROJECT.rglob('*'):
        if path.suffix.lower() in ('.gif', '.png', '.jpg', '.bmp'):
            files[path.name.lower()].append(path)
    required = sorted({name for layout in layouts for name in layout['assets']})
    stems = defaultdict(list)
    sources = {}
    for name in required:
        candidates = ordered_paths(files[name.lower()])
        if not candidates:
            raise ValueError(f'Missing project asset: {name}')
        if len({digest(path) for path in candidates}) != 1:
            raise ValueError(f'Ambiguous project asset: {name}')
        stems[Path(name).stem.lower()].append(name)
        sources[name] = {'path': candidates[0].as_posix(), 'sha256': digest(candidates[0])}
    if any(len(names) > 1 for names in stems.values()):
        raise ValueError('Asset names collide after PNG conversion')
    state_counts = skin_assets.states_by_asset(layouts)
    from PIL import Image
    for name, count in state_counts.items():
        with Image.open(files[name.lower()][0]) as image:
            if count > 1 and image.width % count:
                raise ValueError(f'Image strip cannot be split into its declared states: {name}')
    for name, metadata in sources.items():
        count = state_counts.get(name, 1)
        stem = Path(name).stem
        metadata['states'] = count
        metadata['outputs'] = [f'{stem}.png'] + ([f'{stem}.{index}.png' for index in range(count)] if count > 1 else [])
    layout_dir, skin_dir = destination / LAYOUTS, destination / SKIN
    layout_dir.mkdir(parents=True, exist_ok=True)
    for unit, layout in zip(units, layouts):
        (layout_dir / f'{unit}.layout.json').write_text(json.dumps(layout, indent=1, ensure_ascii=False) + '\n', encoding='utf-8', newline='\n')
    result = skin_assets.export(layouts, PROJECT, skin_dir)
    if result['missing']:
        raise ValueError('Skin export is incomplete')
    outputs = {}
    for path in ordered_paths([*layout_dir.glob('*.layout.json'), *skin_dir.glob('*.png')]):
        relative = path.relative_to(destination).as_posix()
        entry = {'sha256': digest(path)}
        if path.suffix == '.png':
            with Image.open(path) as image:
                image.verify()
            with Image.open(path) as image:
                entry['width'], entry['height'] = image.size
        outputs[relative] = entry
    unknown = {unit: {'details': layout['unknown'], 'issues': sorted(set(re.findall(r'\bU-[A-Z0-9]+-\d+\b', Path('docs/mapping', unit + '.md').read_text(encoding='utf-8'))))}
               for unit, layout in zip(units, layouts)}
    return {'language': 'PT', 'layouts': len(layouts), 'source_assets': sources,
            'outputs': outputs, 'unknown': unknown}


def verify(manifest):
    expected = set(manifest['outputs'])
    actual = {path.as_posix() for path in [*LAYOUTS.glob('*.layout.json'), *SKIN.glob('*.png')]}
    if actual != expected:
        raise ValueError('UI input file inventory differs from manifest')
    units = {path.stem for path in Path('docs/screens').glob('*.md')}
    generated_units = {path.name.removesuffix('.layout.json') for path in LAYOUTS.glob('*.layout.json')}
    if units != generated_units or len(units) != manifest['layouts']:
        raise ValueError('Generated layouts do not cover the screen-spec inventory')
    referenced_assets = set()
    for name, metadata in manifest['outputs'].items():
        path = Path(name)
        if digest(path) != metadata['sha256']:
            raise ValueError(f'Generated UI input changed: {name}')
        if path.suffix == '.png':
            data = path.read_bytes()
            if data[:8] != b'\x89PNG\r\n\x1a\n' or struct.unpack('>II', data[16:24]) != (metadata['width'], metadata['height']):
                raise ValueError(f'Invalid PNG input: {name}')
        else:
            layout = json.loads(path.read_text(encoding='utf-8'))
            referenced_assets.update(layout['assets'])
            if path.stem != layout['window']['name'] + '.layout':
                raise ValueError(f'Layout identity differs: {name}')
    if referenced_assets != set(manifest['source_assets']):
        raise ValueError('Skin source inventory differs from layout references')
    asset_outputs = {f'{SKIN.as_posix()}/{name}' for asset in manifest['source_assets'].values() for name in asset['outputs']}
    if asset_outputs != {name for name in expected if name.endswith('.png')}:
        raise ValueError('Skin state inventory differs from source-asset declarations')
    print(json.dumps({'layouts': manifest['layouts'], 'png_files': sum(name.endswith('.png') for name in expected), 'passed': True}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument('--write', action='store_true')
    modes.add_argument('--check-source', action='store_true')
    args = parser.parse_args()
    if args.write:
        manifest = generate(Path('.'))
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    else:
        manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    verify(manifest)
    if args.check_source:
        # Retained ignored output, no recursive deletion or changes to the originals.
        scratch = Path(tempfile.mkdtemp(prefix='ui-input-check-', dir='analysis-local'))
        if generate(scratch) != manifest:
            raise ValueError('UI inputs differ from the current legacy evidence')
        print('All layouts and images reproduce from the private source evidence.')


if __name__ == '__main__':
    main()
