#!/usr/bin/env python3
"""Migration progress as one self-contained HTML page, for people who do not read CSV or code.

Reads only what the process already maintains: the parity matrix (docs/parity/), the committed seed, the mapping
notes and specs, the answer sheet, the ADRs and, when the folder is a Git repository, the history of the parity
files. Writes docs/progress/index.html (no external files, no network). Run it after each stage, or from CI.

Per screen and report: not started → mapped → building → built (all in-scope rows implemented or verified)
→ done (every row verified or excluded). Built and proven shares are separate; strict completion includes
verified rows and approved exclusions. An implementation is not proof of native or human acceptance.
"""
import argparse
import collections
import csv
from datetime import datetime
from html import escape
import io
import json
from pathlib import Path
import re
import subprocess

DONE = {'verified', 'excluded'}
BUILT = {'implemented', 'verified'}
STATUS_ORDER = ['verified', 'excluded', 'implemented', 'specified', 'unmapped']
COLORS = {'verified': '#5fd38d', 'excluded': '#6b7280', 'implemented': '#f5c451', 'specified': '#8f7cf6',
          'unmapped': '#3a3f4b'}
LABELS = {'verified': 'verified in the new app', 'excluded': 'excluded by decision', 'implemented': 'built, not yet proven',
          'specified': 'understood, not built', 'unmapped': 'not yet understood'}
KIND_BY_PREFIX = (('WIN_', 'screen'), ('RPT_', 'report'), ('ETAT_', 'report'), ('QRY_', 'query'), ('REQ_', 'query'))


def read_rows(text):
    return list(csv.DictReader(io.StringIO(text)))


def matrix_rows(files):
    """Rows of the matrix: parity.csv when it exists, else every per-unit CSV, plus the seed rows not yet in them."""
    named = {Path(name).name: text for name, text in files.items()}
    if 'parity.csv' in named:
        rows = read_rows(named['parity.csv'])
    else:
        rows = [r for name, text in named.items() if name not in ('parity-seed.csv',) for r in read_rows(text)]
    ids = {r['id'] for r in rows}
    # A seed row whose block the matrix already holds under an older name is not a second behavior.
    blocks = {(r.get('element', '').lower(), r.get('context', ''), r.get('event', '')) for r in rows}
    seed = read_rows(named.get('parity-seed.csv', ''))
    rows += [r for r in seed if r['id'] not in ids
             and (r.get('element', '').lower(), r.get('context', ''), r.get('event', '')) not in blocks]
    units = {r['element'].lower(): r['element'] for r in seed if r.get('element')}
    for row in rows:
        # A rule row may carry a free title as element: it belongs to the unit its context starts with.
        first = (row.get('context') or '').split('/')[0].split('.')[0].strip().lower()
        if (row.get('element') or '').lower() not in units and first in units:
            row['element'] = units[first]
    return rows


def unit_kind(name, kinds):
    for prefix, kind in KIND_BY_PREFIX:
        if name.upper().startswith(prefix):
            return kind
    if 'window' in kinds:
        return 'screen'
    if 'report' in kinds:
        return 'report'
    if 'table' in kinds:
        return 'table'
    return 'other'


def summarize(rows, docs):
    units = collections.defaultdict(lambda: {'statuses': collections.Counter(), 'kinds': set(), 'assumed': 0,
                                             'source_unresolved': 0, 'built_on_defaults': 0})
    for row in rows:
        unit = units[row.get('element') or '?']
        status = (row.get('status') or 'unmapped').strip()
        unit['statuses'][status] += 1
        unit['assumed'] += status == 'verified' and (row.get('confidence') or '').strip() == 'assumed'
        unresolved = (row.get('confidence') or '').strip() == 'unresolved'
        unit['source_unresolved'] += unresolved
        unit['built_on_defaults'] += unresolved and status in BUILT
        unit['kinds'].add(row.get('kind', ''))
    result = []
    for name, unit in units.items():
        counts, total = unit['statuses'], sum(unit['statuses'].values())
        kind = unit_kind(name, unit['kinds'])
        mapped = (docs / 'mapping' / f'{name}.md').exists()
        spec = any((docs / folder / f'{name}.md').exists() for folder in ('screens', 'reports'))
        done = sum(counts[s] for s in DONE)
        built = sum(counts[s] for s in BUILT)
        proven, excluded = counts['verified'], counts['excluded']
        if total and done == total:
            stage = 'done'
        elif built and built + excluded == total:
            stage = 'built'
        elif counts['implemented'] or counts['verified']:
            stage = 'building'
        elif mapped:
            stage = 'mapped'
        else:
            stage = 'not started'
        visual_root = docs / 'evidence' / 'visual'
        visuals = {}
        for platform, directory in (('windows', visual_root), ('darwin', visual_root / 'darwin')):
            visual = directory / f'{name}.json'
            if visual.exists():
                record = json.loads(visual.read_text(encoding='utf-8'))
                visuals[platform] = {'pixel': record.get('pixel_similarity'), 'layout': record.get('edge_overlap')}
        result.append({'name': name, 'kind': kind, 'total': total, 'done': done, 'built': built,
                       'built_percent': round(100 * built / total, 1) if total else 0.0,
                       'proven': proven, 'excluded': excluded, 'stage': stage, 'spec': spec,
                       'assumed': unit['assumed'],
                       'source_unresolved': unit['source_unresolved'], 'built_on_defaults': unit['built_on_defaults'],
                       'statuses': {s: counts[s] for s in STATUS_ORDER},
                       'looks': visuals.get('windows'), 'visuals': visuals})
    order = {'building': 0, 'built': 1, 'mapped': 2, 'done': 3, 'not started': 4}
    return sorted(result, key=lambda u: (order[u['stage']], u['kind'], u['name'].lower()))


def open_questions(docs):
    """Unanswered lines of the answer sheet, open U- items in the mapping notes, ADRs still proposed."""
    sheet = docs / 'evidence' / 'encoded-actions.md'
    unanswered = answered = 0
    if sheet.exists():
        column = None
        for line in sheet.read_text(encoding='utf-8').splitlines():
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if 'Answer' in cells:
                column = cells.index('Answer')  # the sheet's header row: older sheets have no Proposed column
            elif line.startswith('| A-') or line.startswith('| Q-'):
                at = column if column is not None else 3 if line.startswith('| A-') else 2
                answer = cells[at] if at < len(cells) else ''
                answered += bool(answer)
                unanswered += not answer
    items = set()
    for note in (docs / 'mapping').glob('*.md') if (docs / 'mapping').exists() else []:
        items |= set(re.findall(r'\bU-[A-Z0-9]+-\d+\b', note.read_text(encoding='utf-8')))
    proposed = [p.stem for p in (docs / 'decisions').glob('*.md')
                if re.search(r'Status:\s*Proposed', p.read_text(encoding='utf-8'))] if (docs / 'decisions').exists() else []
    return {'answer_sheet_open': unanswered, 'answer_sheet_done': answered, 'unresolved_items': len(items),
            'decisions_pending': proposed}


def git(root, *args):
    result = subprocess.run(['git', '-C', str(root), *args], capture_output=True, text=True)
    return result.stdout if result.returncode == 0 else ''


def history(root, parity_dir, limit=200):
    """(date, strict completion %, rows) after parity commits, oldest first. Includes approved exclusions."""
    relative = parity_dir.resolve().relative_to(Path(git(root, 'rev-parse', '--show-toplevel').strip() or root).resolve())
    points = []
    for line in git(root, 'log', f'-{limit}', '--format=%H %cI', '--', str(relative)).splitlines()[::-1]:
        sha, date = line.split()
        names = git(root, 'ls-tree', '--name-only', sha, f'{relative}/').split()
        files = {n: git(root, 'show', f'{sha}:{n}') for n in names if n.endswith('.csv')}
        rows = matrix_rows(files)
        if rows:
            done = sum(1 for r in rows if (r.get('status') or '').strip() in DONE)
            points.append((date[:10], round(100 * done / len(rows), 1), len(rows)))
    return points


def bar(statuses, total, width=100):
    parts = []
    for status in STATUS_ORDER:
        if statuses.get(status):
            share = 100 * statuses[status] / total
            parts.append(f'<span style="width:{share:.2f}%;background:{COLORS[status]}" '
                         f'title="{statuses[status]} {LABELS[status]}"></span>')
    return f'<div class="bar">{"".join(parts)}</div>'


def chart(points):
    if len(points) < 2:
        return '<p class="muted">The progress line appears after a few commits to the parity matrix.</p>'
    w, h = 640, 140
    xs = [i * (w - 20) / (len(points) - 1) + 10 for i in range(len(points))]
    ys = [h - 10 - p[1] * (h - 20) / 100 for p in points]
    line = ' '.join(f'{x:.1f},{y:.1f}' for x, y in zip(xs, ys))
    return (f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="strict completion over time: verified plus approved exclusions">'
            f'<polyline points="{line}" fill="none" stroke="{COLORS["verified"]}" stroke-width="2.5"/>'
            f'<text x="10" y="14">{points[0][0]}</text><text x="{w - 10}" y="14" text-anchor="end">'
            f'{points[-1][0]} · {points[-1][1]}%</text></svg>')


def render(units, questions, points, commits, title, generated):
    rows = sum(u['total'] for u in units)
    done = sum(u['done'] for u in units)
    statuses = collections.Counter()
    for u in units:
        statuses.update(u['statuses'])
    by_kind = collections.defaultdict(collections.Counter)
    for u in units:
        by_kind[u['kind']][u['stage']] += 1
    percent = round(100 * done / rows, 1) if rows else 0.0
    built = statuses['implemented'] + statuses['verified']
    built_percent = round(100 * built / rows, 1) if rows else 0.0
    proven_percent = round(100 * statuses['verified'] / rows, 1) if rows else 0.0
    assumed = sum(u['assumed'] for u in units)
    source_unresolved = sum(u['source_unresolved'] for u in units)
    built_on_defaults = sum(u['built_on_defaults'] for u in units)

    def tile(kind, label):
        counts = by_kind.get(kind, collections.Counter())
        total = sum(counts.values())
        return (f'<div class="tile"><div class="big">{counts["done"]}<small>/{total}</small></div><div>{label} done</div>'
                f'<div class="muted">{counts["built"]} built, awaiting proof · {counts["building"]} being built · {counts["mapped"]} mapped · '
                f'{counts["not started"]} not started</div></div>')

    legend = ''.join(f'<span><i style="background:{COLORS[s]}"></i>{LABELS[s]} ({statuses[s]})</span>' for s in STATUS_ORDER)

    def visual_cell(unit):
        labels = {'windows': 'Windows', 'darwin': 'macOS'}
        scores = ''.join(
            f'<div title="{labels[platform]}: layout match with the legacy screen '
            f'(pixel similarity {escape(str(score["pixel"]))} %)">'
            f'{labels[platform]} {escape(str(score["layout"]))} %</div>'
            for platform, score in unit['visuals'].items())
        return f'<td class="visual">{scores or "–"}</td>'

    unit_rows = ''.join(
        f'<tr class="{u["stage"].replace(" ", "-")}"><td>{escape(u["name"])}</td><td>{u["kind"]}</td>'
        f'<td><b class="stage {u["stage"].replace(" ", "-")}">{u["stage"]}</b></td>'
        f'<td>{bar(u["statuses"], u["total"])}</td>'
        f'<td class="num"><div>{u["built"]}/{u["total"]} built</div><div>{u["proven"]}/{u["total"]} proven</div></td>'
        f'<td class="num" title="verified plus approved exclusions">{u["done"]}/{u["total"]}<div class="muted">{u["excluded"]} excluded</div></td>'
        f'{visual_cell(u)}</tr>'
        for u in units if u['kind'] in ('screen', 'report'))
    others = [u for u in units if u['kind'] not in ('screen', 'report')]
    other_line = (f'<p class="muted">Also tracked: {len(others)} other elements (tables, queries, procedures), '
                  f'{sum(u["built"] for u in others)}/{sum(u["total"] for u in others)} built, '
                  f'{sum(u["proven"] for u in others)}/{sum(u["total"] for u in others)} proven, '
                  f'{sum(u["done"] for u in others)}/{sum(u["total"] for u in others)} strictly complete '
                  f'({sum(u["excluded"] for u in others)} excluded).</p>') if others else ''
    pending = questions['decisions_pending']
    commit_items = ''.join(f'<li><span class="muted">{escape(d)}</span> {escape(s)}</li>' for d, s in commits)
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — migration progress</title>
<style>
:root{{--bg:#0d0f14;--panel:#151923;--line:#262c3a;--text:#e6e8ee;--muted:#8a93a6;--accent:#5fd38d}}
@media (prefers-color-scheme: light){{:root{{--bg:#f6f7f9;--panel:#fff;--line:#e2e5ea;--text:#151923;--muted:#5c6577}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px 48px}}
h1{{font-size:14px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin:0 0 18px}}
h2{{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:32px 0 12px}}
.hero{{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-end}}
.hero .pct{{font-size:72px;font-weight:700;color:{COLORS["implemented"]};line-height:1}}
.tiles{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:20px}}
.tile{{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px}}
.big{{font-size:34px;font-weight:700}}.big small{{font-size:18px;color:var(--muted)}}
.muted{{color:var(--muted);font-size:13px}}
.bar{{display:flex;height:12px;border-radius:6px;overflow:hidden;background:{COLORS["unmapped"]};min-width:40px}}
.bar span{{display:block;height:100%}}
.legend{{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--muted);margin:10px 0}}
.legend i{{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px}}
table{{width:100%;border-collapse:collapse;table-layout:fixed}}td{{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:middle;overflow-wrap:anywhere}}
td:nth-child(1){{width:27%}}td:nth-child(2){{width:8%}}td:nth-child(3){{width:11%}}td:nth-child(5){{width:16%}}td:nth-child(6){{width:12%}}td:nth-child(7){{width:14%}}.num{{text-align:right;white-space:nowrap}}.visual{{text-align:right;font-size:12px;white-space:nowrap}}
.stage{{font-size:12px;padding:2px 8px;border-radius:99px;background:var(--line);white-space:nowrap}}
.stage.done{{background:#1f4d33;color:#9ff0c0}}.stage.building{{background:#4d3f17;color:#ffe08a}}
.stage.built{{background:#594817;color:#ffe7a6}}
.stage.mapped{{background:#2d2752;color:#cfc6ff}}
.filters button{{font:inherit;font-size:13px;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:6px;padding:4px 10px;margin:0 6px 8px 0;cursor:pointer}}
.filters button.on{{border-color:var(--accent)}}
.chart{{width:100%;max-width:640px;background:var(--panel);border:1px solid var(--line);border-radius:10px}}
.chart text{{fill:var(--muted);font-size:11px}}
ul{{padding-left:18px}}li{{margin:3px 0}}
@media (max-width:760px){{.unit-table{{overflow-x:auto}}table{{min-width:880px}}td:nth-child(2){{display:none}}.hero .pct{{font-size:56px}}}}
</style></head><body><main>
<h1>{escape(title)} · WINDEV → new app · migration progress</h1>
<div class="hero"><div class="pct">{built_percent}%</div>
<div><div>of legacy behaviors are <b>built</b> in the new app</div>
<div class="muted">{built} of {rows} behaviors · {statuses["implemented"]} built, awaiting proof · {statuses["excluded"]} approved exclusions outside the built count · updated {generated}</div></div></div>
<div class="tiles">
<div class="tile"><div class="big">{proven_percent}%</div><div>proven by verification</div>
<div class="muted">{statuses["verified"]}/{rows} verified{f" · {assumed} on assumptions still to confirm" if assumed else ""}</div></div>
<div class="tile"><div class="big">{percent}%</div><div>strict completion</div>
<div class="muted">{done}/{rows} verified + approved exclusions ({statuses["excluded"]} excluded)</div></div>
<div class="tile"><div class="big">{built_on_defaults}</div><div>built using target defaults</div>
<div class="muted">{source_unresolved} source behaviors still unconfirmed. Implementation does not resolve the WINDEV evidence gaps or native acceptance.</div></div>
{tile("screen", "screens")}{tile("report", "reports")}
<div class="tile"><div class="big">{questions["answer_sheet_open"]}</div><div>assumptions to confirm with the WINDEV expert (work does not wait)</div>
<div class="muted">{questions["answer_sheet_done"]} answered · {questions["unresolved_items"]} open points in the analysis</div></div>
<div class="tile"><div class="big">{len(pending)}</div><div>decisions waiting for you</div>
<div class="muted">{escape(", ".join(pending[:4])) or "none"}</div></div></div>
<h2>All behaviors</h2>{bar(statuses, rows or 1)}<div class="legend">{legend}</div>
<h2>Strict completion over time</h2><p class="muted">Original history: verified + approved exclusions. Implemented rows awaiting proof do not count in this line.</p>{chart(points)}
<h2>Screens and reports</h2>
<div class="filters"><button data-f="all" class="on">all</button><button data-f="building">being built</button>
<button data-f="built">built, awaiting proof</button>
<button data-f="mapped">mapped</button><button data-f="done">done</button><button data-f="not-started">not started</button></div>
<div class="unit-table"><table id="units"><thead><tr class="muted"><td>screen / report</td><td>kind</td><td>stage</td><td>behaviors</td>
<td class="num">built / proven</td><td class="num">strict completion</td><td class="num">looks like the original</td></tr></thead><tbody>{unit_rows}</tbody></table></div>{other_line}
<h2>Recent work</h2><ul>{commit_items or '<li class="muted">No commits yet.</li>'}</ul>
<p class="muted">Each screen goes: not started → mapped (its behavior written down and checked) → being built → built
(every in-scope behavior implemented or verified) → done (every behavior verified or excluded by a decision).
Built = implemented + verified; proven = verified; strict completion = verified + approved exclusions.
Specified or unmapped rows keep a unit short of built. Built does not establish native or human acceptance.
"Looks like the original": how much of the legacy
screen's layout (borders, text, lines) is at the same place in the new one, from scripts/visual_compare.py.
Windows and macOS measurements are shown separately; a score does not establish native or human acceptance.
A human still approves the look from the side-by-side image. Generated by scripts/progress_dashboard.py.</p>
</main><script>
document.querySelectorAll('.filters button').forEach(b => b.onclick = () => {{
  document.querySelectorAll('.filters button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('#units tbody tr').forEach(r => r.style.display = b.dataset.f === 'all' || r.classList.contains(b.dataset.f) ? '' : 'none');
}});
</script></body></html>
'''


def build(docs, title='Migration', root=None):
    docs = Path(docs)
    parity = docs / 'parity'
    files = {p.name: p.read_text(encoding='utf-8') for p in parity.glob('*.csv')} if parity.exists() else {}
    units = summarize(matrix_rows(files), docs)
    root = Path(root or docs.parent)
    points = history(root, parity) if parity.exists() and git(root, 'rev-parse', '--git-dir') else []
    commits = [tuple(line.split(' ', 1)) for line in git(root, 'log', '-10', '--format=%cs %s').splitlines()
               if ' ' in line]
    generated = datetime.now().strftime('%Y-%m-%d %H:%M')
    return render(units, open_questions(docs), points, commits, title, generated), units


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--docs', type=Path, default=Path('docs'))
    parser.add_argument('--out', type=Path, help='default: <docs>/progress/index.html')
    parser.add_argument('--title', default='Migration', help='the application name shown on the page')
    args = parser.parse_args()
    page, units = build(args.docs, args.title)
    out = args.out or args.docs / 'progress' / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding='utf-8')
    (out.with_suffix('.json')).write_text(json.dumps(units, indent=1), encoding='utf-8')
    screens = [u for u in units if u['kind'] == 'screen']
    print(f"{out}: {sum(u['stage'] == 'done' for u in screens)}/{len(screens)} screens done, "
          f"{sum(u['built'] for u in units)}/{sum(u['total'] for u in units)} behaviors built, "
          f"{sum(u['proven'] for u in units)} verified, {sum(u['excluded'] for u in units)} excluded, "
          f"{sum(u['done'] for u in units)} strictly complete")


if __name__ == '__main__':
    main()
