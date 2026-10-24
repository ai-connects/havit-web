#!/usr/bin/env bash
# 앱 퀴즈 라이브러리(prod battlepass_quizzes, 읽기 전용) → config/quizzes.json. 퀴즈가 바뀌면 로컬에서 다시 돌려 커밋한다.
#   DB_ENV=~/Havit-Workspace/Havit_DB/env.prod bash scripts/export_quizzes.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source "${DB_ENV:?DB_ENV 에 prod env 파일 경로}"; set +a
PGOPTIONS="-c default_transaction_read_only=on" PGPASSWORD=$POSTGRES_PASSWORD psql "host=$DB_HOST_READER port=$DB_PORT dbname=$POSTGRES_DB user=$POSTGRES_USER sslmode=${DB_SSLMODE:-require}" -At \
  -c "
select json_build_object('_note', '앱 퀴즈 라이브러리(battlepass_quizzes) 스냅샷 — scripts/export_quizzes.sh 로 갱신. 원문 그대로 쓴다(대표 결정 2026-10-24).',
  'quizzes', json_agg(json_build_object(
    'id', 'quiz-s' || lpad(stage_no::text, 2, '0') || '-' || lower(article_id),
    'stage', stage_no, 'article_id', article_id, 'answer', answer, 'action_stage', action_stage,
    'langs', json_strip_nulls(json_build_object('ko', ko_kr, 'ja', ja_jp, 'en', en_us, 'zh-tw', zh_tw, 'zh', zh_cn,
      'es', es_es, 'pt-br', pt_pt, 'id', id_id, 'de', de_de, 'fr', fr_fr))
  ) order by stage_no, sequence_no))
from battlepass_quizzes where is_active" | python3 -c "import json,sys; d=json.load(sys.stdin); open('config/quizzes.json','w').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n'); print(len(d['quizzes']), '문항')"
