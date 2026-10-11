import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ArticleV2, ArticleV2LangContent } from '@/lib/articles-v2';
import { getRelatedForLang, articleDates } from '@/lib/articles-v2';
import { articleImage, hubSectionImage } from '@/lib/article-images';
import { localizedCategory } from '@/lib/category-labels';
import { CategoryIcon } from '@/components/CategoryIcon';
import { toFullLang } from '@/lib/i18n';
import { parseHubBody, type HubBlock } from '@/lib/hub-body';
import ArticleAuthorBlock from './ArticleAuthorBlock';
import MedicalDisclaimer from './MedicalDisclaimer';
import MedicalArticleJsonLd from './MedicalArticleJsonLd';
import FaqJsonLd from './FaqJsonLd';
import BreadcrumbJsonLd from './BreadcrumbJsonLd';
import InstallCTA from './InstallCTA';
import AboutHavit from './AboutHavit';

/**
 * GLP-1 SEO 허브 아티클 레이아웃.
 *
 * 기존 ArticleView 는 롱테일 심화글(스포크)용이다. 이쪽은 "ozempic side effects"
 * 같은 헤드 키워드를 받는 허브 61건 전용으로, 훑어보는 독자를 전제로 짠다:
 * 목차로 먼저 지형을 보여주고, 문단을 짧게 끊고, 나열은 카드·스텝으로 세우고,
 * 섹션마다 사진으로 쉼표를 찍는다.
 *
 * 마크업 클래스는 마케팅 사이트(aihavit.com)와 공유하는 이름을 그대로 쓴다
 * — globals.css 가 애초에 그쪽에서 1:1 이식된 것이라 한쪽 변경이 바로 옮겨진다.
 */

interface Props {
  article: ArticleV2;
  content: ArticleV2LangContent;
  shortLang: string;
  fallback: boolean;
}

const L: Record<string, Record<string, string>> = {
  back: { ko: '← 블로그 전체 보기', en: '← All articles', ja: '← 記事一覧', default: '← All articles' },
  toc: { ko: '목차', en: 'Contents', ja: '目次', default: 'Contents' },
  quick: { ko: '빠른 답변', en: 'Quick answer', ja: '結論', default: 'Quick answer' },
  minRead: { ko: '분 분량', en: 'min read', ja: '分', default: 'min read' },
  updated: { ko: '최종 수정', en: 'Updated', ja: '更新', default: 'Updated' },
  faq: { ko: '자주 묻는 질문', en: 'Frequently asked questions', ja: 'よくある質問', default: 'FAQ' },
  refs: { ko: '참고 자료', en: 'References', ja: '参考資料', default: 'References' },
  related: { ko: '관련 글', en: 'Related articles', ja: '関連記事', default: 'Related articles' },
  fallbackBanner: {
    ko: '이 글은 아직 한국어 번역본이 없어 영어 원문을 보여드립니다.',
    en: 'Showing the English original — no translation yet for this language.',
    default: 'Showing the English original — no translation yet for this language.',
  },
};
const t = (key: string, lang: string) => L[key]?.[lang] ?? L[key]?.default ?? key;

/** 인라인 마크다운(링크·굵게)만 처리. 블록 요소는 파서가 이미 나눠놨다. */
function Inline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ href, children }) => {
          const external = /^https?:\/\//.test(href ?? '');
          return external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="hub-link">
              {children}
            </a>
          ) : (
            <Link href={href ?? '#'} className="hub-link">
              {children}
            </Link>
          );
        },
        strong: ({ children }) => <span className="hub-accent">{children}</span>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

/**
 * 구조화 비교표.
 *
 * 제목이 본문 h2 와 같으면 **그 섹션 안에서** 렌더한다. 예전엔 본문 전부를
 * 그린 뒤 맨 끝에 같은 제목으로 한 번 더 그렸다 — 그래서 독자는 같은 제목을
 * 두 번 보고, 표를 소개하는 문장은 정작 표에서 멀리 떨어져 있었다.
 * 실측: hub 65건 중 63건 · 326개 (글×언어) 가 이 상태였고 영어·한국어
 * 포함 전 언어에 해당했다(= 번역 문제가 아니라 레이아웃 문제).
 */
function ComparisonTable({
  table,
  withHeading,
}: {
  table: NonNullable<ArticleV2LangContent['comparison_table']>;
  withHeading: boolean;
}) {
  return (
    <>
      {withHeading && <h2 className="hub-h2">{table.title}</h2>}
      <div className="hub-table-wrap">
        <table className="hub-table">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.caption && <p className="hub-caption">{table.caption}</p>}
    </>
  );
}

function Block({ block }: { block: HubBlock }) {
  switch (block.type) {
    /* 원고가 위치를 직접 지정한 사진. 자동 섹션 사진과 달리 표가 있는 섹션에도
       들어간다 — 앱을 하나씩 소개하는 글은 섹션마다 표가 있어서 자동 배치로는
       사진이 한 장도 안 붙는다.

       `/havit/shot/` 아래는 **앱 화면**이다. 세로로 긴 스크린샷이라 사진과 같은
       4:3 cover 로 넣으면 가운데 띠만 남고 위아래가 잘린다. 그래서 세로 비율을
       그대로 두고 contain 으로, 좁은 폭에 가운데 정렬해 넣는다. */
    case 'image': {
      const isShot = block.src.includes('/havit/shot/');
      return (
        <figure className={isShot ? 'hub-shot' : 'hub-figure hub-figure--inline'}>
          <span className={isShot ? 'hub-shot__frame' : 'hub-figure__box'}>
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes={isShot ? '(max-width: 860px) 70vw, 340px' : '(max-width: 860px) 100vw, 800px'}
              loading="lazy"
              className={isShot ? 'object-contain' : 'object-cover'}
            />
          </span>
          {block.alt && <figcaption className="hub-figcaption">{block.alt}</figcaption>}
        </figure>
      );
    }
    case 'heading':
      return block.level === 3 ? (
        <h3 className="hub-h3">
          <Inline>{block.text}</Inline>
        </h3>
      ) : (
        <h4 className="hub-h4">
          <Inline>{block.text}</Inline>
        </h4>
      );

    case 'para':
      return (
        <p className="hub-p">
          <Inline>{block.text}</Inline>
        </p>
      );

    case 'caption':
      return (
        <p className="hub-caption">
          <Inline>{block.text}</Inline>
        </p>
      );

    case 'quote':
      return (
        <blockquote className="hub-quote">
          <Inline>{block.text}</Inline>
        </blockquote>
      );

    case 'list':
      return block.ordered ? (
        <ol className="hub-ol">
          {block.items.map((it, i) => (
            <li key={i}>
              <Inline>{it}</Inline>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="hub-ul">
          {block.items.map((it, i) => (
            <li key={i}>
              <span className="hub-bullet" aria-hidden />
              <span>
                <Inline>{it}</Inline>
              </span>
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="hub-steps">
          {block.items.map((it, i) => (
            <li key={i}>
              <span className="hub-step__n">{i + 1}</span>
              <div>
                {it.title && (
                  <p className="hub-step__title">
                    <Inline>{it.title}</Inline>
                  </p>
                )}
                {it.body && (
                  <p className="hub-step__body">
                    <Inline>{it.body}</Inline>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      );

    case 'cards':
      return (
        <div className="hub-cards">
          {block.items.map((it, i) => (
            <div key={i} className="hub-card">
              {it.title && (
                <p className="hub-card__title">
                  <Inline>{it.title}</Inline>
                </p>
              )}
              {it.body && (
                <p className="hub-card__body">
                  <Inline>{it.body}</Inline>
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case 'table': {
      /* 헤더가 전부 비어 있으면 "스펙표"다 — `| | |` 로 열 이름 없이 항목·값만
         적은 2열 표. 그대로 그리면 빈 `<th>` 띠가 하나 생겨 글 사이에 정체불명의
         여백이 박힌다. 그럴 땐 thead 를 빼고 왼쪽 열을 라벨로 세운다. */
      const isSpec = block.headers.every((h) => !h.trim());
      return (
        <div className="hub-table-wrap">
          <table className={isSpec ? 'hub-table hub-table--spec' : 'hub-table'}>
            {!isSpec && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} scope="col">
                      <Inline>{h}</Inline>
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((c, j) => (
                    <td key={j}>
                      <Inline>{c}</Inline>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export default function HubArticleView({ article, content, shortLang, fallback }: Props) {
  const langKey = toFullLang(shortLang === 'zh' ? 'zh-cn' : shortLang);
  const body = parseHubBody(content.body_md);

  /**
   * 구조화 비교표를 "어느 섹션 안에서" 그릴지.
   *
   * 원고가 `## 비교표 …` 라는 섹션을 두고 그 아래에 소개 문장만 쓴 뒤, 표 자체는
   * `comparison_table` 필드에 담는 패턴이 굳어 있다. 렌더러가 그걸 맨 끝에 같은
   * 제목으로 또 그려서 **제목이 두 번 나오고 소개 문장과 표가 떨어져 있었다.**
   * 제목이 일치하는 섹션을 찾아 그 안에서 그린다. 못 찾으면 종전대로 맨 끝.
   *
   * 공백만 다른 경우가 있어 normalize 후 비교한다(번역본에서 `比較表:` 뒤
   * 공백 유무가 언어마다 갈렸다).
   */
  const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();
  const tableTitle = content.comparison_table?.title;
  const tableSectionId = tableTitle
    ? (body.sections.find((s) => norm(s.title) === norm(tableTitle))?.id ?? null)
    : null;
  const related = getRelatedForLang(article, shortLang, 4);
  const references = Array.isArray(content.references) ? content.references : null;
  const hero = articleImage(article.slug, article.category);

  // 표·카드가 이미 있는 섹션은 충분히 시각적이라 사진을 넣지 않는다.
  const needsFigure = (s: { blocks: HubBlock[] }) =>
    !s.blocks.some((b) => b.type === 'table' || b.type === 'cards' || b.type === 'steps');

  return (
    <article className="post hv-container hub">
      <header>
        <div className="hub-topbar">
          <Link href={`/${shortLang}`} className="hub-back">
            {t('back', shortLang)}
          </Link>
        </div>

        {fallback && <div className="hub-fallback">{t('fallbackBanner', shortLang)}</div>}

        <span className="category-badge hub-badge">
          <CategoryIcon category={article.category} />
          <span>{localizedCategory(article.category, shortLang)}</span>
        </span>

        <h1 className="hub-title">{content.title}</h1>

        <div className="hub-meta">
          <ArticleAuthorBlock article={article} shortLang={shortLang} />
          <span className="hub-meta__row">
            {/* JSON-LD dateModified 와 같은 값 (articleDates). */}
            <span>
              {t('updated', shortLang)} {articleDates(article).modified.slice(0, 10)}
            </span>
            {article.reading_time_min && (
              <span>
                · {article.reading_time_min}
                {shortLang === 'ko' ? '' : ' '}
                {t('minRead', shortLang)}
              </span>
            )}
          </span>
        </div>

        {/* LCP 요소 — next/image 가 2MB 원본을 AVIF/WebP 로 줄여 내보낸다. */}
        <figure className="hub-hero">
          <Image
            src={hero}
            alt=""
            fill
            sizes="(max-width: 860px) 100vw, 800px"
            priority
            className="object-cover"
          />
        </figure>

        <MedicalDisclaimer shortLang={shortLang} />

        {content.tldr && (
          <div className="hub-quick">
            <p className="hub-quick__label">{t('quick', shortLang)}</p>
            <p className="hub-quick__text">{content.tldr}</p>
          </div>
        )}
      </header>

      {body.sections.length > 1 && (
        <nav className="hub-toc" aria-label={t('toc', shortLang)}>
          <p className="eyebrow">{t('toc', shortLang)}</p>
          <div className="hub-toc__list">
            {body.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hub-toc__link">
                {s.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      {body.lead.length > 0 && (
        <div className="hub-lead">
          {body.lead.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
      )}

      {body.sections.map((s, si) => (
        <section key={s.id} className="hub-section">
          <p className="eyebrow hub-section__n">{String(si + 1).padStart(2, '0')}</p>
          <h2 id={s.id} className="hub-h2">
            {s.title}
          </h2>
          {s.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
          {/* 제목이 같은 섹션이면 표를 여기서 그린다 — 제목 중복이 사라지고,
              표를 소개하는 문장 바로 아래에 표가 온다. */}
          {tableSectionId === s.id && content.comparison_table && (
            <ComparisonTable table={content.comparison_table} withHeading={false} />
          )}
          {/* 섹션 사진은 히어로와도, 서로와도 겹치지 않게 미리 배정돼 있다
              (data/hub-section-images.json). 배정이 없으면 생략한다 —
              같은 사진을 한 글에서 반복하는 것보다 없는 편이 낫다. */}
          {needsFigure(s) &&
            si % 2 === 1 &&
            (() => {
              const src = hubSectionImage(article.slug, si);
              return src ? (
                <figure className="hub-figure">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 860px) 100vw, 800px"
                    loading="lazy"
                    className="object-cover"
                  />
                </figure>
              ) : null;
            })()}
        </section>
      ))}

      {/* 짝이 되는 섹션이 없을 때만 독립 섹션으로. 있으면 위에서 이미 그렸다. */}
      {content.comparison_table && !tableSectionId && (
        <section className="hub-section">
          <ComparisonTable table={content.comparison_table} withHeading />
        </section>
      )}

      {content.faq && content.faq.length > 0 && (
        <section className="hub-section hub-faq">
          <h2 className="hub-h2">{t('faq', shortLang)}</h2>
          <div className="hub-faq__list">
            {content.faq.map((q, i) => (
              /* <details> 라 JS 없이 열린다 — 접힌 패널이 스크립트에 의존하면
                 크롤러·비활성 JS 환경에서 본문이 사라진다. */
              <details key={i} className="hub-faq__item">
                <summary>
                  <span>{q.question}</span>
                  <span className="hub-faq__chevron" aria-hidden>
                    ▾
                  </span>
                </summary>
                <div className="hub-faq__answer">{q.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 무엇인지 먼저 말하고, 그 다음 설치를 권한다. 순서가 반대면
          아직 브랜드를 모르는 독자에게 CTA 가 먼저 온다. */}
      <AboutHavit shortLang={shortLang} />

      <div className="hub-cta">
        <InstallCTA lang={langKey} articleId={article.article_id} variant="inline" />
      </div>


      {references && references.length > 0 && (
        <section className="hub-refs">
          <h2 className="eyebrow">{t('refs', shortLang)}</h2>
          <ol className="hub-refs__list">
            {references.map((r: any, i: number) => {
              const text = r.title ?? r.text ?? '';
              const url = r.url ?? null;
              let host = '';
              if (url) {
                try {
                  host = new URL(url).hostname.replace(/^www\./, '');
                } catch {
                  host = url;
                }
              }
              return (
                <li key={i}>
                  {text}
                  {url && (
                    <>
                      {' '}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="hub-link">
                        {host}
                      </a>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {related.length > 0 && (
        <section className="hub-section">
          <h2 className="hub-h2">{t('related', shortLang)}</h2>
          <div className="post__related-grid">
            {related.map((r) => (
              <figure key={r.slug} className="article-card">
                <Link
                  href={`/${shortLang}/${r.slug}`}
                  className="article-card__media"
                  tabIndex={-1}
                  aria-hidden
                >
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

      <InstallCTA lang={langKey} articleId={article.article_id} variant="sticky" />

      <MedicalArticleJsonLd article={article} content={content} shortLang={shortLang} />
      <FaqJsonLd content={content} />
      <BreadcrumbJsonLd article={article} content={content} shortLang={shortLang} />
    </article>
  );
}
