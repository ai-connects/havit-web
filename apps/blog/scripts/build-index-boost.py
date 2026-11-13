"""
색인 보강 링크 대상 갱신 — data/index-boost.json 생성.

왜: 관련글 배정(lib/related-articles.ts)은 인링크 수만 보고 분산한다. 그런데 링크가
"어디서" 오느냐가 중요하다 — Google 이 자주 크롤하는 노출 상위 글에서 오는 링크가
미색인 글의 크롤·색인 우선순위를 올린다. 이 스크립트는 Search Console 노출로
언어별 (1) 노출 0 글(boost) (2) 노출 상위 글(strong) 목록을 만든다.
관련글 배정 D 단계가 strong 글의 남는 칸을 boost 글로 채운다.

실행(ADC 필요 — webmasters.readonly 스코프):
  gcloud auth application-default login \
    --scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/cloud-platform
  python3 -m venv /tmp/gscvenv && /tmp/gscvenv/bin/pip install google-auth requests
  /tmp/gscvenv/bin/python scripts/build-index-boost.py [--days 28] [--strong 300]

노출 0 = 미색인 확정은 아니다(색인됐지만 검색어가 없을 수도 있음). 다만 노출이 있으면
색인된 것이므로 boost 는 "미색인 후보"의 상한 집합이다. 2~4주마다 갱신.
"""
import argparse
import datetime as dt
import json
import pathlib
import re
import urllib.parse as up
import xml.etree.ElementTree as ET

import google.auth
import google.auth.transport.requests as tr
import requests

SITE = "sc-domain:aihavit.com"
BLOG = "https://www.aihavit.com/blog"
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
NON_ARTICLE = {"articles", "about", "editorial-policy", "tools", "category", "page"}
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "index-boost.json"


def sitemap_urls() -> list[str]:
    idx = ET.fromstring(requests.get(f"{BLOG}/sitemap.xml", timeout=30).content)
    urls: list[str] = []
    for loc in idx.findall(".//s:loc", NS):
        child = ET.fromstring(requests.get(loc.text, timeout=60).content)
        urls += [l.text.strip().rstrip("/") for l in child.findall(".//s:loc", NS)]
    return urls


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=28)
    ap.add_argument("--strong", type=int, default=300)
    a = ap.parse_args()

    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    s = tr.AuthorizedSession(creds)
    end = dt.date.today() - dt.timedelta(days=3)  # final 데이터만
    start = end - dt.timedelta(days=a.days - 1)
    api = f"https://www.googleapis.com/webmasters/v3/sites/{up.quote(SITE, safe='')}/searchAnalytics/query"
    impr: dict[str, int] = {}
    row = 0
    while True:
        r = s.post(api, json={"startDate": str(start), "endDate": str(end), "dimensions": ["page"],
                              "rowLimit": 25000, "startRow": row, "dataState": "final"})
        r.raise_for_status()
        rows = r.json().get("rows", [])
        for x in rows:
            u = x["keys"][0].split("#")[0].split("?")[0].rstrip("/")
            impr[u] = impr.get(u, 0) + int(x["impressions"])
        if len(rows) < 25000:
            break
        row += 25000

    langs: dict[str, dict[str, int]] = {}
    for u in sitemap_urls():
        m = re.match(rf"{re.escape(BLOG)}/([^/]+)/([a-z0-9-]+)$", u)
        if not m or m.group(2) in NON_ARTICLE:
            continue
        langs.setdefault(m.group(1), {})[m.group(2)] = impr.get(u, 0)

    out = {
        "_doc": "scripts/build-index-boost.py 생성. boost=노출 0 글, strong=노출 상위 글(언어별). lib/related-articles.ts D 단계 입력.",
        "window": [str(start), str(end)],
        "langs": {},
    }
    for lang, d in sorted(langs.items()):
        boost = sorted(k for k, v in d.items() if v == 0)
        strong = [k for k, v in sorted(d.items(), key=lambda kv: (-kv[1], kv[0])) if v > 0][: a.strong]
        out["langs"][lang] = {"boost": boost, "strong": sorted(strong)}
        print(f"{lang:6} articles={len(d):5} boost={len(boost):4} strong={len(strong)}")
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
