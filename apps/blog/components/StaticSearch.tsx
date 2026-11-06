'use client';
// 정적 내보내기 전용(app/[lang]/page.tsx 가 STATIC_EXPORT=1 일 때만 넣는다).
// 서버가 요청마다 렌더하던 블로그 홈의 ?q= 검색과 ?page= 쪽 이동을 브라우저에서 대신한다.
// 검색 기준(제목·요약·설명에 포함)은 서버 쪽과 같다.
import { useEffect, useState } from 'react';

type Hit = { s: string; t: string; d: string };

export default function StaticSearch({ lang }: { lang: string }) {
  const [state, setState] = useState<{ q: string; hits: Hit[] } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const page = parseInt(sp.get('page') ?? '', 10);
    const q = (sp.get('q') ?? '').trim().toLowerCase();
    if (!q && page > 1) {
      window.location.replace(`/blog/${lang}/page/${page}`);
      return;
    }
    if (!q) return;
    fetch(`/blog/${lang}/search-index.json`)
      .then((r) => r.json())
      .then((all: Hit[]) => {
        const hits = all.filter(
          (h) => h.t.toLowerCase().includes(q) || h.d.toLowerCase().includes(q),
        );
        setState({ q, hits });
        document.documentElement.setAttribute('data-static-search', '1');
      })
      .catch(() => {});
  }, [lang]);

  if (!state) return null;
  return (
    <div className="static-search">
      <h2 className="text-heading-2 mb-8">
        &quot;{state.q}&quot; — {state.hits.length}
      </h2>
      <div className="post-list">
        {state.hits.map((h) => (
          <a key={h.s} className="post-list__item" href={`/blog/${lang}/${h.s}`}>
            <div className="post-list__item-text">
              <h3 className="text-title-large">{h.t}</h3>
              <p className="text-body-medium line-clamp-2">{h.d}</p>
            </div>
          </a>
        ))}
      </div>
      {/* 검색 중에는 서버가 찍어 둔 첫 쪽 목록과 쪽 번호를 숨긴다. */}
      <style>{`[data-static-search] .static-search ~ * { display: none; }`}</style>
    </div>
  );
}
