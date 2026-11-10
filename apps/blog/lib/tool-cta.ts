/**
 * 계산기 → 하비트 전환 문구. 결과 아래 배너(계산기별)와 페이지 하단 '진단 → 정량 처방 → 매일 코칭' 절.
 * 근거는 앱 화면 문구(havit-wellness-app intl_ko_KR.arb: 전체 건강 분석·신체 설계도·6단계 습관 분석·
 * 핵심 정량적 목표·value_proposition)와 홈페이지 키 카피에서만 가져온다. 체성분은 '추정'.
 * 언어가 없으면 배너는 기존 APP_CTA, 하단 절은 숨김. ko 외 언어는 '쥬비스' 대신 'Juvis Diet, 한국의 대표적인
 * 감량 클리닉 중 하나' 로 설명(홈페이지 표현과 동일, 'No.1' 같은 최상급 표현은 쓰지 않음). 번역은 구독 claude -p.
 */
import type { ToolLang } from './tool-labels';
import type { ToolSlug } from './tool-seo';

export interface ToolCta {
  bannerTitle: string;
  banner: Record<ToolSlug, { limit: string; havit: string }>;
  bannerButton: string;
  sectionKicker: string;
  sectionTitle: string;
  sectionIntro: string;
  steps: { label: string; title: string; body: string; items: string[]; shots: { file: string; alt: string }[] }[];
  bannerShot?: Partial<Record<ToolSlug, { file: string; alt: string }>>;
  proofTitle: string;
  proof: { value: string; label: string }[];
  proofNote: string;
  sectionButton: string;
  disclaimer: string;
}

export const TOOL_CTA: Partial<Record<ToolLang, ToolCta>> = {
  "ko": {
    "bannerTitle": "계산기는 평균, 하비트는 내 몸에 맞춘 처방",
    "banner": {
      "bmr": {
        "limit": "이 공식은 키·몸무게·나이만 봐요. 같은 체중이어도 근육이 많으면 기초대사량이 달라집니다.",
        "havit": "하비트는 AI 체성분 진단으로 근육·체지방·내장지방을 먼저 추정하고, 그 결과로 하루 섭취 칼로리와 소모 칼로리 목표를 숫자로 처방해요."
      },
      "protein": {
        "limit": "이 계산기는 체중과 목표만 봐요. 실제 필요한 양은 근육량과 감량 속도에 따라 달라집니다.",
        "havit": "하비트는 체성분 진단 결과로 단백질·탄수화물·지방·식이섬유 하루 목표를 g 단위로 처방하고, 사진 한 장으로 기록한 식사가 목표를 얼마나 채웠는지 보여 줘요."
      },
      "water": {
        "limit": "이 계산기는 오늘 하루 기준이에요. 체중이 바뀌면 필요한 양도 바뀝니다.",
        "havit": "하비트는 진단 결과로 수분 목표를 처방하고 매주 내 체중에 맞춰 다시 맞춰요. 걸음·수면 등 다른 10가지 하루 목표와 함께 관리해요."
      },
      "caffeine": {
        "limit": "반감기는 사람마다 2배 이상 차이 나요. 평균 5시간은 출발점일 뿐이에요.",
        "havit": "하비트는 수면 목표 시간을 처방하고, 수면 기록과 그날의 커피·식사 기록을 함께 읽어 AI 코치 HAVI가 내게 맞는 조정을 알려 줘요."
      },
      "sleep-cycle": {
        "limit": "이 계산기는 잠드는 시각만 알려 줘요. 실제로 얼마나 잤는지가 체중 관리에 더 중요해요.",
        "havit": "하비트는 진단 결과로 수면 목표 시간을 처방하고, 수면 기록을 식사·체중 흐름과 함께 읽어 오늘 할 일 하나를 알려 줘요."
      },
      "exercise-calories": {
        "limit": "태운 칼로리는 먹은 칼로리와 같이 볼 때 의미가 있어요.",
        "havit": "하비트는 진단 결과로 하루 소모 칼로리·걸음 수 목표와 섭취 칼로리 목표를 함께 처방하고, 운동·걸음 기록이 목표를 채웠는지 매일 보여 줘요."
      }
    },
    "bannerButton": "무료 체성분 진단 받기",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "하비트 체성분 진단 화면"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "하비트 사진 식사 기록 화면"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "하비트 수분·기록 화면"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "하비트 AI 코치 화면"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "하비트 AI 코치 화면"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "하비트 데일리 미션·체중 기록 화면"
      }
    },
    "sectionKicker": "쥬비스 출신이 만든 AI 다이어트, 하비트",
    "sectionTitle": "진단하고, 숫자로 처방하고, 매일 코칭합니다",
    "sectionIntro": "계산기는 누구에게나 같은 평균 공식을 씁니다. 하비트는 내 몸을 먼저 진단하고, 그 결과로 하루 목표를 숫자로 정해 12주 동안 함께 실행합니다.",
    "steps": [
      {
        "label": "1단계",
        "title": "장비 없이 AI 체성분 진단",
        "body": "키·몸무게·나이와 생활습관 질문만으로 체성분을 추정해요. 자체 연구(70명)에서 InBody 측정값 대비 추정 정확도 92.9%였어요.",
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "하비트 앱 골격근-지방 분석·BMI 진단 화면"
          }
        ],
        "items": [
          "하비트 점수·기초대사율",
          "근육-지방 분석·체성분 유형",
          "비만도·복부 지방률·내장지방",
          "신체 설계도: 건강 목표 체중·허리-키 비율·안전한 감량 속도",
          "6단계 습관 분석"
        ]
      },
      {
        "label": "2단계",
        "title": "11가지 하루 목표를 숫자로 처방",
        "body": "진단 결과로 매일 지킬 목표를 정확한 숫자로 정해요. 목표는 매주 내 체중 변화에 맞춰 다시 조정돼요.",
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "하비트 앱 홈 화면 — 하루 목표 게이지와 칼로리 밸런스"
          }
        ],
        "items": [
          "섭취 칼로리·단백질·탄수화물·지방·식이섬유",
          "소모 칼로리·걸음 수",
          "수면 시간·수분",
          "체중 측정 빈도·목표 BMI"
        ]
      },
      {
        "label": "3단계",
        "title": "매일 실행과 AI 코칭",
        "body": "처방은 지켜야 의미가 있어요. 기록은 쉽게, 다음 행동은 분명하게 만들어요.",
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "하비트 앱 사진 식사 기록 화면"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "하비트 AI 코치 HAVI 코칭 화면"
          }
        ],
        "items": [
          "식사는 사진 한 장으로 기록",
          "AI 코치 HAVI가 기록을 읽고 오늘 할 일 하나 제안",
          "진단 결과 기반 126개 이상 카테고리의 맞춤 처방",
          "식단뿐 아니라 마음가짐까지, CBT 기반 코칭"
        ]
      },
      {
        "label": "올인원",
        "title": "앱 하나로 모든 관리",
        "body": "여러 앱을 오갈 필요 없어요. 몸에 관한 기록이 한곳에 모여야 AI 코치가 흐름을 읽을 수 있어요.",
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "하비트 데일리 체크인·기분 기록 화면"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "하비트 체중 기록·데일리 미션 화면"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "하비트 러닝 코치 화면"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "하비트 GLP-1·수분 기록 화면"
          }
        ],
        "items": [
          "식사·수분·운동·걸음",
          "수면·체중·체성분 추이",
          "생리주기·기분·데일리 체크인",
          "GLP-1 투약 기록·알림",
          "가이드 명상·운동 영상·러닝 코치",
          "챌린지·아바타로 게임처럼 지속"
        ]
      }
    ],
    "proofTitle": "을지대학교 12주 임상 결과",
    "proof": [
      {
        "value": "3.9배",
        "label": "체중 5% 이상 감량한 사람 비율 (31.7% vs 8.1%)"
      },
      {
        "value": "83%",
        "label": "체지방률이 줄어든 사람 비율 (대조군 49%)"
      }
    ],
    "proofNote": "2026년 6~8월, 1주차·12주차 InBody 결과가 있는 78명(하비트 41명·대조군 37명) 분석. 비맹검 연구.",
    "sectionButton": "무료로 내 진단 시작하기",
    "disclaimer": "하비트는 의료기기가 아닌 웰니스 앱이며, 체성분 결과는 추정치예요."
  },
  "en": {
    "bannerTitle": "Calculators give averages. HAVIT gives you a plan built for your body.",
    "banner": {
      "bmr": {
        "limit": "This formula only looks at height, weight, and age. Two people at the same weight can have very different BMRs depending on muscle mass.",
        "havit": "HAVIT starts with an AI body composition check that estimates your muscle, body fat, and visceral fat, then sets daily calorie intake and burn targets in real numbers."
      },
      "protein": {
        "limit": "This calculator only looks at your weight and goal. What you actually need depends on your muscle mass and how fast you're losing weight.",
        "havit": "HAVIT uses your body composition results to set daily protein, carb, fat, and fiber targets in grams. Log a meal with one photo and see how close you are to each target."
      },
      "water": {
        "limit": "This calculator gives you a number for today. When your weight changes, so does what you need.",
        "havit": "HAVIT sets a water target from your results and updates it every week as your weight changes. Track it alongside 10 other daily targets, including steps and sleep."
      },
      "caffeine": {
        "limit": "Caffeine half-life can vary more than 2x from person to person. The 5-hour average is just a starting point.",
        "havit": "HAVIT sets a sleep target for you. Your AI coach HAVI reads your sleep logs alongside that day's coffee and meals, then suggests adjustments that fit you."
      },
      "sleep-cycle": {
        "limit": "This calculator only tells you when to fall asleep. For weight management, how much you actually sleep matters more.",
        "havit": "HAVIT sets a sleep target from your results, reads your sleep logs alongside your meals and weight trend, and gives you one thing to do today."
      },
      "exercise-calories": {
        "limit": "Calories burned only mean something when you look at them next to calories eaten.",
        "havit": "HAVIT sets daily calorie burn, step, and calorie intake targets together from your results, and shows you every day whether your workouts and steps hit the mark."
      }
    },
    "bannerButton": "Get my free body analysis",
    "sectionKicker": "An AI weight-loss coach built by experts from Juvis Diet, one of Korea's leading weight-loss clinics",
    "sectionTitle": "Assess. Prescribe in numbers. Coach every day.",
    "sectionIntro": "Calculators apply the same average formula to everyone. HAVIT assesses your body first, turns the results into daily targets in real numbers, and works through them with you for 12 weeks.",
    "steps": [
      {
        "label": "Step 1",
        "title": "AI body composition check, no equipment needed",
        "body": "Just your height, weight, age, and a few lifestyle questions are enough to estimate your body composition. In our own study (70 people), estimates were 92.9% accurate compared with InBody measurements.",
        "items": [
          "HAVIT Score and basal metabolic rate",
          "Muscle-fat analysis and body composition type",
          "Obesity level, abdominal fat ratio, and visceral fat",
          "Body blueprint: healthy goal weight, waist-to-height ratio, and safe rate of weight loss",
          "6-stage habit analysis"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — AI body composition check, no equipment needed"
          }
        ]
      },
      {
        "label": "Step 2",
        "title": "11 daily targets, prescribed in numbers",
        "body": "Your results set exact numbers for what to hit each day. Targets are readjusted every week based on how your weight changes.",
        "items": [
          "Calorie intake, protein, carbs, fat, and fiber",
          "Calories burned and steps",
          "Sleep and water",
          "Weigh-in frequency and target BMI"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 daily targets, prescribed in numbers"
          }
        ]
      },
      {
        "label": "Step 3",
        "title": "Daily action and AI coaching",
        "body": "A plan only works if you follow it. We make logging easy and your next step clear.",
        "items": [
          "Log meals with a single photo",
          "AI coach HAVI reads your logs and suggests one thing to do today",
          "Personalized plans across 126+ categories based on your results",
          "CBT-based coaching for your mindset, not just your diet"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — Daily action and AI coaching"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — Daily action and AI coaching"
          }
        ]
      },
      {
        "label": "All-in-one",
        "title": "Everything in one app",
        "body": "No more switching between apps. When everything about your body lives in one place, your AI coach can see the full picture.",
        "items": [
          "Meals, water, workouts, and steps",
          "Sleep, weight, and body composition trends",
          "Menstrual cycle, mood, and daily check-ins",
          "GLP-1 medication logs and reminders",
          "Guided meditation, workout videos, and running coach",
          "Challenges and avatars that make it feel like a game"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — Everything in one app"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — Everything in one app"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — Everything in one app"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — Everything in one app"
          }
        ]
      }
    ],
    "proofTitle": "Eulji University 12-week clinical study results",
    "proof": [
      {
        "value": "3.9x",
        "label": "more people lost 5% or more of their body weight (31.7% vs 8.1%)"
      },
      {
        "value": "83%",
        "label": "of people reduced their body fat percentage (vs 49% in the control group)"
      }
    ],
    "proofNote": "Analysis of 78 people (41 HAVIT, 37 control) with InBody results at week 1 and week 12, June–August 2026. Non-blinded study.",
    "sectionButton": "Start my free analysis",
    "disclaimer": "HAVIT is a wellness app, not a medical device. Body composition results are estimates.",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — Calculators give averages. HAVIT gives you a plan built for your body."
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — Calculators give averages. HAVIT gives you a plan built for your body."
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — Calculators give averages. HAVIT gives you a plan built for your body."
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Calculators give averages. HAVIT gives you a plan built for your body."
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Calculators give averages. HAVIT gives you a plan built for your body."
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — Calculators give averages. HAVIT gives you a plan built for your body."
      }
    }
  },
  "ja": {
    "bannerTitle": "計算機は平均値、HAVITはあなたの体に合わせた処方",
    "banner": {
      "bmr": {
        "limit": "この計算式は身長・体重・年齢しか見ていません。同じ体重でも、筋肉が多いかどうかで基礎代謝は変わります。",
        "havit": "HAVITはAI体組成診断で筋肉・体脂肪・内臓脂肪をまず推定し、その結果から1日の摂取カロリーと消費カロリーの目標を数字で処方します。"
      },
      "protein": {
        "limit": "この計算機は体重と目標しか見ていません。本当に必要な量は、筋肉量や減量ペースによって変わります。",
        "havit": "HAVITは体組成診断の結果から、たんぱく質・炭水化物・脂質・食物繊維の1日の目標をg単位で処方。写真1枚で記録した食事が目標をどれだけ満たしたかもひと目でわかります。"
      },
      "water": {
        "limit": "この計算機は今日1日分の目安です。体重が変われば、必要な量も変わります。",
        "havit": "HAVITは診断結果から水分の目標を処方し、毎週あなたの体重に合わせて見直します。歩数・睡眠など、ほかの10の1日目標とまとめて管理できます。"
      },
      "caffeine": {
        "limit": "カフェインの半減期は人によって2倍以上の差があります。平均5時間はあくまで目安です。",
        "havit": "HAVITは睡眠時間の目標を処方。睡眠記録とその日のコーヒー・食事の記録をあわせて読み取り、AIコーチHAVIがあなたに合った調整を提案します。"
      },
      "sleep-cycle": {
        "limit": "この計算機がわかるのは寝る時刻だけ。体重管理には、実際にどれだけ眠れたかのほうが大切です。",
        "havit": "HAVITは診断結果から睡眠時間の目標を処方し、睡眠記録を食事や体重の推移とあわせて読み取って、今日やることをひとつ提案します。"
      },
      "exercise-calories": {
        "limit": "消費カロリーは、摂取カロリーとセットで見てこそ意味があります。",
        "havit": "HAVITは診断結果から、1日の消費カロリー・歩数の目標と摂取カロリーの目標をまとめて処方。運動や歩数の記録が目標に届いたかを毎日お知らせします。"
      }
    },
    "bannerButton": "無料で体組成を診断",
    "sectionKicker": "韓国有数のダイエットクリニック「Juvis Diet」の専門家が開発したAIダイエットコーチ、HAVIT",
    "sectionTitle": "診断して、数字で処方して、毎日コーチング",
    "sectionIntro": "計算機は誰にでも同じ平均の計算式を使います。HAVITはまずあなたの体を診断し、その結果から1日の目標を数字で決めて、12週間いっしょに実践します。",
    "steps": [
      {
        "label": "STEP 1",
        "title": "機器なしでAI体組成診断",
        "body": "身長・体重・年齢と生活習慣の質問だけで体組成を推定します。自社研究（70名）では、InBody測定値に対する推定精度は92.9%でした。",
        "items": [
          "HAVITスコア・基礎代謝率",
          "筋肉・脂肪バランス分析・体組成タイプ",
          "肥満度・腹部脂肪率・内臓脂肪",
          "からだの設計図：健康的な目標体重・ウエスト身長比・無理のない減量ペース",
          "6段階の習慣分析"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — 機器なしでAI体組成診断"
          }
        ]
      },
      {
        "label": "STEP 2",
        "title": "11の1日目標を数字で処方",
        "body": "診断結果をもとに、毎日守る目標を具体的な数字で設定。目標は毎週、あなたの体重の変化に合わせて見直されます。",
        "items": [
          "摂取カロリー・たんぱく質・炭水化物・脂質・食物繊維",
          "消費カロリー・歩数",
          "睡眠時間・水分",
          "体重を測る頻度・目標BMI"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11の1日目標を数字で処方"
          }
        ]
      },
      {
        "label": "STEP 3",
        "title": "毎日の実践とAIコーチング",
        "body": "処方は続けてこそ意味があります。記録はかんたんに、次の行動ははっきりと。",
        "items": [
          "食事は写真1枚で記録",
          "AIコーチHAVIが記録を読み取り、今日やることをひとつ提案",
          "診断結果にもとづく126+カテゴリーのパーソナル処方",
          "食事だけでなく気持ちの面まで、CBTベースのコーチング"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — 毎日の実践とAIコーチング"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — 毎日の実践とAIコーチング"
          }
        ]
      },
      {
        "label": "オールインワン",
        "title": "アプリひとつですべて管理",
        "body": "いくつものアプリを行き来する必要はありません。体の記録が1か所に集まるからこそ、AIコーチが流れを読み取れます。",
        "items": [
          "食事・水分・運動・歩数",
          "睡眠・体重・体組成の推移",
          "生理周期・気分・デイリーチェックイン",
          "GLP-1の投薬記録・リマインダー",
          "ガイド付き瞑想・運動動画・ランニングコーチ",
          "チャレンジやアバターでゲーム感覚で続く"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — アプリひとつですべて管理"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — アプリひとつですべて管理"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — アプリひとつですべて管理"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — アプリひとつですべて管理"
          }
        ]
      }
    ],
    "proofTitle": "乙支（ウルチ）大学 12週間の臨床結果",
    "proof": [
      {
        "value": "3.9倍",
        "label": "体重を5%以上減らした人の割合（31.7% vs 8.1%）"
      },
      {
        "value": "83%",
        "label": "体脂肪率が下がった人の割合（対照群 49%）"
      }
    ],
    "proofNote": "2026年6〜8月、1週目・12週目のInBody結果がある78名（HAVIT 41名・対照群 37名）を分析。非盲検試験。",
    "sectionButton": "無料で診断をはじめる",
    "disclaimer": "HAVITは医療機器ではなくウェルネスアプリです。体組成の結果は推定値です。",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — 計算機は平均値、HAVITはあなたの体に合わせた処方"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — 計算機は平均値、HAVITはあなたの体に合わせた処方"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — 計算機は平均値、HAVITはあなたの体に合わせた処方"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — 計算機は平均値、HAVITはあなたの体に合わせた処方"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — 計算機は平均値、HAVITはあなたの体に合わせた処方"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — 計算機は平均値、HAVITはあなたの体に合わせた処方"
      }
    }
  },
  "zh": {
    "bannerTitle": "计算器给你平均值，HAVIT 给你专属方案",
    "banner": {
      "bmr": {
        "limit": "这个公式只看身高、体重和年龄。同样的体重，肌肉多的人基础代谢也不一样。",
        "havit": "HAVIT 先用 AI 体成分评估推算你的肌肉、体脂和内脏脂肪，再据此为你定出每日摄入和消耗热量的具体数字目标。"
      },
      "protein": {
        "limit": "这个计算器只看体重和目标。实际需要多少，还取决于肌肉量和减重速度。",
        "havit": "HAVIT 根据体成分评估结果，以克为单位定出蛋白质、碳水、脂肪和膳食纤维的每日目标；拍一张照片记录饮食，就能看到离目标还差多少。"
      },
      "water": {
        "limit": "这个计算器只算今天。体重变了，需要的饮水量也会跟着变。",
        "havit": "HAVIT 根据评估结果定出饮水目标，并每周按你的体重重新调整，和步数、睡眠等其他 10 项每日目标一起管理。"
      },
      "caffeine": {
        "limit": "咖啡因半衰期因人而异，差距可达 2 倍以上。平均 5 小时只是个起点。",
        "havit": "HAVIT 为你定出睡眠目标时长，AI 教练 HAVI 会结合你的睡眠记录和当天的咖啡、饮食记录，告诉你该怎么调整。"
      },
      "sleep-cycle": {
        "limit": "这个计算器只告诉你几点入睡。对体重管理来说，实际睡了多久更重要。",
        "havit": "HAVIT 根据评估结果定出睡眠目标时长，并把睡眠记录和饮食、体重变化放在一起看，每天告诉你一件今天该做的事。"
      },
      "exercise-calories": {
        "limit": "消耗了多少热量，要和吃进去的热量一起看才有意义。",
        "havit": "HAVIT 根据评估结果，同时定出每日消耗热量、步数目标和摄入热量目标，每天告诉你运动和步数记录是否达标。"
      }
    },
    "bannerButton": "免费测体成分",
    "sectionKicker": "HAVIT 是由韩国知名减重机构 Juvis Diet 的专家团队打造的 AI 减重教练",
    "sectionTitle": "先评估，再用数字定方案，每天陪你执行",
    "sectionIntro": "计算器对每个人都用同一套平均公式。HAVIT 先评估你的身体，再根据结果用数字定出每日目标，12 周陪你一起执行。",
    "steps": [
      {
        "label": "第 1 步",
        "title": "无需设备，AI 评估体成分",
        "body": "只需填写身高、体重、年龄并回答几个生活习惯问题，就能推算体成分。在自有研究（70 人）中，与 InBody 测量值相比，推算准确率达 92.9%。",
        "items": [
          "HAVIT 分数 · 基础代谢率",
          "肌肉-脂肪分析 · 体成分类型",
          "肥胖度 · 腹部脂肪率 · 内脏脂肪",
          "身体蓝图：健康目标体重 · 腰高比 · 安全减重速度",
          "6 级习惯分析"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — 无需设备，AI 评估体成分"
          }
        ]
      },
      {
        "label": "第 2 步",
        "title": "11 项每日目标，全部量化",
        "body": "根据评估结果，把每天要达成的目标定成具体数字，并每周按你的体重变化重新调整。",
        "items": [
          "摄入热量 · 蛋白质 · 碳水 · 脂肪 · 膳食纤维",
          "消耗热量 · 步数",
          "睡眠时长 · 饮水",
          "称重频率 · 目标 BMI"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 项每日目标，全部量化"
          }
        ]
      },
      {
        "label": "第 3 步",
        "title": "每日执行 + AI 教练",
        "body": "方案要做到才有意义。我们让记录更简单，让下一步更明确。",
        "items": [
          "拍一张照片就能记录饮食",
          "AI 教练 HAVI 读取你的记录，每天给出一件要做的事",
          "基于评估结果，覆盖 126+ 个类别的个性化方案",
          "不只管饮食，也照顾心态：基于 CBT 的教练指导"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — 每日执行 + AI 教练"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — 每日执行 + AI 教练"
          }
        ]
      },
      {
        "label": "一站式",
        "title": "一个 App 管好一切",
        "body": "不用在多个 App 之间来回切换。身体数据集中在一处，AI 教练才能看懂你的变化趋势。",
        "items": [
          "饮食 · 饮水 · 运动 · 步数",
          "睡眠 · 体重 · 体成分趋势",
          "生理周期 · 心情 · 每日打卡",
          "GLP-1 用药记录 · 提醒",
          "冥想引导 · 运动视频 · 跑步教练",
          "挑战 · 虚拟形象，像玩游戏一样坚持"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — 一个 App 管好一切"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — 一个 App 管好一切"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — 一个 App 管好一切"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — 一个 App 管好一切"
          }
        ]
      }
    ],
    "proofTitle": "乙支大学 12 周临床研究结果",
    "proof": [
      {
        "value": "3.9 倍",
        "label": "体重减少 5% 以上的人数比例（31.7% vs 8.1%）"
      },
      {
        "value": "83%",
        "label": "体脂率下降的人数比例（对照组 49%）"
      }
    ],
    "proofNote": "分析对象为 2026 年 6–8 月期间、拥有第 1 周和第 12 周 InBody 数据的 78 人（HAVIT 组 41 人、对照组 37 人）。非盲法研究。",
    "sectionButton": "免费开始我的评估",
    "disclaimer": "HAVIT 是健康生活类 App，并非医疗器械；体成分结果为推算值。",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — 计算器给你平均值，HAVIT 给你专属方案"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — 计算器给你平均值，HAVIT 给你专属方案"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — 计算器给你平均值，HAVIT 给你专属方案"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — 计算器给你平均值，HAVIT 给你专属方案"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — 计算器给你平均值，HAVIT 给你专属方案"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — 计算器给你平均值，HAVIT 给你专属方案"
      }
    }
  },
  "zh-tw": {
    "bannerTitle": "計算機給你平均值，HAVIT 給你專屬處方",
    "banner": {
      "bmr": {
        "limit": "這個公式只看身高、體重和年齡。就算體重相同，肌肉量不同，基礎代謝率也會不一樣。",
        "havit": "HAVIT 先用 AI 體組成分析推估肌肉、體脂肪和內臟脂肪，再依結果用數字開出每日攝取熱量與消耗熱量目標。"
      },
      "protein": {
        "limit": "這個計算機只看體重和目標。實際需要多少，要看肌肉量和減重速度。",
        "havit": "HAVIT 依體組成分析結果，以公克為單位開出蛋白質、碳水化合物、脂肪和膳食纖維的每日目標。拍一張照片記錄餐點，馬上看到目標達成多少。"
      },
      "water": {
        "limit": "這個計算機只以今天為準。體重一變，需要的水量也會跟著變。",
        "havit": "HAVIT 依分析結果開出飲水目標，每週根據你的體重重新調整，並和步數、睡眠等另外 10 項每日目標一起管理。"
      },
      "caffeine": {
        "limit": "咖啡因半衰期因人而異，差距可達 2 倍以上。平均 5 小時只是起點。",
        "havit": "HAVIT 開出睡眠時數目標，AI 教練 HAVI 會把你的睡眠紀錄和當天的咖啡、飲食紀錄一起解讀，告訴你最適合你的調整方式。"
      },
      "sleep-cycle": {
        "limit": "這個計算機只告訴你幾點入睡。實際睡了多久，對體重管理更重要。",
        "havit": "HAVIT 依分析結果開出睡眠時數目標，把睡眠紀錄和飲食、體重變化一起解讀，告訴你今天最該做的一件事。"
      },
      "exercise-calories": {
        "limit": "消耗的熱量，要和吃進去的熱量一起看才有意義。",
        "havit": "HAVIT 依分析結果同時開出每日消耗熱量、步數目標與攝取熱量目標，每天讓你看到運動和步數紀錄有沒有達標。"
      }
    },
    "bannerButton": "免費體組成分析",
    "sectionKicker": "HAVIT：由韓國領先減重機構之一 Juvis Diet 的專家打造的 AI 減重教練",
    "sectionTitle": "先分析，再用數字開處方，每天陪你執行",
    "sectionIntro": "計算機對每個人都套用同一套平均公式。HAVIT 先分析你的身體，再依結果用數字訂出每日目標，12 週陪你一起執行。",
    "steps": [
      {
        "label": "第 1 步",
        "title": "免設備 AI 體組成分析",
        "body": "只要回答身高、體重、年齡和生活習慣問題，就能推估體組成。在自家研究（70 人）中，與 InBody 測量值相比，推估準確度達 92.9%。",
        "items": [
          "HAVIT 分數・基礎代謝率",
          "肌肉與脂肪分析・體組成類型",
          "肥胖度・腹部脂肪率・內臟脂肪",
          "身體藍圖：健康目標體重・腰高比・安全減重速度",
          "6 階段習慣分析"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — 免設備 AI 體組成分析"
          }
        ]
      },
      {
        "label": "第 2 步",
        "title": "用數字開出 11 項每日目標",
        "body": "依分析結果，把每天要達成的目標訂成明確數字。目標每週會依你的體重變化重新調整。",
        "items": [
          "攝取熱量・蛋白質・碳水化合物・脂肪・膳食纖維",
          "消耗熱量・步數",
          "睡眠時數・飲水量",
          "量體重頻率・目標 BMI"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 用數字開出 11 項每日目標"
          }
        ]
      },
      {
        "label": "第 3 步",
        "title": "每日執行 × AI 教練",
        "body": "處方要做到才有意義。我們讓記錄變簡單，讓下一步變清楚。",
        "items": [
          "拍一張照片就能記錄餐點",
          "AI 教練 HAVI 解讀你的紀錄，建議今天該做的一件事",
          "依分析結果，提供 126+ 個類別的個人化處方",
          "不只飲食，連心態也一起照顧：以 CBT 為基礎的教練指導"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — 每日執行 × AI 教練"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — 每日執行 × AI 教練"
          }
        ]
      },
      {
        "label": "一站式",
        "title": "一個 App 搞定所有管理",
        "body": "不必在多個 App 之間切換。身體紀錄集中在同一處，AI 教練才能看懂整體變化。",
        "items": [
          "飲食・飲水・運動・步數",
          "睡眠・體重・體組成趨勢",
          "生理週期・心情・每日打卡",
          "GLP-1 用藥紀錄・提醒",
          "冥想引導・運動影片・跑步教練",
          "挑戰任務與虛擬角色，像玩遊戲一樣持續下去"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — 一個 App 搞定所有管理"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — 一個 App 搞定所有管理"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — 一個 App 搞定所有管理"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — 一個 App 搞定所有管理"
          }
        ]
      }
    ],
    "proofTitle": "乙支大學 12 週臨床結果",
    "proof": [
      {
        "value": "3.9 倍",
        "label": "體重減少 5% 以上的人數比例（31.7% vs 8.1%）"
      },
      {
        "value": "83%",
        "label": "體脂率下降的人數比例（對照組 49%）"
      }
    ],
    "proofNote": "分析對象為 2026 年 6～8 月期間，具備第 1 週與第 12 週 InBody 結果的 78 人（HAVIT 組 41 人、對照組 37 人）。非盲性研究。",
    "sectionButton": "免費開始我的分析",
    "disclaimer": "HAVIT 是健康生活 App，並非醫療器材；體組成結果為推估值。",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — 計算機給你平均值，HAVIT 給你專屬處方"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — 計算機給你平均值，HAVIT 給你專屬處方"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — 計算機給你平均值，HAVIT 給你專屬處方"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — 計算機給你平均值，HAVIT 給你專屬處方"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — 計算機給你平均值，HAVIT 給你專屬處方"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — 計算機給你平均值，HAVIT 給你專屬處方"
      }
    }
  },
  "es": {
    "bannerTitle": "Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo",
    "banner": {
      "bmr": {
        "limit": "Esta fórmula solo usa estatura, peso y edad. Dos personas con el mismo peso pueden tener metabolismos basales distintos si una tiene más músculo.",
        "havit": "HAVIT primero estima tu músculo, grasa corporal y grasa visceral con un diagnóstico de composición corporal con IA. Con ese resultado te fija metas diarias exactas de calorías consumidas y quemadas."
      },
      "protein": {
        "limit": "Esta calculadora solo considera tu peso y tu meta. Lo que realmente necesitas depende de tu masa muscular y del ritmo al que bajas de peso.",
        "havit": "HAVIT usa tu diagnóstico de composición corporal para fijarte metas diarias en gramos de proteína, carbohidratos, grasa y fibra. Registras cada comida con una sola foto y ves cuánto de tu meta llevas cubierto."
      },
      "water": {
        "limit": "Esta calculadora sirve solo para hoy. Cuando cambia tu peso, también cambia lo que necesitas.",
        "havit": "HAVIT te fija una meta de hidratación según tu diagnóstico y la ajusta cada semana a tu peso. La gestionas junto con otras 10 metas diarias, como pasos y sueño."
      },
      "caffeine": {
        "limit": "La vida media de la cafeína puede variar más del doble de una persona a otra. Las 5 horas promedio son solo un punto de partida.",
        "havit": "HAVIT te fija una meta de horas de sueño. HAVI, tu coach con IA, lee tu registro de sueño junto con el café y las comidas de ese día y te dice qué ajustar en tu caso."
      },
      "sleep-cycle": {
        "limit": "Esta calculadora solo te dice a qué hora dormirte. Para controlar tu peso importa más cuánto duermes de verdad.",
        "havit": "HAVIT te fija una meta de horas de sueño según tu diagnóstico. Lee tu registro de sueño junto con tus comidas y la evolución de tu peso, y te propone una sola acción para hoy."
      },
      "exercise-calories": {
        "limit": "Las calorías que quemas cobran sentido cuando las comparas con las que comes.",
        "havit": "HAVIT te fija, según tu diagnóstico, metas diarias de calorías quemadas, pasos y calorías consumidas. Cada día ves si tu ejercicio y tus pasos alcanzaron la meta."
      }
    },
    "bannerButton": "Diagnóstico corporal gratis",
    "sectionKicker": "HAVIT, el coach de pérdida de peso con IA creado por expertos de Juvis Diet, una de las clínicas de pérdida de peso líderes de Corea",
    "sectionTitle": "Diagnostica, receta metas exactas y te acompaña cada día",
    "sectionIntro": "Una calculadora le aplica a todo el mundo la misma fórmula promedio. HAVIT primero diagnostica tu cuerpo, con ese resultado fija tus metas diarias en cifras exactas y te acompaña a cumplirlas durante 12 semanas.",
    "steps": [
      {
        "label": "Paso 1",
        "title": "Diagnóstico de composición corporal con IA, sin equipos",
        "body": "Estima tu composición corporal con tu estatura, peso, edad y unas preguntas sobre tus hábitos. En un estudio propio (70 personas), la precisión de la estimación fue del 92.9% frente a las mediciones de InBody.",
        "items": [
          "Puntaje HAVIT y tasa metabólica basal",
          "Análisis músculo-grasa y tipo de composición corporal",
          "Grado de obesidad, porcentaje de grasa abdominal y grasa visceral",
          "Plano corporal: peso meta saludable, relación cintura-estatura y ritmo seguro para bajar de peso",
          "Análisis de hábitos en 6 niveles"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — Diagnóstico de composición corporal con IA, sin equipos"
          }
        ]
      },
      {
        "label": "Paso 2",
        "title": "11 metas diarias en cifras exactas",
        "body": "Tu diagnóstico define las metas que cumplirás cada día, con números precisos. Cada semana se ajustan según cómo cambia tu peso.",
        "items": [
          "Calorías consumidas, proteína, carbohidratos, grasa y fibra",
          "Calorías quemadas y pasos",
          "Horas de sueño e hidratación",
          "Frecuencia de pesaje e IMC meta"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 metas diarias en cifras exactas"
          }
        ]
      },
      {
        "label": "Paso 3",
        "title": "Acción diaria y coaching con IA",
        "body": "Un plan solo sirve si lo cumples. Por eso registrar es fácil y el siguiente paso siempre está claro.",
        "items": [
          "Registra tus comidas con una sola foto",
          "HAVI, tu coach con IA, lee tus registros y te propone una acción para hoy",
          "Recomendaciones personalizadas en 126+ categorías según tu diagnóstico",
          "Coaching basado en TCC (CBT): no solo tu alimentación, también tu mentalidad"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — Acción diaria y coaching con IA"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — Acción diaria y coaching con IA"
          }
        ]
      },
      {
        "label": "Todo en uno",
        "title": "Todo en una sola app",
        "body": "Olvídate de saltar entre apps. Cuando todos los datos de tu cuerpo están en un solo lugar, tu coach con IA puede ver el panorama completo.",
        "items": [
          "Comidas, hidratación, ejercicio y pasos",
          "Evolución de sueño, peso y composición corporal",
          "Ciclo menstrual, estado de ánimo y check-in diario",
          "Registro y recordatorios de dosis de GLP-1",
          "Meditaciones guiadas, videos de ejercicio y coach de running",
          "Retos y avatar para mantener la constancia como en un juego"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — Todo en una sola app"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — Todo en una sola app"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — Todo en una sola app"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — Todo en una sola app"
          }
        ]
      }
    ],
    "proofTitle": "Resultados clínicos de 12 semanas con la Universidad Eulji",
    "proof": [
      {
        "value": "3.9x",
        "label": "más personas bajaron 5% o más de su peso (31.7% vs 8.1%)"
      },
      {
        "value": "83%",
        "label": "de las personas redujo su porcentaje de grasa corporal (grupo control: 49%)"
      }
    ],
    "proofNote": "Junio–agosto de 2026. Análisis de 78 personas con resultados de InBody en la semana 1 y la semana 12 (41 HAVIT, 37 grupo control). Estudio no ciego.",
    "sectionButton": "Haz tu diagnóstico gratis",
    "disclaimer": "HAVIT es una app de bienestar, no un dispositivo médico. Los resultados de composición corporal son estimaciones.",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — Una calculadora te da un promedio. HAVIT te da un plan hecho para tu cuerpo"
      }
    }
  },
  "pt-br": {
    "bannerTitle": "Calculadoras dão médias. O HAVIT prescreve para o seu corpo",
    "banner": {
      "bmr": {
        "limit": "Esta fórmula considera só altura, peso e idade. Com o mesmo peso, quem tem mais músculo tem outro metabolismo basal.",
        "havit": "O HAVIT estima primeiro seus músculos, gordura corporal e gordura visceral com um diagnóstico de composição corporal por IA. Com esse resultado, prescreve em números suas metas diárias de calorias consumidas e gastas."
      },
      "protein": {
        "limit": "Esta calculadora considera só seu peso e sua meta. A quantidade de que você precisa de verdade depende da sua massa muscular e do ritmo de perda de peso.",
        "havit": "O HAVIT usa seu diagnóstico de composição corporal para prescrever metas diárias de proteína, carboidratos, gorduras e fibras, em gramas. E mostra quanto de cada meta suas refeições já cobriram. Para registrar, basta uma foto."
      },
      "water": {
        "limit": "Esta calculadora vale só para hoje. Quando o seu peso muda, a quantidade de água também muda.",
        "havit": "O HAVIT prescreve sua meta de água a partir do diagnóstico e a ajusta toda semana conforme o seu peso. Ela fica junto com outras 10 metas diárias, como passos e sono."
      },
      "caffeine": {
        "limit": "A meia-vida da cafeína pode variar mais que o dobro de uma pessoa para outra. A média de 5 horas é só um ponto de partida.",
        "havit": "O HAVIT prescreve sua meta de horas de sono. A HAVI, sua coach de IA, analisa seus registros de sono junto com o café e as refeições do dia e sugere ajustes feitos para você."
      },
      "sleep-cycle": {
        "limit": "Esta calculadora só diz a hora de dormir. Para controlar o peso, o que mais importa é quanto você realmente dormiu.",
        "havit": "O HAVIT prescreve sua meta de horas de sono a partir do diagnóstico. Depois analisa seus registros de sono junto com suas refeições e a evolução do seu peso, e indica uma única ação para hoje."
      },
      "exercise-calories": {
        "limit": "As calorias gastas só fazem sentido quando comparadas com as calorias consumidas.",
        "havit": "O HAVIT usa seu diagnóstico para prescrever juntas as metas diárias de calorias gastas, passos e calorias consumidas. Todo dia, mostra se seus treinos e passos bateram a meta."
      }
    },
    "bannerButton": "Fazer diagnóstico grátis",
    "sectionKicker": "HAVIT: coach de emagrecimento com IA criado por especialistas da Juvis Diet, uma das principais clínicas de emagrecimento da Coreia",
    "sectionTitle": "Diagnóstico, prescrição em números e coaching diário",
    "sectionIntro": "Calculadoras aplicam a mesma fórmula média para todo mundo. O HAVIT primeiro diagnostica o seu corpo, define suas metas diárias em números a partir do resultado e acompanha você por 12 semanas.",
    "steps": [
      {
        "label": "Etapa 1",
        "title": "Diagnóstico de composição corporal por IA, sem aparelhos",
        "body": "Estimamos sua composição corporal só com altura, peso, idade e algumas perguntas sobre seus hábitos. Em estudo próprio (70 pessoas), a precisão da estimativa foi de 92.9% em relação às medições do InBody.",
        "items": [
          "Pontuação HAVIT e taxa metabólica basal",
          "Análise músculo-gordura e tipo de composição corporal",
          "Grau de obesidade, gordura abdominal e gordura visceral",
          "Plano do corpo: peso-alvo saudável, relação cintura-altura e ritmo seguro de perda de peso",
          "Análise de hábitos em 6 etapas"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — Diagnóstico de composição corporal por IA, sem aparelhos"
          }
        ]
      },
      {
        "label": "Etapa 2",
        "title": "11 metas diárias prescritas em números",
        "body": "A partir do diagnóstico, definimos números exatos para você seguir todo dia. Toda semana, as metas são reajustadas conforme a evolução do seu peso.",
        "items": [
          "Calorias consumidas, proteínas, carboidratos, gorduras e fibras",
          "Calorias gastas e passos",
          "Horas de sono e água",
          "Frequência de pesagem e IMC-alvo"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 metas diárias prescritas em números"
          }
        ]
      },
      {
        "label": "Etapa 3",
        "title": "Ação diária com coaching por IA",
        "body": "Uma prescrição só funciona se for seguida. Por isso, registrar é fácil e o próximo passo fica sempre claro.",
        "items": [
          "Registre refeições com uma foto",
          "A HAVI, sua coach de IA, analisa seus registros e sugere uma ação para hoje",
          "Prescrições personalizadas em 126+ categorias, com base no seu diagnóstico",
          "CBT-based coaching: não só para a dieta, mas também para o mindset"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — Ação diária com coaching por IA"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — Ação diária com coaching por IA"
          }
        ]
      },
      {
        "label": "Tudo em um",
        "title": "Tudo em um só app",
        "body": "Nada de ficar pulando entre apps. Com todos os dados do seu corpo em um só lugar, a coach de IA consegue entender a sua evolução.",
        "items": [
          "Refeições, água, exercícios e passos",
          "Evolução do sono, do peso e da composição corporal",
          "Ciclo menstrual, humor e check-in diário",
          "Registro e lembretes da medicação GLP-1",
          "Meditação guiada, vídeos de treino e coach de corrida",
          "Desafios e avatares para manter o ritmo como num jogo"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — Tudo em um só app"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — Tudo em um só app"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — Tudo em um só app"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — Tudo em um só app"
          }
        ]
      }
    ],
    "proofTitle": "Resultados do estudo clínico de 12 semanas da Eulji University",
    "proof": [
      {
        "value": "3.9x",
        "label": "mais pessoas perderam 5% ou mais do peso (31.7% vs 8.1%)"
      },
      {
        "value": "83%",
        "label": "das pessoas reduziram o percentual de gordura corporal (grupo controle: 49%)"
      }
    ],
    "proofNote": "Análise de 78 pessoas (41 HAVIT, 37 grupo controle) com resultados de InBody na semana 1 e na semana 12, de junho a agosto de 2026. Estudo não cego.",
    "sectionButton": "Começar diagnóstico grátis",
    "disclaimer": "O HAVIT é um app de bem-estar, não um dispositivo médico. Os resultados de composição corporal são estimativas.",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — Calculadoras dão médias. O HAVIT prescreve para o seu corpo"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — Calculadoras dão médias. O HAVIT prescreve para o seu corpo"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — Calculadoras dão médias. O HAVIT prescreve para o seu corpo"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Calculadoras dão médias. O HAVIT prescreve para o seu corpo"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Calculadoras dão médias. O HAVIT prescreve para o seu corpo"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — Calculadoras dão médias. O HAVIT prescreve para o seu corpo"
      }
    }
  },
  "id": {
    "bannerTitle": "Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu",
    "banner": {
      "bmr": {
        "limit": "Rumus ini hanya melihat tinggi, berat, dan usia. Dengan berat yang sama, BMR bisa berbeda jika massa ototmu lebih banyak.",
        "havit": "HAVIT memperkirakan otot, lemak tubuh, dan lemak visceral lewat analisis komposisi tubuh AI, lalu menetapkan target kalori masuk dan kalori terbakar harianmu dalam angka."
      },
      "protein": {
        "limit": "Kalkulator ini hanya melihat berat badan dan target. Kebutuhan sebenarnya bergantung pada massa otot dan kecepatan penurunan berat badan.",
        "havit": "Dari hasil analisis komposisi tubuh, HAVIT menetapkan target harian protein, karbohidrat, lemak, dan serat dalam gram, lalu menunjukkan seberapa jauh makanan yang kamu catat lewat satu foto sudah memenuhi target."
      },
      "water": {
        "limit": "Kalkulator ini hanya untuk hari ini. Saat berat badan berubah, kebutuhan airmu juga berubah.",
        "havit": "HAVIT menetapkan target air dari hasil analisismu dan menyesuaikannya ulang setiap minggu sesuai berat badanmu. Dikelola bersama 10 target harian lainnya, seperti langkah dan tidur."
      },
      "caffeine": {
        "limit": "Waktu paruh kafein bisa berbeda lebih dari 2 kali lipat antarorang. Rata-rata 5 jam hanyalah titik awal.",
        "havit": "HAVIT menetapkan target waktu tidurmu, lalu coach AI HAVI membaca catatan tidur bersama catatan kopi dan makan hari itu untuk memberi penyesuaian yang pas untukmu."
      },
      "sleep-cycle": {
        "limit": "Kalkulator ini hanya memberi tahu jam tidur. Untuk mengelola berat badan, yang lebih penting adalah berapa lama kamu benar-benar tidur.",
        "havit": "HAVIT menetapkan target waktu tidur dari hasil analisismu, lalu membaca catatan tidur bersama pola makan dan berat badan untuk memberi satu hal yang perlu kamu lakukan hari ini."
      },
      "exercise-calories": {
        "limit": "Kalori yang terbakar baru bermakna jika dilihat bersama kalori yang kamu makan.",
        "havit": "Dari hasil analisismu, HAVIT menetapkan target kalori terbakar, jumlah langkah, dan kalori masuk harian sekaligus, lalu setiap hari menunjukkan apakah catatan olahraga dan langkahmu sudah memenuhi target."
      }
    },
    "bannerButton": "Cek komposisi tubuh gratis",
    "sectionKicker": "HAVIT: coach diet AI dari para ahli Juvis Diet, salah satu klinik penurunan berat badan terkemuka di Korea",
    "sectionTitle": "Analisis, target dalam angka, coaching setiap hari",
    "sectionIntro": "Kalkulator memakai rumus rata-rata yang sama untuk semua orang. HAVIT menganalisis tubuhmu lebih dulu, menetapkan target harian dalam angka dari hasilnya, lalu menjalankannya bersamamu selama 12 minggu.",
    "steps": [
      {
        "label": "Langkah 1",
        "title": "Analisis komposisi tubuh AI tanpa alat",
        "body": "Cukup isi tinggi, berat, usia, dan beberapa pertanyaan gaya hidup untuk memperkirakan komposisi tubuhmu. Dalam studi internal kami (70 orang), akurasi estimasinya 92,9% dibandingkan hasil pengukuran InBody.",
        "items": [
          "Skor HAVIT & laju metabolisme basal",
          "Analisis otot-lemak & tipe komposisi tubuh",
          "Tingkat obesitas, persentase lemak perut & lemak visceral",
          "Cetak biru tubuh: berat badan target sehat, rasio pinggang-tinggi, kecepatan turun berat yang aman",
          "Analisis kebiasaan 6 tahap"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — Analisis komposisi tubuh AI tanpa alat"
          }
        ]
      },
      {
        "label": "Langkah 2",
        "title": "11 target harian dalam angka",
        "body": "Dari hasil analisis, target harianmu ditetapkan dalam angka yang jelas. Target disesuaikan ulang setiap minggu mengikuti perubahan berat badanmu.",
        "items": [
          "Kalori masuk, protein, karbohidrat, lemak, serat",
          "Kalori terbakar & jumlah langkah",
          "Durasi tidur & asupan air",
          "Frekuensi timbang badan & BMI target"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 target harian dalam angka"
          }
        ]
      },
      {
        "label": "Langkah 3",
        "title": "Aksi harian & coaching AI",
        "body": "Target baru berarti kalau dijalankan. Mencatat jadi mudah, langkah berikutnya jadi jelas.",
        "items": [
          "Catat makanan cukup dengan satu foto",
          "Coach AI HAVI membaca catatanmu dan menyarankan satu hal untuk hari ini",
          "Rekomendasi personal di 126+ kategori berdasarkan hasil analisis",
          "Bukan cuma pola makan, tapi juga pola pikir — coaching berbasis CBT"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — Aksi harian & coaching AI"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — Aksi harian & coaching AI"
          }
        ]
      },
      {
        "label": "All-in-one",
        "title": "Semua dalam satu aplikasi",
        "body": "Tak perlu bolak-balik banyak aplikasi. Saat semua catatan tentang tubuhmu ada di satu tempat, coach AI bisa membaca polanya.",
        "items": [
          "Makan, air, olahraga, langkah",
          "Tren tidur, berat badan & komposisi tubuh",
          "Siklus menstruasi, suasana hati & check-in harian",
          "Catatan & pengingat obat GLP-1",
          "Meditasi terpandu, video olahraga & coach lari",
          "Tetap konsisten lewat tantangan & avatar ala game"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — Semua dalam satu aplikasi"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — Semua dalam satu aplikasi"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — Semua dalam satu aplikasi"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — Semua dalam satu aplikasi"
          }
        ]
      }
    ],
    "proofTitle": "Hasil uji klinis 12 minggu Universitas Eulji",
    "proof": [
      {
        "value": "3,9x",
        "label": "Proporsi orang yang turun berat badan 5% atau lebih (31,7% vs 8,1%)"
      },
      {
        "value": "83%",
        "label": "Proporsi orang yang persentase lemak tubuhnya turun (kelompok kontrol 49%)"
      }
    ],
    "proofNote": "Analisis 78 orang (41 HAVIT, 37 kontrol) dengan hasil InBody minggu ke-1 dan ke-12, Juni–Agustus 2026. Studi non-blinded.",
    "sectionButton": "Mulai analisis gratis",
    "disclaimer": "HAVIT adalah aplikasi wellness, bukan alat kesehatan. Hasil komposisi tubuh merupakan estimasi.",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — Kalkulator pakai rata-rata, HAVIT menyesuaikan dengan tubuhmu"
      }
    }
  },
  "de": {
    "bannerTitle": "Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper.",
    "banner": {
      "bmr": {
        "limit": "Diese Formel berücksichtigt nur Größe, Gewicht und Alter. Doch bei gleichem Gewicht verändert mehr Muskelmasse deinen Grundumsatz.",
        "havit": "HAVIT schätzt per KI-Körperanalyse zuerst Muskeln, Körperfett und viszerales Fett und legt daraus klare Tagesziele für Kalorienaufnahme und -verbrauch fest."
      },
      "protein": {
        "limit": "Dieser Rechner berücksichtigt nur Gewicht und Ziel. Wie viel du wirklich brauchst, hängt von deiner Muskelmasse und deinem Abnehmtempo ab.",
        "havit": "HAVIT legt anhand deiner Körperanalyse Tagesziele für Protein, Kohlenhydrate, Fett und Ballaststoffe in Gramm fest und zeigt dir, wie viel davon deine per Foto erfasste Mahlzeit schon abdeckt."
      },
      "water": {
        "limit": "Dieser Rechner gilt nur für heute. Ändert sich dein Gewicht, ändert sich auch dein Bedarf.",
        "havit": "HAVIT legt dein Trinkziel anhand der Analyse fest und passt es jede Woche an dein Gewicht an, zusammen mit 10 weiteren Tageszielen wie Schritten und Schlaf."
      },
      "caffeine": {
        "limit": "Die Halbwertszeit unterscheidet sich von Mensch zu Mensch um mehr als das Doppelte. Der Durchschnitt von 5 Stunden ist nur ein Ausgangspunkt.",
        "havit": "HAVIT legt dein Schlafziel fest. KI-Coach HAVI liest deine Schlafdaten zusammen mit Kaffee und Mahlzeiten des Tages und sagt dir, was du gezielt anpassen kannst."
      },
      "sleep-cycle": {
        "limit": "Dieser Rechner nennt dir nur die Uhrzeit zum Einschlafen. Fürs Abnehmen zählt mehr, wie lange du tatsächlich schläfst.",
        "havit": "HAVIT legt anhand der Analyse dein Schlafziel fest, liest deine Schlafdaten zusammen mit Ernährung und Gewichtsverlauf und gibt dir eine konkrete Aufgabe für heute."
      },
      "exercise-calories": {
        "limit": "Verbrannte Kalorien sind erst aussagekräftig, wenn du sie mit den aufgenommenen vergleichst.",
        "havit": "HAVIT legt anhand der Analyse Tagesziele für Kalorienverbrauch, Schritte und Kalorienaufnahme fest und zeigt dir täglich, ob deine Trainings- und Schrittdaten das Ziel erreichen."
      }
    },
    "bannerButton": "Gratis Körperanalyse starten",
    "sectionKicker": "HAVIT ist der KI-Abnehmcoach von Experten von Juvis Diet, einer der führenden Abnehmkliniken Koreas",
    "sectionTitle": "Analysieren, klare Zahlen setzen, täglich coachen",
    "sectionIntro": "Rechner nutzen für alle dieselbe Durchschnittsformel. HAVIT analysiert zuerst deinen Körper, legt daraus konkrete Tagesziele fest und setzt sie 12 Wochen lang mit dir um.",
    "steps": [
      {
        "label": "Schritt 1",
        "title": "KI-Körperanalyse ohne Geräte",
        "body": "Größe, Gewicht, Alter und ein paar Fragen zu deinem Alltag reichen, um deine Körperzusammensetzung zu schätzen. In unserer eigenen Studie (70 Personen) lag die Genauigkeit im Vergleich zu InBody-Messwerten bei 92,9 %.",
        "items": [
          "HAVIT-Score & Grundumsatz",
          "Muskel-Fett-Analyse & Körpertyp",
          "Gewichtsstatus, Bauchfettanteil & viszerales Fett",
          "Körper-Bauplan: gesundes Zielgewicht, Taille-Größe-Verhältnis & sicheres Abnehmtempo",
          "Gewohnheitsanalyse in 6 Stufen"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — KI-Körperanalyse ohne Geräte"
          }
        ]
      },
      {
        "label": "Schritt 2",
        "title": "11 Tagesziele in klaren Zahlen",
        "body": "Aus deiner Analyse ergeben sich präzise Zahlen für jeden Tag. Jede Woche werden die Ziele an deine Gewichtsentwicklung angepasst.",
        "items": [
          "Kalorienaufnahme, Protein, Kohlenhydrate, Fett & Ballaststoffe",
          "Kalorienverbrauch & Schritte",
          "Schlafdauer & Wasser",
          "Wiegehäufigkeit & Ziel-BMI"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 Tagesziele in klaren Zahlen"
          }
        ]
      },
      {
        "label": "Schritt 3",
        "title": "Tägliche Umsetzung mit KI-Coaching",
        "body": "Ein Plan wirkt nur, wenn du ihn umsetzt. Deshalb ist das Erfassen einfach und der nächste Schritt immer klar.",
        "items": [
          "Mahlzeiten mit einem Foto erfassen",
          "KI-Coach HAVI liest deine Daten und schlägt dir eine Aufgabe für heute vor",
          "Persönliche Empfehlungen in 126+ Kategorien auf Basis deiner Analyse",
          "Nicht nur Ernährung, auch Mindset: CBT-basiertes Coaching"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — Tägliche Umsetzung mit KI-Coaching"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — Tägliche Umsetzung mit KI-Coaching"
          }
        ]
      },
      {
        "label": "All-in-one",
        "title": "Alles in einer App",
        "body": "Schluss mit dem Wechseln zwischen Apps. Erst wenn alle Daten zu deinem Körper an einem Ort sind, erkennt der KI-Coach die Zusammenhänge.",
        "items": [
          "Mahlzeiten, Wasser, Training & Schritte",
          "Verlauf von Schlaf, Gewicht & Körperzusammensetzung",
          "Zyklus, Stimmung & täglicher Check-in",
          "GLP-1-Medikation: Protokoll & Erinnerungen",
          "Geführte Meditationen, Workout-Videos & Lauf-Coach",
          "Challenges & Avatar: dranbleiben wie im Spiel"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — Alles in einer App"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — Alles in einer App"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — Alles in einer App"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — Alles in einer App"
          }
        ]
      }
    ],
    "proofTitle": "Klinische 12-Wochen-Studie der Eulji University",
    "proof": [
      {
        "value": "3,9×",
        "label": "Anteil der Teilnehmenden mit mindestens 5 % Gewichtsverlust (31,7 % vs. 8,1 %)"
      },
      {
        "value": "83 %",
        "label": "Anteil der Teilnehmenden mit gesunkenem Körperfettanteil (Kontrollgruppe: 49 %)"
      }
    ],
    "proofNote": "Juni–August 2026: Auswertung von 78 Personen mit InBody-Daten aus Woche 1 und Woche 12 (41 HAVIT, 37 Kontrollgruppe). Nicht verblindete Studie.",
    "sectionButton": "Jetzt kostenlos analysieren",
    "disclaimer": "HAVIT ist eine Wellness-App und kein Medizinprodukt. Die Ergebnisse zur Körperzusammensetzung sind Schätzwerte.",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper."
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper."
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper."
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper."
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper."
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — Der Rechner kennt den Durchschnitt. HAVIT kennt deinen Körper."
      }
    }
  },
  "fr": {
    "bannerTitle": "Le calculateur donne une moyenne, HAVIT s'adapte à votre corps",
    "banner": {
      "bmr": {
        "limit": "Cette formule ne tient compte que de la taille, du poids et de l'âge. À poids égal, plus de muscle change votre métabolisme de base.",
        "havit": "HAVIT estime d'abord vos muscles, votre masse grasse et votre graisse viscérale grâce à un diagnostic IA de composition corporelle, puis fixe en chiffres vos objectifs quotidiens de calories consommées et dépensées."
      },
      "protein": {
        "limit": "Ce calculateur ne regarde que votre poids et votre objectif. Vos vrais besoins dépendent de votre masse musculaire et de votre rythme de perte de poids.",
        "havit": "HAVIT fixe au gramme près vos objectifs quotidiens de protéines, glucides, lipides et fibres d'après votre diagnostic, et vous montre ce que chaque repas, enregistré en une photo, couvre de vos objectifs."
      },
      "water": {
        "limit": "Ce calculateur se base sur aujourd'hui. Quand votre poids change, vos besoins changent aussi.",
        "havit": "HAVIT fixe votre objectif d'hydratation d'après votre diagnostic et le réajuste chaque semaine selon votre poids. Il le suit avec 10 autres objectifs quotidiens, comme les pas et le sommeil."
      },
      "caffeine": {
        "limit": "La demi-vie de la caféine varie de plus du simple au double d'une personne à l'autre. La moyenne de 5 heures n'est qu'un point de départ.",
        "havit": "HAVIT fixe votre objectif de sommeil, puis HAVI, votre coach IA, croise vos nuits avec le café et les repas de la journée pour vous suggérer les bons ajustements."
      },
      "sleep-cycle": {
        "limit": "Ce calculateur vous donne seulement l'heure du coucher. Pour gérer votre poids, c'est surtout la durée réelle de sommeil qui compte.",
        "havit": "HAVIT fixe votre objectif de sommeil d'après votre diagnostic, croise vos nuits avec vos repas et l'évolution de votre poids, et vous propose une seule action pour aujourd'hui."
      },
      "exercise-calories": {
        "limit": "Les calories brûlées n'ont de sens que si on les compare aux calories consommées.",
        "havit": "HAVIT fixe ensemble vos objectifs de calories dépensées, de pas et de calories consommées d'après votre diagnostic, et vous montre chaque jour si votre activité et vos pas les atteignent."
      }
    },
    "bannerButton": "Diagnostic corporel gratuit",
    "sectionKicker": "HAVIT, le coach minceur IA conçu par les experts de Juvis Diet, l'une des principales cliniques minceur de Corée",
    "sectionTitle": "Diagnostiquer, prescrire en chiffres, coacher chaque jour",
    "sectionIntro": "Un calculateur applique la même formule moyenne à tout le monde. HAVIT diagnostique d'abord votre corps, en tire des objectifs quotidiens chiffrés et vous accompagne pendant 12 semaines pour les atteindre.",
    "steps": [
      {
        "label": "Étape 1",
        "title": "Diagnostic IA de composition corporelle, sans appareil",
        "body": "Quelques questions sur votre taille, votre poids, votre âge et votre mode de vie suffisent pour estimer votre composition corporelle. Dans notre étude interne (70 personnes), l'estimation était précise à 92.9% par rapport aux mesures InBody.",
        "items": [
          "Score HAVIT et métabolisme de base",
          "Analyse muscle-graisse et type de composition corporelle",
          "Niveau de surpoids, taux de graisse abdominale, graisse viscérale",
          "Plan corporel : poids santé cible, rapport tour de taille/taille, rythme de perte de poids sûr",
          "Analyse de vos habitudes en 6 étapes"
        ],
        "shots": [
          {
            "file": "feature-body-insights.webp",
            "alt": "HAVIT — Diagnostic IA de composition corporelle, sans appareil"
          }
        ]
      },
      {
        "label": "Étape 2",
        "title": "11 objectifs quotidiens, en chiffres",
        "body": "Votre diagnostic définit des objectifs précis à tenir chaque jour. Ils sont réajustés chaque semaine selon l'évolution de votre poids.",
        "items": [
          "Calories consommées, protéines, glucides, lipides, fibres",
          "Calories dépensées, nombre de pas",
          "Durée de sommeil, hydratation",
          "Fréquence de pesée, IMC cible"
        ],
        "shots": [
          {
            "file": "home-targets.webp",
            "alt": "HAVIT — 11 objectifs quotidiens, en chiffres"
          }
        ]
      },
      {
        "label": "Étape 3",
        "title": "Passer à l'action, avec un coaching IA quotidien",
        "body": "Une prescription n'a de valeur que si on la suit. Le suivi devient simple, et la prochaine étape évidente.",
        "items": [
          "Vos repas enregistrés en une seule photo",
          "HAVI, votre coach IA, lit vos données et vous propose une action pour aujourd'hui",
          "Des recommandations sur mesure dans 126+ catégories, basées sur votre diagnostic",
          "Un coaching basé sur la CBT, pour l'alimentation comme pour le mental"
        ],
        "shots": [
          {
            "file": "feature-nutrition.webp",
            "alt": "HAVIT — Passer à l'action, avec un coaching IA quotidien"
          },
          {
            "file": "feature-ai-coach.webp",
            "alt": "HAVIT — Passer à l'action, avec un coaching IA quotidien"
          }
        ]
      },
      {
        "label": "Tout-en-un",
        "title": "Tout gérer dans une seule app",
        "body": "Fini de jongler entre plusieurs apps. Quand toutes vos données sont au même endroit, votre coach IA peut suivre leur évolution.",
        "items": [
          "Repas, hydratation, exercice, pas",
          "Sommeil, poids, évolution de la composition corporelle",
          "Cycle menstruel, humeur, check-in quotidien",
          "Suivi et rappels des prises de GLP-1",
          "Méditations guidées, vidéos d'exercice, coach de course",
          "Défis et avatar pour tenir dans la durée, comme un jeu"
        ],
        "shots": [
          {
            "file": "feature-daily-check-in.webp",
            "alt": "HAVIT — Tout gérer dans une seule app"
          },
          {
            "file": "feature-daily-missions.webp",
            "alt": "HAVIT — Tout gérer dans une seule app"
          },
          {
            "file": "feature-running-coach.webp",
            "alt": "HAVIT — Tout gérer dans une seule app"
          },
          {
            "file": "feature-track-everything.webp",
            "alt": "HAVIT — Tout gérer dans une seule app"
          }
        ]
      }
    ],
    "proofTitle": "Résultats de l'étude clinique de 12 semaines de l'Université Eulji",
    "proof": [
      {
        "value": "3.9x",
        "label": "Personnes ayant perdu 5% ou plus de leur poids (31.7% vs 8.1%)"
      },
      {
        "value": "83%",
        "label": "Personnes dont le taux de masse grasse a baissé (groupe témoin : 49%)"
      }
    ],
    "proofNote": "Juin–août 2026 : analyse de 78 personnes (41 HAVIT, 37 groupe témoin) disposant de résultats InBody en semaine 1 et en semaine 12. Étude non aveugle.",
    "sectionButton": "Mon diagnostic gratuit",
    "disclaimer": "HAVIT est une app de bien-être, pas un dispositif médical. Les résultats de composition corporelle sont des estimations.",
    "bannerShot": {
      "bmr": {
        "file": "feature-body-insights.webp",
        "alt": "HAVIT — Le calculateur donne une moyenne, HAVIT s'adapte à votre corps"
      },
      "protein": {
        "file": "feature-nutrition.webp",
        "alt": "HAVIT — Le calculateur donne une moyenne, HAVIT s'adapte à votre corps"
      },
      "water": {
        "file": "feature-track-everything.webp",
        "alt": "HAVIT — Le calculateur donne une moyenne, HAVIT s'adapte à votre corps"
      },
      "caffeine": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Le calculateur donne une moyenne, HAVIT s'adapte à votre corps"
      },
      "sleep-cycle": {
        "file": "feature-ai-coach.webp",
        "alt": "HAVIT — Le calculateur donne une moyenne, HAVIT s'adapte à votre corps"
      },
      "exercise-calories": {
        "file": "feature-daily-missions.webp",
        "alt": "HAVIT — Le calculateur donne une moyenne, HAVIT s'adapte à votre corps"
      }
    }
  }
};
