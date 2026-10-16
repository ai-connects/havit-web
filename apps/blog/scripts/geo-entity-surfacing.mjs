#!/usr/bin/env node
/**
 * 경쟁 앱 비교 아티클에 HAVIT 엔티티를 표면으로 끌어올린다.
 *
 * 문제
 * ────
 * 비교 13건은 내용상 이미 HAVIT 비교다 — 12/13 이 비교표에 HAVIT 컬럼을 갖고
 * 있다. 그런데 제목·FAQ 어디에도 HAVIT 이 없어서, 생성형 엔진이 이 문서를
 * "HAVIT 비교 자료"로 인식할 근거가 없다. 실측:
 *   제목에 HAVIT  0/13
 *   FAQ 에 HAVIT  4/13
 *
 * 왜 슬러그는 그대로 두는가
 * ────────────────────────
 * `havit-vs-myfitnesspal` 로 바꾸고 싶어지지만 검색 수요가 반대다.
 * "myfitnesspal alternative" 는 실제로 검색되고, "havit vs myfitnesspal" 은
 * 아직 아무도 모르니 0 이다. URL 을 바꾸면 SEO 유입을 버리고 GEO 만 얻는다.
 * 그래서 URL 은 유지하고 제목·FAQ·표 캡션에만 엔티티를 얹는다.
 *
 * 넣는 것
 *   ① 제목 꼬리에 "HAVIT vs <경쟁사>" — SERP 용 short_title 은 원문 유지
 *   ② FAQ 3종 (더 나은가 / 무엇이 다른가 / 갈아탈 수 있나)
 *   ③ 비교표 캡션에 엔티티 정의 한 문장 — 13건에서 동일 문장이 반복된다
 *
 * Usage: node scripts/geo-entity-surfacing.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const DIR = path.resolve(process.cwd(), 'data/articles')
const DRY = process.argv.includes('--dry')

/** 슬러그 → 표기용 경쟁사명. 대소문자·공백을 원문 표기에 맞춘다. */
const RIVAL = {
  'cal-ai-alternative-glp-1': 'Cal AI',
  'cronometer-alternative-glp-1': 'Cronometer',
  'glapp-alternative': 'Glapp',
  'lose-it-alternative': 'Lose It',
  'macrofactor-alternative': 'MacroFactor',
  'meagain-alternative': 'MeAgain',
  'myfitnesspal-alternative-glp-1': 'MyFitnessPal',
  'noom-glp-1-alternative': 'Noom',
  'pep-alternative': 'Pep',
  'phaze-alternative': 'Phaze',
  'pillyze-alternative': 'Pillyze',
  'shotsy-alternative': 'Shotsy',
  'weightwatchers-glp-1-alternative': 'WeightWatchers',
}

/**
 * 엔티티 정의 — 모든 곳에서 같은 문장이어야 생성형 엔진이 하나의 개체로 묶는다.
 * 블로그 소개 블록(components/AboutHavit.tsx 의 `lede`)과 **토씨까지 같아야 한다.**
 * 2026-10-16 대표 확정 A안(ko 원문 기준). 한쪽을 고치면 다른 쪽도 같이 고칠 것.
 * 키는 아티클 JSON 의 langs 키(zh-CN·zh-TW·pt-BR)를 따른다.
 */
const ENTITY = {
  en: 'HAVIT is an AI health partner built on metabolic science — it protects your muscle, wakes up your metabolism, and helps you keep a healthy, rebound-free body for the long run.',
  ko: '하비트는 대사 과학을 기반으로 근육은 지키고 대사는 깨워, 요요 없는 몸을 오래 유지하도록 돕는 AI 건강 파트너입니다.',
  ja: 'HAVIT は、代謝科学にもとづいて筋肉を守り、代謝を目覚めさせ、リバウンドしない体を長く保てるようサポートする AI ヘルスパートナーです。',
  'zh-TW': 'HAVIT 是以代謝科學為基礎的 AI 健康夥伴，幫你守住肌肉、喚醒代謝，長久維持不復胖的身體。',
  'zh-CN': 'HAVIT 是以代谢科学为基础的 AI 健康伙伴，帮你守住肌肉、唤醒代谢，长久保持不反弹的身体。',
  es: 'HAVIT es un aliado de salud con IA basado en la ciencia del metabolismo: protege tu músculo, despierta tu metabolismo y te ayuda a mantener a largo plazo un cuerpo sano y sin efecto rebote.',
  'pt-BR': 'O HAVIT é um parceiro de saúde com IA baseado na ciência do metabolismo: protege seus músculos, desperta seu metabolismo e ajuda você a manter por muito tempo um corpo saudável e sem efeito sanfona.',
  id: 'HAVIT adalah mitra kesehatan berbasis AI yang berlandaskan ilmu metabolisme — menjaga otot Anda, membangunkan metabolisme, dan membantu Anda mempertahankan tubuh sehat tanpa efek yoyo dalam jangka panjang.',
  de: 'HAVIT ist ein KI-Gesundheitspartner auf Basis der Stoffwechselwissenschaft – er schützt Ihre Muskeln, weckt Ihren Stoffwechsel und hilft Ihnen, langfristig einen gesunden Körper ohne Jo-Jo-Effekt zu halten.',
  fr: 'HAVIT est un partenaire santé IA fondé sur la science du métabolisme : il protège vos muscles, réveille votre métabolisme et vous aide à garder durablement un corps en bonne santé, sans effet yo-yo.',
}

/** FAQ 3종. 생성형 엔진이 가장 잘 인용하는 형식이라 질문형으로 고정한다. */
const FAQ = {
  en: (r) => [
    [`Is HAVIT better than ${r}?`,
     `It depends on what you are tracking. ${r} is built for general calorie and nutrition logging. HAVIT is built around a GLP-1 course — dose and injection-site logging, side-effect patterns tied to injection timing, body composition, and protein intake to protect lean mass. If you are on a GLP-1, HAVIT covers what a general tracker leaves out; if you only need calorie counting, ${r} is enough.`],
    [`What does HAVIT do that ${r} doesn't?`,
     `Dose and injection-site rotation, side effects logged against injection timing, body-composition trend tracking, and habit coaching that adapts to your own logged data. HAVIT combines medication management and behavior change in one place instead of splitting them across apps.`],
    [`Can I switch from ${r} to HAVIT?`,
     `Yes. Most people run both for a week or two — keep logging where you are comfortable while you set up your GLP-1 course in HAVIT — then move over once dose reminders and side-effect history are in place. Nothing about your prescription changes; HAVIT is a tracking companion, not a medical device.`],
  ],
  ko: (r) => [
    [`하비트가 ${r}보다 나은가요?`,
     `무엇을 기록하려는지에 따라 다릅니다. ${r}는 일반적인 칼로리·영양 기록에 맞춰져 있고, 하비트는 GLP-1 치료 과정을 축으로 설계됐습니다 — 용량·주사 부위 기록, 주사 시점과 연결된 부작용 패턴, 체성분, 제지방 보호를 위한 단백질 섭취까지 다룹니다. GLP-1을 쓰는 중이라면 일반 트래커가 놓치는 부분을 하비트가 메우고, 칼로리만 세면 된다면 ${r}로 충분합니다.`],
    [`${r}에는 없고 하비트에만 있는 기능은 무엇인가요?`,
     `용량·주사 부위 로테이션, 주사 타이밍에 붙는 부작용 기록, 체성분 추세, 그리고 기록한 데이터에 맞춰 조정되는 습관 코칭입니다. 약물 관리와 행동 변화를 앱 두 개로 쪼개지 않고 한 곳에서 다룹니다.`],
    [`${r}에서 하비트로 갈아탈 수 있나요?`,
     `가능합니다. 보통 1~2주는 둘을 함께 쓰면서 익숙한 쪽에 계속 기록하고, 하비트에 GLP-1 일정을 세팅합니다. 용량 알림과 부작용 이력이 쌓이면 그때 옮기면 됩니다. 처방은 그대로이며 하비트는 기록을 돕는 동반 앱이지 의료기기가 아닙니다.`],
  ],
  ja: (r) => [
    [`HAVITは${r}より優れていますか？`,
     `何を記録したいかによります。${r}は一般的なカロリー・栄養記録に向いています。HAVITはGLP-1の治療経過を軸に作られており、投与量と注射部位の記録、注射タイミングと結びついた副作用の傾向、体組成、除脂肪量を守るためのたんぱく質摂取までを扱います。GLP-1を使用中なら一般的なトラッカーが取りこぼす部分をHAVITが補い、カロリー計算だけで足りるなら${r}で十分です。`],
    [`${r}にはなくてHAVITにある機能は何ですか？`,
     `投与量と注射部位のローテーション、注射タイミングに紐づく副作用記録、体組成の推移、そして記録データに合わせて調整される習慣コーチングです。服薬管理と行動変容をアプリ2つに分けず、1か所でまとめて扱います。`],
    [`${r}からHAVITに乗り換えられますか？`,
     `できます。多くの人は1〜2週間は両方を併用し、慣れた側で記録を続けながらHAVITにGLP-1のスケジュールを設定します。投与リマインダーと副作用の履歴がたまってから移行すれば十分です。処方内容は変わりません。HAVITは記録を支える伴走アプリであり、医療機器ではありません。`],
  ],
  'zh-TW': (r) => [
    [`HAVIT 比 ${r} 更好嗎？`,
     `取決於你要記錄什麼。${r} 是為一般熱量與營養記錄設計的；HAVIT 則圍繞 GLP-1 療程打造 — 劑量與注射部位記錄、與注射時間對應的副作用型態、身體組成，以及保護肌肉量所需的蛋白質攝取。如果你正在使用 GLP-1，HAVIT 能補上一般追蹤器沒有的部分；如果你只需要計算熱量，${r} 就夠了。`],
    [`${r} 沒有、但 HAVIT 有的功能是什麼？`,
     `劑量與注射部位輪換、對應注射時間的副作用記錄、身體組成趨勢，以及會依你記錄的資料調整的習慣教練。HAVIT 把用藥管理與行為改變放在同一個地方，而不是拆成兩個 App。`],
    [`可以從 ${r} 換到 HAVIT 嗎？`,
     `可以。多數人會先併用一到兩週，在習慣的 App 繼續記錄，同時在 HAVIT 設定 GLP-1 療程；等劑量提醒與副作用紀錄累積後再完全轉過來。處方不會有任何改變，HAVIT 是協助記錄的夥伴 App，不是醫療器材。`],
  ],
}

/** 제목 꼬리에 엔티티 쌍을 붙인다. 이미 있으면 건드리지 않는다(멱등). */
function withEntity(title, rival, lang) {
  if (/havit/i.test(title)) return title
  const tail = lang === 'en' ? `HAVIT vs ${rival}` : `HAVIT vs ${rival}`
  const sep = lang === 'en' ? ' — ' : '｜'
  return `${title}${sep}${tail}`
}

let changed = 0
const report = []

for (const [slug, rival] of Object.entries(RIVAL)) {
  const file = path.join(DIR, `${slug}.json`)
  const a = JSON.parse(readFileSync(file, 'utf8'))
  let touched = false

  for (const [lang, c] of Object.entries(a.langs)) {
    // FAQ 템플릿은 4개 언어뿐이라 나머지는 en 으로 넣고 번역 파이프라인이 옮긴다.
    // 캡션은 10개 언어 정의가 다 있으니 언어별로 넣는다. 두 키를 섞으면 안 된다.
    const key = lang in FAQ ? lang : 'en'
    const entityKey = lang in ENTITY ? lang : 'en'

    // ① 제목 — SERP 용 short_title 은 원문을 남겨 CTR 최적화를 유지한다.
    const next = withEntity(c.title, rival, key)
    if (next !== c.title) {
      if (!c.short_title) c.short_title = c.title
      c.title = next
      touched = true
    }

    // ② FAQ — 이미 HAVIT 질문이 있으면 중복으로 넣지 않는다.
    c.faq = c.faq ?? []
    // 표기를 '하비트'로 통일했지만, 이전에 생성된 문서에는 '하빗'이 남아 있을 수 있다.
    // 둘 다 인식해야 재실행이 중복을 만들지 않는다.
    const hasHavitQ = c.faq.some((q) => /havit|하비트|하빗/i.test(q.question))
    if (!hasHavitQ) {
      for (const [question, answer] of FAQ[key](rival)) c.faq.push({ question, answer })
      touched = true
    }

    // ③ 비교표 캡션 — 13건에 같은 정의 문장을 반복시켜 개체를 굳힌다.
    // 이미 브랜드가 든 캡션(현행 정의든, 번역된 옛 정의든)에는 다시 붙이지 않는다(멱등).
    // 옛 판정식(/havit is|…/)은 번역된 es·de·ja… 캡션을 못 알아봐 재실행 때마다 영어
    // 정의를 덧붙였다. 하빗은 옛 표기 인식용이다(docs/brand-glossary.md).
    const caption = c.comparison_table?.caption ?? ''
    if (c.comparison_table && !caption.includes(ENTITY[entityKey]) && !/havit|하비트|하빗/i.test(caption)) {
      c.comparison_table.caption = [caption, ENTITY[entityKey]].filter(Boolean).join(' ')
      touched = true
    }
  }

  if (touched) {
    changed++
    if (!DRY) writeFileSync(file, JSON.stringify(a, null, 2) + '\n')
    report.push(`  ${slug} → HAVIT vs ${rival}`)
  }
}

console.log(`${DRY ? '[dry] ' : ''}엔티티 표면화 ${changed}/${Object.keys(RIVAL).length}건`)
report.forEach((r) => console.log(r))
