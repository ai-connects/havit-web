import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, readJson } from './source.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SYSTEM = readFileSync(path.join(ROOT, 'prompts/system.md'), 'utf8');
const RULES = readJson(path.join(ROOT, 'prompts/channel_rules.json'));

const FORMAT_HINT = {
  question: 'Open with a concrete everyday moment, end with one genuine question. No list.',
  one_stat: 'Build the whole post around ONE finding from key_stats (result + source). No list.',
  myth_fact: 'State a common belief, then what the evidence in the SOURCE actually says.',
  mini_steps: 'Give at most 3 short steps taken from the SOURCE steps. No intro fluff.',
  havi_scene: 'A tiny scene where HAVI (the coach character) nudges someone at a real moment of the day. Light, warm, 1 practical tip from the SOURCE.',
  steps_carousel: 'Cover → problem → one step per slide (from SOURCE) → summary → save CTA.',
  myth_fact_carousel: 'Cover → 2–3 myth/fact pairs (one per slide) → summary → save CTA.',
  one_stat_carousel: 'Cover → the finding (result + source) → what it means → how to use it → save CTA.',
  checklist_carousel: 'Cover → a checklist people can screenshot (from SOURCE) → save CTA.',
  havi_scene_carousel: 'Cover → a short HAVI comic-style scene in 4–6 slides → tip → save CTA.',
  hot_take: 'One counterintuitive claim the SOURCE supports, stated in the first line with confidence. Then the evidence (result + source) and who it matters for. End by asking whether readers had assumed the opposite — a genuine question, not "comment YES".',
  ab_question: 'Ask an either/or question readers can answer in one word (e.g. "Morning or evening walk — which helps more after dinner?"). Give the SOURCE answer in the post itself or the first reply, so nobody is left hanging.',
  recipe_quick: 'ONE real dish named in the first line. A 3–5 ingredient idea built ONLY from foods named in the SOURCE, in 2–4 short lines, then one line on why it fits the topic (a finding from the SOURCE). No calorie or gram numbers unless they appear in the SOURCE.',
  recipe_carousel: 'ONE real dish someone can make tonight. Cover title = the dish name (e.g. "Salmon & potato bowl"), never a number list. Cover (dish name + the benefit in plain words) → ingredients slide (only foods named in the SOURCE, no invented amounts) → 2–3 step slides → why it works (one finding + source) → save CTA. No calorie or gram numbers unless they appear in the SOURCE.',
  quiz_carousel: 'Cover asks a question readers want to guess ("Which keeps you full longer?") → options slide → answer slide with the finding + source → why it matters → save CTA. The answer must be in the carousel.',
  app_quiz_carousel: 'The SOURCE is one O/X quiz from the HAVIT app (answer O = true, X = false). Use its content as-is: keep the statement, the answer, the explanation and the reference faithful in meaning — no new claims, no new or changed numbers, nothing dropped that changes the meaning. Cover = the statement turned into a question + "O or X?" (in the post language) → a "think first" slide → answer slide (O/X + one line why) → 1–2 explanation slides → reference slide (the reference as given) → CTA: a new quiz every day, save and test a friend. The title is the topic, not the answer. The caption must NOT reveal the answer (no "the answer is O/X", no explanation that gives it away): tease the question, tell readers to guess before swiping, and leave the answer to the images. There is no blog article for a quiz — never mention a guide or article; the profile link leads to the HAVIT app, where a new quiz comes every day.',
  app_quiz_post: 'The SOURCE is one O/X quiz from the HAVIT app. Threads post: first line = the statement as a question + "O or X?" (in the post language), one line of context that makes people want to answer, then ask readers to reply O or X. Put the answer (O/X) + the explanation + the reference in first_reply, faithful to the quiz (no new claims or numbers). The post itself must not reveal the answer.',
  app_article_post: 'The SOURCE is a HAVIT app article (title, summary, science.question/mechanism, steps, mission, reference) on the same topic as tonight\'s quiz. Threads post: a relatable first line built on science.question, the key point in 2–3 short lines (true to summary/mechanism), ONE practical step from steps, then mission as "today\'s mini mission". End with a question inviting replies. No new claims or numbers; do not reveal tonight\'s quiz.',
  app_article_carousel: 'The SOURCE is a HAVIT app article. Carousel: cover = science.question as a hook (short) → why it happens (mechanism, plain words, 1–2 slides) → "try this" — one step per slide from steps (2–4 slides) → today\'s mini mission → reference slide (as given) → save CTA. No new claims or numbers.',
  versus_carousel: 'Cover "A vs B" (two things the SOURCE compares) → one slide per difference (2–3) → which to choose when → save CTA. Only comparisons the SOURCE makes.',
  mistakes_carousel: 'Cover "N common mistakes with …" → one mistake per slide with what to do instead (from the SOURCE) → summary → save CTA.',
  link_teaser: 'This post is published with the blog article attached as a link preview card (the platform shows its title and image). Write 1 post only: a scroll-stopping first line, then 2–3 short lines on what the reader will find in the article (true to the SOURCE). Do not put any URL in the text.',
  community_question: 'Ask the community a real question tied to the topic, share 2–3 points from the SOURCE, invite replies.',
  checklist: 'A short checklist from the SOURCE with a one-line intro.',
  workplace_insight: 'Translate the topic into a workplace wellbeing insight for teams/HR. One finding + practical takeaway.',
  evidence_brief: 'A short evidence brief: what is known, what is not, practical takeaway. Results only with sources.',
  building_in_public: 'Founder voice: why we wrote this guide and how we checked the evidence (we replaced unverifiable citations with real papers). One honest lesson.',
  lesson_learned: 'Founder voice: one lesson from building a health coach app, tied to this topic.',
};

// 앱 퀴즈·앱 아티클 공통: 블로그 글이 없으므로 가이드·글 안내 금지, 링크는 하비트 앱 소개 페이지.
const APP_SOURCE_RULES = ' Never present a one-size-fits-all number as a personal target (weight-loss amount or %, calories, protein, water, fasting hours): drop it, or say plainly that it depends on sex, height, current weight and health — this overrides faithfulness to the SOURCE. In "evidence", use as source the journal/organisation name exactly as written in the SOURCE reference (e.g. "American Journal of Clinical Nutrition"), never "HAVIT app article". There is no blog article: never mention a guide, article or "full guide". The goal of every post is to get the reader to install the free HAVIT app. End with ONE clear, specific call to download it, tied to the topic (e.g. "Get the free HAVIT app and try today\'s mission", "Take a new quiz every day in the free HAVIT app"): Instagram → in the caption say the free app is at the link in bio, and write first_reply as the brand\'s first comment: 1–2 short lines that invite replies (for a quiz: "O or X? Tell us below 👇"; otherwise a genuine question about the topic) + one line that the free HAVIT app is at the link in bio — no URL (not clickable on Instagram), no hashtags, no disclaimer; Threads → put the app link (given as url) in first_reply with one short line inviting them to download the free app. For carousels, the LAST slide is the download slide: title = a short invitation to get the free HAVIT app, body = what they get there (a new quiz and tip every day, logging and coaching for this topic) — the store badges are added automatically, do not write store names.';

export function buildPrompt(entry, source, link) {
  const ch = config('channels');
  const lang = ch.langs[entry.lang];
  const disclaimer = entry.channel.startsWith('linkedin') && entry.lang === 'ko' ? lang.disclaimer_formal : lang.disclaimer;
  const rule = RULES[entry.channel][entry.lang];
  const fill = {
    lang: entry.lang,
    banned: ch.banned[entry.lang].join(', '),
    disclaimer: ch.channels[entry.channel].disclaimer === 'none'
      ? 'NONE on this channel — do not write any disclaimer or "not medical advice" line anywhere (it is in the profile bio).'
      : `"${disclaimer}" — place: ${ch.channels[entry.channel].disclaimer}`,
    channel: entry.channel,
    format: entry.format,
    channel_rules: `${rule}\nFormat guidance: ${FORMAT_HINT[entry.format] || ''}${source.kind?.startsWith('app_') ? APP_SOURCE_RULES : ''}`,
    segment: entry.segment,
    brand_tag: `#${lang.brand_tag || 'HAVIT'}`,
    swipe: `"${lang.swipe || 'Swipe →'}"`,
    url: entry.share === 'link' ? `${link} — attached automatically as a link preview card on the post. Do NOT write this URL anywhere (not in posts, not in first_reply). first_reply stays empty unless the channel rules say otherwise.` : link,
  };
  const system = SYSTEM.replace(/\{(\w+)\}/g, (m, k) => (k in fill ? fill[k] : m));
  const { _text, ...packet } = source;
  return { system, user: `SOURCE (${entry.lang}):\n${JSON.stringify(packet, null, 1)}` };
}
