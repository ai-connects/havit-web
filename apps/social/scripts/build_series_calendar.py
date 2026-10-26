"""상황별 시리즈 편성표(config/series_calendar.json) 생성 — config/situations.json 을 날짜·채널·현지 시각에 배치.
생존 가이드(sit-): 월 07시 IG+Threads · 수 16시 Threads · 금 15시 IG+Threads. 첫 4주·시즌 회차는 FIXED, 나머지는 우선순위 순.
AI 잔소리(nag-): Threads 월~금(에피소드 추천 요일·시각) · Instagram 화·금 20시(Threads 에 3일 이상 먼저 나간 편을 캐러셀로).
임상 검토 대상(clinical_review)은 clinical_approved_by 가 채워지기 전엔 편성하지 않는다. 약물 주제는 plan_series.mjs 가 막는다.
같은 계정의 기존 슬롯(channels.json post_hours)과 같은 시각이면 한 시간씩 민다. 실행: python3 scripts/build_series_calendar.py [시작 월요일] [주 수]
"""
import json, sys
from datetime import date, timedelta
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
START = date.fromisoformat(sys.argv[1] if len(sys.argv) > 1 else '2026-11-02')
WEEKS = int(sys.argv[2]) if len(sys.argv) > 2 else 10
assert START.weekday() == 0, '시작일은 월요일'

items = json.loads((ROOT / 'config/situations.json').read_text())['items']
ready = [x for x in items if not x.get('clinical_review') or x.get('clinical_approved_by')]
held = [x['id'] for x in items if x not in ready]
by_topic = {x['topic']: x for x in ready if x['series'] == 'survival'}
post_hours = json.loads((ROOT / 'config/channels.json').read_text())['langs']['ko']['post_hours']  # 전 언어 같은 현지 시각
taken = {ch: {h for k, h in post_hours.items() if k.split('_')[0] == ch} for ch in ('instagram', 'threads')}

# 첫 4주(04_hooks 4주 편성) + 시즌(12월 회식·송년회·연말 연휴)
FIXED = {'2026-11-02': 'T16', '2026-11-04': 'T12', '2026-11-06': 'T23', '2026-11-09': 'T17', '2026-11-11': 'T04', '2026-11-13': 'T02',
         '2026-11-16': 'T22', '2026-11-18': 'T13', '2026-11-20': 'T03', '2026-11-23': 'T10', '2026-11-27': 'T09',
         '2026-12-04': 'T01', '2026-12-09': 'T29', '2026-12-18': 'T26'}
SLOTS = {0: (7, ['instagram', 'threads']), 2: (16, ['threads']), 4: (15, ['instagram', 'threads'])}
FORMAT = {('survival', 'instagram'): 'situation_playbook', ('survival', 'threads'): 'situation_post',
          ('nag', 'instagram'): 'nag_carousel', ('nag', 'threads'): 'nag_post'}

entries = []
used_hours = {}  # (date, channel) → 그날 그 채널에 이미 쓴 시각


def free_hour(d, ch, h):
    busy = taken[ch] | used_hours.get((d, ch), set())
    for step in [0, 1, -1, 2, -2, 3, -3]:
        if 6 <= h + step <= 23 and h + step not in busy:
            return h + step
    raise SystemExit(f'{d} {ch} 빈 시각 없음')


def add(d, ch, item, h, no):
    h = free_hour(d, ch, h)
    used_hours.setdefault((d, ch), set()).add(h)
    entries.append({'date': d, 'channel': ch, 'hour': h, 'slug': item['id'], 'series': item['series'], 'series_no': no, 'format': FORMAT[(item['series'], ch)]})


days = [START + timedelta(i) for i in range(WEEKS * 7)]
# 생존 가이드
fixed_topics = set(FIXED.values())
queue = [x for x in sorted(ready, key=lambda x: x['priority']) if x['series'] == 'survival' and x['topic'] not in fixed_topics]
no = 0
for d in days:
    if d.weekday() not in SLOTS:
        continue
    t = FIXED.get(d.isoformat())
    item = by_topic.get(t) if t else (queue.pop(0) if queue else None)
    if not item:
        continue
    no += 1
    h, chans = SLOTS[d.weekday()]
    for ch in chans:
        add(d.isoformat(), ch, item, h, no)
left_survival = [x['id'] for x in queue]

# AI 잔소리 — Threads 월~금, 추천 요일이 맞는 편 먼저, 없으면 요일 무관(any) 편
WD = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
nags = sorted([x for x in ready if x['series'] == 'nag'], key=lambda x: x['priority'])
threads_order = []
for d in days:
    if not nags:
        continue
    # 주말은 그 요일을 지정한 편(일요일 브런치 등)만
    pick = next((x for x in nags if x.get('weekday') == WD[d.weekday()]), None) or (next((x for x in nags if x.get('weekday', 'any') == 'any'), None) if d.weekday() <= 4 else None)
    if not pick:
        continue
    nags.remove(pick)
    threads_order.append((d, pick))
    add(d.isoformat(), 'threads', pick, int(pick.get('local_hour') or 21), len(threads_order))
# 요일이 안 맞아 남은 편은 남은 평일 뒤에 이어 붙인다(요일 지정 편은 그 요일에)
for x in list(nags):
    for d in days:
        if (x.get('weekday', 'any') == WD[d.weekday()] or (d.weekday() <= 4 and x.get('weekday', 'any') == 'any')) and not any(e['date'] == d.isoformat() and e['series'] == 'nag' and e['channel'] == 'threads' for e in entries):
            nags.remove(x)
            threads_order.append((d, x))
            add(d.isoformat(), 'threads', x, int(x.get('local_hour') or 21), len(threads_order))
            break
threads_order.sort(key=lambda p: p[0])
ep_no = {x['id']: e['series_no'] for x in ready for e in entries if e['slug'] == x['id'] and e['channel'] == 'threads' and x['series'] == 'nag'}
ig_queue = [x for _, x in threads_order]
for d in days:
    if d.weekday() not in (1, 4) or not ig_queue:
        continue
    # Threads 에 3일 이상 먼저 나간 편 중, 요일 지정이 없거나 그 요일인 편(월요일 이야기를 금요일에 내지 않게)
    first = next((i for i, x in enumerate(ig_queue) if x.get('weekday', 'any') in ('any', WD[d.weekday()]) and any(dd + timedelta(3) <= d for dd, xx in threads_order if xx is x)), None)
    if first is None:
        continue
    x = ig_queue.pop(first)
    add(d.isoformat(), 'instagram', x, 20, ep_no[x['id']])

entries.sort(key=lambda e: (e['date'], e['hour'], e['channel']))
out = {'_note': '상황별 시리즈 편성표 — scripts/build_series_calendar.py 로 생성(손으로 고치지 말 것). hour = 현지 시각(9개 언어 공통). 임상 검토 주제는 승인 전 미편성.',
       'start': START.isoformat(), 'weeks': WEEKS, 'held_for_clinical_review': held, 'unscheduled': left_survival + [x['id'] for x in nags], 'nag_threads_only': [x['id'] for x in ig_queue],
       'entries': entries}
(ROOT / 'config/series_calendar.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
per_week = len(entries) / WEEKS
print(f'편성 {len(entries)}슬롯(언어당) · 주 평균 {per_week:.1f} · 마지막 {entries[-1]["date"]} · 임상 보류 {held} · 미편성 {out["unscheduled"]}')
