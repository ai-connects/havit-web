/**
 * 아티클 → 하비트 전환 문구(글 중간 블록·계산기 카드·글 끝 절 도입).
 * 계산기 페이지(lib/tool-cta.ts)와 같은 메시지 — 평균 정보 → 진단 → 정량 처방 → 코칭.
 * 근거는 앱 화면 문구·홈페이지 키 카피에서만. 언어가 없으면 기존 MidArticleCTA·AboutHavit 를 쓴다.
 */
import type { ToolLang } from './tool-labels';
import type { ToolSlug } from './tool-seo';

export type ArticleFocus = 'nutrition' | 'exercise' | 'weight' | 'sleep' | 'mind' | 'habits' | 'glp1';

const GLP1 = /glp|ozempic|wegovy|mounjaro|zepbound|tirzepatide|semaglutide|saxenda|liraglutide|rybelsus|retatrutide|orforglipron/;
const BY_CATEGORY: Record<string, ArticleFocus> = {
  'Diet & Nutrition': 'nutrition',
  'Hydration & Beverages': 'nutrition',
  'Gut Health & Microbiome': 'nutrition',
  'Exercise & Activity': 'exercise',
  'Weight & Metabolism': 'weight',
  'Tracking & Insights': 'weight',
  'Longevity & Healthy Aging': 'weight',
  'Personalized Strategies': 'weight',
  'Health & Conditions': 'weight',
  'Sleep & Recovery': 'sleep',
  'Mindset & Motivation': 'mind',
  'Mental Health & Stress': 'mind',
  'Lifestyle Habits': 'habits',
  'Situational Tips': 'habits',
};

export function articleFocus(slug: string, category?: string): ArticleFocus {
  if (GLP1.test(slug) || category === 'Medication Guide') return 'glp1';
  return (category && BY_CATEGORY[category]) || 'weight';
}

/** 글 주제와 이어지는 계산기. 슬러그 + 영문 핵심 키워드로 판정, 없으면 null. */
const TOOL_RULES: [ToolSlug, RegExp][] = [
  ['protein', /protein/],
  ['caffeine', /caffeine|coffee/],
  ['water', /\bhydrat|water[- ]intake|drink(ing)?[- ]water|dehydrat/],
  ['sleep-cycle', /sleep[- ]cycle|bedtime|wake[- ]?up[- ]time|sleep[- ]schedule|rem[- ]sleep|deep[- ]sleep/],
  ['bmr', /\bbmr\b|tdee|basal[- ]metabolic|metabolic[- ]rate|calorie[- ]deficit|maintenance[- ]calorie/],
  ['body-fat', /body[- ]fat[- ](percent|calculator|measure|estimat)|measur\w* body[- ]fat|navy[- ]method|skinfold|caliper/],
  ['bmi', /\bbmi\b|body[- ]mass[- ]index|waist[- ]to[- ](height|hip)|healthy[- ]weight[- ]range/],
  ['exercise-calories', /calories?[- ]burn|calorie[- ]expenditure|walking[- ]calorie/],
];
export function articleTool(slug: string, primaryKeywordEn?: string): ToolSlug | null {
  const s = `${slug} ${primaryKeywordEn ?? ''}`.toLowerCase().replace(/-/g, ' ');
  for (const [tool, re] of TOOL_RULES) if (re.test(s)) return tool;
  return null;
}

/** 글 중간 블록 이미지(언어판 있음). */
export const FOCUS_SHOT: Record<ArticleFocus, string> = {
  nutrition: 'feature-nutrition.webp',
  exercise: 'feature-running-coach.webp',
  weight: 'home-targets.webp',
  sleep: 'feature-ai-coach.webp',
  mind: 'feature-daily-check-in.webp',
  habits: 'home-targets.webp',
  glp1: 'feature-track-everything.webp',
};

export interface ArticleCta {
  midTitle: string;
  focus: Record<ArticleFocus, { limit: string; havit: string }>;
  midButton: string;
  sectionIntro: string;
  calcTitle: string;
  /** {tool} = 계산기 이름 */
  calcBody: string;
  calcButton: string;
}

export const ARTICLE_CTA: Partial<Record<ToolLang, ArticleCta>> = {
  "ko": {
    "midTitle": "평균 말고, 내 몸 기준으로",
    "focus": {
      "nutrition": {
        "limit": "글 속 권장량은 평균값이에요. 내게 맞는 양은 체중·근육량·목표에 따라 달라요.",
        "havit": "하비트는 AI 체성분 진단 결과로 단백질·탄수화물·지방·식이섬유 하루 목표를 g 단위로 처방하고, 사진 한 장으로 기록한 식사가 목표를 얼마나 채웠는지 보여 줘요."
      },
      "exercise": {
        "limit": "운동 효과는 먹은 것과 같이 볼 때 제대로 보여요.",
        "havit": "하비트는 진단 결과로 걸음 수·소모 칼로리 목표와 섭취 칼로리 목표를 함께 처방하고, 운동·러닝 기록이 목표를 채웠는지 매일 보여 줘요."
      },
      "weight": {
        "limit": "체중계 숫자만으로는 지방이 빠졌는지 근육이 빠졌는지 알 수 없어요.",
        "havit": "하비트는 장비 없이 체지방·근육·내장지방을 추정하고, 그 결과로 칼로리와 영양 목표를 숫자로 처방해 매주 내 체중 변화에 맞춰 다시 맞춰요."
      },
      "sleep": {
        "limit": "권장 수면 시간은 평균이에요. 잠이 식욕과 체중에 미치는 영향은 사람마다 달라요.",
        "havit": "하비트는 수면 목표 시간을 처방하고, 수면 기록을 식사·체중 흐름과 함께 읽어 AI 코치 HAVI가 오늘 할 일 하나를 알려 줘요."
      },
      "mind": {
        "limit": "의지력만으로 버티는 다이어트는 오래가기 어려워요.",
        "havit": "하비트는 데일리 체크인으로 그날의 기분과 컨디션을 묻고, CBT 기반 코칭과 가이드 명상으로 습관이 이어지게 도와요."
      },
      "habits": {
        "limit": "좋은 습관도 숫자로 재지 않으면 흐지부지되기 쉬워요.",
        "havit": "하비트는 진단 결과로 11가지 하루 목표를 숫자로 정하고, 데일리 미션과 챌린지로 매일 지킬 수 있게 만들어요."
      },
      "glp1": {
        "limit": "GLP-1로 체중이 빠질 때 근육도 함께 빠질 수 있어요.",
        "havit": "하비트는 투약 기록·알림과 함께 추정 체성분 추이를 보여 주고, 근육을 지키는 단백질 목표와 식사를 매일 코칭해요."
      }
    },
    "midButton": "무료 체성분 진단 받기",
    "sectionIntro": "글은 누구에게나 같은 평균을 말합니다. 하비트는 내 몸을 먼저 진단하고, 그 결과로 하루 목표를 숫자로 정해 12주 동안 함께 실행합니다.",
    "calcTitle": "이 글 내용을 내 숫자로 확인해 보세요",
    "calcBody": "{tool}에 내 정보를 넣으면 바로 계산돼요. 무료예요.",
    "calcButton": "바로 계산하기"
  },
  "en": {
    "midTitle": "Not the average. Your body.",
    "focus": {
      "nutrition": {
        "limit": "The amounts in this article are averages. What's right for you depends on your weight, muscle mass, and goals.",
        "havit": "HAVIT uses your AI body composition analysis to set daily protein, carb, fat, and fiber targets in grams, then shows how well each meal you log with a single photo meets them."
      },
      "exercise": {
        "limit": "You see the real effect of exercise when you look at it alongside what you eat.",
        "havit": "HAVIT uses your analysis to set step, calories-burned, and calorie-intake targets together, then shows every day whether your workouts and runs hit them."
      },
      "weight": {
        "limit": "The number on the scale can't tell you whether you lost fat or muscle.",
        "havit": "HAVIT estimates your body fat, muscle, and visceral fat with no equipment, turns the results into calorie and nutrition targets, and adjusts them every week based on how your weight changes."
      },
      "sleep": {
        "limit": "Recommended sleep hours are an average. How sleep affects your appetite and weight varies from person to person.",
        "havit": "HAVIT sets a sleep target, reads your sleep logs alongside your meals and weight trends, and your AI coach HAVI gives you one thing to do today."
      },
      "mind": {
        "limit": "A diet that runs on willpower alone is hard to keep up.",
        "havit": "HAVIT asks about your mood and how you feel with a daily check-in, then helps your habits stick with CBT-based coaching and guided meditation."
      },
      "habits": {
        "limit": "Even good habits tend to fade when you don't measure them.",
        "havit": "HAVIT uses your analysis to set 11 daily targets in numbers, then makes them doable every day with daily missions and challenges."
      },
      "glp1": {
        "limit": "When you lose weight on GLP-1, you can lose muscle along with it.",
        "havit": "HAVIT logs your doses and sends reminders, shows your estimated body composition trends, and coaches you every day on a muscle-preserving protein target and meals."
      }
    },
    "midButton": "Get my free body analysis",
    "sectionIntro": "Articles give everyone the same averages. HAVIT assesses your body first, uses the results to set daily targets in numbers, and works through them with you for 12 weeks.",
    "calcTitle": "Check this article against your own numbers",
    "calcBody": "Enter your info in {tool} and get results instantly. It's free.",
    "calcButton": "Calculate now"
  },
  "ja": {
    "midTitle": "平均ではなく、あなたの体を基準に",
    "focus": {
      "nutrition": {
        "limit": "記事の推奨量は平均値です。あなたに合う量は、体重・筋肉量・目標によって変わります。",
        "havit": "HAVITはAI体組成診断の結果から、たんぱく質・炭水化物・脂質・食物繊維の1日の目標をg単位で処方。写真1枚で記録した食事が、目標をどれだけ満たしたかを表示します。"
      },
      "exercise": {
        "limit": "運動の効果は、食べたものと合わせて見ることで正しく見えてきます。",
        "havit": "HAVITは診断結果から、歩数・消費カロリーの目標と摂取カロリーの目標をあわせて処方。運動・ランニングの記録が目標を満たしたかを毎日表示します。"
      },
      "weight": {
        "limit": "体重計の数字だけでは、落ちたのが脂肪か筋肉かはわかりません。",
        "havit": "HAVITは機器なしで体脂肪・筋肉・内臓脂肪を推定し、その結果からカロリーと栄養の目標を数字で処方。毎週の体重変化に合わせて見直します。"
      },
      "sleep": {
        "limit": "推奨される睡眠時間は平均値です。睡眠が食欲や体重に与える影響は人によって異なります。",
        "havit": "HAVITは睡眠の目標時間を処方し、睡眠の記録を食事・体重の推移とあわせて読み取ります。AIコーチHAVIが、今日やることを1つお伝えします。"
      },
      "mind": {
        "limit": "意志の力だけに頼るダイエットは、長続きしにくいものです。",
        "havit": "HAVITはデイリーチェックインでその日の気分や体調をたずね、CBTに基づくコーチングとガイド付き瞑想で、習慣が続くようサポートします。"
      },
      "habits": {
        "limit": "良い習慣も、数字で測らなければうやむやになりがちです。",
        "havit": "HAVITは診断結果から11の1日の目標を数字で設定し、デイリーミッションとチャレンジで毎日続けられるようにします。"
      },
      "glp1": {
        "limit": "GLP-1で体重が減るとき、筋肉も一緒に減ることがあります。",
        "havit": "HAVITは投与の記録・リマインダーとあわせて推定体組成の推移を表示し、筋肉を守るたんぱく質の目標と食事を毎日コーチングします。"
      }
    },
    "midButton": "無料で体組成を診断",
    "sectionIntro": "記事は誰にでも同じ平均値を伝えます。HAVITはまずあなたの体を診断し、その結果から1日の目標を数字で決めて、12週間一緒に実行します。",
    "calcTitle": "この記事の内容を、あなたの数字で確かめましょう",
    "calcBody": "{tool}にあなたの情報を入力すると、すぐに計算できます。無料です。",
    "calcButton": "今すぐ計算する"
  },
  "zh": {
    "midTitle": "不看平均值，以你的身体为准",
    "focus": {
      "nutrition": {
        "limit": "文中的推荐量是平均值。适合你的量取决于体重、肌肉量和目标。",
        "havit": "HAVIT 根据 AI 体成分评估结果，以 g 为单位设定蛋白质、碳水化合物、脂肪和膳食纤维的每日目标；拍一张照片记录饮食，就能看到这一餐完成了多少目标。"
      },
      "exercise": {
        "limit": "运动效果要和饮食放在一起看，才看得清楚。",
        "havit": "HAVIT 根据评估结果，同时设定步数、消耗热量目标和摄入热量目标，每天告诉你运动和跑步记录是否达标。"
      },
      "weight": {
        "limit": "只看体重秤上的数字，无法知道减掉的是脂肪还是肌肉。",
        "havit": "HAVIT 无需设备即可估算体脂、肌肉和内脏脂肪，据此用数字设定热量和营养目标，并每周根据你的体重变化重新调整。"
      },
      "sleep": {
        "limit": "推荐睡眠时长是平均值。睡眠对食欲和体重的影响因人而异。",
        "havit": "HAVIT 为你设定目标睡眠时长，并结合饮食和体重变化解读睡眠记录，由 AI 教练 HAVI 告诉你今天要做的一件事。"
      },
      "mind": {
        "limit": "单靠意志力硬撑的减重，很难长久。",
        "havit": "HAVIT 通过每日签到了解你当天的心情和状态，用基于 CBT 的教练指导和引导冥想，帮你把习惯坚持下去。"
      },
      "habits": {
        "limit": "好习惯如果不用数字衡量，也容易半途而废。",
        "havit": "HAVIT 根据评估结果，用数字设定 11 项每日目标，并通过每日任务和挑战，让你每天都能做到。"
      },
      "glp1": {
        "limit": "使用 GLP-1 减重时，肌肉也可能随之流失。",
        "havit": "HAVIT 提供用药记录和提醒，同时展示估算的体成分变化趋势，并每天围绕保护肌肉的蛋白质目标和饮食为你提供指导。"
      }
    },
    "midButton": "免费测体成分",
    "sectionIntro": "文章对每个人讲的都是同样的平均值。HAVIT 先评估你的身体，再根据结果用数字设定每日目标，陪你执行 12 周。",
    "calcTitle": "用你自己的数字，验证本文内容",
    "calcBody": "在{tool}中输入你的信息，即可立即计算，完全免费。",
    "calcButton": "立即计算"
  },
  "zh-tw": {
    "midTitle": "不看平均值，以你的身體為準",
    "focus": {
      "nutrition": {
        "limit": "文章中的建議攝取量是平均值。適合你的量，會依體重、肌肉量和目標而不同。",
        "havit": "HAVIT 依 AI 體組成分析結果，以 g 為單位開出蛋白質、碳水化合物、脂肪、膳食纖維的每日目標；拍一張照片記錄餐點，就能看到目標達成了多少。"
      },
      "exercise": {
        "limit": "運動效果要和吃進去的一起看，才看得清楚。",
        "havit": "HAVIT 依分析結果同時開出步數、消耗熱量目標和攝取熱量目標，每天告訴你運動與跑步紀錄是否達標。"
      },
      "weight": {
        "limit": "光看體重計上的數字，無法知道減掉的是脂肪還是肌肉。",
        "havit": "HAVIT 不需任何設備就能推估體脂肪、肌肉和內臟脂肪，並依結果用數字開出熱量與營養目標，每週配合你的體重變化重新調整。"
      },
      "sleep": {
        "limit": "建議睡眠時間是平均值。睡眠對食慾和體重的影響因人而異。",
        "havit": "HAVIT 為你開出睡眠目標時間，並把睡眠紀錄和飲食、體重變化一起解讀，由 AI 教練 HAVI 告訴你今天該做的一件事。"
      },
      "mind": {
        "limit": "只靠意志力撐著的減重，很難持久。",
        "havit": "HAVIT 透過每日打卡詢問你當天的心情與狀態，並以 CBT 為基礎的教練指導和引導式冥想，幫你把習慣延續下去。"
      },
      "habits": {
        "limit": "好習慣如果不用數字衡量，很容易就不了了之。",
        "havit": "HAVIT 依分析結果用數字訂出 11 項每日目標，再透過每日任務和挑戰，讓你每天都做得到。"
      },
      "glp1": {
        "limit": "使用 GLP-1 減重時，肌肉也可能跟著流失。",
        "havit": "HAVIT 提供用藥紀錄與提醒，並顯示推估的體組成變化趨勢，每天指導你達成守住肌肉的蛋白質目標與飲食。"
      }
    },
    "midButton": "免費體組成分析",
    "sectionIntro": "文章對每個人說的都是同樣的平均值。HAVIT 先分析你的身體，再依結果用數字訂出每日目標，12 週陪你一起執行。",
    "calcTitle": "用你自己的數字，確認這篇文章的內容",
    "calcBody": "在{tool}輸入你的資料，馬上就能算出結果，完全免費。",
    "calcButton": "立即計算"
  },
  "es": {
    "midTitle": "Tu cuerpo como referencia, no un promedio",
    "focus": {
      "nutrition": {
        "limit": "Las cantidades recomendadas en el artículo son promedios. Lo que te conviene a ti depende de tu peso, tu masa muscular y tu meta.",
        "havit": "Con tu diagnóstico de composición corporal con IA, HAVIT te receta metas diarias de proteína, carbohidratos, grasa y fibra en gramos (g). Con solo una foto registras tu comida y ves cuánto de tus metas cubriste."
      },
      "exercise": {
        "limit": "El efecto del ejercicio se ve de verdad cuando lo miras junto con lo que comes.",
        "havit": "Con tu diagnóstico, HAVIT te receta metas de pasos y calorías quemadas junto con tu meta de calorías consumidas. Cada día te muestra si tus registros de ejercicio y carrera cumplieron la meta."
      },
      "weight": {
        "limit": "El número de la báscula no te dice si perdiste grasa o músculo.",
        "havit": "Sin ningún equipo, HAVIT estima tu grasa corporal, tu músculo y tu grasa visceral. Con ese resultado te receta metas de calorías y nutrientes en números, y cada semana las ajusta según cómo cambia tu peso."
      },
      "sleep": {
        "limit": "Las horas de sueño recomendadas son un promedio. El efecto del sueño en el apetito y el peso cambia de una persona a otra.",
        "havit": "HAVIT te receta una meta de horas de sueño y lee tus registros de sueño junto con tu alimentación y tu peso. Así HAVI, tu coach de IA, te dice una sola cosa que hacer hoy."
      },
      "mind": {
        "limit": "Una dieta que depende solo de la fuerza de voluntad es difícil de sostener.",
        "havit": "Con un check-in diario, HAVIT te pregunta cómo te sientes y cómo estás ese día. Con coaching basado en la terapia cognitivo-conductual (TCC) y meditaciones guiadas, te ayuda a mantener tus hábitos."
      },
      "habits": {
        "limit": "Si no los mides con números, hasta los buenos hábitos se diluyen fácilmente.",
        "havit": "Con tu diagnóstico, HAVIT fija 11 metas diarias en números y, con misiones diarias y retos, te ayuda a cumplirlas cada día."
      },
      "glp1": {
        "limit": "Cuando bajas de peso con GLP-1, también puedes perder músculo.",
        "havit": "HAVIT te muestra la tendencia estimada de tu composición corporal junto con el registro y los recordatorios de tu medicación. Cada día te guía con una meta de proteína y con tus comidas para que conserves tu músculo."
      }
    },
    "midButton": "Diagnóstico corporal gratis",
    "sectionIntro": "Los artículos les dan a todos el mismo promedio. HAVIT primero diagnostica tu cuerpo, con ese resultado fija tus metas diarias en números y te acompaña a cumplirlas durante 12 semanas.",
    "calcTitle": "Revisa lo que dice este artículo con tus propios números",
    "calcBody": "Ingresa tus datos en {tool} y obtén el resultado al instante. Es gratis.",
    "calcButton": "Calcular ahora"
  },
  "pt-br": {
    "midTitle": "Nada de média: o seu corpo é a referência",
    "focus": {
      "nutrition": {
        "limit": "As quantidades recomendadas no texto são médias. A quantidade certa para você depende do seu peso, da sua massa muscular e do seu objetivo.",
        "havit": "O HAVIT usa o resultado do diagnóstico de composição corporal por IA para prescrever metas diárias de proteína, carboidrato, gordura e fibra em gramas, e mostra quanto da meta cada refeição registrada com uma foto já cobriu."
      },
      "exercise": {
        "limit": "O efeito do exercício só aparece de verdade quando você olha junto com o que comeu.",
        "havit": "Com base no diagnóstico, o HAVIT prescreve metas de passos e de calorias gastas junto com a meta de calorias ingeridas, e mostra todo dia se seus treinos e corridas bateram a meta."
      },
      "weight": {
        "limit": "Só o número da balança não mostra se você perdeu gordura ou músculo.",
        "havit": "O HAVIT estima gordura corporal, massa muscular e gordura visceral sem nenhum equipamento, prescreve metas de calorias e nutrientes em números e as ajusta toda semana de acordo com a variação do seu peso."
      },
      "sleep": {
        "limit": "O tempo de sono recomendado é uma média. O efeito do sono no apetite e no peso muda de pessoa para pessoa.",
        "havit": "O HAVIT prescreve uma meta de horas de sono e analisa seus registros de sono junto com a alimentação e o peso, para que o coach de IA HAVI indique uma coisa para você fazer hoje."
      },
      "mind": {
        "limit": "Dieta que depende só de força de vontade dificilmente dura.",
        "havit": "No check-in diário, o HAVIT pergunta como está seu humor e sua disposição, e ajuda você a manter os hábitos com coaching baseado em TCC e meditações guiadas."
      },
      "habits": {
        "limit": "Até bons hábitos se perdem quando não são medidos em números.",
        "havit": "O HAVIT define 11 metas diárias em números a partir do diagnóstico e usa missões diárias e desafios para você conseguir cumpri-las todos os dias."
      },
      "glp1": {
        "limit": "Quando o peso cai com GLP-1, a massa muscular também pode diminuir.",
        "havit": "O HAVIT mostra a evolução estimada da sua composição corporal junto com o registro e os lembretes das doses, e orienta todo dia sua meta de proteína e suas refeições para preservar a massa muscular."
      }
    },
    "midButton": "Fazer diagnóstico grátis",
    "sectionIntro": "Os textos falam da mesma média para todo mundo. O HAVIT primeiro diagnostica o seu corpo, define metas diárias em números com base no resultado e coloca tudo em prática com você por 12 semanas.",
    "calcTitle": "Confira o que este texto diz com os seus números",
    "calcBody": "Insira seus dados em {tool} e veja o cálculo na hora. É grátis.",
    "calcButton": "Calcular agora"
  },
  "id": {
    "midTitle": "Bukan rata-rata, tapi sesuai tubuhmu",
    "focus": {
      "nutrition": {
        "limit": "Takaran yang disarankan di artikel adalah nilai rata-rata. Jumlah yang pas untukmu bergantung pada berat badan, massa otot, dan targetmu.",
        "havit": "HAVIT menetapkan target harian protein, karbohidrat, lemak, dan serat dalam satuan g dari hasil analisis komposisi tubuh AI, lalu menunjukkan seberapa banyak makanan yang kamu catat lewat satu foto sudah memenuhi target."
      },
      "exercise": {
        "limit": "Hasil olahraga baru terlihat jelas jika dilihat bersama apa yang kamu makan.",
        "havit": "HAVIT menetapkan target langkah, kalori terbakar, dan asupan kalori sekaligus dari hasil analisis, lalu setiap hari menunjukkan apakah catatan olahraga dan larimu sudah memenuhi target."
      },
      "weight": {
        "limit": "Angka di timbangan saja tidak bisa memberi tahu apakah yang turun itu lemak atau otot.",
        "havit": "HAVIT memperkirakan lemak tubuh, otot, dan lemak visceral tanpa alat, menetapkan target kalori dan nutrisi dalam angka dari hasilnya, lalu menyesuaikannya lagi setiap minggu mengikuti perubahan berat badanmu."
      },
      "sleep": {
        "limit": "Durasi tidur yang disarankan adalah rata-rata. Pengaruh tidur pada nafsu makan dan berat badan berbeda pada setiap orang.",
        "havit": "HAVIT menetapkan target durasi tidur, membaca catatan tidurmu bersama pola makan dan berat badan, lalu coach AI HAVI memberi tahu satu hal yang perlu kamu lakukan hari ini."
      },
      "mind": {
        "limit": "Diet yang hanya mengandalkan tekad biasanya sulit bertahan lama.",
        "havit": "HAVIT menanyakan suasana hati dan kondisimu lewat check-in harian, lalu membantu kebiasaanmu terus berjalan dengan coaching berbasis CBT dan meditasi terpandu."
      },
      "habits": {
        "limit": "Kebiasaan baik pun mudah terlupakan jika tidak diukur dengan angka.",
        "havit": "HAVIT menetapkan 11 target harian dalam angka dari hasil analisis, lalu membantumu menjalankannya setiap hari lewat misi harian dan tantangan."
      },
      "glp1": {
        "limit": "Saat berat badan turun dengan GLP-1, massa otot juga bisa ikut berkurang.",
        "havit": "HAVIT menampilkan tren perkiraan komposisi tubuh bersama catatan dan pengingat obat, lalu setiap hari memberi coaching untuk target protein dan makanan yang membantu menjaga otot."
      }
    },
    "midButton": "Cek komposisi tubuh gratis",
    "sectionIntro": "Artikel menyampaikan rata-rata yang sama untuk semua orang. HAVIT menganalisis tubuhmu lebih dulu, menetapkan target harian dalam angka dari hasilnya, lalu menjalankannya bersamamu selama 12 minggu.",
    "calcTitle": "Cek isi artikel ini dengan angkamu sendiri",
    "calcBody": "Masukkan datamu di {tool}, hasilnya langsung keluar. Gratis.",
    "calcButton": "Hitung sekarang"
  },
  "de": {
    "midTitle": "Nicht der Durchschnitt, sondern Ihr Körper",
    "focus": {
      "nutrition": {
        "limit": "Die Empfehlungen im Artikel sind Durchschnittswerte. Wie viel Sie brauchen, hängt von Gewicht, Muskelmasse und Ziel ab.",
        "havit": "HAVIT legt auf Basis Ihrer KI-Körperanalyse tägliche Ziele für Protein, Kohlenhydrate, Fett und Ballaststoffe in g fest und zeigt Ihnen, wie viel Ihre per Foto erfassten Mahlzeiten davon schon abdecken."
      },
      "exercise": {
        "limit": "Was Ihr Training bringt, sehen Sie erst richtig, wenn Sie auch auf Ihre Ernährung schauen.",
        "havit": "HAVIT legt auf Basis Ihrer Analyse Ziele für Schritte und verbrannte Kalorien zusammen mit Ihrem Kalorienziel fest und zeigt Ihnen täglich, ob Ihre Workouts und Läufe die Ziele erreichen."
      },
      "weight": {
        "limit": "Die Waage allein verrät nicht, ob Sie Fett oder Muskeln verloren haben.",
        "havit": "HAVIT schätzt Körperfett, Muskelmasse und Viszeralfett ganz ohne Gerät, leitet daraus klare Kalorien- und Nährstoffziele ab und passt sie jede Woche an Ihre Gewichtsentwicklung an."
      },
      "sleep": {
        "limit": "Empfohlene Schlafzeiten sind Durchschnittswerte. Wie Schlaf Appetit und Gewicht beeinflusst, ist bei jedem anders.",
        "havit": "HAVIT legt Ihr Schlafziel fest und liest Ihre Schlafdaten zusammen mit Mahlzeiten und Gewichtsverlauf – Ihr KI-Coach HAVI nennt Ihnen dann eine Aufgabe für heute."
      },
      "mind": {
        "limit": "Eine Diät, die nur auf Willenskraft setzt, hält selten lange.",
        "havit": "HAVIT fragt beim täglichen Check-in nach Stimmung und Befinden und hilft Ihnen mit CBT-basiertem Coaching und geführten Meditationen, dranzubleiben."
      },
      "habits": {
        "limit": "Auch gute Gewohnheiten schlafen leicht ein, wenn Sie sie nicht in Zahlen messen.",
        "havit": "HAVIT legt auf Basis Ihrer Analyse 11 tägliche Ziele in klaren Zahlen fest und hilft Ihnen mit täglichen Missionen und Challenges, sie jeden Tag einzuhalten."
      },
      "glp1": {
        "limit": "Wenn Sie mit GLP-1 abnehmen, kann auch Muskelmasse verloren gehen.",
        "havit": "HAVIT zeigt Ihnen neben Dosis-Tracking und Erinnerungen den geschätzten Verlauf Ihrer Körperzusammensetzung und coacht Sie täglich zu Proteinziel und Mahlzeiten, die Ihre Muskeln schützen."
      }
    },
    "midButton": "Gratis Körperanalyse starten",
    "sectionIntro": "Artikel nennen allen denselben Durchschnitt. HAVIT analysiert zuerst Ihren Körper, legt daraus klare Tagesziele fest und setzt sie 12 Wochen lang mit Ihnen um.",
    "calcTitle": "Prüfen Sie den Artikel mit Ihren eigenen Zahlen",
    "calcBody": "Geben Sie Ihre Daten in {tool} ein und erhalten Sie sofort Ihr Ergebnis. Kostenlos.",
    "calcButton": "Jetzt berechnen"
  },
  "fr": {
    "midTitle": "Pas une moyenne : votre corps comme référence",
    "focus": {
      "nutrition": {
        "limit": "Les apports recommandés dans l'article sont des moyennes. La bonne quantité pour vous dépend de votre poids, de votre masse musculaire et de votre objectif.",
        "havit": "À partir du diagnostic de composition corporelle par IA, HAVIT vous prescrit des objectifs quotidiens de protéines, glucides, lipides et fibres en grammes, puis vous montre dans quelle mesure chaque repas enregistré en une photo les atteint."
      },
      "exercise": {
        "limit": "L'effet de l'exercice se mesure vraiment quand on le met en regard de ce que l'on mange.",
        "havit": "À partir du diagnostic, HAVIT vous prescrit à la fois des objectifs de pas, de calories brûlées et de calories consommées, puis vous montre chaque jour si vos séances d'exercice et de course les ont atteints."
      },
      "weight": {
        "limit": "Le chiffre de la balance ne dit pas si vous avez perdu de la graisse ou du muscle.",
        "havit": "Sans aucun appareil, HAVIT estime votre masse grasse, votre masse musculaire et votre graisse viscérale. Il en tire des objectifs caloriques et nutritionnels chiffrés, puis les réajuste chaque semaine selon l'évolution de votre poids."
      },
      "sleep": {
        "limit": "La durée de sommeil recommandée est une moyenne. L'effet du sommeil sur l'appétit et le poids varie d'une personne à l'autre.",
        "havit": "HAVIT vous prescrit un objectif de durée de sommeil et lit vos nuits avec l'évolution de vos repas et de votre poids. HAVI, votre coach IA, vous indique ensuite une seule chose à faire aujourd'hui."
      },
      "mind": {
        "limit": "Un régime qui ne tient qu'à la volonté a du mal à durer.",
        "havit": "Chaque jour, HAVIT vous demande comment vous vous sentez et comment va votre forme lors d'un check-in, puis vous aide à garder vos habitudes grâce à un coaching fondé sur la TCC et à des méditations guidées."
      },
      "habits": {
        "limit": "Même les bonnes habitudes s'essoufflent vite quand on ne les mesure pas.",
        "havit": "À partir du diagnostic, HAVIT fixe 11 objectifs quotidiens chiffrés et vous aide à les tenir chaque jour avec des missions quotidiennes et des défis."
      },
      "glp1": {
        "limit": "Quand on perd du poids sous GLP-1, on peut aussi perdre du muscle.",
        "havit": "HAVIT associe le suivi des prises et des rappels à l'évolution estimée de votre composition corporelle, et vous coache chaque jour sur votre objectif de protéines et vos repas pour préserver votre muscle."
      }
    },
    "midButton": "Diagnostic corporel gratuit",
    "sectionIntro": "Un article donne la même moyenne à tout le monde. HAVIT diagnostique d'abord votre corps, en tire des objectifs quotidiens chiffrés, puis les met en pratique avec vous pendant 12 semaines.",
    "calcTitle": "Vérifiez cet article avec vos propres chiffres",
    "calcBody": "Entrez vos informations dans {tool} et obtenez le résultat tout de suite. C'est gratuit.",
    "calcButton": "Calculer maintenant"
  }
};
