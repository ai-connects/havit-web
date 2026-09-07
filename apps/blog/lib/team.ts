import { SITE } from '@/lib/site';
/**
 * E-E-A-T entity registry (authors / reviewers / publisher) — data-driven so real
 * named experts can be slotted in without touching components or schema code.
 *
 * IMPORTANT (YMYL): do NOT invent people or credentials here. Health content must
 * attribute review to *real, verifiable* experts. The defaults below are honest
 * organization-level entities (a team / board), not fabricated individuals. To add
 * a named medical reviewer, append a real Person to REVIEWERS with verifiable
 * `sameAs` (LinkedIn / ORCID / clinic profile) and reference it from articles.
 */

/**
 * Verified official Havit Inc. properties (same legal entity).
 * aiconnects.me is deliberately absent: after the AI Connect → Havit Inc.
 * rename it redirects here, and sameAs must list live canonical profiles, not
 * URLs that bounce. The bare apex aihavit.com is absent for the same reason —
 * it 307s to www, so www is the one canonical form.
 */
export const BRAND_SAME_AS: string[] = [
  'https://www.aihavit.com',
  'https://app.aihavit.com',
  // TODO(real-data): add external authoritative profiles to strengthen the entity:
  //   LinkedIn company, Crunchbase, X/Instagram, Google Play / App Store listings.
];

/** Reusable publisher Organization node for JSON-LD (home + articles). */
export const PUBLISHER_ORG = {
  '@type': 'Organization' as const,
  '@id': `${SITE}/#publisher`,
  name: 'Havit Inc.',
  url: 'https://www.aihavit.com',
  logo: {
    '@type': 'ImageObject' as const,
    url: `${SITE}/havit-logo.png`,
    width: 1600,
    height: 988,
  },
  sameAs: BRAND_SAME_AS,
};

/** An author or reviewer entity (Organization board today; Person when named). */
export interface TeamEntity {
  '@type'?: 'Organization' | 'Person';
  name: string;
  /** e.g. "MD", "RD", "Editorial Medical Review Board" — surfaced in byline + schema. */
  credential?: string;
  /** Person only: e.g. "Registered Dietitian". */
  jobTitle?: string;
  /** Topics of expertise → schema knowsAbout. */
  knowsAbout?: string[];
  /** On-site profile/policy page (relative path under /[lang]). */
  pathOnSite?: string;
  /** Verifiable external profiles (LinkedIn / ORCID / clinic). Real URLs only. */
  sameAs?: string[];
  image?: string;
  bio?: string;
}

/** Honest org-level default author. */
export const DEFAULT_AUTHOR: TeamEntity = {
  '@type': 'Organization',
  name: 'HAVIT Editorial Team',
  pathOnSite: 'about',
  knowsAbout: ['nutrition', 'sleep', 'exercise', 'metabolic health', 'habit change'],
  sameAs: BRAND_SAME_AS,
};

/** Honest org-level default reviewer (a board, not a fabricated individual). */
export const DEFAULT_REVIEWER: TeamEntity = {
  '@type': 'Organization',
  name: 'HAVIT Medical Advisory',
  credential: 'Editorial Medical Review Board',
  pathOnSite: 'editorial-policy',
  sameAs: BRAND_SAME_AS,
};

/**
 * Named real reviewers go here once available. Leave empty rather than fabricate.
 * Example shape (fill with a REAL person + verifiable sameAs before using):
 *   { '@type': 'Person', name: 'Jane Doe', credential: 'MD',
 *     jobTitle: 'Internal Medicine Physician', pathOnSite: 'reviewers/jane-doe',
 *     sameAs: ['https://www.linkedin.com/in/...', 'https://orcid.org/...'] }
 */
export const REVIEWERS: TeamEntity[] = [];

/** Build a schema.org author/reviewer node for a given site language. */
export function entitySchema(e: TeamEntity, shortLang: string) {
  const node: Record<string, unknown> = {
    '@type': e['@type'] ?? 'Organization',
    name: e.name,
  };
  if (e.pathOnSite) node.url = `${SITE}/${shortLang}/${e.pathOnSite}`;
  if (e.sameAs?.length) node.sameAs = e.sameAs;
  if (e.knowsAbout?.length) node.knowsAbout = e.knowsAbout;
  if (e['@type'] === 'Person') {
    if (e.jobTitle) node.jobTitle = e.jobTitle;
    if (e.credential) node.hasCredential = e.credential;
    if (e.image) node.image = e.image;
  } else if (e.credential) {
    node.description = e.credential;
  }
  return node;
}
