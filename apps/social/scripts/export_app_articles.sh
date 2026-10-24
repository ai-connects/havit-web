#!/usr/bin/env bash
# 퀴즈의 원본 앱 아티클(prod articles, 읽기 전용) → config/app_articles.json. 퀴즈와 같은 주제의 콘텐츠 소스.
#   DB_ENV=~/Havit-Workspace/Havit_DB/env.prod bash scripts/export_app_articles.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source "${DB_ENV:?DB_ENV 에 prod env 파일 경로}"; set +a
pick() { echo "json_build_object('title',$1->'title','summary',$1->'summary','science',$1->'science','action',$1->'action','mission',$1->'mission','reference',$1->'reference')"; }
PGOPTIONS="-c default_transaction_read_only=on" PGPASSWORD=$POSTGRES_PASSWORD psql "host=$DB_HOST_READER port=$DB_PORT dbname=$POSTGRES_DB user=$POSTGRES_USER sslmode=${DB_SSLMODE:-require}" -At -c "
select json_build_object('_note','퀴즈 원본 앱 아티클 스냅샷 — scripts/export_app_articles.sh 로 갱신.','articles', json_agg(json_build_object(
  'id', lower(a.article_id), 'category', a.category,
  'langs', json_build_object('ko',$(pick a.ko_kr),'ja',$(pick a.ja_jp),'en',$(pick a.en_us),'zh-tw',$(pick a.zh_tw),'zh',$(pick a.zh_cn),
    'es',$(pick a.es_es),'pt-br',$(pick a.pt_pt),'id',$(pick a.id_id),'de',$(pick a.de_de),'fr',$(pick a.fr_fr))) order by a.article_id))
from articles a where a.article_id in (select distinct article_id from battlepass_quizzes where is_active)" \
 | python3 -c "import json,sys; d=json.load(sys.stdin); open('config/app_articles.json','w').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n'); print(len(d['articles']), '편')"
