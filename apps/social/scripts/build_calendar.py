"""SNS 84일 편성표(config/calendar.json) 생성 — 배틀패스 12주 퀴즈 커리큘럼을 주간 테마로 쓴다.
하루 = 퀴즈 3문항(그 주 단계, 순서대로) + 블로그 글 1편(그 주 테마 글 우선, 모자라면 핵심 주제 글을 가장 덜 쓴 것부터).
약물(GLP-1 등) 주제는 lib/source.mjs isDrugTopic 과 같은 규칙으로 뺀다. 실행: python3 scripts/build_calendar.py
"""
import json, re, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
DRUG = re.compile(r'glp-?1|semaglutide|tirzepatide|liraglutide|orforglipron|retatrutide|ozempic|wegovy|mounjaro|zepbound|saxenda|rybelsus|metformin|levothyroxine|rapamycin|세마글루타이드|터제파타이드|티르제파타이드|오젬픽|위고비|마운자로|젭바운드|삭센다|메트포르민|레보티록신|주사제|비만 ?주사|처방약', re.I)
THEMES = ['기초(Foundation)', '마인드셋', '영양 기초', '단백질', '탄수화물·지방', '수분·수면', '움직임', '감정적 식사', '사회·환경', '정체기·재시작', '호르몬·건강', '통합']
# 주차별 테마 글(앞에서부터 우선). 질환 글은 11주에만.
WEEK_ARTICLES = {
  1: ['body-weight-fluctuation-normal-range-daily-tracking-2026', 'active-calories-vs-total-calories-burned-tracking-2026', 'cold-water-drinking-metabolism-calorie-burn-myth-2026'],
  2: ['self-compassion-meditation-weight-loss-motivation-2026', 'guided-meditation-weight-loss-healthy-habits-guide-2026', 'morning-meditation-focus-energy-5-minute-2026', 'meditation-for-beginners-5-minutes-anywhere-2026'],
  3: ['satiety-index-foods-hunger-control-ranking-2026', 'vitamin-d3-k2-synergy-calcium-metabolism-2026', 'apple-cider-vinegar-drink-blood-sugar-hydration-2026', 'zinc-copper-ratio-supplementation-imbalance-risk-2026'],
  4: ['leucine-threshold-per-meal-muscle-protein-synthesis-2026', 'diet-induced-thermogenesis-protein-thermic-effect-2026', 'protein-quality-aging-leucine-threshold-muscle-2026', 'creatine-monohydrate-food-sources-supplementation-need-2026'],
  5: ['post-meal-walking-blood-sugar-timing-optimization-2026', 'carbohydrate-insulin-model-obesity-current-evidence-2026', 'autophagy-fasting-protocol-duration-threshold-evidence-2026'],
  6: ['sparkling-water-bone-health-carbonation-calcium-myth-2026', 'sleep-pressure-adenosine-buildup-timing-2026', 'milk-hydration-index-better-than-water-study-2026', 'caffeine-half-life-sleep-cutoff-time-calculation-2026', 'magnesium-forms-sleep-specific-absorption-2026', 'coconut-water-vs-sports-drinks-electrolyte-comparison-2026', 'tart-cherry-juice-sleep-melatonin-hydration-timing-2026'],
  7: ['stair-climbing-cardiorespiratory-fitness-apartment-workout-2026', 'body-recomposition-lose-fat-gain-muscle-simultaneously-2026', 'grip-strength-longevity-predictor-training-2026', 'farmers-walk-functional-strength-whole-body-exercise-2026', 'breathing-technique-lifting-valsalva-safety-2026'],
  8: ['meditation-for-emotional-stress-eating-2026', 'meditation-for-food-cravings-5-minute-practice-2026', 'breathing-relaxation-meditation-stress-anxiety-2026'],
  9: ['alcohol-dehydration-recovery-timeline-rehydration-protocol-2026', 'herbal-tea-caffeine-free-hydration-sleep-quality-2026', 'reading-before-bed-screen-vs-paper-sleep-onset-2026'],
  10: ['water-retention-causes-solutions-weight-fluctuation-2026', 'weight-loss-rate-optimal-speed-muscle-preservation-2026', 'refeeding-syndrome-extreme-diet-warning-signs-2026'],
  11: ['chronic-inflammation-markers-crp-levels-lifestyle-reduction-2026', 'morning-evening-blood-pressure-difference-tracking-2026', 'histamine-intolerance-hidden-trigger-foods-2026', 'joint-pain-morning-stiffness-duration-meaning-2026', 'blood-pressure-variability-day-to-day-normal-range-2026', 'low-stomach-acid-hypochlorhydria-signs-natural-support-2026', 'post-viral-fatigue-recovery-timeline-protocol-2026'],
  12: ['body-scan-sleep-meditation-10-minute-guide-2026', 'brain-derived-neurotrophic-factor-boosting-activities-2026', 'skin-temperature-circadian-rhythm-tracking-2026'],
}
# 빈자리를 채우는 핵심 주제 글(식단·영양·수분·수면·스트레스·습관) — 질환 글은 넣지 않는다.
CORE = [s for w in (3, 6, 4, 8, 5, 2, 1, 10, 7, 9, 12) for s in WEEK_ARTICLES[w]]

sources = {x['slug'] for x in json.loads((ROOT / 'config/sources.json').read_text())['sources']}
for w, arts in WEEK_ARTICLES.items():
    for s in arts: assert s in sources, s
quizzes = [q for q in json.loads((ROOT / 'config/quizzes.json').read_text())['quizzes']
           if not any(DRUG.search(' '.join(q['langs'][l].values())) for l in ('ko', 'en'))]
by_stage = collections.defaultdict(list)
for q in quizzes: by_stage[q['stage']].append(q['id'])  # 내보내기가 stage·sequence 순

used = collections.Counter(); days = []
for w in range(1, 13):
    themed = list(WEEK_ARTICLES[w]); week_used = set()
    for k in range(7):
        if themed: slug = themed.pop(0)
        else: slug = min((s for s in CORE if s not in week_used), key=lambda s: (used[s], CORE.index(s)))
        used[slug] += 1; week_used.add(slug)
        qs = by_stage[w][k * 3:(k + 1) * 3]
        days.append({'week': w, 'theme': THEMES[w - 1], 'article': slug, 'quiz_ig': qs[0], 'quiz_tip': qs[1], 'quiz_ox': qs[2]})
out = {'_note': 'SNS 84일 편성표 — scripts/build_calendar.py 로 생성(손으로 고치지 말 것). 매일 9개 언어 같은 콘텐츠. day=(날짜-start)%84. 배틀패스 12주 커리큘럼=주간 테마. 약물 주제 제외.',
       'start': '2026-10-25', 'days': days}
(ROOT / 'config/calendar.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print('84일', len(days), '블로그 글', len(used), '종 · 최다 반복', used.most_common(1), '· 퀴즈', len({d[k] for d in days for k in ('quiz_ig', 'quiz_tip', 'quiz_ox')}))
