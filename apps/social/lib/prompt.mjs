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
  community_question: 'Ask the community a real question tied to the topic, share 2–3 points from the SOURCE, invite replies.',
  checklist: 'A short checklist from the SOURCE with a one-line intro.',
  workplace_insight: 'Translate the topic into a workplace wellbeing insight for teams/HR. One finding + practical takeaway.',
  evidence_brief: 'A short evidence brief: what is known, what is not, practical takeaway. Results only with sources.',
  building_in_public: 'Founder voice: why we wrote this guide and how we checked the evidence (we replaced unverifiable citations with real papers). One honest lesson.',
  lesson_learned: 'Founder voice: one lesson from building a health coach app, tied to this topic.',
};

export function buildPrompt(entry, source, link) {
  const ch = config('channels');
  const lang = ch.langs[entry.lang];
  const disclaimer = entry.channel.startsWith('linkedin') && entry.lang === 'ko' ? lang.disclaimer_formal : lang.disclaimer;
  const rule = RULES[entry.channel][entry.lang];
  const fill = {
    lang: entry.lang,
    banned: ch.banned[entry.lang].join(', '),
    disclaimer: `"${disclaimer}" — place: ${ch.channels[entry.channel].disclaimer}`,
    channel: entry.channel,
    format: entry.format,
    channel_rules: `${rule}\nFormat guidance: ${FORMAT_HINT[entry.format] || ''}`,
    segment: entry.segment,
    url: link,
  };
  const system = SYSTEM.replace(/\{(\w+)\}/g, (m, k) => (k in fill ? fill[k] : m));
  const { _text, ...packet } = source;
  return { system, user: `SOURCE (${entry.lang}):\n${JSON.stringify(packet, null, 1)}` };
}
