/**
 * i18n labels for Wellness Tools — all 10 route languages.
 */

import type { ActivityLevel, ProteinGoal, Climate, ExerciseType } from './calculators';

export type ToolLang = 'ko' | 'en' | 'ja' | 'zh' | 'zh-tw' | 'es' | 'pt-br' | 'id' | 'de' | 'fr';

const TOOL_LANGS: readonly ToolLang[] = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'];

/** Map a route lang to a ToolLang. Every served route lang has native tool
 *  labels; 'en' is only returned for unknown segments, which the tool pages
 *  reject with notFound() before rendering. */
export function toToolLang(lang: string): ToolLang {
  return (TOOL_LANGS as readonly string[]).includes(lang) ? (lang as ToolLang) : 'en';
}

/** Optional SERP overrides. When set, <title> uses metaTitle (+ " — HAVIT",
 *  kept ≤60 chars) and meta description uses metaDescription (≤155 chars);
 *  otherwise pageTitle / pageIntro are used as before. */
export interface ToolMeta {
  metaTitle?: string;
  metaDescription?: string;
}

/** Shared: HAVIT app cross-promo on every calculator. */
export const APP_CTA: Record<ToolLang, { title: string; body: string; button: string }> = {
  ko: { title: '📱 더 정확한 측정은 HAVIT 앱', body: '체성분 (체지방률·근육량·내장지방) 정밀 측정과 일별 트렌드는 HAVIT 앱에서 1초 만에 확인하세요.', button: '앱 시작하기' },
  en: { title: '📱 For precise tracking, use HAVIT app', body: 'Get exact body composition (body fat %, muscle, visceral fat) and daily trends in 1 second with HAVIT.', button: 'Open the app' },
  ja: { title: '📱 より正確な測定はHAVITアプリ', body: '体組成(体脂肪率・筋肉量・内臓脂肪)の精密測定と日別トレンドはHAVITアプリで1秒。', button: 'アプリを開く' },
  zh: { title: '📱 精确测量请用 HAVIT 应用', body: '体成分(体脂率、肌肉量、内脏脂肪)精确测量与每日趋势,HAVIT 一秒搞定。', button: '打开应用' },
  'zh-tw': { title: '📱 精確測量請用 HAVIT 應用', body: '體組成(體脂率、肌肉量、內臟脂肪)精確測量與每日趨勢,HAVIT 一秒搞定。', button: '開啟應用' },
  es: { title: '📱 Para mediciones precisas, usa HAVIT', body: 'Obtén la composición corporal exacta (% grasa, músculo, grasa visceral) y tendencias diarias en 1 segundo con HAVIT.', button: 'Abrir la app' },
  'pt-br': { title: '📱 Para medições precisas, use o app HAVIT', body: 'Veja sua composição corporal exata (% de gordura, massa muscular, gordura visceral) e as tendências diárias em 1 segundo com o HAVIT.', button: 'Abrir o app' },
  id: { title: '📱 Untuk pengukuran akurat, gunakan aplikasi HAVIT', body: 'Cek komposisi tubuh secara akurat (% lemak tubuh, massa otot, lemak viseral) dan tren harian dalam 1 detik dengan HAVIT.', button: 'Buka aplikasi' },
  de: { title: '📱 Für genaue Messungen: die HAVIT-App', body: 'Exakte Körperzusammensetzung (Körperfettanteil, Muskelmasse, viszerales Fett) und tägliche Trends in 1 Sekunde mit HAVIT.', button: 'App öffnen' },
  fr: { title: '📱 Pour un suivi précis, utilisez l’app HAVIT', body: 'Obtenez votre composition corporelle exacte (% de masse grasse, masse musculaire, graisse viscérale) et vos tendances quotidiennes en 1 seconde avec HAVIT.', button: 'Ouvrir l’app' },
};

export interface BmrLabels extends ToolMeta {
  pageTitle: string;
  pageIntro: string;
  sex: string;
  male: string;
  female: string;
  age: string;
  weight: string;
  height: string;
  units: string;
  metric: string;
  imperial: string;
  activity: string;
  activityLevels: Record<ActivityLevel, string>;
  calculate: string;
  result: string;
  bmrLabel: string;
  tdeeLabel: string;
  bmrHelp: string;
  tdeeHelp: string;
  feet: string;
  inches: string;
  aboutHeader: string;
  aboutBody: string;
  formulaHeader: string;
  formulaBody: string;
}

export const BMR_LABELS: Record<ToolLang, BmrLabels> = {
  ko: {
    pageTitle: '기초대사량(BMR) + 일일 칼로리(TDEE) 계산기',
    pageIntro: '성별·나이·체중·키·활동량을 입력하면 Mifflin-St Jeor 공식으로 BMR과 TDEE를 계산합니다. 다이어트·근육 증량 목표 설정의 기준이 됩니다.',
    sex: '성별', male: '남자', female: '여자',
    age: '나이', weight: '체중', height: '키',
    units: '단위', metric: '미터법(kg/cm)', imperial: '야드파운드(lb/ft)',
    activity: '활동량',
    activityLevels: { sedentary: '좌식 (운동 거의 없음)', light: '가벼움 (주 1–3회)', moderate: '보통 (주 3–5회)', active: '활동적 (주 6–7회)', very_active: '매우 활동적 (하루 2회 또는 육체노동)' },
    calculate: '계산하기',
    result: '결과',
    bmrLabel: 'BMR (기초대사량)',
    tdeeLabel: 'TDEE (일일 총 소비)',
    bmrHelp: '안정 상태에서 하루 동안 생명 유지에 필요한 최소 에너지입니다.',
    tdeeHelp: '활동량까지 포함한 하루 총 칼로리 소비량. 다이어트·증량 목표의 기준입니다.',
    feet: '피트', inches: '인치',
    aboutHeader: '이 계산기에 대해',
    aboutBody: 'Mifflin-St Jeor 공식(1990)은 비-DEXA 환경에서 가장 정확한 BMR 추정 식으로, 미국임상영양학회(ACSM)와 국제스포츠영양학회(ISSN)가 권장합니다. TDEE는 WHO/IOM의 표준 활동 계수를 적용합니다.',
    formulaHeader: '계산 공식',
    formulaBody: 'BMR (남): 10×체중(kg) + 6.25×키(cm) − 5×나이 + 5\nBMR (여): 10×체중(kg) + 6.25×키(cm) − 5×나이 − 161\nTDEE: BMR × 활동 계수 (1.2 ~ 1.9)',
  },
  en: {
    pageTitle: 'BMR + TDEE Calculator — Daily Calorie Needs',
    pageIntro: 'Enter sex, age, weight, height, and activity to get your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation — the basis for any cut, maintenance, or bulk plan.',
    sex: 'Sex', male: 'Male', female: 'Female',
    age: 'Age', weight: 'Weight', height: 'Height',
    units: 'Units', metric: 'Metric (kg/cm)', imperial: 'Imperial (lb/ft)',
    activity: 'Activity level',
    activityLevels: { sedentary: 'Sedentary (little or no exercise)', light: 'Light (1–3 days/week)', moderate: 'Moderate (3–5 days/week)', active: 'Active (6–7 days/week)', very_active: 'Very active (2×/day or physical job)' },
    calculate: 'Calculate',
    result: 'Result',
    bmrLabel: 'BMR (Basal Metabolic Rate)',
    tdeeLabel: 'TDEE (Total Daily Energy)',
    bmrHelp: 'The minimum daily energy your body needs at rest to keep core functions running.',
    tdeeHelp: 'Total calories burned per day including activity. Use this as the baseline for cut/maintain/bulk targets.',
    feet: 'ft', inches: 'in',
    aboutHeader: 'About this calculator',
    aboutBody: 'The Mifflin-St Jeor equation (1990) is the most accurate BMR estimator without lab equipment and is recommended by ACSM and ISSN. TDEE applies the standard WHO/IOM physical-activity multipliers.',
    formulaHeader: 'Formula',
    formulaBody: 'BMR (male): 10×kg + 6.25×cm − 5×age + 5\nBMR (female): 10×kg + 6.25×cm − 5×age − 161\nTDEE: BMR × activity factor (1.2 to 1.9)',
  },
  ja: {
    pageTitle: '基礎代謝量(BMR)＋一日総消費カロリー(TDEE)計算機',
    pageIntro: '性別・年齢・体重・身長・活動量を入力すると、Mifflin-St Jeor式でBMRとTDEEを計算します。ダイエットや増量目標設定の基準値です。',
    sex: '性別', male: '男性', female: '女性',
    age: '年齢', weight: '体重', height: '身長',
    units: '単位', metric: 'メートル法(kg/cm)', imperial: 'ヤードポンド法(lb/ft)',
    activity: '活動レベル',
    activityLevels: { sedentary: '座位中心(運動ほぼなし)', light: '軽い運動(週1〜3回)', moderate: '中程度(週3〜5回)', active: '活発(週6〜7回)', very_active: '非常に活発(1日2回または肉体労働)' },
    calculate: '計算する',
    result: '結果',
    bmrLabel: 'BMR (基礎代謝量)',
    tdeeLabel: 'TDEE (1日総消費)',
    bmrHelp: '安静時に生命維持のために必要な1日の最低エネルギー量。',
    tdeeHelp: '活動量を含む1日の総消費カロリー。ダイエット・増量目標の基準値です。',
    feet: 'フィート', inches: 'インチ',
    aboutHeader: 'この計算機について',
    aboutBody: 'Mifflin-St Jeor式(1990)は、検査機器なしで最も正確なBMR推定式とされ、ACSMとISSNが推奨しています。TDEEはWHO/IOMの標準活動係数を適用します。',
    formulaHeader: '計算式',
    formulaBody: 'BMR (男性): 10×kg + 6.25×cm − 5×年齢 + 5\nBMR (女性): 10×kg + 6.25×cm − 5×年齢 − 161\nTDEE: BMR × 活動係数 (1.2 〜 1.9)',
  },
  zh: {
    pageTitle: '基础代谢率(BMR)+ 每日总消耗(TDEE)计算器',
    pageIntro: '输入性别、年龄、体重、身高和活动量,使用 Mifflin-St Jeor 公式计算 BMR 和 TDEE — 减脂、维持、增肌目标的基础数据。',
    sex: '性别', male: '男', female: '女',
    age: '年龄', weight: '体重', height: '身高',
    units: '单位', metric: '公制(kg/cm)', imperial: '英制(lb/ft)',
    activity: '活动量',
    activityLevels: { sedentary: '久坐(几乎不运动)', light: '轻度(每周1–3次)', moderate: '中等(每周3–5次)', active: '活跃(每周6–7次)', very_active: '非常活跃(每日2次或体力劳动)' },
    calculate: '计算',
    result: '结果',
    bmrLabel: 'BMR (基础代谢率)',
    tdeeLabel: 'TDEE (每日总消耗)',
    bmrHelp: '静息状态下,身体维持基本功能所需的最低每日能量。',
    tdeeHelp: '包含活动量的每日总消耗。这是设定减脂/维持/增肌目标的基线。',
    feet: '英尺', inches: '英寸',
    aboutHeader: '关于本计算器',
    aboutBody: 'Mifflin-St Jeor 公式(1990)是无需仪器条件下最准确的 BMR 估算法,ACSM 和 ISSN 均推荐。TDEE 采用 WHO/IOM 标准活动系数。',
    formulaHeader: '计算公式',
    formulaBody: 'BMR (男): 10×kg + 6.25×cm − 5×年龄 + 5\nBMR (女): 10×kg + 6.25×cm − 5×年龄 − 161\nTDEE: BMR × 活动系数 (1.2 ~ 1.9)',
  },
  'zh-tw': {
    pageTitle: '基礎代謝率(BMR)＋每日總消耗(TDEE)計算機',
    pageIntro: '輸入性別、年齡、體重、身高和活動量,使用 Mifflin-St Jeor 公式計算 BMR 和 TDEE — 減脂、維持、增肌目標的基礎數據。',
    sex: '性別', male: '男', female: '女',
    age: '年齡', weight: '體重', height: '身高',
    units: '單位', metric: '公制(kg/cm)', imperial: '英制(lb/ft)',
    activity: '活動量',
    activityLevels: { sedentary: '久坐(幾乎不運動)', light: '輕度(每週1–3次)', moderate: '中等(每週3–5次)', active: '活躍(每週6–7次)', very_active: '非常活躍(每日2次或體力勞動)' },
    calculate: '計算',
    result: '結果',
    bmrLabel: 'BMR (基礎代謝率)',
    tdeeLabel: 'TDEE (每日總消耗)',
    bmrHelp: '靜息狀態下,身體維持基本功能所需的最低每日能量。',
    tdeeHelp: '包含活動量的每日總消耗。這是設定減脂/維持/增肌目標的基線。',
    feet: '英尺', inches: '英寸',
    aboutHeader: '關於本計算機',
    aboutBody: 'Mifflin-St Jeor 公式(1990)是無需儀器條件下最準確的 BMR 估算法,ACSM 與 ISSN 均推薦。TDEE 採用 WHO/IOM 標準活動係數。',
    formulaHeader: '計算公式',
    formulaBody: 'BMR (男): 10×kg + 6.25×cm − 5×年齡 + 5\nBMR (女): 10×kg + 6.25×cm − 5×年齡 − 161\nTDEE: BMR × 活動係數 (1.2 ~ 1.9)',
  },
  es: {
    pageTitle: 'Calculadora de TMB + TDEE (calorías diarias)',
    pageIntro: 'Introduce sexo, edad, peso, altura y actividad para obtener tu Tasa Metabólica Basal (TMB) y el Gasto Energético Total Diario (TDEE) con la ecuación de Mifflin-St Jeor — la base de cualquier déficit, mantenimiento o superávit calórico.',
    sex: 'Sexo', male: 'Hombre', female: 'Mujer',
    age: 'Edad', weight: 'Peso', height: 'Altura',
    units: 'Unidades', metric: 'Métrico (kg/cm)', imperial: 'Imperial (lb/ft)',
    activity: 'Nivel de actividad',
    activityLevels: { sedentary: 'Sedentario (poco o ningún ejercicio)', light: 'Ligero (1–3 días/semana)', moderate: 'Moderado (3–5 días/semana)', active: 'Activo (6–7 días/semana)', very_active: 'Muy activo (2×/día o trabajo físico)' },
    calculate: 'Calcular',
    result: 'Resultado',
    bmrLabel: 'TMB (Tasa Metabólica Basal)',
    tdeeLabel: 'TDEE (Gasto Total Diario)',
    bmrHelp: 'Energía mínima diaria que tu cuerpo necesita en reposo para mantener las funciones vitales.',
    tdeeHelp: 'Calorías totales quemadas al día incluyendo actividad. Usa esto como base para tus objetivos.',
    feet: 'pies', inches: 'pulgadas',
    aboutHeader: 'Sobre esta calculadora',
    aboutBody: 'La ecuación de Mifflin-St Jeor (1990) es la estimación de TMB más precisa sin equipo de laboratorio y es recomendada por ACSM e ISSN. TDEE aplica los multiplicadores estándar de actividad de la OMS/IOM.',
    formulaHeader: 'Fórmula',
    formulaBody: 'TMB (hombre): 10×kg + 6.25×cm − 5×edad + 5\nTMB (mujer): 10×kg + 6.25×cm − 5×edad − 161\nTDEE: TMB × factor de actividad (1.2 a 1.9)',
  },
  'pt-br': {
    metaTitle: 'Calculadora de TMB: quantas calorias você gasta?',
    metaDescription: 'Descubra em segundos sua taxa metabólica basal (TMB) e quantas calorias você gasta por dia (TDEE), pela fórmula de Mifflin-St Jeor. Grátis e sem cadastro.',
    pageTitle: 'Calculadora de TMB + Gasto Calórico Diário (TDEE)',
    pageIntro: 'Informe sexo, idade, peso, altura e nível de atividade para obter sua Taxa Metabólica Basal (TMB) e seu Gasto Energético Total Diário (TDEE) pela equação de Mifflin-St Jeor — a base de qualquer plano de déficit, manutenção ou superávit calórico.',
    sex: 'Sexo', male: 'Homem', female: 'Mulher',
    age: 'Idade', weight: 'Peso', height: 'Altura',
    units: 'Unidades', metric: 'Métrico (kg/cm)', imperial: 'Imperial (lb/pés)',
    activity: 'Nível de atividade',
    activityLevels: { sedentary: 'Sedentário (pouco ou nenhum exercício)', light: 'Leve (1–3 dias/semana)', moderate: 'Moderado (3–5 dias/semana)', active: 'Ativo (6–7 dias/semana)', very_active: 'Muito ativo (2×/dia ou trabalho braçal)' },
    calculate: 'Calcular',
    result: 'Resultado',
    bmrLabel: 'TMB (Taxa Metabólica Basal)',
    tdeeLabel: 'TDEE (Gasto Energético Total)',
    bmrHelp: 'A energia mínima que seu corpo precisa por dia em repouso para manter as funções vitais.',
    tdeeHelp: 'Total de calorias gastas por dia, incluindo as atividades. Use como base para suas metas de déficit, manutenção ou ganho de massa.',
    feet: 'pés', inches: 'polegadas',
    aboutHeader: 'Sobre esta calculadora',
    aboutBody: 'A equação de Mifflin-St Jeor (1990) é a estimativa de TMB mais precisa sem equipamento de laboratório e é recomendada pelo ACSM e pela ISSN. O TDEE aplica os fatores de atividade física padrão da OMS/IOM.',
    formulaHeader: 'Fórmula',
    formulaBody: 'TMB (homem): 10×kg + 6,25×cm − 5×idade + 5\nTMB (mulher): 10×kg + 6,25×cm − 5×idade − 161\nTDEE: TMB × fator de atividade (1,2 a 1,9)',
  },
  id: {
    metaTitle: 'Kalkulator BMR & TDEE: Berapa Kalori Harian Anda?',
    metaDescription: 'Hitung BMR dan TDEE Anda dalam hitungan detik dengan rumus Mifflin-St Jeor. Ketahui berapa kalori yang Anda bakar per hari untuk diet atau menambah otot.',
    pageTitle: 'Kalkulator BMR + TDEE — Kebutuhan Kalori Harian',
    pageIntro: 'Masukkan jenis kelamin, usia, berat badan, tinggi badan, dan tingkat aktivitas untuk mengetahui Basal Metabolic Rate (BMR) dan Total Daily Energy Expenditure (TDEE) Anda dengan rumus Mifflin-St Jeor — dasar untuk rencana defisit, mempertahankan berat badan, maupun surplus kalori.',
    sex: 'Jenis kelamin', male: 'Pria', female: 'Wanita',
    age: 'Usia', weight: 'Berat badan', height: 'Tinggi badan',
    units: 'Satuan', metric: 'Metrik (kg/cm)', imperial: 'Imperial (lb/kaki)',
    activity: 'Tingkat aktivitas',
    activityLevels: { sedentary: 'Tidak aktif (jarang atau tidak berolahraga)', light: 'Ringan (1–3 hari/minggu)', moderate: 'Sedang (3–5 hari/minggu)', active: 'Aktif (6–7 hari/minggu)', very_active: 'Sangat aktif (2×/hari atau kerja fisik)' },
    calculate: 'Hitung',
    result: 'Hasil',
    bmrLabel: 'BMR (Laju Metabolisme Basal)',
    tdeeLabel: 'TDEE (Total Energi Harian)',
    bmrHelp: 'Energi minimum yang dibutuhkan tubuh Anda per hari saat istirahat untuk menjalankan fungsi vital.',
    tdeeHelp: 'Total kalori yang terbakar per hari termasuk aktivitas. Gunakan sebagai dasar target turun, jaga, atau naik berat badan.',
    feet: 'kaki', inches: 'inci',
    aboutHeader: 'Tentang kalkulator ini',
    aboutBody: 'Rumus Mifflin-St Jeor (1990) adalah estimasi BMR paling akurat tanpa alat laboratorium dan direkomendasikan oleh ACSM serta ISSN. TDEE menggunakan faktor aktivitas fisik standar WHO/IOM.',
    formulaHeader: 'Rumus',
    formulaBody: 'BMR (pria): 10×kg + 6,25×cm − 5×usia + 5\nBMR (wanita): 10×kg + 6,25×cm − 5×usia − 161\nTDEE: BMR × faktor aktivitas (1,2 sampai 1,9)',
  },
  de: {
    metaTitle: 'Grundumsatz-Rechner: Wie viele Kalorien am Tag?',
    metaDescription: 'Berechnen Sie sofort Ihren Grundumsatz (BMR) und täglichen Kalorienbedarf (TDEE) nach Mifflin-St Jeor – die Basis zum Abnehmen oder Muskelaufbau.',
    pageTitle: 'Grundumsatz- und Kalorienbedarf-Rechner (BMR + TDEE)',
    pageIntro: 'Geben Sie Geschlecht, Alter, Gewicht, Größe und Aktivitätslevel ein und erhalten Sie Ihren Grundumsatz (BMR) und Gesamtumsatz (TDEE) nach der Mifflin-St-Jeor-Formel – die Basis für jedes Ziel: abnehmen, Gewicht halten oder Muskeln aufbauen.',
    sex: 'Geschlecht', male: 'Mann', female: 'Frau',
    age: 'Alter', weight: 'Gewicht', height: 'Größe',
    units: 'Einheiten', metric: 'Metrisch (kg/cm)', imperial: 'Imperial (lb/Fuß)',
    activity: 'Aktivitätslevel',
    activityLevels: { sedentary: 'Sitzend (kaum oder kein Sport)', light: 'Leicht aktiv (1–3 Tage/Woche)', moderate: 'Mäßig aktiv (3–5 Tage/Woche)', active: 'Aktiv (6–7 Tage/Woche)', very_active: 'Sehr aktiv (2×/Tag oder körperliche Arbeit)' },
    calculate: 'Berechnen',
    result: 'Ergebnis',
    bmrLabel: 'BMR (Grund\u00ADumsatz)',
    tdeeLabel: 'TDEE (Gesamt\u00ADumsatz)',
    bmrHelp: 'Die minimale Energie, die Ihr Körper täglich in Ruhe für die lebenswichtigen Funktionen braucht.',
    tdeeHelp: 'Alle Kalorien, die Sie pro Tag inklusive Aktivität verbrauchen. Die Basis für Ihr Ziel: abnehmen, halten oder aufbauen.',
    feet: 'Fuß', inches: 'Zoll',
    aboutHeader: 'Über diesen Rechner',
    aboutBody: 'Die Mifflin-St-Jeor-Formel (1990) gilt ohne Laborgeräte als genaueste Schätzung des Grundumsatzes und wird von ACSM und ISSN empfohlen. Für den TDEE werden die Standard-Aktivitätsfaktoren von WHO/IOM verwendet.',
    formulaHeader: 'Formel',
    formulaBody: 'BMR (Mann): 10×kg + 6,25×cm − 5×Alter + 5\nBMR (Frau): 10×kg + 6,25×cm − 5×Alter − 161\nTDEE: BMR × Aktivitätsfaktor (1,2 bis 1,9)',
  },
  fr: {
    metaTitle: 'Calcul métabolisme de base : combien de calories ?',
    metaDescription: 'Calculez en quelques secondes votre métabolisme de base et vos besoins caloriques (TDEE) avec la formule de Mifflin-St Jeor. Gratuit, sans inscription.',
    pageTitle: 'Calcul du métabolisme de base + besoins caloriques (TDEE)',
    pageIntro: 'Indiquez votre sexe, âge, poids, taille et niveau d’activité pour obtenir votre métabolisme de base (MB) et votre dépense énergétique journalière totale (TDEE) selon l’équation de Mifflin-St Jeor — la base de tout plan de déficit, de maintien ou de prise de masse.',
    sex: 'Sexe', male: 'Homme', female: 'Femme',
    age: 'Âge', weight: 'Poids', height: 'Taille',
    units: 'Unités', metric: 'Métrique (kg/cm)', imperial: 'Impérial (lb/pieds)',
    activity: 'Niveau d’activité',
    activityLevels: { sedentary: 'Sédentaire (peu ou pas d’exercice)', light: 'Légèrement actif (1–3 jours/semaine)', moderate: 'Modérément actif (3–5 jours/semaine)', active: 'Actif (6–7 jours/semaine)', very_active: 'Très actif (2×/jour ou travail physique)' },
    calculate: 'Calculer',
    result: 'Résultat',
    bmrLabel: 'MB (métabolisme de base)',
    tdeeLabel: 'TDEE (dépense énergétique totale)',
    bmrHelp: 'L’énergie minimale dont votre corps a besoin chaque jour au repos pour assurer ses fonctions vitales.',
    tdeeHelp: 'Total des calories brûlées par jour, activité comprise. Servez-vous-en comme base pour vos objectifs de déficit, de maintien ou de prise de masse.',
    feet: 'pieds', inches: 'pouces',
    aboutHeader: 'À propos de ce calculateur',
    aboutBody: 'L’équation de Mifflin-St Jeor (1990) est l’estimation du métabolisme de base la plus précise sans matériel de laboratoire ; elle est recommandée par l’ACSM et l’ISSN. Le TDEE applique les coefficients d’activité physique standard de l’OMS/IOM.',
    formulaHeader: 'Formule',
    formulaBody: 'MB (homme) : 10×kg + 6,25×cm − 5×âge + 5\nMB (femme) : 10×kg + 6,25×cm − 5×âge − 161\nTDEE : MB × coefficient d’activité (1,2 à 1,9)',
  },
};

/* ─── Protein labels ─── */
export interface ProteinLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  weight: string; goal: string; calculate: string;
  goalLabels: Record<ProteinGoal, string>;
  rangeLabel: string; perMealLabel: string; help: string;
  aboutHeader: string; aboutBody: string;
}
export const PROTEIN_LABELS: Record<ToolLang, ProteinLabels> = {
  ko: { pageTitle: '단백질 필요량 계산기', pageIntro: '체중과 목표에 따른 일일 단백질 g (ISSN 2017 기준).', weight: '체중 (kg)', goal: '목표', calculate: '계산하기',
    goalLabels: { sedentary: '비활동 (좌식)', endurance: '지구력 운동 (러닝/사이클)', strength: '근력 운동 (웨이트)', cut: '다이어트 (근손실 방지)', older_adult: '60세 이상' },
    rangeLabel: '일일 권장량', perMealLabel: '한 끼 단백질 (4식 기준)', help: 'g/day',
    aboutHeader: '왜 단백질이 중요한가?', aboutBody: '단백질은 근육 합성·포만감·대사 유지의 핵심 영양소입니다. 다이어트 중에는 일반 권장량(0.8 g/kg)의 2배 이상이 필요해 근손실을 막습니다. 한 끼에 30g 이상이면 흡수율이 떨어지므로 4번에 나누어 섭취 권장 (ISSN 2017).' },
  en: { pageTitle: 'Protein Needs Calculator', pageIntro: 'Daily protein grams by body weight and goal (ISSN 2017).', weight: 'Weight (kg)', goal: 'Goal', calculate: 'Calculate',
    goalLabels: { sedentary: 'Sedentary (desk job)', endurance: 'Endurance (running, cycling)', strength: 'Strength training', cut: 'Cutting (muscle preservation)', older_adult: 'Adult 60+' },
    rangeLabel: 'Daily range', perMealLabel: 'Per meal (4 meals/day)', help: 'g/day',
    aboutHeader: 'Why protein matters', aboutBody: 'Protein drives muscle synthesis, satiety, and metabolic preservation. Cutting needs 2× the standard RDA (0.8 g/kg) to prevent muscle loss. Distribute across 4 meals — absorption plateaus above ~30g per sitting (ISSN 2017).' },
  ja: { pageTitle: 'たんぱく質必要量計算機', pageIntro: '体重と目標別の1日たんぱく質g (ISSN 2017基準)。', weight: '体重 (kg)', goal: '目標', calculate: '計算',
    goalLabels: { sedentary: '座位中心(運動なし)', endurance: '持久力(ランニング・サイクリング)', strength: '筋トレ', cut: '減量(筋肉保持)', older_adult: '60歳以上' },
    rangeLabel: '1日推奨量', perMealLabel: '1食あたり(4食基準)', help: 'g/日',
    aboutHeader: 'たんぱく質が重要な理由', aboutBody: 'たんぱく質は筋合成・満腹感・代謝維持の鍵。減量時は通常推奨量(0.8 g/kg)の2倍以上で筋肉減少を防ぎます。1食30g以上で吸収プラトーするため4食に分散推奨 (ISSN 2017)。' },
  zh: { pageTitle: '蛋白质需求量计算器', pageIntro: '按体重和目标计算每日蛋白质克数 (ISSN 2017标准)。', weight: '体重 (kg)', goal: '目标', calculate: '计算',
    goalLabels: { sedentary: '久坐(无运动)', endurance: '耐力训练(跑步/骑行)', strength: '力量训练', cut: '减脂(肌肉保持)', older_adult: '60岁以上' },
    rangeLabel: '每日范围', perMealLabel: '每餐 (4餐/日)', help: 'g/日',
    aboutHeader: '蛋白质为何重要', aboutBody: '蛋白质是肌肉合成、饱腹感与代谢维持的核心。减脂期需要标准推荐量(0.8 g/kg)的2倍以防止肌肉流失。单餐超过30g吸收率下降,建议分4餐摄入 (ISSN 2017)。' },
  'zh-tw': { pageTitle: '蛋白質需求量計算機', pageIntro: '按體重和目標計算每日蛋白質克數 (ISSN 2017標準)。', weight: '體重 (kg)', goal: '目標', calculate: '計算',
    goalLabels: { sedentary: '久坐(無運動)', endurance: '耐力訓練(跑步/騎行)', strength: '力量訓練', cut: '減脂(肌肉保持)', older_adult: '60歲以上' },
    rangeLabel: '每日範圍', perMealLabel: '每餐 (4餐/日)', help: 'g/日',
    aboutHeader: '蛋白質為何重要', aboutBody: '蛋白質是肌肉合成、飽腹感與代謝維持的核心。減脂期需要標準推薦量(0.8 g/kg)的2倍以防止肌肉流失。單餐超過30g吸收率下降,建議分4餐攝取 (ISSN 2017)。' },
  es: { pageTitle: 'Calculadora de Necesidades de Proteína', pageIntro: 'Gramos diarios de proteína por peso y objetivo (ISSN 2017).', weight: 'Peso (kg)', goal: 'Objetivo', calculate: 'Calcular',
    goalLabels: { sedentary: 'Sedentario (oficina)', endurance: 'Resistencia (correr, ciclismo)', strength: 'Fuerza (pesas)', cut: 'Definición (preservar músculo)', older_adult: 'Adulto 60+' },
    rangeLabel: 'Rango diario', perMealLabel: 'Por comida (4/día)', help: 'g/día',
    aboutHeader: 'Por qué importa la proteína', aboutBody: 'La proteína impulsa la síntesis muscular, la saciedad y la preservación metabólica. En definición se necesita 2× la RDA estándar (0.8 g/kg) para evitar pérdida muscular. Distribuye en 4 comidas — la absorción se estabiliza por encima de ~30g por toma (ISSN 2017).' },
  'pt-br': { metaTitle: 'Calculadora de Proteína: quantos gramas por dia?', metaDescription: 'Descubra quantos gramas de proteína comer por dia para ganhar massa, emagrecer sem perder músculo ou manter a saúde após os 60. Baseado na ISSN 2017.',
    pageTitle: 'Calculadora de Proteína Diária', pageIntro: 'Gramas de proteína por dia de acordo com seu peso e objetivo (ISSN 2017).', weight: 'Peso (kg)', goal: 'Objetivo', calculate: 'Calcular',
    goalLabels: { sedentary: 'Sedentário (trabalho de escritório)', endurance: 'Resistência (corrida, ciclismo)', strength: 'Musculação', cut: 'Emagrecimento (preservar massa muscular)', older_adult: 'Adulto com 60+' },
    rangeLabel: 'Faixa diária', perMealLabel: 'Por refeição (4 refeições/dia)', help: 'g/dia',
    aboutHeader: 'Por que a proteína importa', aboutBody: 'A proteína impulsiona a síntese muscular, a saciedade e a preservação do metabolismo. No emagrecimento, é preciso o dobro da recomendação padrão (0,8 g/kg) para evitar a perda de massa muscular. Divida em 4 refeições — o aproveitamento se estabiliza acima de ~30 g por refeição (ISSN 2017).' },
  id: { metaTitle: 'Kalkulator Protein: Berapa Gram Protein per Hari?', metaDescription: 'Hitung kebutuhan protein harian Anda dalam gram sesuai berat badan dan target: diet, membentuk otot, olahraga daya tahan, atau usia 60+ (ISSN 2017).',
    pageTitle: 'Kalkulator Kebutuhan Protein Harian', pageIntro: 'Gram protein harian berdasarkan berat badan dan target Anda (ISSN 2017).', weight: 'Berat badan (kg)', goal: 'Target', calculate: 'Hitung',
    goalLabels: { sedentary: 'Tidak aktif (kerja kantoran)', endurance: 'Daya tahan (lari, bersepeda)', strength: 'Latihan beban', cut: 'Diet (mempertahankan otot)', older_adult: 'Dewasa usia 60+' },
    rangeLabel: 'Kisaran harian', perMealLabel: 'Per makan (4 kali/hari)', help: 'g/hari',
    aboutHeader: 'Mengapa protein penting', aboutBody: 'Protein mendorong sintesis otot, rasa kenyang, dan menjaga metabolisme. Saat diet, Anda butuh 2× angka kecukupan standar (0,8 g/kg) untuk mencegah kehilangan otot. Bagi ke dalam 4 kali makan — penyerapan cenderung stagnan di atas ~30 g per sekali makan (ISSN 2017).' },
  de: { metaTitle: 'Eiweißbedarf berechnen: Wie viel Protein pro Tag?', metaDescription: 'Wie viel Eiweiß brauchen Sie täglich? Berechnen Sie Ihren Proteinbedarf in Gramm für Muskelaufbau, Diät, Ausdauersport oder ab 60 – nach ISSN 2017.',
    pageTitle: 'Proteinbedarf-Rechner', pageIntro: 'Täglicher Eiweißbedarf in Gramm nach Körpergewicht und Ziel (ISSN 2017).', weight: 'Gewicht (kg)', goal: 'Ziel', calculate: 'Berechnen',
    goalLabels: { sedentary: 'Wenig aktiv (Bürojob)', endurance: 'Ausdauersport (Laufen, Radfahren)', strength: 'Krafttraining', cut: 'Diät (Muskelerhalt)', older_adult: 'Erwachsene ab 60' },
    rangeLabel: 'Tagesbedarf', perMealLabel: 'Pro Mahlzeit (bei 4 am Tag)', help: 'g/Tag',
    aboutHeader: 'Warum Protein wichtig ist', aboutBody: 'Protein treibt Muskelaufbau und Sättigung an und erhält den Stoffwechsel. In der Diät brauchen Sie das Doppelte der Standardempfehlung (0,8 g/kg), um Muskelabbau zu verhindern. Verteilen Sie es auf 4 Mahlzeiten – ab etwa 30 g pro Mahlzeit stagniert die Verwertung (ISSN 2017).' },
  fr: { metaTitle: 'Besoin en protéines : combien de grammes par jour ?', metaDescription: 'Combien de grammes de protéines par jour ? Calculez-le selon votre poids et votre objectif : muscle, sèche, endurance ou après 60 ans (ISSN 2017).',
    pageTitle: 'Calcul des besoins en protéines', pageIntro: 'Grammes de protéines par jour selon votre poids et votre objectif (ISSN 2017).', weight: 'Poids (kg)', goal: 'Objectif', calculate: 'Calculer',
    goalLabels: { sedentary: 'Sédentaire (travail de bureau)', endurance: 'Endurance (course à pied, vélo)', strength: 'Musculation', cut: 'Sèche (préserver le muscle)', older_adult: 'Adulte de 60 ans et +' },
    rangeLabel: 'Apport quotidien', perMealLabel: 'Par repas (4 repas/jour)', help: 'g/jour',
    aboutHeader: 'Pourquoi les protéines sont importantes', aboutBody: 'Les protéines soutiennent la synthèse musculaire, la satiété et le maintien du métabolisme. En sèche, il faut 2× l’apport recommandé standard (0,8 g/kg) pour éviter la fonte musculaire. Répartissez-les sur 4 repas — au-delà de ~30 g par repas, l’absorption plafonne (ISSN 2017).' },
};

/* ─── Water labels ─── */
export interface WaterLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  weight: string; exerciseHours: string; climate: string; calculate: string;
  climateNormal: string; climateHot: string;
  resultLabel: string; help: string;
  cupsLabel: string;
  aboutHeader: string; aboutBody: string;
}
export const WATER_LABELS: Record<ToolLang, WaterLabels> = {
  ko: { pageTitle: '일일 수분 섭취량 계산기', pageIntro: '체중·운동·기후를 반영한 정확한 일일 물 섭취량 (NAM 2004).', weight: '체중 (kg)', exerciseHours: '하루 운동 시간 (시간)', climate: '기후', calculate: '계산하기', climateNormal: '보통', climateHot: '덥거나 습함', resultLabel: '하루 권장 수분', help: '음료·음식 모두 포함', cupsLabel: '약 250ml 컵 기준',
    aboutHeader: '계산 근거', aboutBody: '기본: 체중 1kg당 35ml. 운동 1시간당 +700ml. 더운 기후 +500ml. 카페인·알코올은 이뇨 작용으로 추가 보충 필요.' },
  en: { pageTitle: 'Daily Water Intake Calculator', pageIntro: 'Personalized hydration target by weight, exercise, climate (NAM 2004).', weight: 'Weight (kg)', exerciseHours: 'Exercise hours/day', climate: 'Climate', calculate: 'Calculate', climateNormal: 'Normal', climateHot: 'Hot or humid', resultLabel: 'Daily target', help: 'Includes drinks and food', cupsLabel: '~250 ml cups',
    aboutHeader: 'How this is calculated', aboutBody: 'Baseline: 35 ml per kg body weight. +700 ml per hour of exercise. +500 ml in hot climate. Caffeine and alcohol are diuretic — add extra accordingly.' },
  ja: { pageTitle: '1日の水分摂取量計算機', pageIntro: '体重・運動・気候を反映した正確な水分量 (NAM 2004)。', weight: '体重 (kg)', exerciseHours: '1日の運動時間', climate: '気候', calculate: '計算', climateNormal: '通常', climateHot: '暑い・湿気', resultLabel: '1日推奨', help: '飲み物と食事を含む', cupsLabel: '約250mlカップ換算',
    aboutHeader: '計算根拠', aboutBody: '基本:体重1kgあたり35ml。運動1時間ごとに+700ml。暑い気候は+500ml。カフェイン・アルコールは利尿作用で追加補給推奨。' },
  zh: { pageTitle: '每日水分摄入计算器', pageIntro: '基于体重、运动、气候的精确每日水量 (NAM 2004)。', weight: '体重 (kg)', exerciseHours: '每日运动时间', climate: '气候', calculate: '计算', climateNormal: '正常', climateHot: '炎热或潮湿', resultLabel: '每日推荐', help: '包括饮料和食物', cupsLabel: '约250ml杯',
    aboutHeader: '计算依据', aboutBody: '基础:体重每kg 35ml。运动每小时+700ml。炎热气候+500ml。咖啡因和酒精有利尿作用,需额外补充。' },
  'zh-tw': { pageTitle: '每日水分攝取計算機', pageIntro: '基於體重、運動、氣候的精確每日水量 (NAM 2004)。', weight: '體重 (kg)', exerciseHours: '每日運動時間', climate: '氣候', calculate: '計算', climateNormal: '正常', climateHot: '炎熱或潮濕', resultLabel: '每日推薦', help: '包括飲料和食物', cupsLabel: '約250ml杯',
    aboutHeader: '計算依據', aboutBody: '基礎:體重每kg 35ml。運動每小時+700ml。炎熱氣候+500ml。咖啡因和酒精有利尿作用,需額外補充。' },
  es: { pageTitle: 'Calculadora de Hidratación Diaria', pageIntro: 'Objetivo personalizado por peso, ejercicio y clima (NAM 2004).', weight: 'Peso (kg)', exerciseHours: 'Horas de ejercicio/día', climate: 'Clima', calculate: 'Calcular', climateNormal: 'Normal', climateHot: 'Cálido o húmedo', resultLabel: 'Meta diaria', help: 'Incluye bebidas y alimentos', cupsLabel: '~250 ml por vaso',
    aboutHeader: 'Cómo se calcula', aboutBody: 'Base: 35 ml por kg. +700 ml por hora de ejercicio. +500 ml en clima cálido. La cafeína y el alcohol son diuréticos — añade más en consecuencia.' },
  'pt-br': { metaTitle: 'Quanto de água beber por dia? Calculadora', metaDescription: 'Descubra quantos litros de água você deve beber por dia com base no seu peso, tempo de exercício e clima. Resultado em litros e copos de 250 ml (NAM 2004).',
    pageTitle: 'Calculadora de Consumo de Água Diário', pageIntro: 'Meta de hidratação personalizada por peso, exercício e clima (NAM 2004).', weight: 'Peso (kg)', exerciseHours: 'Horas de exercício/dia', climate: 'Clima', calculate: 'Calcular', climateNormal: 'Ameno', climateHot: 'Quente ou úmido', resultLabel: 'Meta diária', help: 'Inclui bebidas e alimentos', cupsLabel: 'copos de ~250 ml',
    aboutHeader: 'Como é calculado', aboutBody: 'Base: 35 ml por kg de peso corporal. +700 ml por hora de exercício. +500 ml em clima quente. Cafeína e álcool são diuréticos — beba um pouco mais para compensar.' },
  id: { metaTitle: 'Berapa Liter Air Minum per Hari? Cek di Sini', metaDescription: 'Hitung kebutuhan air minum harian Anda berdasarkan berat badan, durasi olahraga, dan iklim. Hasil dalam liter dan jumlah gelas 250 ml (NAM 2004).',
    pageTitle: 'Kalkulator Kebutuhan Air Minum Harian', pageIntro: 'Target hidrasi personal berdasarkan berat badan, olahraga, dan iklim (NAM 2004).', weight: 'Berat badan (kg)', exerciseHours: 'Jam olahraga/hari', climate: 'Iklim', calculate: 'Hitung', climateNormal: 'Sejuk/biasa', climateHot: 'Panas atau lembap', resultLabel: 'Target harian', help: 'Termasuk minuman dan makanan', cupsLabel: 'gelas (~250 ml)',
    aboutHeader: 'Cara perhitungannya', aboutBody: 'Dasar: 35 ml per kg berat badan. +700 ml per jam olahraga. +500 ml di iklim panas. Kafein dan alkohol bersifat diuretik — tambahkan asupan air sesuai kebutuhan.' },
  de: { metaTitle: 'Wie viel Wasser am Tag? Trinkmenge berechnen', metaDescription: 'Berechnen Sie Ihren täglichen Wasserbedarf in Litern nach Körpergewicht, Sportdauer und Klima – inklusive Anzahl der Gläser à 250 ml (NAM 2004).',
    pageTitle: 'Wasserbedarf-Rechner: Ihre tägliche Trinkmenge', pageIntro: 'Persönliche Trinkmenge nach Gewicht, Sport und Klima (NAM 2004).', weight: 'Gewicht (kg)', exerciseHours: 'Sport (Stunden/Tag)', climate: 'Klima', calculate: 'Berechnen', climateNormal: 'Gemäßigt', climateHot: 'Heiß oder schwül', resultLabel: 'Tagesziel', help: 'Inklusive Getränke und Nahrung', cupsLabel: 'Gläser à ~250 ml',
    aboutHeader: 'So wird gerechnet', aboutBody: 'Basis: 35 ml pro kg Körpergewicht. +700 ml pro Stunde Sport. +500 ml bei heißem Klima. Koffein und Alkohol wirken harntreibend – trinken Sie entsprechend mehr.' },
  fr: { metaTitle: 'Combien d’eau boire par jour ? Calculez-le', metaDescription: 'Calculez combien de litres d’eau boire par jour selon votre poids, votre temps d’exercice et le climat. Résultat en litres et en verres de 250 ml.',
    pageTitle: 'Calculateur d’hydratation quotidienne', pageIntro: 'Votre besoin en eau personnalisé selon le poids, l’activité physique et le climat (NAM 2004).', weight: 'Poids (kg)', exerciseHours: 'Heures d’exercice/jour', climate: 'Climat', calculate: 'Calculer', climateNormal: 'Tempéré', climateHot: 'Chaud ou humide', resultLabel: 'Objectif quotidien', help: 'Boissons et aliments compris', cupsLabel: 'verres de ~250 ml',
    aboutHeader: 'Comment est-ce calculé ?', aboutBody: 'Base : 35 ml par kg de poids corporel. +700 ml par heure d’exercice. +500 ml par temps chaud. La caféine et l’alcool sont diurétiques — buvez un peu plus en conséquence.' },
};

/* ─── Caffeine labels ─── */
export interface CaffeineLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  bedtime: string; dose: string; doseExamples: string; targetAtBed: string; calculate: string;
  resultLabel: string; helpResult: string;
  aboutHeader: string; aboutBody: string;
}
export const CAFFEINE_LABELS: Record<ToolLang, CaffeineLabels> = {
  ko: { pageTitle: '카페인 마지노선 계산기', pageIntro: '잠 안 깨고 싶은 시간까지 카페인이 충분히 빠지려면 언제 마지막 컵을 마셔야 할지 계산.', bedtime: '취침 시각', dose: '한 잔 카페인 (mg)', doseExamples: '드립커피 ≈95mg · 에스프레소 ≈63mg · 콜드브루 ≈155mg · 녹차 ≈30mg', targetAtBed: '취침 시 잔류 허용량 (mg)', calculate: '계산하기', resultLabel: '마지막 컵 마지노선', helpResult: '이 시각 이후엔 마시지 않기',
    aboutHeader: '왜 이렇게 보수적인가?', aboutBody: '카페인 평균 반감기는 5시간. 즉 100mg을 마시면 5시간 후 50mg, 10시간 후 25mg 남음. 잔류 30mg 이상이면 깊은 잠(N3) 비율이 40% 감소 (Drake 2013). 개인차로 빠른 대사자/느린 대사자 ±50%.' },
  en: { pageTitle: 'Caffeine Cutoff Calculator', pageIntro: 'Find the latest time to drink coffee so it doesn\'t wreck your sleep.', bedtime: 'Bedtime', dose: 'Caffeine per cup (mg)', doseExamples: 'Drip coffee ≈95mg · Espresso ≈63mg · Cold brew ≈155mg · Green tea ≈30mg', targetAtBed: 'Residual allowed at bedtime (mg)', calculate: 'Calculate', resultLabel: 'Latest cup time', helpResult: 'No caffeine after this time',
    aboutHeader: 'Why this conservative?', aboutBody: 'Average caffeine half-life: 5 hours. 100mg becomes 50mg in 5h, 25mg in 10h. Residual above 30mg cuts deep sleep (N3) by 40% (Drake 2013). Individual variation ±50% for fast/slow metabolizers.' },
  ja: { pageTitle: 'カフェイン門限計算機', pageIntro: '快眠のために最後のコーヒーを何時までに飲むべきか計算します。', bedtime: '就寝時刻', dose: '1杯あたりカフェイン (mg)', doseExamples: 'ドリップ ≈95mg · エスプレッソ ≈63mg · コールドブリュー ≈155mg · 緑茶 ≈30mg', targetAtBed: '就寝時残存許容量 (mg)', calculate: '計算', resultLabel: '最終杯の門限', helpResult: 'この時刻以降は飲まない',
    aboutHeader: 'なぜ厳しめか', aboutBody: 'カフェイン平均半減期は5時間。100mgは5時間後50mg、10時間後25mg。残存30mg超で深睡眠(N3)が40%減少 (Drake 2013)。個人差±50%。' },
  zh: { pageTitle: '咖啡因截止时间计算器', pageIntro: '为了不影响睡眠,最后一杯咖啡该几点喝。', bedtime: '就寝时间', dose: '每杯咖啡因 (mg)', doseExamples: '滴漏咖啡 ≈95mg · 浓缩 ≈63mg · 冷萃 ≈155mg · 绿茶 ≈30mg', targetAtBed: '就寝时残留允许 (mg)', calculate: '计算', resultLabel: '最迟饮用时间', helpResult: '此后不要再摄入咖啡因',
    aboutHeader: '为何如此保守', aboutBody: '咖啡因平均半衰期5小时。100mg 5小时后剩50mg,10小时后25mg。残留超过30mg会让深睡眠(N3)减少40% (Drake 2013)。个体差异±50%。' },
  'zh-tw': { pageTitle: '咖啡因截止時間計算機', pageIntro: '為了不影響睡眠,最後一杯咖啡該幾點喝。', bedtime: '就寢時間', dose: '每杯咖啡因 (mg)', doseExamples: '滴漏咖啡 ≈95mg · 濃縮 ≈63mg · 冷萃 ≈155mg · 綠茶 ≈30mg', targetAtBed: '就寢時殘留允許 (mg)', calculate: '計算', resultLabel: '最遲飲用時間', helpResult: '此後不要再攝入咖啡因',
    aboutHeader: '為何如此保守', aboutBody: '咖啡因平均半衰期5小時。100mg 5小時後剩50mg,10小時後25mg。殘留超過30mg會讓深睡眠(N3)減少40% (Drake 2013)。個體差異±50%。' },
  es: { pageTitle: 'Calculadora de Hora Límite de Cafeína', pageIntro: 'Encuentra a qué hora dejar el café para no arruinar tu sueño.', bedtime: 'Hora de dormir', dose: 'Cafeína por taza (mg)', doseExamples: 'Café filtrado ≈95mg · Espresso ≈63mg · Cold brew ≈155mg · Té verde ≈30mg', targetAtBed: 'Residual permitido al dormir (mg)', calculate: 'Calcular', resultLabel: 'Última taza permitida', helpResult: 'Nada de cafeína después de esta hora',
    aboutHeader: '¿Por qué tan conservador?', aboutBody: 'Vida media de la cafeína: 5 horas. 100mg → 50mg en 5h, 25mg en 10h. Más de 30mg residuales reduce el sueño profundo (N3) un 40% (Drake 2013). Variación individual ±50%.' },
  'pt-br': { metaTitle: 'Até que horas tomar café sem perder o sono?', metaDescription: 'Calcule o horário da última xícara de café para dormir bem. Simulação pela meia-vida da cafeína (5 h), com base na sua hora de dormir e na dose.',
    pageTitle: 'Calculadora de Horário Limite da Cafeína', pageIntro: 'Descubra o horário máximo para tomar café sem prejudicar seu sono.', bedtime: 'Hora de dormir', dose: 'Cafeína por xícara (mg)', doseExamples: 'Café coado ≈95mg · Expresso ≈63mg · Cold brew ≈155mg · Chá verde ≈30mg', targetAtBed: 'Resíduo tolerado na hora de dormir (mg)', calculate: 'Calcular', resultLabel: 'Horário limite da última xícara', helpResult: 'Nada de cafeína depois deste horário',
    aboutHeader: 'Por que tão conservador?', aboutBody: 'Meia-vida média da cafeína: 5 horas. 100mg viram 50mg em 5h e 25mg em 10h. Mais de 30mg residuais reduzem o sono profundo (N3) em 40% (Drake 2013). Variação individual de ±50% entre quem metaboliza rápido ou devagar.' },
  id: { metaTitle: 'Jam Berapa Terakhir Minum Kopi Agar Bisa Tidur?', metaDescription: 'Hitung jam terakhir minum kopi agar tidur tetap nyenyak. Simulasi waktu paruh kafein (5 jam) berdasarkan jam tidur dan dosis kafein Anda.',
    pageTitle: 'Kalkulator Batas Waktu Minum Kafein', pageIntro: 'Cari tahu jam terakhir minum kopi agar tidur Anda tidak terganggu.', bedtime: 'Jam tidur', dose: 'Kafein per cangkir (mg)', doseExamples: 'Kopi seduh ≈95mg · Espresso ≈63mg · Cold brew ≈155mg · Teh hijau ≈30mg', targetAtBed: 'Sisa kafein yang ditoleransi saat tidur (mg)', calculate: 'Hitung', resultLabel: 'Batas cangkir terakhir', helpResult: 'Jangan minum kafein setelah jam ini',
    aboutHeader: 'Mengapa batasnya ketat?', aboutBody: 'Rata-rata waktu paruh kafein: 5 jam. 100mg menjadi 50mg dalam 5 jam dan 25mg dalam 10 jam. Sisa di atas 30mg mengurangi tidur nyenyak (N3) hingga 40% (Drake 2013). Variasi individu ±50% tergantung cepat atau lambatnya metabolisme kafein.' },
  de: { metaTitle: 'Koffein-Rechner: Bis wann Kaffee trinken?', metaDescription: 'Bis wann dürfen Sie Kaffee trinken, ohne schlecht zu schlafen? Der Rechner simuliert den Koffeinabbau (Halbwertszeit 5 h) nach Schlafenszeit und Dosis.',
    pageTitle: 'Koffein-Rechner: Wann ist die letzte Tasse fällig?', pageIntro: 'Finden Sie heraus, bis wann Sie spätestens Kaffee trinken können, ohne Ihren Schlaf zu ruinieren.', bedtime: 'Schlafenszeit', dose: 'Koffein pro Tasse (mg)', doseExamples: 'Filterkaffee ≈95mg · Espresso ≈63mg · Cold Brew ≈155mg · Grüner Tee ≈30mg', targetAtBed: 'Erlaubter Rest zur Schlafenszeit (mg)', calculate: 'Berechnen', resultLabel: 'Letzte Tasse spätestens um', helpResult: 'Nach dieser Uhrzeit kein Koffein mehr',
    aboutHeader: 'Warum so vorsichtig?', aboutBody: 'Durchschnittliche Halbwertszeit von Koffein: 5 Stunden. Aus 100mg werden in 5 h 50mg, in 10 h 25mg. Ein Rest über 30mg verringert den Tiefschlaf (N3) um 40 % (Drake 2013). Individuelle Schwankung ±50 %, je nachdem, ob Sie Koffein schnell oder langsam abbauen.' },
  fr: { metaTitle: 'Dernier café : à quelle heure pour bien dormir ?', metaDescription: 'Calculez l’heure de votre dernier café pour bien dormir. Simulation selon la demi-vie de la caféine (5 h), votre heure de coucher et la dose consommée.',
    pageTitle: 'Calculateur d’heure limite pour la caféine', pageIntro: 'Trouvez l’heure limite pour boire un café sans gâcher votre sommeil.', bedtime: 'Heure du coucher', dose: 'Caféine par tasse (mg)', doseExamples: 'Café filtre ≈95mg · Expresso ≈63mg · Cold brew ≈155mg · Thé vert ≈30mg', targetAtBed: 'Résiduel toléré au coucher (mg)', calculate: 'Calculer', resultLabel: 'Heure limite de la dernière tasse', helpResult: 'Plus de caféine après cette heure',
    aboutHeader: 'Pourquoi être si prudent ?', aboutBody: 'Demi-vie moyenne de la caféine : 5 heures. 100mg deviennent 50mg en 5 h et 25mg en 10 h. Au-delà de 30mg résiduels, le sommeil profond (N3) baisse de 40 % (Drake 2013). Variation individuelle de ±50 % selon que l’on métabolise la caféine vite ou lentement.' },
};

/* ─── Sleep cycle labels ─── */
export interface SleepCycleLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  wakeTime: string; calculate: string;
  resultHeader: string; cyclesLabel: string; helpRow: string;
  aboutHeader: string; aboutBody: string;
}
export const SLEEP_CYCLE_LABELS: Record<ToolLang, SleepCycleLabels> = {
  ko: { pageTitle: '수면 사이클 계산기', pageIntro: '90분 사이클 끝에 깨면 가장 상쾌. 원하는 기상 시각을 입력하면 추천 취침 시각 4가지가 나옵니다.', wakeTime: '기상 시각', calculate: '계산하기', resultHeader: '추천 취침 시각', cyclesLabel: '사이클', helpRow: '(잠드는 데 14분 가정)', aboutHeader: '왜 사이클이 중요한가?', aboutBody: '수면은 90분 단위 사이클 (얕은잠 → 깊은잠 → REM)로 반복됩니다. 사이클 중간에 깨면 sleep inertia (정신이 흐릿한 상태)가 30분 이상 지속. 사이클 끝(REM 직후)에 깨면 즉시 상쾌. 성인 권장: 4~6 사이클 (6~9시간).' },
  en: { pageTitle: 'Sleep Cycle Calculator', pageIntro: 'Waking at the end of a 90-min cycle feels best. Enter your wake time to get 4 recommended bedtimes.', wakeTime: 'Wake up time', calculate: 'Calculate', resultHeader: 'Recommended bedtimes', cyclesLabel: 'cycles', helpRow: '(14 min to fall asleep)', aboutHeader: 'Why cycles matter', aboutBody: 'Sleep runs in 90-min cycles (light → deep → REM). Waking mid-cycle triggers sleep inertia (grogginess) for 30+ min. Waking at cycle end (just after REM) feels instantly fresh. Adult recommendation: 4–6 cycles (6–9 hours).' },
  ja: { pageTitle: '睡眠サイクル計算機', pageIntro: '90分サイクルの最後に起きるのが最も爽快。希望の起床時刻を入れると4つの推奨就寝時刻が出ます。', wakeTime: '起床時刻', calculate: '計算', resultHeader: '推奨就寝時刻', cyclesLabel: 'サイクル', helpRow: '(寝つき14分前提)', aboutHeader: 'サイクルが重要な理由', aboutBody: '睡眠は90分単位のサイクル(浅い→深い→REM)を繰り返します。サイクル途中で起きると睡眠惰性(頭が重い状態)が30分以上続きます。サイクル終わり(REM直後)に起きると即座に爽快。成人推奨:4〜6サイクル(6〜9時間)。' },
  zh: { pageTitle: '睡眠周期计算器', pageIntro: '在90分钟周期末尾醒来最清爽。输入起床时间,获得4个推荐入睡时间。', wakeTime: '起床时间', calculate: '计算', resultHeader: '推荐入睡时间', cyclesLabel: '周期', helpRow: '(入睡14分钟)', aboutHeader: '周期为何重要', aboutBody: '睡眠以90分钟为周期(浅→深→REM)循环。在周期中间醒来会产生睡眠惯性(头脑迷糊)30分钟以上。在周期末尾(REM刚结束)醒来立即清爽。成人推荐:4–6个周期(6–9小时)。' },
  'zh-tw': { pageTitle: '睡眠週期計算機', pageIntro: '在90分鐘週期末尾醒來最清爽。輸入起床時間,獲得4個推薦入睡時間。', wakeTime: '起床時間', calculate: '計算', resultHeader: '推薦入睡時間', cyclesLabel: '週期', helpRow: '(入睡14分鐘)', aboutHeader: '週期為何重要', aboutBody: '睡眠以90分鐘為週期(淺→深→REM)循環。在週期中間醒來會產生睡眠慣性(頭腦迷糊)30分鐘以上。在週期末尾(REM剛結束)醒來立即清爽。成人推薦:4–6個週期(6–9小時)。' },
  es: { pageTitle: 'Calculadora de Ciclos de Sueño', pageIntro: 'Despertar al final de un ciclo de 90 min se siente mejor. Introduce tu hora de despertar para obtener 4 horas recomendadas para dormir.', wakeTime: 'Hora de despertar', calculate: 'Calcular', resultHeader: 'Horas recomendadas para dormir', cyclesLabel: 'ciclos', helpRow: '(14 min para dormirse)', aboutHeader: 'Por qué importan los ciclos', aboutBody: 'El sueño se da en ciclos de 90 min (ligero → profundo → REM). Despertar a mitad de ciclo provoca inercia del sueño (aturdimiento) por más de 30 min. Despertar al final del ciclo (justo tras REM) se siente fresco al instante. Recomendación adulta: 4–6 ciclos (6–9 horas).' },
  'pt-br': { metaTitle: 'Calculadora do Sono: a que horas dormir?', metaDescription: 'Descubra a melhor hora para dormir e acordar disposto. Informe a hora em que quer acordar e receba 4 horários para dormir baseados em ciclos de 90 minutos.', pageTitle: 'Calculadora de Ciclo do Sono', pageIntro: 'Acordar no fim de um ciclo de 90 min é o que traz mais disposição. Informe a hora em que quer acordar e veja 4 horários recomendados para dormir.', wakeTime: 'Hora de acordar', calculate: 'Calcular', resultHeader: 'Horários recomendados para dormir', cyclesLabel: 'ciclos', helpRow: '(considerando 14 min para pegar no sono)', aboutHeader: 'Por que os ciclos importam', aboutBody: 'O sono acontece em ciclos de 90 min (leve → profundo → REM). Acordar no meio de um ciclo causa inércia do sono (sensação de estar grogue) por mais de 30 min. Acordar no fim do ciclo (logo após o REM) traz disposição imediata. Recomendação para adultos: 4–6 ciclos (6–9 horas).' },
  id: { metaTitle: 'Kalkulator Tidur: Jam Berapa Sebaiknya Tidur?', metaDescription: 'Ingin bangun segar? Masukkan jam bangun Anda dan dapatkan 4 rekomendasi jam tidur berdasarkan siklus tidur 90 menit. Gratis dan instan.', pageTitle: 'Kalkulator Siklus Tidur', pageIntro: 'Bangun di akhir siklus 90 menit terasa paling segar. Masukkan jam bangun Anda untuk mendapatkan 4 rekomendasi jam tidur.', wakeTime: 'Jam bangun', calculate: 'Hitung', resultHeader: 'Rekomendasi jam tidur', cyclesLabel: 'siklus', helpRow: '(asumsi 14 menit untuk terlelap)', aboutHeader: 'Mengapa siklus tidur penting', aboutBody: 'Tidur berlangsung dalam siklus 90 menit (ringan → nyenyak → REM). Bangun di tengah siklus memicu inersia tidur (rasa linglung) selama lebih dari 30 menit. Bangun di akhir siklus (tepat setelah REM) langsung terasa segar. Rekomendasi untuk orang dewasa: 4–6 siklus (6–9 jam).' },
  de: { metaTitle: 'Schlafrechner: Wann ins Bett, um fit aufzuwachen?', metaDescription: 'Wann sollten Sie ins Bett gehen, um erholt aufzuwachen? Weckzeit eingeben und 4 ideale Schlafenszeiten auf Basis von 90-Minuten-Zyklen erhalten.', pageTitle: 'Schlafzyklus-Rechner', pageIntro: 'Am Ende eines 90-Minuten-Zyklus aufzuwachen fühlt sich am besten an. Geben Sie Ihre Weckzeit ein und erhalten Sie 4 empfohlene Schlafenszeiten.', wakeTime: 'Weckzeit', calculate: 'Berechnen', resultHeader: 'Empfohlene Schlafenszeiten', cyclesLabel: 'Zyklen', helpRow: '(inkl. 14 Min. zum Einschlafen)', aboutHeader: 'Warum Schlafzyklen wichtig sind', aboutBody: 'Schlaf verläuft in 90-Minuten-Zyklen (Leichtschlaf → Tiefschlaf → REM). Wer mitten im Zyklus aufwacht, kämpft über 30 Minuten mit Schlafträgheit (Benommenheit). Wer am Ende eines Zyklus (direkt nach der REM-Phase) aufwacht, ist sofort frisch. Empfehlung für Erwachsene: 4–6 Zyklen (6–9 Stunden).' },
  fr: { metaTitle: 'Cycle de sommeil : à quelle heure se coucher ?', metaDescription: 'À quelle heure vous coucher pour vous réveiller en forme ? Entrez votre heure de réveil et obtenez 4 heures de coucher idéales (cycles de 90 min).', pageTitle: 'Calculateur de cycles de sommeil', pageIntro: 'Se réveiller à la fin d’un cycle de 90 min, c’est se lever en forme. Indiquez votre heure de réveil pour obtenir 4 heures de coucher recommandées.', wakeTime: 'Heure de réveil', calculate: 'Calculer', resultHeader: 'Heures de coucher recommandées', cyclesLabel: 'cycles', helpRow: '(en comptant 14 min d’endormissement)', aboutHeader: 'Pourquoi les cycles comptent', aboutBody: 'Le sommeil s’organise en cycles de 90 min (léger → profond → paradoxal). Se réveiller en plein cycle provoque une inertie du sommeil (sensation d’être groggy) pendant plus de 30 min. Se réveiller en fin de cycle (juste après le sommeil paradoxal) donne une sensation de fraîcheur immédiate. Recommandation pour l’adulte : 4 à 6 cycles (6 à 9 heures).' },
};

/* ─── Exercise calorie labels ─── */
export interface ExerciseLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  exercise: string; duration: string; weight: string; calculate: string;
  exerciseLabels: Record<ExerciseType, string>;
  resultLabel: string; helpResult: string;
  aboutHeader: string; aboutBody: string;
}
const EXERCISE_LABELS_KO: Record<ExerciseType, string> = { walking_brisk: '빠르게 걷기', running_8: '러닝 (8 km/h)', running_10: '러닝 (10 km/h)', running_12: '러닝 (12 km/h)', cycling_moderate: '사이클링 (보통)', cycling_vigorous: '사이클링 (격렬)', swimming_moderate: '수영 (보통)', swimming_vigorous: '수영 (격렬)', weight_training: '웨이트 트레이닝', yoga: '요가', pilates: '필라테스', hiking: '하이킹', jump_rope: '줄넘기', rowing: '로잉 머신', elliptical: '일립티컬', basketball: '농구', soccer: '축구', tennis: '테니스' };
const EXERCISE_LABELS_EN: Record<ExerciseType, string> = { walking_brisk: 'Brisk walking', running_8: 'Running (8 km/h)', running_10: 'Running (10 km/h)', running_12: 'Running (12 km/h)', cycling_moderate: 'Cycling (moderate)', cycling_vigorous: 'Cycling (vigorous)', swimming_moderate: 'Swimming (moderate)', swimming_vigorous: 'Swimming (vigorous)', weight_training: 'Weight training', yoga: 'Yoga', pilates: 'Pilates', hiking: 'Hiking', jump_rope: 'Jump rope', rowing: 'Rowing machine', elliptical: 'Elliptical', basketball: 'Basketball', soccer: 'Soccer', tennis: 'Tennis' };
const EXERCISE_LABELS_JA: Record<ExerciseType, string> = { walking_brisk: '早歩き', running_8: 'ランニング (8 km/h)', running_10: 'ランニング (10 km/h)', running_12: 'ランニング (12 km/h)', cycling_moderate: 'サイクリング (中)', cycling_vigorous: 'サイクリング (激)', swimming_moderate: '水泳 (中)', swimming_vigorous: '水泳 (激)', weight_training: 'ウェイトトレーニング', yoga: 'ヨガ', pilates: 'ピラティス', hiking: 'ハイキング', jump_rope: '縄跳び', rowing: 'ローイングマシン', elliptical: 'エリプティカル', basketball: 'バスケットボール', soccer: 'サッカー', tennis: 'テニス' };
const EXERCISE_LABELS_ZH: Record<ExerciseType, string> = { walking_brisk: '快走', running_8: '跑步 (8 km/h)', running_10: '跑步 (10 km/h)', running_12: '跑步 (12 km/h)', cycling_moderate: '骑行 (中)', cycling_vigorous: '骑行 (剧烈)', swimming_moderate: '游泳 (中)', swimming_vigorous: '游泳 (剧烈)', weight_training: '力量训练', yoga: '瑜伽', pilates: '普拉提', hiking: '徒步', jump_rope: '跳绳', rowing: '划船机', elliptical: '椭圆机', basketball: '篮球', soccer: '足球', tennis: '网球' };
const EXERCISE_LABELS_ZH_TW: Record<ExerciseType, string> = { walking_brisk: '快走', running_8: '跑步 (8 km/h)', running_10: '跑步 (10 km/h)', running_12: '跑步 (12 km/h)', cycling_moderate: '騎行 (中)', cycling_vigorous: '騎行 (劇烈)', swimming_moderate: '游泳 (中)', swimming_vigorous: '游泳 (劇烈)', weight_training: '力量訓練', yoga: '瑜伽', pilates: '皮拉提斯', hiking: '健行', jump_rope: '跳繩', rowing: '划船機', elliptical: '橢圓機', basketball: '籃球', soccer: '足球', tennis: '網球' };
const EXERCISE_LABELS_ES: Record<ExerciseType, string> = { walking_brisk: 'Caminata rápida', running_8: 'Correr (8 km/h)', running_10: 'Correr (10 km/h)', running_12: 'Correr (12 km/h)', cycling_moderate: 'Ciclismo (moderado)', cycling_vigorous: 'Ciclismo (vigoroso)', swimming_moderate: 'Natación (moderado)', swimming_vigorous: 'Natación (vigoroso)', weight_training: 'Entrenamiento con pesas', yoga: 'Yoga', pilates: 'Pilates', hiking: 'Senderismo', jump_rope: 'Comba', rowing: 'Máquina de remo', elliptical: 'Elíptica', basketball: 'Baloncesto', soccer: 'Fútbol', tennis: 'Tenis' };
const EXERCISE_LABELS_PT_BR: Record<ExerciseType, string> = { walking_brisk: 'Caminhada rápida', running_8: 'Corrida (8 km/h)', running_10: 'Corrida (10 km/h)', running_12: 'Corrida (12 km/h)', cycling_moderate: 'Ciclismo (moderado)', cycling_vigorous: 'Ciclismo (intenso)', swimming_moderate: 'Natação (moderada)', swimming_vigorous: 'Natação (intensa)', weight_training: 'Musculação', yoga: 'Ioga', pilates: 'Pilates', hiking: 'Trilha (caminhada)', jump_rope: 'Pular corda', rowing: 'Remo ergométrico', elliptical: 'Elíptico', basketball: 'Basquete', soccer: 'Futebol', tennis: 'Tênis' };
const EXERCISE_LABELS_ID: Record<ExerciseType, string> = { walking_brisk: 'Jalan cepat', running_8: 'Lari (8 km/jam)', running_10: 'Lari (10 km/jam)', running_12: 'Lari (12 km/jam)', cycling_moderate: 'Bersepeda (sedang)', cycling_vigorous: 'Bersepeda (berat)', swimming_moderate: 'Berenang (sedang)', swimming_vigorous: 'Berenang (berat)', weight_training: 'Latihan beban', yoga: 'Yoga', pilates: 'Pilates', hiking: 'Mendaki', jump_rope: 'Lompat tali', rowing: 'Mesin dayung', elliptical: 'Mesin elips', basketball: 'Bola basket', soccer: 'Sepak bola', tennis: 'Tenis' };
const EXERCISE_LABELS_DE: Record<ExerciseType, string> = { walking_brisk: 'Zügiges Gehen', running_8: 'Laufen (8 km/h)', running_10: 'Laufen (10 km/h)', running_12: 'Laufen (12 km/h)', cycling_moderate: 'Radfahren (moderat)', cycling_vigorous: 'Radfahren (intensiv)', swimming_moderate: 'Schwimmen (moderat)', swimming_vigorous: 'Schwimmen (intensiv)', weight_training: 'Krafttraining', yoga: 'Yoga', pilates: 'Pilates', hiking: 'Wandern', jump_rope: 'Seilspringen', rowing: 'Rudergerät', elliptical: 'Crosstrainer', basketball: 'Basketball', soccer: 'Fußball', tennis: 'Tennis' };
const EXERCISE_LABELS_FR: Record<ExerciseType, string> = { walking_brisk: 'Marche rapide', running_8: 'Course à pied (8 km/h)', running_10: 'Course à pied (10 km/h)', running_12: 'Course à pied (12 km/h)', cycling_moderate: 'Vélo (modéré)', cycling_vigorous: 'Vélo (intense)', swimming_moderate: 'Natation (modérée)', swimming_vigorous: 'Natation (intense)', weight_training: 'Musculation', yoga: 'Yoga', pilates: 'Pilates', hiking: 'Randonnée', jump_rope: 'Corde à sauter', rowing: 'Rameur', elliptical: 'Vélo elliptique', basketball: 'Basket-ball', soccer: 'Football', tennis: 'Tennis' };
export const EXERCISE_CAL_LABELS: Record<ToolLang, ExerciseLabels> = {
  ko: { pageTitle: '운동 칼로리 소모 계산기', pageIntro: 'METs × 체중 × 시간으로 실제 운동별 정확한 칼로리 소모를 계산 (Compendium of Physical Activities 2024).', exercise: '운동 종류', duration: '운동 시간 (분)', weight: '체중 (kg)', calculate: '계산하기', exerciseLabels: EXERCISE_LABELS_KO, resultLabel: '소모 칼로리', helpResult: '실제 체성분에 따라 ±15% 차이 가능', aboutHeader: 'METs란?', aboutBody: 'METs(Metabolic Equivalent of Task)는 안정시 에너지 대비 운동 에너지 배율입니다. 예) 빠르게 걷기 4.3 METs = 안정시의 4.3배 칼로리 소모. 공식: METs × 3.5 × 체중(kg) × 시간(분) / 200 = 칼로리.' },
  en: { pageTitle: 'Exercise Calorie Burn Calculator', pageIntro: 'METs × weight × time gives the actual calorie burn for any activity (Compendium of Physical Activities 2024).', exercise: 'Exercise', duration: 'Duration (min)', weight: 'Weight (kg)', calculate: 'Calculate', exerciseLabels: EXERCISE_LABELS_EN, resultLabel: 'Calories burned', helpResult: 'Actual burn varies ±15% by body composition', aboutHeader: 'What are METs?', aboutBody: 'METs (Metabolic Equivalent of Task) = energy cost vs. resting. Brisk walking at 4.3 METs burns 4.3× resting calories. Formula: METs × 3.5 × weight(kg) × time(min) / 200 = kcal.' },
  ja: { pageTitle: '運動カロリー消費計算機', pageIntro: 'METs × 体重 × 時間で運動別の正確なカロリー消費を計算 (Compendium of Physical Activities 2024)。', exercise: '運動種類', duration: '運動時間 (分)', weight: '体重 (kg)', calculate: '計算', exerciseLabels: EXERCISE_LABELS_JA, resultLabel: '消費カロリー', helpResult: '体組成により±15%差あり', aboutHeader: 'METsとは?', aboutBody: 'METs(代謝当量)は安静時を1とした運動エネルギー倍率。例)早歩き4.3 METs = 安静時の4.3倍消費。計算式:METs × 3.5 × 体重(kg) × 時間(分) / 200 = kcal。' },
  zh: { pageTitle: '运动卡路里消耗计算器', pageIntro: 'METs × 体重 × 时间精确计算每种运动的卡路里消耗 (Compendium of Physical Activities 2024)。', exercise: '运动种类', duration: '运动时长 (分钟)', weight: '体重 (kg)', calculate: '计算', exerciseLabels: EXERCISE_LABELS_ZH, resultLabel: '消耗卡路里', helpResult: '实际消耗因体成分±15%', aboutHeader: '什么是 METs?', aboutBody: 'METs(代谢当量)是相对静息状态的能量倍率。例)快走4.3 METs = 静息时的4.3倍消耗。公式:METs × 3.5 × 体重(kg) × 时间(分钟) / 200 = kcal。' },
  'zh-tw': { pageTitle: '運動卡路里消耗計算機', pageIntro: 'METs × 體重 × 時間精確計算每種運動的卡路里消耗 (Compendium of Physical Activities 2024)。', exercise: '運動種類', duration: '運動時長 (分鐘)', weight: '體重 (kg)', calculate: '計算', exerciseLabels: EXERCISE_LABELS_ZH_TW, resultLabel: '消耗卡路里', helpResult: '實際消耗因體組成±15%', aboutHeader: '什麼是 METs?', aboutBody: 'METs(代謝當量)是相對靜息狀態的能量倍率。例)快走4.3 METs = 靜息時的4.3倍消耗。公式:METs × 3.5 × 體重(kg) × 時間(分鐘) / 200 = kcal。' },
  es: { pageTitle: 'Calculadora de Calorías por Ejercicio', pageIntro: 'METs × peso × tiempo calcula la quema real por actividad (Compendium of Physical Activities 2024).', exercise: 'Ejercicio', duration: 'Duración (min)', weight: 'Peso (kg)', calculate: 'Calcular', exerciseLabels: EXERCISE_LABELS_ES, resultLabel: 'Calorías quemadas', helpResult: 'La quema real varía ±15% según composición corporal', aboutHeader: '¿Qué son los METs?', aboutBody: 'METs (Equivalente Metabólico de Tarea) = coste energético vs. reposo. Caminar rápido 4.3 METs = 4.3× las calorías en reposo. Fórmula: METs × 3.5 × peso(kg) × tiempo(min) / 200 = kcal.' },
  'pt-br': { metaTitle: 'Quantas calorias gasto no exercício? Calcule', metaDescription: 'Calcule quantas calorias você gasta correndo, caminhando, nadando, na musculação e em outras 14 atividades, pelo seu peso. Valores METs do Compendium 2024.', pageTitle: 'Calculadora de Calorias Gastas no Exercício', pageIntro: 'METs × peso × tempo mostram o gasto calórico real de cada atividade (Compendium of Physical Activities 2024).', exercise: 'Exercício', duration: 'Duração (min)', weight: 'Peso (kg)', calculate: 'Calcular', exerciseLabels: EXERCISE_LABELS_PT_BR, resultLabel: 'Calorias gastas', helpResult: 'O gasto real varia ±15% conforme a composição corporal', aboutHeader: 'O que são METs?', aboutBody: 'METs (Equivalente Metabólico da Tarefa) = gasto de energia em relação ao repouso. Caminhar rápido a 4,3 METs gasta 4,3× as calorias do repouso. Fórmula: METs × 3,5 × peso (kg) × tempo (min) / 200 = kcal.' },
  id: { metaTitle: 'Kalkulator Kalori Olahraga: Berapa yang Terbakar?', metaDescription: 'Hitung kalori yang terbakar saat lari, jalan cepat, berenang, latihan beban, dan 14 aktivitas lainnya sesuai berat badan Anda. Nilai METs Compendium 2024.', pageTitle: 'Kalkulator Kalori Olahraga', pageIntro: 'METs × berat badan × durasi menghitung pembakaran kalori sebenarnya untuk setiap aktivitas (Compendium of Physical Activities 2024).', exercise: 'Jenis olahraga', duration: 'Durasi (menit)', weight: 'Berat badan (kg)', calculate: 'Hitung', exerciseLabels: EXERCISE_LABELS_ID, resultLabel: 'Kalori terbakar', helpResult: 'Pembakaran sebenarnya bisa berbeda ±15% tergantung komposisi tubuh', aboutHeader: 'Apa itu METs?', aboutBody: 'METs (Metabolic Equivalent of Task) = kebutuhan energi dibandingkan saat istirahat. Jalan cepat 4,3 METs membakar 4,3× kalori saat istirahat. Rumus: METs × 3,5 × berat badan (kg) × waktu (menit) / 200 = kkal.' },
  de: { metaTitle: 'Kalorienverbrauch berechnen: Was verbrennt Sport?', metaDescription: 'Wie viele Kalorien verbrennen Sie beim Laufen, Gehen, Schwimmen oder Krafttraining? Berechnen Sie den Verbrauch für 18 Sportarten nach Gewicht (MET 2024).', pageTitle: 'Kalorienverbrauch-Rechner für Sport', pageIntro: 'METs × Gewicht × Dauer ergibt den tatsächlichen Kalorienverbrauch jeder Aktivität (Compendium of Physical Activities 2024).', exercise: 'Sportart', duration: 'Dauer (Min.)', weight: 'Gewicht (kg)', calculate: 'Berechnen', exerciseLabels: EXERCISE_LABELS_DE, resultLabel: 'Verbrannte Kalorien', helpResult: 'Der tatsächliche Verbrauch schwankt je nach Körperzusammensetzung um ±15 %', aboutHeader: 'Was sind METs?', aboutBody: 'METs (metabolisches Äquivalent) = Energieumsatz im Verhältnis zum Ruhezustand. Zügiges Gehen mit 4,3 METs verbraucht das 4,3-Fache des Ruheumsatzes. Formel: METs × 3,5 × Gewicht (kg) × Zeit (Min.) / 200 = kcal.' },
  fr: { metaTitle: 'Calories brûlées : combien par sport ? Calculez', metaDescription: 'Combien de calories brûlez-vous en courant, en marchant, en nageant ou en musculation ? Calculez votre dépense pour 18 activités selon votre poids.', pageTitle: 'Calculateur de calories brûlées par sport', pageIntro: 'METs × poids × durée donnent la dépense calorique réelle de chaque activité (Compendium of Physical Activities 2024).', exercise: 'Activité', duration: 'Durée (min)', weight: 'Poids (kg)', calculate: 'Calculer', exerciseLabels: EXERCISE_LABELS_FR, resultLabel: 'Calories brûlées', helpResult: 'La dépense réelle varie de ±15 % selon la composition corporelle', aboutHeader: 'Que sont les METs ?', aboutBody: 'Les METs (équivalents métaboliques) = dépense d’énergie par rapport au repos. La marche rapide à 4,3 METs brûle 4,3× les calories dépensées au repos. Formule : METs × 3,5 × poids (kg) × durée (min) / 200 = kcal.' },
};
