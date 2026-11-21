import Link from 'next/link';
import Image from 'next/image';
import type { ArticleListItem } from '@/lib/articles-v2';
import { localizedCategory } from '@/lib/category-labels';
import { CategoryIcon } from '@/components/CategoryIcon';
import { articleImage } from '@/lib/article-images';

interface Props {
  item: ArticleListItem;
  shortLang: string;
  featured?: boolean;
  /** Set on the first row of above-the-fold grids so the LCP image preloads. */
  priority?: boolean;
}

const MIN_READ_LABEL: Record<string, string> = {
  en: 'min read', ko: '분 분량', ja: '分で読める', zh: '分钟阅读', 'zh-tw': '分鐘閱讀', es: 'min',
  'pt-br': 'min de leitura', id: 'menit', de: 'Min. Lesezeit', fr: 'min de lecture',
};

export default function ArticleCardV2({ item, shortLang, featured = false, priority = false }: Props) {
  const href = `/${shortLang}/${item.slug}`;
  const dateLocale = shortLang === 'zh-tw' ? 'zh-TW' : shortLang === 'zh' ? 'zh-CN' : shortLang;
  const publishedDate = item.updated_at ? new Date(item.updated_at) : null;
  const minReadLabel = MIN_READ_LABEL[shortLang] ?? 'min read';
  const src = articleImage(item.slug, item.category);

  return (
    <article className={`article-card ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <Link href={href} className="article-card__media" tabIndex={-1} aria-hidden>
        <Image
          src={src}
          alt={item.title}
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 640px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px'}
          priority={priority}
          className="object-cover"
        />
      </Link>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="category-badge" aria-label={`Category: ${item.category}`}>
            <CategoryIcon category={item.category} />
            <span>{localizedCategory(item.category, shortLang)}</span>
          </span>
        </div>
        <h3 className={featured ? 'text-title-xlarge' : 'text-title-large'}>
          <Link href={href} className="hover:text-primary-700 transition-colors">
            {item.title}
          </Link>
        </h3>
        {(item.tldr || item.meta_description) && (
          <p className="text-body-small line-clamp-3">{item.tldr ?? item.meta_description}</p>
        )}
        <div
          className="mt-auto flex items-center gap-2 text-xs"
          style={{ color: 'var(--hv-fg-subtle)' }}
        >
          {publishedDate && (
            <time dateTime={item.updated_at}>
              {publishedDate.toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
          )}
          {item.reading_time_min && (
            <>
              <span aria-hidden>·</span>
              <span>{item.reading_time_min} {minReadLabel}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
