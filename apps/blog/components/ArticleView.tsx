import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ArticleV2, ArticleV2LangContent } from '@/lib/articles-v2';
import { getRelatedForLang, articleDates } from '@/lib/articles-v2';
import { articleImage } from '@/lib/article-images';
import { localizedCategory } from '@/lib/category-labels';
import { CategoryIcon } from '@/components/CategoryIcon';
import InstallCTA from './InstallCTA';
import { toFullLang } from '@/lib/i18n';
// BLOG_AUTHORITY v1.0.0 (PRD §7.3) — 3 신규 import (기존 import 무변경)
import ArticleAuthorBlock from './ArticleAuthorBlock';
import MedicalDisclaimer from './MedicalDisclaimer';
import MedicalArticleJsonLd from './MedicalArticleJsonLd';
// SEO v1.1 — FAQPage + BreadcrumbList rich-result schemas
import FaqJsonLd from './FaqJsonLd';
import BreadcrumbJsonLd from './BreadcrumbJsonLd';
import AboutHavit from './AboutHavit';

interface Props {
  article: ArticleV2;
  content: ArticleV2LangContent;
  shortLang: string;
  fallback: boolean;
}

const L: Record<string, Record<string, string>> = {
  back: { en: '← Back to Blog', ko: '← 블로그로 돌아가기', ja: '← ブログに戻る', zh: '← 返回博客', 'zh-tw': '← 返回網誌', es: '← Volver al blog', 'pt-br': '← Voltar ao blog', id: '← Kembali ke blog', de: '← Zurück zum Blog', fr: '← Retour au blog' },
  tldr: { en: 'TL;DR', ko: '한 줄 요약', ja: '要約', zh: '一句话总结', 'zh-tw': '一句話總結', es: 'En resumen', 'pt-br': 'Em resumo', id: 'Ringkasan', de: 'Kurzfassung', fr: 'En bref' },
  updated: { en: 'Updated', ko: '업데이트', ja: '更新', zh: '更新', 'zh-tw': '更新', es: 'Actualizado', 'pt-br': 'Atualizado', id: 'Diperbarui', de: 'Aktualisiert', fr: 'Mis à jour' },
  minRead: { en: 'min read', ko: '분 분량', ja: '分で読める', zh: '分钟阅读', 'zh-tw': '分鐘閱讀', es: 'min de lectura', 'pt-br': 'min de leitura', id: 'menit', de: 'Min. Lesezeit', fr: 'min de lecture' },
  keyStats: { en: 'Key Stats', ko: '핵심 통계', ja: '主要統計', zh: '关键统计', 'zh-tw': '關鍵統計', es: 'Datos clave', 'pt-br': 'Estatísticas-chave', id: 'Statistik Utama', de: 'Kennzahlen', fr: 'Chiffres clés' },
  faq: { en: 'Frequently Asked Questions', ko: '자주 묻는 질문', ja: 'よくある質問', zh: '常见问题', 'zh-tw': '常見問題', es: 'Preguntas frecuentes', 'pt-br': 'Perguntas frequentes', id: 'Pertanyaan Umum', de: 'Häufige Fragen', fr: 'Questions fréquentes' },
  references: { en: 'References', ko: '참고 자료', ja: '参考資料', zh: '参考资料', 'zh-tw': '參考資料', es: 'Referencias', 'pt-br': 'Referências', id: 'Referensi', de: 'Quellen', fr: 'Références' },
  related: { en: 'Related articles', ko: '관련 글', ja: '関連記事', zh: '相关文章', 'zh-tw': '相關文章', es: 'Artículos relacionados', 'pt-br': 'Artigos relacionados', id: 'Artikel terkait', de: 'Ähnliche Artikel', fr: 'Articles liés' },
  fallbackBanner: { en: 'Showing English (translation pending for your language).', ko: '영문판을 표시 중입니다 (해당 언어 번역 예정).', ja: '英語版を表示中（翻訳予定）.', zh: '正在显示英文版（翻译中）.', 'zh-tw': '正在顯示英文版（翻譯中）.', es: 'Mostrando inglés (traducción pendiente).', 'pt-br': 'Exibindo em inglês (tradução pendente).', id: 'Menampilkan bahasa Inggris (terjemahan akan menyusul).', de: 'Englische Version (Übersetzung in Vorbereitung).', fr: 'Version anglaise (traduction à venir).' },
};

function label(key: string, shortLang: string): string {
  return L[key]?.[shortLang] ?? L[key]?.en ?? '';
}

export default function ArticleView({ article, content, shortLang, fallback }: Props) {
  const langKey = toFullLang(shortLang === 'zh' ? 'zh-cn' : shortLang);
  const references = Array.isArray(content.references) ? content.references : null;
  // SEO — same-category sibling links (native-content only) so no article is an
  // orphan. Reachability from related pages is a direct lever against
  // "Crawled/Discovered — currently not indexed".
  const related = getRelatedForLang(article, shortLang, 4);

  return (
    <article className="post hv-container post__col">
      <header className="mb-8">
        <Link href={`/${shortLang}`} className="inline-block text-body-small mb-5 hover:underline">
          {label('back', shortLang)}
        </Link>

        {fallback && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
            {label('fallbackBanner', shortLang)}
          </div>
        )}

        {/* Hero photo — assigned by scripts/build-article-images.ts. This is the
            page's LCP element, hence `priority`. */}
        <figure className="post__hero">
          <Image
            src={articleImage(article.slug, article.category)}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 680px"
            priority
            className="object-cover"
          />
        </figure>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="category-badge">
            <CategoryIcon category={article.category} />
            <span>{localizedCategory(article.category, shortLang)}</span>
          </span>
          {article.reading_time_min && (
            <span className="text-body-small">
              {article.reading_time_min} {label('minRead', shortLang)}
            </span>
          )}
        </div>

        <h1 className="text-heading-2 mb-4">{content.title}</h1>

        {content.tldr && (
          <div className="post__callout mb-5">
            <div className="eyebrow mb-1.5" style={{ color: 'var(--hv-grey-80)' }}>
              {label('tldr', shortLang)}
            </div>
            <p className="text-title-medium leading-relaxed" style={{ color: 'var(--hv-grey-100)' }}>
              {content.tldr}
            </p>
          </div>
        )}

        {/* JSON-LD dateModified 와 같은 값이어야 한다 — 화면·구조화 데이터가 다르면 Google 이 둘 다 버린다. */}
        <div className="text-body-small">
          🕓 {label('updated', shortLang)}: <strong>{articleDates(article).modified.slice(0, 10)}</strong>
        </div>

        {/* BLOG_AUTHORITY v1.0.0 (PRD §7.3 Step 3a) — author/reviewer byline */}
        <div className="mt-3">
          <ArticleAuthorBlock article={article} shortLang={shortLang} />
        </div>
      </header>

      {/* BLOG_AUTHORITY v1.0.0 (PRD §7.3 Step 3b) — Medical disclaimer banner before body */}
      <MedicalDisclaimer shortLang={shortLang} />

      <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-[24px] prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-[18px] prose-p:leading-[1.7] prose-p:text-[var(--hv-fg-muted)] prose-li:text-[var(--hv-fg-muted)] prose-a:text-primary-700 prose-strong:text-[var(--hv-fg)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body_md}</ReactMarkdown>
      </div>


      {content.key_stats && content.key_stats.length > 0 && (
        <section className="mt-12">
          <h2 className="text-title-xlarge mb-4">📊 {label('keyStats', shortLang)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.key_stats.map((s, i) => (
              <div key={i} className="p-5 rounded-2xl border" style={{ borderColor: 'var(--hv-border)', background: 'var(--hv-surface)' }}>
                <div className="text-title-xlarge text-primary-700 mb-1">{s.value}</div>
                <div className="text-body-small mb-1.5" style={{ color: 'var(--hv-fg-muted)' }}>{s.label}</div>
                {s.source && (
                  <div className="text-xs italic" style={{ color: 'var(--hv-fg-subtle)' }}>{s.source}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {content.comparison_table && (
        <section className="mt-12">
          <h2 className="text-title-xlarge mb-4">{content.comparison_table.title}</h2>
          <div className="overflow-x-auto -mx-4 md:mx-0 rounded-2xl border" style={{ borderColor: 'var(--hv-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--hv-surface-muted)' }}>
                <tr>
                  {content.comparison_table.headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-2.5 font-semibold whitespace-nowrap border-b border-gray-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.comparison_table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2.5 text-gray-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {content.comparison_table.caption && (
            <p className="mt-2 text-xs text-gray-500 italic">{content.comparison_table.caption}</p>
          )}
        </section>
      )}

      {content.faq && content.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-title-xlarge mb-4">❓ {label('faq', shortLang)}</h2>
          <div className="space-y-3">
            {content.faq.map((q, i) => (
              <details key={i} className="group p-5 rounded-2xl border" style={{ borderColor: 'var(--hv-border)', background: 'var(--hv-surface)' }}>
                <summary className="cursor-pointer font-semibold list-none flex items-start justify-between gap-3">
                  <span>{q.question}</span>
                  <span aria-hidden className="text-gray-400 group-open:rotate-180 transition-transform mt-0.5">▼</span>
                </summary>
                <div className="mt-3 text-body-medium leading-relaxed">{q.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 엔티티 블록 — 본문 영역 안. 푸터/CTA 의 Havit 언급은 추출 단계에서
          대체로 버려지므로 <article> 안에서 한 번은 브랜드를 말해야 한다. */}

      {/* 무엇인지 먼저 말하고, 그 다음 설치를 권한다. */}
      <AboutHavit shortLang={shortLang} />

      <div className="mt-12">
        <InstallCTA lang={langKey} articleId={article.article_id} variant="inline" />
      </div>

      {references && references.length > 0 && (
        <section className="mt-14 pt-8 border-t" style={{ borderColor: 'var(--hv-border)' }}>
          <h3 className="eyebrow">
            {label('references', shortLang)}
          </h3>
          <ul className="space-y-1.5 text-body-small">
            {references.map((r: any, i) => {
              const refTitle = r.title ?? r.text ?? '';
              const refSource = r.source ?? '';
              const refUrl = r.url ?? null;
              const display = refSource ? `${refTitle} — ${refSource}` : refTitle;
              return (
                <li key={i} className="italic">
                  {refUrl ? (
                    <a href={refUrl} target="_blank" rel="noopener" className="hover:underline">{display}</a>
                  ) : (
                    display
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14 pt-8 border-t" style={{ borderColor: 'var(--hv-border)' }}>
          <h2 className="text-title-xlarge">{label('related', shortLang)}</h2>
          {/* Thumbnails here, not a bullet list — same "Other articles" grid the
              marketing site uses, and it makes sibling links actually clickable
              targets (crawl depth + orphan-page mitigation). */}
          <div className="post__related-grid">
            {related.map((r) => (
              <figure key={r.slug} className="article-card">
                <Link href={`/${shortLang}/${r.slug}`} className="article-card__media" tabIndex={-1} aria-hidden>
                  <Image
                    src={articleImage(r.slug, article.category)}
                    alt=""
                    fill
                    sizes="(max-width: 960px) 100vw, 330px"
                    className="object-cover"
                  />
                </Link>
                <figcaption className="p-4">
                  <Link href={`/${shortLang}/${r.slug}`} className="text-title-small hover:underline">
                    <CategoryIcon category={r.category} className="mr-1.5" />
                    {r.title}
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Sticky CTA — mobile only */}
      <InstallCTA lang={langKey} articleId={article.article_id} variant="sticky" />

      {/* BLOG_AUTHORITY v1.0.0 (PRD §7.3 Step 3e) — JSON-LD schema injection */}
      <MedicalArticleJsonLd article={article} content={content} shortLang={shortLang} />
      {/* SEO v1.1 — FAQPage rich-result schema (only when content.faq exists) */}
      <FaqJsonLd content={content} />
      {/* SEO v1.1 — BreadcrumbList navigation schema */}
      <BreadcrumbJsonLd article={article} content={content} shortLang={shortLang} />
    </article>
  );
}
