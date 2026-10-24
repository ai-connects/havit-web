import { socialLinks } from '@/lib/social';

// 아티클 끝 — 매일 올라가는 퀴즈·건강 팁(Instagram·Threads)으로 이어 준다. 계정은 언어별.
const COPY: Record<string, { title: string; sub: string }> = {
  en: { title: 'A new quiz and health tip every day', sub: 'Follow HAVIT on Instagram and Threads.' },
  ko: { title: '매일 새 퀴즈와 건강 팁', sub: '하비트 Instagram·Threads에서 매일 만나 보세요.' },
  ja: { title: '毎日新しいクイズと健康のヒント', sub: 'HAVITのInstagram・Threadsで毎日お届けします。' },
  zh: { title: '每天一道新测验和健康小贴士', sub: '在 Instagram 和 Threads 关注 HAVIT。' },
  'zh-tw': { title: '每天一題新測驗和健康小知識', sub: '在 Instagram 和 Threads 追蹤 HAVIT。' },
  es: { title: 'Un quiz y un consejo de salud nuevos cada día', sub: 'Sigue a HAVIT en Instagram y Threads.' },
  'pt-br': { title: 'Um quiz e uma dica de saúde novos todo dia', sub: 'Siga a HAVIT no Instagram e no Threads.' },
  id: { title: 'Kuis dan tips kesehatan baru setiap hari', sub: 'Ikuti HAVIT di Instagram dan Threads.' },
  de: { title: 'Jeden Tag ein neues Quiz und ein Gesundheitstipp', sub: 'Folge HAVIT auf Instagram und Threads.' },
  fr: { title: 'Un nouveau quiz et un conseil santé chaque jour', sub: 'Suis HAVIT sur Instagram et Threads.' },
};

export default function SocialFollow({ shortLang }: { shortLang: string }) {
  const c = COPY[shortLang] ?? COPY.en;
  const s = socialLinks(shortLang);
  const btn = 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold';
  return (
    <section className="mt-10 rounded-2xl p-6" style={{ background: 'var(--hv-tint-pale)', border: '1px solid var(--hv-border)' }}>
      <p className="font-semibold" style={{ fontSize: 18 }}>{c.title}</p>
      <p className="mt-1 text-sm" style={{ color: 'var(--hv-fg-muted)' }}>{c.sub} <span>@{s.handle}</span></p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={s.instagram} target="_blank" rel="noopener" className={btn} style={{ background: 'var(--hv-black)', color: 'var(--hv-primary)' }}>Instagram</a>
        <a href={s.threads} target="_blank" rel="noopener" className={btn} style={{ background: 'var(--hv-black)', color: 'var(--hv-primary)' }}>Threads</a>
      </div>
    </section>
  );
}
