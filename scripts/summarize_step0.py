"""Consolidate completed per-unit Step0 mappings and write a review index."""
import collections
import csv
import json
from pathlib import Path

COLS = 'id kind element context event evidence confidence legacy_behavior target_behavior implemented_in test decision status'.split()


def main():
    root = Path(__file__).resolve().parents[1]
    parity = root / 'docs/parity'
    rows = []
    units = []
    for path in sorted(parity.glob('*.csv')):
        if path.name in ('parity.csv', 'parity-seed.csv'):
            continue
        with path.open(encoding='utf-8-sig', newline='') as handle:
            subset = list(csv.DictReader(handle))
        rows.extend(subset)
        units.append((path.stem, len(subset), sum(r['id'].startswith('SRC-') for r in subset),
                      sum(r['status'] == 'unmapped' for r in subset)))
    ids = [r['id'] for r in rows]
    if len(set(ids)) != len(ids):
        raise ValueError('Duplicate parity IDs: ' + ', '.join(k for k,v in collections.Counter(ids).items() if v>1))
    with (parity / 'parity-seed.csv').open(encoding='utf-8-sig') as handle:
        seeds = list(csv.DictReader(handle))
    if {r['id'] for r in seeds} != {r['id'] for r in rows if r['id'].startswith('SRC-')}:
        raise ValueError('Consolidated SRC rows do not exactly match seed')
    if any(r['status'] not in ('specified', 'unmapped') for r in rows):
        raise ValueError('Step 0 contains implementation/completion claims')
    with (parity / 'parity.csv').open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=COLS)
        writer.writeheader()
        writer.writerows(rows)
    summary = {'units': len(units), 'rows': len(rows), 'source_seed_rows': len(seeds),
               'status': dict(collections.Counter(r['status'] for r in rows)),
               'confidence': dict(collections.Counter(r['confidence'] for r in rows))}
    (root / 'docs/mapping/coverage.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
    lines = ['# Step 0 mapping index', '', 'Scope: evidence and mapping only. No architecture decision or application implementation is approved.', '',
             f'{len(units)} mapped source/table/template units; {len(seeds)} source-seed rows retained exactly; {len(rows)} total behavior rows.', '',
             'Verified confidence means the legacy fact has evidence. No row is implemented or verified as target behavior.', '',
             'Start with docs/runbooks/step0-report.md, docs/legacy-inventory.md, docs/evidence-report.md and docs/runbooks/handoff.md.', '',
             '| Unit | Mapping | Spec | Parity rows | Source seeds | Unmapped rows |', '|---|---|---|---|---|---|']
    for name, count, seedcount, openrows in units:
        spec = 'screen' if (root / f'docs/screens/{name}.md').exists() else 'report' if (root / f'docs/reports/{name}.md').exists() else None
        target = f'../{spec}s/{name}.md' if spec else None
        lines.append(f'| {name} | [{name}]({name}.md) | '+(f'[{spec}]({target})' if spec else '—')+f' | {count} | {seedcount} | {openrows} |')
    (root / 'docs/mapping/README.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')
    print(json.dumps(summary))


if __name__ == '__main__':
    main()
