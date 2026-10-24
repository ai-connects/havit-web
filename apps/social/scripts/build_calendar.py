"""SNS 편성표(config/calendar.json) 생성 — 배틀패스 퀴즈 커리큘럼 순서(1~12단계, 단계 안 순서)를 그대로 따른다.
하루 = 주제 2개. 주제 = 퀴즈 1문항 + 그 퀴즈의 원본 앱 아티클(같은 주제 콘텐츠). 각 주제는 Instagram·Threads 에 콘텐츠 1 + 퀴즈 1.
약물(GLP-1 등) 주제 제외(lib/source.mjs isDrugTopic 과 같은 규칙). 실행: python3 scripts/build_calendar.py
"""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
DRUG = re.compile(r'glp-?1|semaglutide|tirzepatide|liraglutide|orforglipron|retatrutide|ozempic|wegovy|mounjaro|zepbound|saxenda|rybelsus|metformin|levothyroxine|rapamycin|세마글루타이드|터제파타이드|티르제파타이드|오젬픽|위고비|마운자로|젭바운드|삭센다|메트포르민|레보티록신|주사제|비만 ?주사|처방약', re.I)
THEMES = ['기초', '마인드셋', '영양 기초', '단백질', '탄수화물·지방', '수분·수면', '움직임', '감정적 식사', '사회·환경', '정체기·재시작', '호르몬·건강', '통합']
arts = {a['id']: a for a in json.loads((ROOT / 'config/app_articles.json').read_text())['articles']}
def drug(q):
    a = arts.get(q['article_id'].lower())
    txt = ' '.join(json.dumps(q['langs'][l], ensure_ascii=False) for l in ('ko', 'en'))
    if a: txt += ' '.join(json.dumps([a['langs'][l]['title'], a['langs'][l]['summary']], ensure_ascii=False) for l in ('ko', 'en'))
    return bool(DRUG.search(txt))
qs = [q for q in json.loads((ROOT / 'config/quizzes.json').read_text())['quizzes'] if q['article_id'].lower() in arts and not drug(q)]
days = []
for i in range(0, len(qs) - 1, 2):
    a, b = qs[i], qs[i + 1]
    days.append({'stage': a['stage'], 'theme': THEMES[a['stage'] - 1],
                 'quiz_a': a['id'], 'article_a': a['article_id'].lower(), 'quiz_b': b['id'], 'article_b': b['article_id'].lower()})
out = {'_note': 'SNS 편성표 — scripts/build_calendar.py 로 생성(손으로 고치지 말 것). 매일 9개 언어 같은 콘텐츠. 배틀패스 퀴즈 커리큘럼 순서, 하루 주제 2개(콘텐츠+퀴즈). 약물 제외. 끝나면 처음부터 반복.',
       'start': '2026-10-25', 'days': days}
(ROOT / 'config/calendar.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print('퀴즈', len(qs), '문항 → ', len(days), '일')
