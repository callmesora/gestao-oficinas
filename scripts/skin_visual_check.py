"""Compare implemented skin component regions, without claiming whole-window parity."""
import argparse
import json
from pathlib import Path
from PIL import Image
from visual_compare import compare


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('screenshot', type=Path)
    args = parser.parse_args()
    layout_path = Path('src/ui/legacy/WIN_Form_Clientes.layout.json')
    layout = json.loads(layout_path.read_text(encoding='utf-8'))
    reference_path = Path(layout['image'])
    regions = {'header': (0, 0, layout['window']['size']['width'], 25)}
    for name in ('BTN_Validar', 'BTN_Cancelar', 'EDT_Descricao'):
        control = next(control for control in layout['controls'] if control['name'] == name)
        regions[name] = (control['x'], control['y'], control['x'] + control['width'], control['y'] + control['height'])
    reference = Image.open(reference_path).convert('RGB')
    target = Image.open(args.screenshot).convert('RGB')
    if reference.size != target.size:
        raise ValueError('Component fixture must match the source frame size; no resizing')
    output = Path('docs/evidence/visual/skin-components.json')
    previous = json.loads(output.read_text(encoding='utf-8')) if output.exists() else {}
    results = {}
    for name, bounds in regions.items():
        before, after = Path(f'ui-report/skin-{name}-reference.png'), Path(f'ui-report/skin-{name}-target.png')
        reference.crop(bounds).save(before); target.crop(bounds).save(after)
        result = compare(before, after, Path(f'ui-report/skin-{name}-comparison.png'))
        result['bounds'] = list(bounds)
        result['passed'] = result['pixel_similarity'] >= 90 and result['edge_overlap'] >= 60
        baseline = previous.get('regions', {}).get(name)
        if baseline and result['edge_overlap'] < baseline['edge_overlap'] - 2:
            result['passed'] = False
        results[name] = result
    report = {'scope': 'component regions only; not whole-window parity', 'layout': layout_path.as_posix(),
              'reference': reference_path.as_posix(), 'screenshot': args.screenshot.as_posix(),
              'floors': {'pixel_similarity': 90, 'edge_overlap': 60}, 'regions': results,
              'passed': all(result['passed'] for result in results.values())}
    if not report['passed']:
        output = Path('ui-report/skin-components-failed.json')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))
    raise SystemExit(0 if report['passed'] else 1)


if __name__ == '__main__':
    main()
