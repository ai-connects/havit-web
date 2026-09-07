/**
 * SEO footer link clusters.
 *
 * A sitewide footer is the strongest internal-linking surface a content site
 * has: every one of the ~10k article URLs links back to whatever sits here, so
 * these pages accumulate internal PageRank and get crawled far more often than
 * a link buried in an archive page ever would.
 *
 * WHY THESE ARTICLES
 * A full pass over the 1,035 deployed articles showed content depth is
 * essentially uniform (every article ships FAQ + key stats + references in 4
 * languages), so depth cannot rank them. What does vary is whether the article
 * targets a query a person would actually type. Selection therefore scored
 * `primary_keyword_en` on: how short/head-term it is, whether it names a drug
 * brand (ozempic / wegovy / mounjaro / semaglutide / tirzepatide …), and
 * whether it carries commercial-decision intent (vs, side effects, how much,
 * insurance). The GLP-1 cluster dominated that ranking, which is also where
 * HAVIT's product story lives — so the footer leans into it rather than trying
 * to represent all 15 blog categories equally (the TOPICS column already does
 * that job).
 *
 * WHY ~48 LINKS (was 36)
 * Enough to cover the money clusters, few enough that each still receives a
 * meaningful share of link equity. Adding the long tail here would dilute every
 * link and bloat 10k pages.
 *
 * The original 36 were picked when only the 1,035 long-tail articles existed —
 * there were no head-term pages to choose from, so the best available were
 * still 60-character slugs like glp1-gastroparesis-symptoms-recognition-2026.
 * The GLP-1 hub set added real head terms (ozempic-side-effects, wegovy-tracker,
 * myfitnesspal-alternative-glp-1), which score far higher on the same three
 * criteria used above. Scoring both sets on (short head term / names a drug
 * brand / commercial-decision intent) gave 3.6 avg for the original 36 and
 * 10.9 for the top hubs, so 24 of the weakest were swapped out rather than
 * appended to. The dropped ones are not orphaned: the hub bodies link to them
 * (526 internal links), which is the hub-and-spoke shape this set is meant to
 * express.
 *
 * LABELS
 * Anchor text is derived from each article's own title in the reader's
 * language (see shortLabel in components/Footer.tsx) instead of a hand-kept
 * table — 36 links × 10 languages of hand-written labels would drift the moment
 * a title changes, and the localized title already contains the entity the
 * anchor needs to carry.
 *
 * To add a link: append the slug. To retire one: delete the line. A slug that
 * no longer resolves is skipped at render time rather than throwing.
 */

export interface FooterLinkGroup {
  /** i18n key for the column heading (see FOOTER_GROUP_LABELS in Footer.tsx). */
  key: string
  slugs: string[]
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    // Practical "I just started" questions — highest-intent, lowest-competition.
    key: 'glp1Start',
    slugs: [
      'glp1-injection-site-rotation-absorption-2026',
      'glp1-injection-technique-pain-reduction-2026',
      'tirzepatide-dose-titration-schedule-minimize-nausea-2026',
      'glp1-traveling-storage-temperature-guide-2026',
      'wegovy-insurance-coverage-prior-authorization-tips-2026',
      'glp1-exercise-timing-medication-effectiveness-2026',
    ],
  },
  {
    // "<drug> side effects" is the highest-volume GLP-1 query family.
    key: 'sideEffects',
    slugs: [
      'ozempic-side-effects',
      'wegovy-side-effects',
      'mounjaro-side-effects',
      'zepbound-side-effects',
      'semaglutide-side-effects',
      'glp1-nausea-management-evidence-based-strategies-2026',
    ],
  },
  {
    // Comparison queries convert: the searcher is choosing between options.
    key: 'compare',
    slugs: [
      'semaglutide-vs-tirzepatide',
      'tirzepatide-side-effects',
      'tirzepatide-vs-semaglutide-gi-side-effects-duration-comparison-2026',
      'compounded-semaglutide-vs-brand-wegovy-safety-efficacy-2026',
      'glp1-switching-brands-equivalence-guide-2026',
      'transitioning-from-ozempic-to-mounjaro-protocol-2026',
    ],
  },
  {
    // "can I take X with GLP-1" — safety questions people search before asking a doctor.
    key: 'interactions',
    slugs: [
      'glp1-metformin-combination-therapy-synergy-2026',
      'glp1-antidepressant-ssri-interaction-serotonin-2026',
      'glp1-levothyroxine-thyroid-medication-interaction-2026',
      'glp1-statin-cholesterol-medication-synergy-2026',
      'glp1-alcohol-interaction-safety-limits-2026',
      'glp1-caffeine-interaction-appetite-effects-2026',
    ],
  },
  {
    // Stopping / maintaining — where HAVIT's own product value sits.
    key: 'afterGlp1',
    slugs: [
      'glp-1-habit-report',
      'glp-1-first-month',
      'glp1-rebound-weight-gain-prevention-2026',
      'glp1-rebound-weight-gain-prevention-2026',
      'glp1-muscle-preservation-protein-timing-resistance-training-2026',
      'glp1-sarcopenia-screening-dexa-grip-strength-protocol-2026',
    ],
  },
  {
    // Persona / condition modifiers — long-tail with low competition.
    key: 'conditions',
    slugs: [
      'glp-1-for-pcos',
      'glp-1-for-menopause',
      'glp-1-postpartum',
      'glp1-pcos-weight-loss-insulin-resistance-improvement-2026',
      'glp1-sleep-quality-changes-mechanisms-2026',
      'glp1-mental-health-effects-depression-anxiety-2026',
    ],
  },
  {
    // Brand-name tracker queries — the closest thing the blog has to product
    // intent. These are hub pages, so each also feeds the long-tail articles
    // beneath it rather than being a dead end.
    key: 'tracker',
    slugs: [
      'ozempic-tracker',
      'wegovy-tracker',
      'mounjaro-tracker',
      'zepbound-tracker',
      'semaglutide-tracker',
      'tirzepatide-tracker',
    ],
  },
  {
    // Competitor comparisons. The title carries "Havit vs <rival>" so the pair
    // is legible to generative engines, while the slug keeps the query people
    // actually search ("<rival> alternative") — swapping the slug would trade
    // real search demand for a term nobody looks up yet.
    key: 'alternatives',
    slugs: [
      'myfitnesspal-alternative-glp-1',
      'noom-glp-1-alternative',
      'weightwatchers-glp-1-alternative',
      'shotsy-alternative',
      'macrofactor-alternative',
      'glp-1-tracker-app',
    ],
  },
]

/** Flat slug list — used by tests / sitemap priority if ever needed. */
export const FOOTER_LINK_SLUGS: string[] = FOOTER_LINK_GROUPS.flatMap((g) => g.slugs)
