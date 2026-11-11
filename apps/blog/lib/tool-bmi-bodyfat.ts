/**
 * BMI(+허리-키 비율)·체지방률(미 해군 공식) 계산기 문구 — 10개 언어.
 * ko·en 직접 작성, 나머지 8개 언어는 구독 claude -p 번역 후 분류 기준(언어별 표준)을 대조.
 * BMI 분류: ko 대한비만학회(18.5/23/25/30/35), ja 日本肥満学会(18.5/25/30/35/40), zh WS/T 428-2013(18.5/24/28),
 * zh-tw 국민건강서(18.5/24/27/30/35), 그 외 WHO(18.5/25/30). 체지방 범위는 ACE.
 */
import type { ToolLang, ToolMeta } from './tool-labels';
import type { ToolSeo } from './tool-seo';

export interface BmiLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  weight: string; height: string; units: string; metric: string; imperial: string; feet: string; inches: string;
  waist: string; calculate: string; bmiLabel: string; categoryLabel: string; whtrLabel: string;
  whtrBelow: string; whtrAbove: string; invalid: string; standardName: string; standardNote: string;
  categoryNames: string[]; cuts: number[]; tableHeader: string;
  aboutHeader: string; aboutBody: string; formulaHeader: string; formulaBody: string;
}
export interface BodyFatLabels extends ToolMeta {
  pageTitle: string; pageIntro: string;
  sex: string; male: string; female: string;
  height: string; neck: string; waist: string; hip: string;
  units: string; metric: string; imperial: string; feet: string; inches: string;
  calculate: string; resultLabel: string; categoryLabel: string; invalid: string;
  categoryNames: string[]; rangeHeader: string; estimateNote: string;
  aboutHeader: string; aboutBody: string; measureHeader: string; measureBody: string;
  formulaHeader: string; formulaBody: string;
}
type Banner = { limit: string; havit: string };
type Idx = { title: string; desc: string };

export const BMI_LABELS: Record<ToolLang, BmiLabels> = {
  "ko": {
    "pageTitle": "BMI 계산기 (허리-키 비율 포함)",
    "pageIntro": "키와 몸무게로 체질량지수(BMI)를 계산하고, 허리둘레를 입력하면 허리-키 비율(WHtR)도 함께 확인할 수 있어요. 비만 분류는 대한비만학회 기준(아시아-태평양 기준)을 사용합니다.",
    "weight": "체중",
    "height": "키",
    "units": "단위",
    "metric": "미터법(kg/cm)",
    "imperial": "야드파운드(lb/ft)",
    "feet": "피트",
    "inches": "인치",
    "waist": "허리둘레 (선택, 허리-키 비율 계산용)",
    "calculate": "계산하기",
    "bmiLabel": "BMI (체질량지수)",
    "categoryLabel": "분류",
    "whtrLabel": "허리-키 비율 (WHtR)",
    "whtrBelow": "0.5 미만이에요. 허리둘레가 키의 절반보다 작습니다.",
    "whtrAbove": "0.5 이상이에요. 허리둘레가 키의 절반 이상입니다. 허리-키 비율은 복부 지방 분포를 보는 참고 지표예요.",
    "invalid": "체중과 키를 올바르게 입력해 주세요.",
    "standardName": "대한비만학회",
    "standardNote": "분류 기준: 대한비만학회(아시아-태평양 기준). 이 기준은 성인용이며 만 18세 미만에는 맞지 않아요.",
    "categoryNames": [
      "저체중",
      "정상",
      "과체중(비만 전단계)",
      "1단계 비만",
      "2단계 비만",
      "3단계 비만"
    ],
    "cuts": [
      18.5,
      23,
      25,
      30,
      35
    ],
    "tableHeader": "BMI 분류표",
    "aboutHeader": "이 계산기에 대해",
    "aboutBody": "BMI는 체중(kg)을 키(m)의 제곱으로 나눈 값으로, 집단 수준에서 체중 상태를 가늠하는 가장 널리 쓰이는 지표예요. 다만 근육과 지방을 구분하지 못하고 지방이 어디에 붙어 있는지도 알려 주지 못해요. 허리-키 비율은 허리둘레를 키로 나눈 값으로, 0.5를 경계로 보는 방식(Ashwell)이 널리 알려져 있어요.",
    "formulaHeader": "계산 공식",
    "formulaBody": "BMI = 체중(kg) ÷ 키(m)²\n허리-키 비율 = 허리둘레(cm) ÷ 키(cm)\n분류: 대한비만학회 — 18.5 / 23 / 25 / 30 / 35"
  },
  "en": {
    "pageTitle": "BMI Calculator (with Waist-to-Height Ratio)",
    "pageIntro": "Enter your height and weight to calculate body mass index (BMI). Add your waist to also get your waist-to-height ratio. Categories follow the WHO adult cutoffs.",
    "weight": "Weight",
    "height": "Height",
    "units": "Units",
    "metric": "Metric (kg/cm)",
    "imperial": "Imperial (lb/ft)",
    "feet": "ft",
    "inches": "in",
    "waist": "Waist (optional, for waist-to-height ratio)",
    "calculate": "Calculate",
    "bmiLabel": "BMI (Body Mass Index)",
    "categoryLabel": "Category",
    "whtrLabel": "Waist-to-height ratio (WHtR)",
    "whtrBelow": "Below 0.5, meaning your waist is less than half your height.",
    "whtrAbove": "0.5 or above, meaning your waist is at least half your height. WHtR is a reference for how weight is distributed around the midsection.",
    "invalid": "Please enter a valid weight and height.",
    "standardName": "WHO",
    "standardNote": "Categories: World Health Organization adult cutoffs. They apply to adults only, not to children or teens under 18.",
    "categoryNames": [
      "Underweight",
      "Normal weight",
      "Overweight",
      "Obesity"
    ],
    "cuts": [
      18.5,
      25,
      30
    ],
    "tableHeader": "BMI categories",
    "aboutHeader": "About this calculator",
    "aboutBody": "BMI is weight in kilograms divided by height in meters squared, and it is the most widely used population-level screen for weight status. It cannot tell muscle from fat or show where fat is carried. Waist-to-height ratio is your waist divided by your height, and a boundary of 0.5 is commonly used (Ashwell).",
    "formulaHeader": "Formula",
    "formulaBody": "BMI = weight (kg) ÷ height (m)²\nWaist-to-height ratio = waist (cm) ÷ height (cm)\nCategories: WHO — 18.5 / 25 / 30"
  },
  "ja": {
    "pageTitle": "BMI計算(ウエスト身長比つき)",
    "pageIntro": "身長と体重を入力すると、BMI(体格指数)を計算します。ウエストも入力すると、ウエスト身長比もわかります。分類は日本肥満学会の成人の基準(『肥満症診療ガイドライン2022』)に基づいています。",
    "weight": "体重",
    "height": "身長",
    "units": "単位",
    "metric": "メートル法(kg/cm)",
    "imperial": "ヤード・ポンド法(lb/ft)",
    "feet": "ft",
    "inches": "in",
    "waist": "ウエスト(任意・ウエスト身長比用)",
    "calculate": "計算する",
    "bmiLabel": "BMI(体格指数)",
    "categoryLabel": "分類",
    "whtrLabel": "ウエスト身長比(WHtR)",
    "whtrBelow": "0.5未満です。ウエストが身長の半分より小さいことを意味します。",
    "whtrAbove": "0.5以上です。ウエストが身長の半分以上であることを意味します。WHtRは、お腹まわりに体重がどう分布しているかの目安です。",
    "invalid": "正しい体重と身長を入力してください。",
    "standardName": "日本肥満学会",
    "standardNote": "分類:日本肥満学会の成人の基準(『肥満症診療ガイドライン2022』)。成人のみが対象で、18歳未満の子どもや10代には当てはまりません。",
    "categoryNames": [
      "低体重",
      "普通体重",
      "肥満(1度)",
      "肥満(2度)",
      "肥満(3度)",
      "肥満(4度)"
    ],
    "cuts": [
      18.5,
      25,
      30,
      35,
      40
    ],
    "tableHeader": "BMIの分類",
    "aboutHeader": "この計算ツールについて",
    "aboutBody": "BMIは体重(kg)を身長(m)の2乗で割った値で、集団レベルで体格を判定する指標として最も広く使われています。日本肥満学会はBMI 22を標準とし、18.5未満を低体重、25以上を肥満として、肥満を1度から4度に区分しています。ただし、BMIでは筋肉と脂肪を区別できず、脂肪がどこについているかもわかりません。ウエスト身長比はウエストを身長で割った値で、0.5が境界としてよく使われます(Ashwell)。",
    "formulaHeader": "計算式",
    "formulaBody": "BMI = 体重(kg)÷ 身長(m)²\nウエスト身長比 = ウエスト(cm)÷ 身長(cm)\n分類:日本肥満学会 — 18.5 / 25 / 30 / 35 / 40"
  },
  "zh": {
    "pageTitle": "BMI 计算器(含腰围身高比)",
    "pageIntro": "输入身高和体重,即可计算身体质量指数(BMI)。再填上腰围,还能算出腰围身高比。分类采用国家卫健委《成人体重判定》(WS/T 428-2013)标准。",
    "weight": "体重",
    "height": "身高",
    "units": "单位",
    "metric": "公制(kg/cm)",
    "imperial": "英制(lb/ft)",
    "feet": "英尺",
    "inches": "英寸",
    "waist": "腰围(选填,用于计算腰围身高比)",
    "calculate": "计算",
    "bmiLabel": "BMI(身体质量指数)",
    "categoryLabel": "分类",
    "whtrLabel": "腰围身高比(WHtR)",
    "whtrBelow": "低于 0.5,表示腰围不到身高的一半。",
    "whtrAbove": "0.5 或以上,表示腰围达到或超过身高的一半。WHtR 可用来参考体重在腰腹部的分布情况。",
    "invalid": "请输入有效的体重和身高。",
    "standardName": "国家卫健委 WS/T 428-2013",
    "standardNote": "分类依据:国家卫生健康委员会行业标准《成人体重判定》(WS/T 428-2013)。仅适用于成年人,不适用于 18 岁以下的儿童和青少年。",
    "categoryNames": [
      "低体重",
      "正常",
      "超重",
      "肥胖"
    ],
    "cuts": [
      18.5,
      24,
      28
    ],
    "tableHeader": "BMI 分类",
    "aboutHeader": "关于本计算器",
    "aboutBody": "BMI 是体重(千克)除以身高(米)的平方,是人群层面最常用的体重状况筛查指标。它无法区分肌肉和脂肪,也看不出脂肪分布在哪里。本计算器的分类采用国家卫健委《成人体重判定》(WS/T 428-2013)标准。腰围身高比是腰围除以身高,常用 0.5 作为分界值(Ashwell)。",
    "formulaHeader": "计算公式",
    "formulaBody": "BMI = 体重 (kg) ÷ 身高 (m)²\n腰围身高比 = 腰围 (cm) ÷ 身高 (cm)\n分类:国家卫健委 WS/T 428-2013 — 18.5 / 24 / 28"
  },
  "zh-tw": {
    "pageTitle": "BMI 計算機(含腰高比)",
    "pageIntro": "輸入身高和體重,即可計算身體質量指數(BMI)。再加上腰圍,還能算出腰高比。分類採用衛生福利部國民健康署的成人標準。",
    "weight": "體重",
    "height": "身高",
    "units": "單位",
    "metric": "公制(kg/cm)",
    "imperial": "英制(lb/ft)",
    "feet": "呎",
    "inches": "吋",
    "waist": "腰圍(選填,用於計算腰高比)",
    "calculate": "計算",
    "bmiLabel": "BMI(身體質量指數)",
    "categoryLabel": "分類",
    "whtrLabel": "腰高比(WHtR)",
    "whtrBelow": "低於 0.5,表示腰圍小於身高的一半。",
    "whtrAbove": "0.5 以上,表示腰圍至少是身高的一半。腰高比可作為了解體重在腹部周圍分布情形的參考。",
    "invalid": "請輸入有效的體重和身高。",
    "standardName": "衛福部國健署",
    "standardNote": "分類:衛生福利部國民健康署成人標準。僅適用於成人,不適用於未滿 18 歲的兒童及青少年。",
    "categoryNames": [
      "過輕",
      "健康體位",
      "過重",
      "輕度肥胖",
      "中度肥胖",
      "重度肥胖"
    ],
    "cuts": [
      18.5,
      24,
      27,
      30,
      35
    ],
    "tableHeader": "BMI 分類",
    "aboutHeader": "關於這個計算機",
    "aboutBody": "BMI 是體重(公斤)除以身高(公尺)的平方,是最廣泛用於族群層面篩檢體重狀態的指標。分類採用衛生福利部國民健康署的成人標準。BMI 無法區分肌肉與脂肪,也看不出脂肪分布在哪裡。腰高比是腰圍除以身高,常以 0.5 作為分界(Ashwell)。",
    "formulaHeader": "公式",
    "formulaBody": "BMI = 體重 (kg) ÷ 身高 (m)²\n腰高比 = 腰圍 (cm) ÷ 身高 (cm)\n分類:衛福部國健署 — 18.5 / 24 / 27 / 30 / 35"
  },
  "es": {
    "pageTitle": "Calculadora de IMC (con índice cintura-estatura)",
    "pageIntro": "Ingresa tu estatura y tu peso para calcular el índice de masa corporal (IMC). Agrega tu cintura para obtener también tu índice cintura-estatura. Las categorías siguen los puntos de corte de la OMS para adultos.",
    "weight": "Peso",
    "height": "Estatura",
    "units": "Unidades",
    "metric": "Métrico (kg/cm)",
    "imperial": "Imperial (lb/ft)",
    "feet": "pies",
    "inches": "pulg",
    "waist": "Cintura (opcional, para el índice cintura-estatura)",
    "calculate": "Calcular",
    "bmiLabel": "IMC (índice de masa corporal)",
    "categoryLabel": "Categoría",
    "whtrLabel": "Índice cintura-estatura (ICE)",
    "whtrBelow": "Menos de 0.5: tu cintura mide menos de la mitad de tu estatura.",
    "whtrAbove": "0.5 o más: tu cintura mide al menos la mitad de tu estatura. El ICE sirve como referencia de cómo se distribuye el peso en la zona abdominal.",
    "invalid": "Ingresa un peso y una estatura válidos.",
    "standardName": "OMS",
    "standardNote": "Categorías: puntos de corte de la Organización Mundial de la Salud para adultos. Solo se aplican a adultos, no a niños ni adolescentes menores de 18 años.",
    "categoryNames": [
      "Bajo peso",
      "Peso normal",
      "Sobrepeso",
      "Obesidad"
    ],
    "cuts": [
      18.5,
      25,
      30
    ],
    "tableHeader": "Categorías de IMC",
    "aboutHeader": "Sobre esta calculadora",
    "aboutBody": "El IMC es el peso en kilogramos dividido entre la estatura en metros al cuadrado, y es la herramienta de cribado del estado de peso más usada a nivel poblacional. No distingue el músculo de la grasa ni muestra dónde se acumula la grasa. El índice cintura-estatura es tu cintura dividida entre tu estatura, y suele usarse 0.5 como límite (Ashwell).",
    "formulaHeader": "Fórmula",
    "formulaBody": "IMC = peso (kg) ÷ estatura (m)²\nÍndice cintura-estatura = cintura (cm) ÷ estatura (cm)\nCategorías: OMS — 18.5 / 25 / 30"
  },
  "pt-br": {
    "pageTitle": "Calculadora de IMC (com relação cintura-altura)",
    "pageIntro": "Informe sua altura e seu peso para calcular o índice de massa corporal (IMC). Se informar também a cintura, você vê sua relação cintura-altura. As categorias seguem os pontos de corte da OMS para adultos.",
    "weight": "Peso",
    "height": "Altura",
    "units": "Unidades",
    "metric": "Métrico (kg/cm)",
    "imperial": "Imperial (lb/ft)",
    "feet": "pés",
    "inches": "pol",
    "waist": "Cintura (opcional, para a relação cintura-altura)",
    "calculate": "Calcular",
    "bmiLabel": "IMC (Índice de Massa Corporal)",
    "categoryLabel": "Categoria",
    "whtrLabel": "Relação cintura-altura (RCA)",
    "whtrBelow": "Abaixo de 0.5: sua cintura mede menos da metade da sua altura.",
    "whtrAbove": "0.5 ou mais: sua cintura mede pelo menos metade da sua altura. A RCA é uma referência de como o peso se distribui na região abdominal.",
    "invalid": "Informe um peso e uma altura válidos.",
    "standardName": "OMS",
    "standardNote": "Categorias: pontos de corte da Organização Mundial da Saúde para adultos. Valem só para adultos, não para crianças ou adolescentes com menos de 18 anos.",
    "categoryNames": [
      "Abaixo do peso",
      "Peso normal",
      "Sobrepeso",
      "Obesidade"
    ],
    "cuts": [
      18.5,
      25,
      30
    ],
    "tableHeader": "Categorias de IMC",
    "aboutHeader": "Sobre esta calculadora",
    "aboutBody": "O IMC é o peso em quilogramas dividido pela altura em metros ao quadrado. É a triagem de peso mais usada em nível populacional. Ele não diferencia músculo de gordura nem mostra onde a gordura se concentra. A relação cintura-altura é a cintura dividida pela altura, e o limite de 0.5 é o mais usado (Ashwell).",
    "formulaHeader": "Fórmula",
    "formulaBody": "IMC = peso (kg) ÷ altura (m)²\nRelação cintura-altura = cintura (cm) ÷ altura (cm)\nCategorias: OMS — 18.5 / 25 / 30"
  },
  "id": {
    "pageTitle": "Kalkulator BMI (dengan Rasio Lingkar Pinggang terhadap Tinggi Badan)",
    "pageIntro": "Masukkan tinggi dan berat badan Anda untuk menghitung indeks massa tubuh (BMI). Tambahkan lingkar pinggang untuk sekaligus mendapatkan rasio lingkar pinggang terhadap tinggi badan. Kategori mengikuti batas WHO untuk orang dewasa.",
    "weight": "Berat badan",
    "height": "Tinggi badan",
    "units": "Satuan",
    "metric": "Metrik (kg/cm)",
    "imperial": "Imperial (lb/ft)",
    "feet": "ft",
    "inches": "in",
    "waist": "Lingkar pinggang (opsional, untuk rasio lingkar pinggang terhadap tinggi badan)",
    "calculate": "Hitung",
    "bmiLabel": "BMI (Indeks Massa Tubuh)",
    "categoryLabel": "Kategori",
    "whtrLabel": "Rasio lingkar pinggang terhadap tinggi badan (WHtR)",
    "whtrBelow": "Di bawah 0.5, artinya lingkar pinggang Anda kurang dari setengah tinggi badan.",
    "whtrAbove": "0.5 atau lebih, artinya lingkar pinggang Anda setidaknya setengah dari tinggi badan. WHtR adalah acuan tentang bagaimana berat badan tersebar di area perut.",
    "invalid": "Masukkan berat dan tinggi badan yang valid.",
    "standardName": "WHO",
    "standardNote": "Kategori: batas Organisasi Kesehatan Dunia (WHO) untuk orang dewasa. Batas ini hanya berlaku untuk orang dewasa, bukan untuk anak-anak atau remaja di bawah 18 tahun.",
    "categoryNames": [
      "Berat badan kurang",
      "Berat badan normal",
      "Berat badan berlebih",
      "Obesitas"
    ],
    "cuts": [
      18.5,
      25,
      30
    ],
    "tableHeader": "Kategori BMI",
    "aboutHeader": "Tentang kalkulator ini",
    "aboutBody": "BMI adalah berat badan dalam kilogram dibagi kuadrat tinggi badan dalam meter, dan merupakan alat skrining status berat badan tingkat populasi yang paling banyak digunakan. BMI tidak dapat membedakan otot dari lemak atau menunjukkan di mana lemak tersimpan. Rasio lingkar pinggang terhadap tinggi badan adalah lingkar pinggang dibagi tinggi badan, dan batas 0.5 umum digunakan (Ashwell).",
    "formulaHeader": "Rumus",
    "formulaBody": "BMI = berat badan (kg) ÷ tinggi badan (m)²\nRasio lingkar pinggang terhadap tinggi badan = lingkar pinggang (cm) ÷ tinggi badan (cm)\nKategori: WHO — 18.5 / 25 / 30"
  },
  "de": {
    "pageTitle": "BMI-Rechner (mit Taille-zu-Größe-Verhältnis)",
    "pageIntro": "Geben Sie Ihre Größe und Ihr Gewicht ein, um Ihren Body-Mass-Index (BMI) zu berechnen. Wenn Sie zusätzlich Ihren Taillenumfang angeben, erhalten Sie auch Ihr Taille-zu-Größe-Verhältnis. Die Kategorien folgen den WHO-Grenzwerten für Erwachsene.",
    "weight": "Gewicht",
    "height": "Größe",
    "units": "Einheiten",
    "metric": "Metrisch (kg/cm)",
    "imperial": "Imperial (lb/ft)",
    "feet": "ft",
    "inches": "in",
    "waist": "Taillenumfang (optional, für das Taille-zu-Größe-Verhältnis)",
    "calculate": "Berechnen",
    "bmiLabel": "BMI (Body-Mass-Index)",
    "categoryLabel": "Kategorie",
    "whtrLabel": "Taille-zu-Größe-Verhältnis (WHtR)",
    "whtrBelow": "Unter 0.5, das heißt, Ihr Taillenumfang ist kleiner als die Hälfte Ihrer Körpergröße.",
    "whtrAbove": "0.5 oder mehr, das heißt, Ihr Taillenumfang beträgt mindestens die Hälfte Ihrer Körpergröße. Das WHtR ist ein Anhaltspunkt dafür, wie sich das Gewicht im Bauchbereich verteilt.",
    "invalid": "Bitte geben Sie ein gültiges Gewicht und eine gültige Größe ein.",
    "standardName": "WHO",
    "standardNote": "Kategorien: Grenzwerte der Weltgesundheitsorganisation (WHO) für Erwachsene. Sie gelten nur für Erwachsene, nicht für Kinder oder Jugendliche unter 18 Jahren.",
    "categoryNames": [
      "Untergewicht",
      "Normalgewicht",
      "Übergewicht",
      "Adipositas"
    ],
    "cuts": [
      18.5,
      25,
      30
    ],
    "tableHeader": "BMI-Kategorien",
    "aboutHeader": "Über diesen Rechner",
    "aboutBody": "Der BMI ist das Gewicht in Kilogramm geteilt durch die Körpergröße in Metern zum Quadrat. Er ist das am weitesten verbreitete Screening-Maß für den Gewichtsstatus auf Bevölkerungsebene. Er kann jedoch weder Muskeln von Fett unterscheiden noch zeigen, wo Fett eingelagert ist. Das Taille-zu-Größe-Verhältnis ist Ihr Taillenumfang geteilt durch Ihre Körpergröße; häufig wird ein Grenzwert von 0.5 verwendet (Ashwell).",
    "formulaHeader": "Formel",
    "formulaBody": "BMI = Gewicht (kg) ÷ Größe (m)²\nTaille-zu-Größe-Verhältnis = Taillenumfang (cm) ÷ Größe (cm)\nKategorien: WHO — 18.5 / 25 / 30"
  },
  "fr": {
    "pageTitle": "Calculateur d'IMC (avec rapport tour de taille/taille)",
    "pageIntro": "Saisissez votre taille et votre poids pour calculer votre indice de masse corporelle (IMC). Ajoutez votre tour de taille pour obtenir aussi votre rapport tour de taille/taille. Les catégories suivent les seuils de l'OMS pour les adultes.",
    "weight": "Poids",
    "height": "Taille",
    "units": "Unités",
    "metric": "Métrique (kg/cm)",
    "imperial": "Impérial (lb/pi)",
    "feet": "pi",
    "inches": "po",
    "waist": "Tour de taille (facultatif, pour le rapport tour de taille/taille)",
    "calculate": "Calculer",
    "bmiLabel": "IMC (indice de masse corporelle)",
    "categoryLabel": "Catégorie",
    "whtrLabel": "Rapport tour de taille/taille (RTT)",
    "whtrBelow": "Inférieur à 0,5 : votre tour de taille est inférieur à la moitié de votre taille.",
    "whtrAbove": "0,5 ou plus : votre tour de taille est au moins égal à la moitié de votre taille. Le RTT est un repère sur la répartition du poids au niveau de l'abdomen.",
    "invalid": "Veuillez saisir un poids et une taille valides.",
    "standardName": "OMS",
    "standardNote": "Catégories : seuils de l'Organisation mondiale de la santé pour les adultes. Ils s'appliquent uniquement aux adultes, pas aux enfants ni aux adolescents de moins de 18 ans.",
    "categoryNames": [
      "Insuffisance pondérale",
      "Poids normal",
      "Surpoids",
      "Obésité"
    ],
    "cuts": [
      18.5,
      25,
      30
    ],
    "tableHeader": "Catégories d'IMC",
    "aboutHeader": "À propos de ce calculateur",
    "aboutBody": "L'IMC correspond au poids en kilogrammes divisé par le carré de la taille en mètres. C'est l'indicateur le plus utilisé à l'échelle de la population pour évaluer le statut pondéral. Il ne distingue pas le muscle de la graisse et n'indique pas où la graisse se situe. Le rapport tour de taille/taille correspond à votre tour de taille divisé par votre taille ; un seuil de 0,5 est couramment utilisé (Ashwell).",
    "formulaHeader": "Formule",
    "formulaBody": "IMC = poids (kg) ÷ taille (m)²\nRapport tour de taille/taille = tour de taille (cm) ÷ taille (cm)\nCatégories : OMS — 18,5 / 25 / 30"
  }
};

export const BODYFAT_LABELS: Record<ToolLang, BodyFatLabels> = {
  "ko": {
    "pageTitle": "체지방률 계산기 (미 해군 둘레 공식)",
    "pageIntro": "키와 목·허리(여성은 엉덩이 포함) 둘레를 줄자로 재어 입력하면 미 해군 공식으로 체지방률을 추정합니다. 인바디·DEXA 같은 장비 측정과는 차이가 날 수 있는 추정치예요.",
    "sex": "성별",
    "male": "남자",
    "female": "여자",
    "height": "키",
    "neck": "목둘레",
    "waist": "허리둘레",
    "hip": "엉덩이둘레 (여성)",
    "units": "단위",
    "metric": "미터법(cm)",
    "imperial": "야드파운드(in)",
    "feet": "피트",
    "inches": "인치",
    "calculate": "계산하기",
    "resultLabel": "추정 체지방률",
    "categoryLabel": "ACE 기준 범위",
    "invalid": "둘레 값을 확인해 주세요. 허리둘레는 목둘레보다 커야 해요.",
    "categoryNames": [
      "필수 지방 수준",
      "운동선수",
      "피트니스",
      "평균",
      "평균 이상"
    ],
    "rangeHeader": "체지방률 범위 (ACE)",
    "estimateNote": "이 값은 둘레로 계산한 추정치예요. InBody·DEXA 같은 장비 측정값과 다를 수 있고, 근육량이 많거나 지방이 붙는 위치가 다르면 오차가 더 커질 수 있어요.",
    "aboutHeader": "이 계산기에 대해",
    "aboutBody": "미 해군 방법(Hodgdon & Beckett, 1984)은 키와 몇 군데 둘레만으로 체지방률을 추정하는 방식이에요. 장비가 필요 없어서 간편하지만 추정치입니다. 범위 표는 미국운동협의회(ACE)의 체지방률 구분을 따랐어요.",
    "measureHeader": "재는 방법",
    "measureBody": "목: 후두(목젖) 바로 아래, 어깨를 내리고 잽니다. 허리: 남성은 배꼽 높이, 여성은 가장 가는 부위. 엉덩이(여성): 가장 굵은 부위. 숨을 내쉰 상태에서 줄자를 피부에 딱 맞게 두르세요.",
    "formulaHeader": "계산 공식",
    "formulaBody": "남성: 체지방률 = 495 ÷ (1.0324 − 0.19077×log10(허리−목) + 0.15456×log10(키)) − 450\n여성: 체지방률 = 495 ÷ (1.29579 − 0.35004×log10(허리+엉덩이−목) + 0.22100×log10(키)) − 450\n(길이는 모두 cm)"
  },
  "en": {
    "pageTitle": "Body Fat Calculator (U.S. Navy Method)",
    "pageIntro": "Measure your height and your neck and waist (plus hip for women) with a tape measure, and the U.S. Navy formula estimates your body fat percentage. It is an estimate and can differ from InBody or DEXA measurements.",
    "sex": "Sex",
    "male": "Male",
    "female": "Female",
    "height": "Height",
    "neck": "Neck",
    "waist": "Waist",
    "hip": "Hip (women)",
    "units": "Units",
    "metric": "Metric (cm)",
    "imperial": "Imperial (in)",
    "feet": "ft",
    "inches": "in",
    "calculate": "Calculate",
    "resultLabel": "Estimated body fat",
    "categoryLabel": "ACE range",
    "invalid": "Please check your measurements. Waist must be larger than neck.",
    "categoryNames": [
      "Essential fat",
      "Athletes",
      "Fitness",
      "Average",
      "Above average"
    ],
    "rangeHeader": "Body fat ranges (ACE)",
    "estimateNote": "This is an estimate from circumference measurements. It can differ from InBody or DEXA results, and the gap may be larger with high muscle mass or a different fat distribution.",
    "aboutHeader": "About this calculator",
    "aboutBody": "The U.S. Navy method (Hodgdon & Beckett, 1984) estimates body fat from height and a few circumferences. It needs no equipment, but it is an estimate. The range table follows the American Council on Exercise (ACE) body fat categories.",
    "measureHeader": "How to measure",
    "measureBody": "Neck: just below the larynx (Adam's apple), shoulders relaxed. Waist: at navel level for men, at the narrowest point for women. Hip (women): at the widest point. Measure after exhaling, with the tape snug against the skin.",
    "formulaHeader": "Formula",
    "formulaBody": "Male: body fat % = 495 ÷ (1.0324 − 0.19077×log10(waist−neck) + 0.15456×log10(height)) − 450\nFemale: body fat % = 495 ÷ (1.29579 − 0.35004×log10(waist+hip−neck) + 0.22100×log10(height)) − 450\n(all lengths in cm)"
  },
  "ja": {
    "pageTitle": "体脂肪率計算(米海軍方式)",
    "pageIntro": "メジャーで身長・首・ウエスト(女性はヒップも)を測ると、米海軍の計算式で体脂肪率を推定します。推定値のため、InBodyやDEXAでの測定結果とは異なる場合があります。",
    "sex": "性別",
    "male": "男性",
    "female": "女性",
    "height": "身長",
    "neck": "首",
    "waist": "ウエスト",
    "hip": "ヒップ(女性)",
    "units": "単位",
    "metric": "メートル法(cm)",
    "imperial": "ヤード・ポンド法(in)",
    "feet": "ft",
    "inches": "in",
    "calculate": "計算する",
    "resultLabel": "推定体脂肪率",
    "categoryLabel": "ACEの区分",
    "invalid": "測定値を確認してください。ウエストは首より大きい必要があります。",
    "categoryNames": [
      "必須脂肪",
      "アスリート",
      "フィットネス",
      "平均",
      "平均以上"
    ],
    "rangeHeader": "体脂肪率の区分(ACE)",
    "estimateNote": "これは周囲径の測定値から推定した値です。InBodyやDEXAの結果とは異なる場合があり、筋肉量が多い人や脂肪のつき方が異なる人では差が大きくなることがあります。",
    "aboutHeader": "この計算ツールについて",
    "aboutBody": "米海軍方式(Hodgdon & Beckett、1984年)は、身長といくつかの周囲径から体脂肪率を推定する方法です。機器は不要ですが、あくまで推定値です。区分表は米国運動協議会(ACE)の体脂肪率区分に基づいています。",
    "measureHeader": "測り方",
    "measureBody": "首:喉頭(のどぼとけ)のすぐ下で、肩の力を抜いて測ります。ウエスト:男性はへその高さ、女性はいちばん細い位置で測ります。ヒップ(女性):いちばん太い位置で測ります。息を吐いたあと、メジャーを肌に沿わせて測ってください。",
    "formulaHeader": "計算式",
    "formulaBody": "男性:体脂肪率(%)= 495 ÷ (1.0324 − 0.19077×log10(ウエスト−首) + 0.15456×log10(身長)) − 450\n女性:体脂肪率(%)= 495 ÷ (1.29579 − 0.35004×log10(ウエスト+ヒップ−首) + 0.22100×log10(身長)) − 450\n(長さはすべてcm)"
  },
  "zh": {
    "pageTitle": "体脂率计算器(美国海军法)",
    "pageIntro": "用软尺量出身高、颈围和腰围(女性再量臀围),即可用美国海军公式估算体脂率。结果是估算值,可能与 InBody 或 DEXA 的测量结果不同。",
    "sex": "性别",
    "male": "男",
    "female": "女",
    "height": "身高",
    "neck": "颈围",
    "waist": "腰围",
    "hip": "臀围(女性)",
    "units": "单位",
    "metric": "公制(cm)",
    "imperial": "英制(in)",
    "feet": "英尺",
    "inches": "英寸",
    "calculate": "计算",
    "resultLabel": "估算体脂率",
    "categoryLabel": "ACE 区间",
    "invalid": "请检查测量数据。腰围必须大于颈围。",
    "categoryNames": [
      "必需脂肪",
      "运动员",
      "健身",
      "一般",
      "高于一般"
    ],
    "rangeHeader": "体脂率区间(ACE)",
    "estimateNote": "这是根据围度测量得出的估算值,可能与 InBody 或 DEXA 的结果不同。肌肉量较大或脂肪分布不同时,差异可能更大。",
    "aboutHeader": "关于本计算器",
    "aboutBody": "美国海军法(Hodgdon & Beckett,1984)根据身高和几处围度估算体脂率。不需要任何设备,但结果是估算值。区间表采用美国运动委员会(ACE)的体脂率分类。",
    "measureHeader": "测量方法",
    "measureBody": "颈围:在喉结正下方测量,肩膀放松。腰围:男性在肚脐高度测量,女性在腰部最细处测量。臀围(女性):在臀部最宽处测量。呼气后测量,软尺贴紧皮肤。",
    "formulaHeader": "计算公式",
    "formulaBody": "男性:体脂率 % = 495 ÷ (1.0324 − 0.19077×log10(腰围−颈围) + 0.15456×log10(身高)) − 450\n女性:体脂率 % = 495 ÷ (1.29579 − 0.35004×log10(腰围+臀围−颈围) + 0.22100×log10(身高)) − 450\n(所有长度单位均为 cm)"
  },
  "zh-tw": {
    "pageTitle": "體脂率計算機(美國海軍法)",
    "pageIntro": "用皮尺量好身高、頸圍和腰圍(女性另加臀圍),就能用美國海軍公式推估體脂率。這是推估值,可能和 InBody 或 DEXA 的測量結果不同。",
    "sex": "性別",
    "male": "男性",
    "female": "女性",
    "height": "身高",
    "neck": "頸圍",
    "waist": "腰圍",
    "hip": "臀圍(女性)",
    "units": "單位",
    "metric": "公制(cm)",
    "imperial": "英制(in)",
    "feet": "呎",
    "inches": "吋",
    "calculate": "計算",
    "resultLabel": "推估體脂率",
    "categoryLabel": "ACE 範圍",
    "invalid": "請確認測量數值。腰圍必須大於頸圍。",
    "categoryNames": [
      "必需脂肪",
      "運動員",
      "健身族",
      "一般",
      "高於一般"
    ],
    "rangeHeader": "體脂率範圍(ACE)",
    "estimateNote": "這是根據圍度測量得出的推估值。可能和 InBody 或 DEXA 的結果不同,肌肉量較高或脂肪分布不同時,差距可能更大。",
    "aboutHeader": "關於這個計算機",
    "aboutBody": "美國海軍法(Hodgdon & Beckett,1984)是用身高和幾個圍度來推估體脂率。不需要任何器材,但結果是推估值。範圍表採用美國運動委員會(ACE)的體脂率分類。",
    "measureHeader": "測量方式",
    "measureBody": "頸圍:喉結正下方,肩膀放鬆。腰圍:男性量肚臍高度,女性量最細處。臀圍(女性):量最寬處。吐氣後再量,皮尺貼合皮膚。",
    "formulaHeader": "公式",
    "formulaBody": "男性:體脂率 % = 495 ÷ (1.0324 − 0.19077×log10(腰圍−頸圍) + 0.15456×log10(身高)) − 450\n女性:體脂率 % = 495 ÷ (1.29579 − 0.35004×log10(腰圍+臀圍−頸圍) + 0.22100×log10(身高)) − 450\n(所有長度單位皆為 cm)"
  },
  "es": {
    "pageTitle": "Calculadora de grasa corporal (método de la Marina de EE. UU.)",
    "pageIntro": "Mide tu estatura, tu cuello y tu cintura (y la cadera en mujeres) con una cinta métrica, y la fórmula de la Marina de EE. UU. (U.S. Navy) estima tu porcentaje de grasa corporal. Es una estimación y puede diferir de las mediciones con InBody o DEXA.",
    "sex": "Sexo",
    "male": "Hombre",
    "female": "Mujer",
    "height": "Estatura",
    "neck": "Cuello",
    "waist": "Cintura",
    "hip": "Cadera (mujeres)",
    "units": "Unidades",
    "metric": "Métrico (cm)",
    "imperial": "Imperial (in)",
    "feet": "pies",
    "inches": "pulg",
    "calculate": "Calcular",
    "resultLabel": "Grasa corporal estimada",
    "categoryLabel": "Rango ACE",
    "invalid": "Revisa tus medidas. La cintura debe ser mayor que el cuello.",
    "categoryNames": [
      "Grasa esencial",
      "Atletas",
      "Fitness",
      "Promedio",
      "Por encima del promedio"
    ],
    "rangeHeader": "Rangos de grasa corporal (ACE)",
    "estimateNote": "Esta es una estimación a partir de medidas de circunferencia. Puede diferir de los resultados de InBody o DEXA, y la diferencia puede ser mayor si tienes mucha masa muscular o una distribución de grasa distinta.",
    "aboutHeader": "Sobre esta calculadora",
    "aboutBody": "El método de la Marina de EE. UU. (Hodgdon & Beckett, 1984) estima la grasa corporal a partir de la estatura y algunas circunferencias. No requiere equipo, pero es una estimación. La tabla de rangos sigue las categorías de grasa corporal del Consejo Estadounidense del Ejercicio (ACE).",
    "measureHeader": "Cómo medir",
    "measureBody": "Cuello: justo debajo de la laringe (manzana de Adán), con los hombros relajados. Cintura: a la altura del ombligo en hombres y en el punto más estrecho en mujeres. Cadera (mujeres): en el punto más ancho. Mide después de exhalar, con la cinta ajustada a la piel.",
    "formulaHeader": "Fórmula",
    "formulaBody": "Hombre: % de grasa corporal = 495 ÷ (1.0324 − 0.19077×log10(cintura−cuello) + 0.15456×log10(estatura)) − 450\nMujer: % de grasa corporal = 495 ÷ (1.29579 − 0.35004×log10(cintura+cadera−cuello) + 0.22100×log10(estatura)) − 450\n(todas las longitudes en cm)"
  },
  "pt-br": {
    "pageTitle": "Calculadora de gordura corporal (método da Marinha dos EUA)",
    "pageIntro": "Meça com uma fita métrica sua altura, o pescoço e a cintura (e o quadril, para mulheres). A fórmula da Marinha dos EUA (U.S. Navy) estima seu percentual de gordura corporal. É uma estimativa e pode diferir de medições por InBody ou DEXA.",
    "sex": "Sexo",
    "male": "Masculino",
    "female": "Feminino",
    "height": "Altura",
    "neck": "Pescoço",
    "waist": "Cintura",
    "hip": "Quadril (mulheres)",
    "units": "Unidades",
    "metric": "Métrico (cm)",
    "imperial": "Imperial (in)",
    "feet": "pés",
    "inches": "pol",
    "calculate": "Calcular",
    "resultLabel": "Gordura corporal estimada",
    "categoryLabel": "Faixa ACE",
    "invalid": "Confira suas medidas. A cintura precisa ser maior que o pescoço.",
    "categoryNames": [
      "Gordura essencial",
      "Atletas",
      "Fitness",
      "Média",
      "Acima da média"
    ],
    "rangeHeader": "Faixas de gordura corporal (ACE)",
    "estimateNote": "Esta é uma estimativa feita a partir de circunferências. Pode diferir dos resultados de InBody ou DEXA, e a diferença pode ser maior com muita massa muscular ou outra distribuição de gordura.",
    "aboutHeader": "Sobre esta calculadora",
    "aboutBody": "O método da Marinha dos EUA (Hodgdon & Beckett, 1984) estima a gordura corporal a partir da altura e de algumas circunferências. Não exige equipamento, mas é uma estimativa. A tabela de faixas segue as categorias de gordura corporal do American Council on Exercise (ACE).",
    "measureHeader": "Como medir",
    "measureBody": "Pescoço: logo abaixo da laringe (pomo de adão), com os ombros relaxados. Cintura: na altura do umbigo para homens e no ponto mais estreito para mulheres. Quadril (mulheres): no ponto mais largo. Meça depois de expirar, com a fita justa na pele.",
    "formulaHeader": "Fórmula",
    "formulaBody": "Masculino: % de gordura = 495 ÷ (1.0324 − 0.19077×log10(cintura−pescoço) + 0.15456×log10(altura)) − 450\nFeminino: % de gordura = 495 ÷ (1.29579 − 0.35004×log10(cintura+quadril−pescoço) + 0.22100×log10(altura)) − 450\n(todas as medidas em cm)"
  },
  "id": {
    "pageTitle": "Kalkulator Lemak Tubuh (Metode Angkatan Laut AS)",
    "pageIntro": "Ukur tinggi badan serta lingkar leher dan pinggang (ditambah pinggul untuk perempuan) dengan pita ukur, lalu rumus Angkatan Laut AS (U.S. Navy) akan memperkirakan persentase lemak tubuh Anda. Hasilnya adalah perkiraan dan bisa berbeda dari pengukuran InBody atau DEXA.",
    "sex": "Jenis kelamin",
    "male": "Laki-laki",
    "female": "Perempuan",
    "height": "Tinggi badan",
    "neck": "Leher",
    "waist": "Pinggang",
    "hip": "Pinggul (perempuan)",
    "units": "Satuan",
    "metric": "Metrik (cm)",
    "imperial": "Imperial (in)",
    "feet": "ft",
    "inches": "in",
    "calculate": "Hitung",
    "resultLabel": "Perkiraan lemak tubuh",
    "categoryLabel": "Rentang ACE",
    "invalid": "Periksa kembali ukuran Anda. Lingkar pinggang harus lebih besar dari lingkar leher.",
    "categoryNames": [
      "Lemak esensial",
      "Atlet",
      "Bugar",
      "Rata-rata",
      "Di atas rata-rata"
    ],
    "rangeHeader": "Rentang lemak tubuh (ACE)",
    "estimateNote": "Ini adalah perkiraan dari pengukuran lingkar tubuh. Hasilnya bisa berbeda dari InBody atau DEXA, dan selisihnya bisa lebih besar jika massa otot tinggi atau sebaran lemak berbeda.",
    "aboutHeader": "Tentang kalkulator ini",
    "aboutBody": "Metode Angkatan Laut AS (U.S. Navy; Hodgdon & Beckett, 1984) memperkirakan lemak tubuh dari tinggi badan dan beberapa ukuran lingkar tubuh. Metode ini tidak memerlukan alat, tetapi hasilnya adalah perkiraan. Tabel rentang mengikuti kategori lemak tubuh dari American Council on Exercise (ACE).",
    "measureHeader": "Cara mengukur",
    "measureBody": "Leher: tepat di bawah laring (jakun), bahu rileks. Pinggang: sejajar pusar untuk laki-laki, di bagian paling ramping untuk perempuan. Pinggul (perempuan): di bagian paling lebar. Ukur setelah menghembuskan napas, dengan pita menempel pas di kulit.",
    "formulaHeader": "Rumus",
    "formulaBody": "Laki-laki: lemak tubuh % = 495 ÷ (1.0324 − 0.19077×log10(pinggang−leher) + 0.15456×log10(tinggi)) − 450\nPerempuan: lemak tubuh % = 495 ÷ (1.29579 − 0.35004×log10(pinggang+pinggul−leher) + 0.22100×log10(tinggi)) − 450\n(semua panjang dalam cm)"
  },
  "de": {
    "pageTitle": "Körperfettrechner (U.S.-Navy-Methode)",
    "pageIntro": "Messen Sie mit einem Maßband Ihre Größe sowie Hals- und Taillenumfang (bei Frauen zusätzlich den Hüftumfang). Die U.S.-Navy-Formel schätzt daraus Ihren Körperfettanteil. Es handelt sich um eine Schätzung, die von InBody- oder DEXA-Messungen abweichen kann.",
    "sex": "Geschlecht",
    "male": "Männlich",
    "female": "Weiblich",
    "height": "Größe",
    "neck": "Hals",
    "waist": "Taille",
    "hip": "Hüfte (Frauen)",
    "units": "Einheiten",
    "metric": "Metrisch (cm)",
    "imperial": "Imperial (in)",
    "feet": "ft",
    "inches": "in",
    "calculate": "Berechnen",
    "resultLabel": "Geschätztes Körperfett",
    "categoryLabel": "ACE-Bereich",
    "invalid": "Bitte überprüfen Sie Ihre Messwerte. Der Taillenumfang muss größer als der Halsumfang sein.",
    "categoryNames": [
      "Essenzielles Fett",
      "Athleten",
      "Fitness",
      "Durchschnitt",
      "Über dem Durchschnitt"
    ],
    "rangeHeader": "Körperfettbereiche (ACE)",
    "estimateNote": "Dies ist eine Schätzung auf Basis von Umfangsmessungen. Sie kann von InBody- oder DEXA-Ergebnissen abweichen, und die Abweichung kann bei hoher Muskelmasse oder einer anderen Fettverteilung größer sein.",
    "aboutHeader": "Über diesen Rechner",
    "aboutBody": "Die U.S.-Navy-Methode (Hodgdon & Beckett, 1984) schätzt den Körperfettanteil aus der Körpergröße und einigen Umfängen. Sie benötigt keine Geräte, liefert aber nur eine Schätzung. Die Bereichstabelle folgt den Körperfettkategorien des American Council on Exercise (ACE).",
    "measureHeader": "So messen Sie",
    "measureBody": "Hals: direkt unterhalb des Kehlkopfs (Adamsapfel), Schultern entspannt. Taille: bei Männern auf Höhe des Bauchnabels, bei Frauen an der schmalsten Stelle. Hüfte (Frauen): an der breitesten Stelle. Messen Sie nach dem Ausatmen, mit eng an der Haut anliegendem Maßband.",
    "formulaHeader": "Formel",
    "formulaBody": "Männer: Körperfett % = 495 ÷ (1.0324 − 0.19077×log10(Taille−Hals) + 0.15456×log10(Größe)) − 450\nFrauen: Körperfett % = 495 ÷ (1.29579 − 0.35004×log10(Taille+Hüfte−Hals) + 0.22100×log10(Größe)) − 450\n(alle Längen in cm)"
  },
  "fr": {
    "pageTitle": "Calculateur de masse grasse (méthode de l'U.S. Navy)",
    "pageIntro": "Mesurez votre taille ainsi que votre tour de cou et votre tour de taille (plus le tour de hanches pour les femmes) avec un mètre ruban : la formule de l'U.S. Navy estime votre pourcentage de masse grasse. Il s'agit d'une estimation, qui peut différer des mesures InBody ou DEXA.",
    "sex": "Sexe",
    "male": "Homme",
    "female": "Femme",
    "height": "Taille",
    "neck": "Tour de cou",
    "waist": "Tour de taille",
    "hip": "Tour de hanches (femmes)",
    "units": "Unités",
    "metric": "Métrique (cm)",
    "imperial": "Impérial (po)",
    "feet": "pi",
    "inches": "po",
    "calculate": "Calculer",
    "resultLabel": "Masse grasse estimée",
    "categoryLabel": "Plage ACE",
    "invalid": "Veuillez vérifier vos mesures. Le tour de taille doit être supérieur au tour de cou.",
    "categoryNames": [
      "Graisse essentielle",
      "Athlètes",
      "Forme",
      "Moyenne",
      "Au-dessus de la moyenne"
    ],
    "rangeHeader": "Plages de masse grasse (ACE)",
    "estimateNote": "Il s'agit d'une estimation à partir de mesures de circonférence. Elle peut différer des résultats InBody ou DEXA, et l'écart peut être plus important en cas de masse musculaire élevée ou de répartition différente de la graisse.",
    "aboutHeader": "À propos de ce calculateur",
    "aboutBody": "La méthode de l'U.S. Navy (Hodgdon & Beckett, 1984) estime la masse grasse à partir de la taille et de quelques circonférences. Elle ne nécessite aucun équipement, mais reste une estimation. Le tableau des plages suit les catégories de masse grasse de l'American Council on Exercise (ACE).",
    "measureHeader": "Comment mesurer",
    "measureBody": "Cou : juste sous le larynx (pomme d'Adam), épaules relâchées. Taille : au niveau du nombril pour les hommes, au point le plus étroit pour les femmes. Hanches (femmes) : au point le plus large. Mesurez après avoir expiré, le ruban bien ajusté contre la peau.",
    "formulaHeader": "Formule",
    "formulaBody": "Homme : masse grasse % = 495 ÷ (1.0324 − 0.19077×log10(taille−cou) + 0.15456×log10(hauteur)) − 450\nFemme : masse grasse % = 495 ÷ (1.29579 − 0.35004×log10(taille+hanches−cou) + 0.22100×log10(hauteur)) − 450\n(toutes les longueurs en cm ; taille = tour de taille, hauteur = taille corporelle)"
  }
};

export const NEW_TOOL_SEO: Record<'bmi' | 'body-fat', Record<ToolLang, ToolSeo>> = {
  "bmi": {
    "ko": {
      "metaTitle": "BMI 계산기: 체질량지수·허리-키 비율",
      "metaDescription": "키와 몸무게만 넣으면 BMI를 바로 계산하고 대한비만학회 기준으로 분류해 줍니다. 허리둘레를 넣으면 허리-키 비율도 확인할 수 있어요.",
      "faqHeader": "자주 묻는 질문",
      "faq": [
        {
          "q": "BMI는 어떻게 계산하나요?",
          "a": "체중(kg)을 키(m)의 제곱으로 나눕니다. 예를 들어 키 170cm, 체중 65kg이면 65 ÷ (1.7 × 1.7) = 22.5예요."
        },
        {
          "q": "한국에서는 BMI 몇부터 과체중·비만인가요?",
          "a": "대한비만학회는 아시아-태평양 기준을 따라 BMI 18.5 미만을 저체중, 18.5~22.9를 정상, 23~24.9를 과체중(비만 전단계), 25~29.9를 1단계 비만, 30~34.9를 2단계 비만, 35 이상을 3단계 비만으로 분류합니다. WHO 기준(과체중 25, 비만 30)보다 낮게 잡습니다."
        },
        {
          "q": "허리-키 비율은 무엇이고 0.5는 무슨 뜻인가요?",
          "a": "허리둘레를 키로 나눈 값이에요. Ashwell 등이 제안한 '허리둘레를 키의 절반 아래로'라는 기준에 따라 0.5를 경계로 봅니다. BMI가 같아도 복부에 지방이 더 몰려 있는지 가늠하는 참고 지표로 쓰여요."
        },
        {
          "q": "BMI만으로 몸 상태를 알 수 있나요?",
          "a": "BMI는 키와 체중만 쓰기 때문에 근육량과 체지방을 구분하지 못합니다. 근육이 많은 사람과 적은 사람이 같은 값이 나올 수 있어요. 체성분을 함께 보면 더 구체적인 그림이 나옵니다."
        },
        {
          "q": "어린이·청소년에게도 이 기준을 쓸 수 있나요?",
          "a": "이 계산기의 분류표는 성인 기준이에요. 만 18세 미만은 나이와 성별에 따른 성장도표(질병관리청 소아청소년 성장도표 등)를 기준으로 봅니다."
        }
      ]
    },
    "en": {
      "metaTitle": "BMI Calculator: Body Mass Index & Waist-to-Height",
      "metaDescription": "Enter height and weight to get your BMI and WHO category instantly. Add your waist to see your waist-to-height ratio too.",
      "faqHeader": "Frequently asked questions",
      "faq": [
        {
          "q": "How is BMI calculated?",
          "a": "Divide your weight in kilograms by your height in meters squared. For example, 170 cm and 65 kg gives 65 ÷ (1.7 × 1.7) = 22.5. In imperial units it is 703 × weight (lb) ÷ height (in)²."
        },
        {
          "q": "What are the BMI categories?",
          "a": "The World Health Organization (WHO) defines underweight as below 18.5, normal weight as 18.5 to 24.9, overweight as 25 to 29.9, and obesity as 30 or above. These cutoffs are for adults."
        },
        {
          "q": "What is waist-to-height ratio, and what does 0.5 mean?",
          "a": "It is your waist circumference divided by your height. Ashwell and colleagues proposed keeping your waist under half your height, so 0.5 is used as the boundary. It is a reference for how weight is distributed, alongside BMI."
        },
        {
          "q": "Can BMI tell me about my body composition?",
          "a": "No. BMI only uses height and weight, so it cannot separate muscle from fat. Two people with the same BMI can have very different amounts of body fat. Looking at body composition gives a more specific picture."
        },
        {
          "q": "Does this apply to children and teens?",
          "a": "No. These categories are for adults. For people under 18, BMI is read against age- and sex-specific growth charts, such as the CDC growth charts or the WHO growth reference."
        }
      ]
    },
    "ja": {
      "metaTitle": "BMI計算:体格指数とウエスト身長比",
      "metaDescription": "身長と体重を入力するだけで、BMIと日本肥満学会の基準による分類をすぐに確認できます。ウエストを入力すれば、ウエスト身長比もわかります。",
      "faqHeader": "よくある質問",
      "faq": [
        {
          "q": "BMIはどのように計算しますか?",
          "a": "体重(kg)を身長(m)の2乗で割ります。たとえば身長170 cm、体重65 kgなら、65 ÷(1.7 × 1.7)= 22.5です。ヤード・ポンド法では、703 × 体重(lb)÷ 身長(in)²で計算します。"
        },
        {
          "q": "BMIの分類は?",
          "a": "日本肥満学会の基準では、18.5未満を低体重、18.5以上25未満を普通体重、25以上30未満を肥満(1度)、30以上35未満を肥満(2度)、35以上40未満を肥満(3度)、40以上を肥満(4度)としています。これは成人向けの基準です。なお、WHOの基準では25以上を過体重、30以上を肥満としています。"
        },
        {
          "q": "ウエスト身長比とは?0.5は何を意味しますか?",
          "a": "ウエスト周囲径を身長で割った値です。Ashwellらが「ウエストを身長の半分未満に保つ」ことを提唱したため、0.5が境界として使われています。BMIとあわせて、体重の分布を見る目安になります。"
        },
        {
          "q": "BMIで体組成はわかりますか?",
          "a": "いいえ。BMIは身長と体重だけを使うため、筋肉と脂肪を区別できません。BMIが同じでも、体脂肪の量が大きく異なることがあります。体組成を見ると、より具体的な状態がわかります。"
        },
        {
          "q": "子どもや10代にも当てはまりますか?",
          "a": "いいえ。この分類は成人向けです。18歳未満の場合、BMIはCDC成長曲線やWHO成長基準など、年齢・性別ごとの成長曲線と照らし合わせて判断します。"
        }
      ]
    },
    "zh": {
      "metaTitle": "BMI 计算器:身体质量指数与腰围身高比",
      "metaDescription": "输入身高和体重,立即得出 BMI 及国家卫健委 WS/T 428-2013 标准分类。填上腰围,还能看到腰围身高比。",
      "faqHeader": "常见问题",
      "faq": [
        {
          "q": "BMI 怎么计算?",
          "a": "用体重(千克)除以身高(米)的平方。例如身高 170 cm、体重 65 kg,BMI = 65 ÷ (1.7 × 1.7) = 22.5。使用英制单位时,BMI = 703 × 体重 (lb) ÷ 身高 (in)²。"
        },
        {
          "q": "BMI 分类有哪些?",
          "a": "根据国家卫生健康委员会行业标准《成人体重判定》(WS/T 428-2013):低体重 <18.5,正常 18.5–23.9,超重 24–27.9,肥胖 ≥28。这些分界值适用于成年人。"
        },
        {
          "q": "什么是腰围身高比?0.5 代表什么?",
          "a": "它是腰围除以身高得到的数值。Ashwell 等人提出,腰围最好保持在身高的一半以下,因此用 0.5 作为分界值。它可以和 BMI 一起,用来参考体重的分布情况。"
        },
        {
          "q": "BMI 能反映身体成分吗?",
          "a": "不能。BMI 只用到身高和体重,无法区分肌肉和脂肪。BMI 相同的两个人,体脂含量可能相差很大。了解身体成分能得到更具体的情况。"
        },
        {
          "q": "这些分类适用于儿童和青少年吗?",
          "a": "不适用。这些分类针对成年人。18 岁以下人群的 BMI 需要对照按年龄和性别区分的生长曲线来解读,例如 CDC 生长曲线或 WHO 生长参考标准。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "BMI 計算機:身體質量指數與腰高比",
      "metaDescription": "輸入身高和體重,立即算出 BMI 及衛福部國健署分類。再加上腰圍,還能看到腰高比。",
      "faqHeader": "常見問題",
      "faq": [
        {
          "q": "BMI 怎麼計算?",
          "a": "將體重(公斤)除以身高(公尺)的平方。例如身高 170 cm、體重 65 kg,就是 65 ÷ (1.7 × 1.7) = 22.5。使用英制單位時,公式為 703 × 體重 (lb) ÷ 身高 (in)²。"
        },
        {
          "q": "BMI 分類有哪些?",
          "a": "依衛生福利部國民健康署的標準,過輕為低於 18.5,健康體位為 18.5–23.9,過重為 24–26.9,輕度肥胖為 27–29.9,中度肥胖為 30–34.9,重度肥胖為 35 以上。這些分界適用於成人。"
        },
        {
          "q": "什麼是腰高比?0.5 代表什麼?",
          "a": "腰高比是腰圍除以身高。Ashwell 等學者提出腰圍應保持在身高的一半以下,因此以 0.5 作為分界。它可以和 BMI 一起,作為了解體重分布情形的參考。"
        },
        {
          "q": "BMI 能看出我的身體組成嗎?",
          "a": "不能。BMI 只用身高和體重計算,無法區分肌肉和脂肪。BMI 相同的兩個人,體脂肪量可能差很多。看身體組成能得到更具體的樣貌。"
        },
        {
          "q": "兒童和青少年也適用嗎?",
          "a": "不適用。這些分類是針對成人。未滿 18 歲者的 BMI 需對照依年齡和性別區分的生長曲線,例如 CDC 生長曲線或 WHO 生長標準。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calculadora de IMC: índice de masa corporal y cintura-estatura",
      "metaDescription": "Ingresa tu estatura y tu peso para obtener al instante tu IMC y tu categoría según la OMS. Agrega tu cintura para ver también tu índice cintura-estatura.",
      "faqHeader": "Preguntas frecuentes",
      "faq": [
        {
          "q": "¿Cómo se calcula el IMC?",
          "a": "Divide tu peso en kilogramos entre tu estatura en metros al cuadrado. Por ejemplo, con 170 cm y 65 kg se obtiene 65 ÷ (1.7 × 1.7) = 22.5. En unidades imperiales es 703 × peso (lb) ÷ estatura (in)²."
        },
        {
          "q": "¿Cuáles son las categorías de IMC?",
          "a": "La Organización Mundial de la Salud (OMS) define el bajo peso como menos de 18.5, el peso normal de 18.5 a 24.9, el sobrepeso de 25 a 29.9 y la obesidad como 30 o más. Estos puntos de corte son para adultos."
        },
        {
          "q": "¿Qué es el índice cintura-estatura y qué significa 0.5?",
          "a": "Es la circunferencia de tu cintura dividida entre tu estatura. Ashwell y sus colegas propusieron mantener la cintura por debajo de la mitad de la estatura, por eso se usa 0.5 como límite. Sirve como referencia de cómo se distribuye el peso, junto con el IMC."
        },
        {
          "q": "¿El IMC me dice algo sobre mi composición corporal?",
          "a": "No. El IMC solo usa la estatura y el peso, así que no puede separar el músculo de la grasa. Dos personas con el mismo IMC pueden tener cantidades de grasa corporal muy distintas. Revisar la composición corporal da una imagen más específica."
        },
        {
          "q": "¿Se aplica a niños y adolescentes?",
          "a": "No. Estas categorías son para adultos. En menores de 18 años, el IMC se interpreta con curvas de crecimiento específicas por edad y sexo, como las curvas de crecimiento de los CDC o la referencia de crecimiento de la OMS."
        }
      ]
    },
    "pt-br": {
      "metaTitle": "Calculadora de IMC: índice de massa corporal e cintura-altura",
      "metaDescription": "Informe altura e peso e veja na hora seu IMC e sua categoria da OMS. Informe também a cintura para ver sua relação cintura-altura.",
      "faqHeader": "Perguntas frequentes",
      "faq": [
        {
          "q": "Como o IMC é calculado?",
          "a": "Divida seu peso em quilogramas pela sua altura em metros ao quadrado. Por exemplo, com 170 cm e 65 kg, o resultado é 65 ÷ (1.7 × 1.7) = 22.5. Em unidades imperiais, a conta é 703 × peso (lb) ÷ altura (in)²."
        },
        {
          "q": "Quais são as categorias de IMC?",
          "a": "A Organização Mundial da Saúde (OMS) define abaixo do peso como menos de 18.5, peso normal de 18.5 a 24.9, sobrepeso de 25 a 29.9 e obesidade a partir de 30. Esses pontos de corte valem para adultos."
        },
        {
          "q": "O que é a relação cintura-altura e o que significa 0.5?",
          "a": "É a circunferência da cintura dividida pela altura. Ashwell e colegas propuseram manter a cintura abaixo da metade da altura, por isso 0.5 é usado como limite. É uma referência de como o peso se distribui, que complementa o IMC."
        },
        {
          "q": "O IMC mostra minha composição corporal?",
          "a": "Não. O IMC usa só altura e peso, então não separa músculo de gordura. Duas pessoas com o mesmo IMC podem ter quantidades de gordura corporal bem diferentes. Olhar a composição corporal dá uma visão mais específica."
        },
        {
          "q": "Vale para crianças e adolescentes?",
          "a": "Não. Essas categorias são para adultos. Para menores de 18 anos, o IMC é interpretado com curvas de crescimento por idade e sexo, como as curvas do CDC ou a referência de crescimento da OMS."
        }
      ]
    },
    "id": {
      "metaTitle": "Kalkulator BMI: Indeks Massa Tubuh & Rasio Pinggang-Tinggi",
      "metaDescription": "Masukkan tinggi dan berat badan untuk langsung mengetahui BMI dan kategori WHO Anda. Tambahkan lingkar pinggang untuk melihat rasio lingkar pinggang terhadap tinggi badan juga.",
      "faqHeader": "Pertanyaan yang sering diajukan",
      "faq": [
        {
          "q": "Bagaimana cara menghitung BMI?",
          "a": "Bagi berat badan Anda dalam kilogram dengan kuadrat tinggi badan dalam meter. Misalnya, 170 cm dan 65 kg menghasilkan 65 ÷ (1.7 × 1.7) = 22.5. Dalam satuan imperial, rumusnya adalah 703 × berat badan (lb) ÷ tinggi badan (in)²."
        },
        {
          "q": "Apa saja kategori BMI?",
          "a": "Organisasi Kesehatan Dunia (WHO) mendefinisikan berat badan kurang sebagai di bawah 18.5, berat badan normal 18.5 hingga 24.9, berat badan berlebih 25 hingga 29.9, dan obesitas 30 atau lebih. Batas ini berlaku untuk orang dewasa."
        },
        {
          "q": "Apa itu rasio lingkar pinggang terhadap tinggi badan, dan apa arti 0.5?",
          "a": "Rasio ini adalah lingkar pinggang Anda dibagi tinggi badan. Ashwell dan rekan-rekannya mengusulkan agar lingkar pinggang dijaga kurang dari setengah tinggi badan, sehingga 0.5 digunakan sebagai batas. Rasio ini menjadi acuan tentang bagaimana berat badan tersebar, berdampingan dengan BMI."
        },
        {
          "q": "Apakah BMI bisa menggambarkan komposisi tubuh saya?",
          "a": "Tidak. BMI hanya menggunakan tinggi dan berat badan, sehingga tidak dapat memisahkan otot dari lemak. Dua orang dengan BMI yang sama bisa memiliki jumlah lemak tubuh yang sangat berbeda. Melihat komposisi tubuh memberikan gambaran yang lebih spesifik."
        },
        {
          "q": "Apakah ini berlaku untuk anak-anak dan remaja?",
          "a": "Tidak. Kategori ini untuk orang dewasa. Untuk usia di bawah 18 tahun, BMI dibaca menggunakan grafik pertumbuhan menurut usia dan jenis kelamin, seperti grafik pertumbuhan CDC atau referensi pertumbuhan WHO."
        }
      ]
    },
    "de": {
      "metaTitle": "BMI-Rechner: Body-Mass-Index & Taille-zu-Größe",
      "metaDescription": "Geben Sie Größe und Gewicht ein und erhalten Sie sofort Ihren BMI und Ihre WHO-Kategorie. Mit Ihrem Taillenumfang sehen Sie zusätzlich Ihr Taille-zu-Größe-Verhältnis.",
      "faqHeader": "Häufig gestellte Fragen",
      "faq": [
        {
          "q": "Wie wird der BMI berechnet?",
          "a": "Teilen Sie Ihr Gewicht in Kilogramm durch Ihre Körpergröße in Metern zum Quadrat. Beispiel: Bei 170 cm und 65 kg ergibt sich 65 ÷ (1.7 × 1.7) = 22.5. In imperialen Einheiten lautet die Formel 703 × Gewicht (lb) ÷ Größe (in)²."
        },
        {
          "q": "Welche BMI-Kategorien gibt es?",
          "a": "Die Weltgesundheitsorganisation (WHO) definiert Untergewicht als unter 18.5, Normalgewicht als 18.5 bis 24.9, Übergewicht als 25 bis 29.9 und Adipositas als 30 oder mehr. Diese Grenzwerte gelten für Erwachsene."
        },
        {
          "q": "Was ist das Taille-zu-Größe-Verhältnis, und was bedeutet 0.5?",
          "a": "Es ist Ihr Taillenumfang geteilt durch Ihre Körpergröße. Ashwell und Kollegen schlugen vor, den Taillenumfang unter der Hälfte der Körpergröße zu halten, daher wird 0.5 als Grenzwert verwendet. Es dient ergänzend zum BMI als Anhaltspunkt dafür, wie sich das Gewicht verteilt."
        },
        {
          "q": "Sagt der BMI etwas über meine Körperzusammensetzung aus?",
          "a": "Nein. Der BMI verwendet nur Größe und Gewicht und kann daher Muskeln nicht von Fett unterscheiden. Zwei Personen mit gleichem BMI können sehr unterschiedlich viel Körperfett haben. Ein Blick auf die Körperzusammensetzung liefert ein genaueres Bild."
        },
        {
          "q": "Gilt das auch für Kinder und Jugendliche?",
          "a": "Nein. Diese Kategorien gelten für Erwachsene. Bei Personen unter 18 Jahren wird der BMI anhand alters- und geschlechtsspezifischer Wachstumskurven eingeordnet, etwa der CDC-Wachstumskurven oder der WHO-Wachstumsreferenz."
        }
      ]
    },
    "fr": {
      "metaTitle": "Calculateur d'IMC : indice de masse corporelle et tour de taille/taille",
      "metaDescription": "Saisissez votre taille et votre poids pour obtenir instantanément votre IMC et votre catégorie OMS. Ajoutez votre tour de taille pour voir aussi votre rapport tour de taille/taille.",
      "faqHeader": "Questions fréquentes",
      "faq": [
        {
          "q": "Comment l'IMC est-il calculé ?",
          "a": "Divisez votre poids en kilogrammes par le carré de votre taille en mètres. Par exemple, pour 170 cm et 65 kg : 65 ÷ (1,7 × 1,7) = 22,5. En unités impériales, la formule est 703 × poids (lb) ÷ taille (po)²."
        },
        {
          "q": "Quelles sont les catégories d'IMC ?",
          "a": "L'Organisation mondiale de la santé (OMS) définit l'insuffisance pondérale comme un IMC inférieur à 18,5, le poids normal de 18,5 à 24,9, le surpoids de 25 à 29,9 et l'obésité à partir de 30. Ces seuils concernent les adultes."
        },
        {
          "q": "Qu'est-ce que le rapport tour de taille/taille, et que signifie 0,5 ?",
          "a": "C'est votre tour de taille divisé par votre taille. Ashwell et ses collègues ont proposé de garder un tour de taille inférieur à la moitié de sa taille ; 0,5 sert donc de seuil. C'est un repère sur la répartition du poids, en complément de l'IMC."
        },
        {
          "q": "L'IMC renseigne-t-il sur ma composition corporelle ?",
          "a": "Non. L'IMC n'utilise que la taille et le poids : il ne peut donc pas distinguer le muscle de la graisse. Deux personnes ayant le même IMC peuvent avoir des quantités de graisse corporelle très différentes. La composition corporelle donne une image plus précise."
        },
        {
          "q": "Cela s'applique-t-il aux enfants et aux adolescents ?",
          "a": "Non. Ces catégories concernent les adultes. Pour les moins de 18 ans, l'IMC s'interprète à l'aide de courbes de croissance selon l'âge et le sexe, comme les courbes de croissance des CDC ou les références de croissance de l'OMS."
        }
      ]
    }
  },
  "body-fat": {
    "ko": {
      "metaTitle": "체지방률 계산기: 미 해군 둘레 공식",
      "metaDescription": "키, 목, 허리(여성은 엉덩이 포함) 둘레만 재면 미 해군 공식으로 체지방률을 추정하고 ACE 기준 범위를 보여 줍니다.",
      "faqHeader": "자주 묻는 질문",
      "faq": [
        {
          "q": "미 해군 체지방률 공식이 뭔가요?",
          "a": "Hodgdon & Beckett(1984)이 미 해군 인원의 체격 평가를 위해 만든 공식으로, 키와 목·허리(여성은 엉덩이 포함) 둘레로 체지방률을 추정합니다. 남성은 허리−목, 여성은 허리+엉덩이−목 값을 사용해요."
        },
        {
          "q": "인바디나 DEXA와 얼마나 다른가요?",
          "a": "둘레 기반 추정이라 장비 측정값과 차이가 날 수 있어요. 근육량이 많거나 지방이 붙는 위치가 평균과 다르면 차이가 더 커질 수 있습니다. 변화 추이를 같은 방법으로 꾸준히 비교하는 용도로 쓰면 도움이 돼요."
        },
        {
          "q": "둘레는 어디를 어떻게 재야 하나요?",
          "a": "목은 후두 바로 아래, 허리는 남성은 배꼽 높이·여성은 가장 가는 부위, 엉덩이(여성)는 가장 굵은 부위를 숨을 내쉰 상태에서 잽니다. 줄자는 피부에 맞게 두르고 조이지 않아요."
        },
        {
          "q": "체지방률 범위는 어떻게 나뉘나요?",
          "a": "미국운동협의회(ACE) 구분으로 남성은 필수 지방 2~5%, 운동선수 6~13%, 피트니스 14~17%, 평균 18~24%, 25% 이상이고, 여성은 필수 지방 10~13%, 운동선수 14~20%, 피트니스 21~24%, 평균 25~31%, 32% 이상입니다."
        },
        {
          "q": "체지방률과 BMI는 어떻게 다른가요?",
          "a": "BMI는 키와 몸무게만으로 계산해 근육과 지방을 구분하지 못하고, 체지방률은 몸무게 중 지방이 차지하는 비율을 추정해요. 둘을 함께 보면 체중 변화의 내용을 더 잘 알 수 있습니다."
        }
      ]
    },
    "en": {
      "metaTitle": "Body Fat Calculator: U.S. Navy Method",
      "metaDescription": "Measure your height, neck, and waist (plus hip for women) to estimate body fat percentage with the U.S. Navy formula and see your ACE range.",
      "faqHeader": "Frequently asked questions",
      "faq": [
        {
          "q": "What is the U.S. Navy body fat formula?",
          "a": "It was developed by Hodgdon and Beckett (1984) for U.S. Navy body composition assessment. It estimates body fat from height and neck and waist circumference, plus hip for women. Men use waist minus neck, women use waist plus hip minus neck."
        },
        {
          "q": "How does it compare with InBody or DEXA?",
          "a": "Because it is estimated from circumferences, it can differ from device measurements, especially with high muscle mass or a different fat distribution. It works well for tracking change over time if you measure the same way each time."
        },
        {
          "q": "Where and how should I measure?",
          "a": "Neck just below the larynx; waist at navel level for men and at the narrowest point for women; hip (women) at the widest point. Measure after exhaling, with the tape snug but not tight."
        },
        {
          "q": "What are the body fat ranges?",
          "a": "Per the American Council on Exercise (ACE), men: essential fat 2–5%, athletes 6–13%, fitness 14–17%, average 18–24%, and 25% or more. Women: essential fat 10–13%, athletes 14–20%, fitness 21–24%, average 25–31%, and 32% or more."
        },
        {
          "q": "How is body fat percentage different from BMI?",
          "a": "BMI uses only height and weight and cannot separate muscle from fat, while body fat percentage estimates how much of your weight is fat. Reading both together tells you more about what a change in weight is made of."
        }
      ]
    },
    "ja": {
      "metaTitle": "体脂肪率計算:米海軍方式",
      "metaDescription": "身長・首・ウエスト(女性はヒップも)を測って、米海軍の計算式で体脂肪率を推定し、ACEの区分を確認できます。",
      "faqHeader": "よくある質問",
      "faq": [
        {
          "q": "米海軍の体脂肪率計算式とは?",
          "a": "米海軍の体組成評価のために、Hodgdon と Beckett(1984年)が開発した計算式です。身長と首・ウエストの周囲径(女性はヒップも)から体脂肪率を推定します。男性は「ウエスト−首」、女性は「ウエスト+ヒップ−首」を使います。"
        },
        {
          "q": "InBodyやDEXAと比べてどうですか?",
          "a": "周囲径から推定するため、特に筋肉量が多い場合や脂肪のつき方が異なる場合には、機器での測定値と差が出ることがあります。毎回同じ方法で測れば、時間の経過による変化を追うのに役立ちます。"
        },
        {
          "q": "どこをどう測ればいいですか?",
          "a": "首は喉頭のすぐ下、ウエストは男性ならへその高さ、女性ならいちばん細い位置、ヒップ(女性)はいちばん太い位置で測ります。息を吐いたあと、メジャーを肌に沿わせ、締めつけすぎないように測ってください。"
        },
        {
          "q": "体脂肪率の区分は?",
          "a": "米国運動協議会(ACE)によると、男性は必須脂肪 2–5%、アスリート 6–13%、フィットネス 14–17%、平均 18–24%、25%以上です。女性は必須脂肪 10–13%、アスリート 14–20%、フィットネス 21–24%、平均 25–31%、32%以上です。"
        },
        {
          "q": "体脂肪率とBMIの違いは?",
          "a": "BMIは身長と体重だけを使うため筋肉と脂肪を区別できませんが、体脂肪率は体重のうちどれだけが脂肪かを推定します。両方をあわせて見ると、体重の変化が何によるものかがよりよくわかります。"
        }
      ]
    },
    "zh": {
      "metaTitle": "体脂率计算器:美国海军法",
      "metaDescription": "量出身高、颈围和腰围(女性再加臀围),用美国海军公式估算体脂率,并查看你所在的 ACE 区间。",
      "faqHeader": "常见问题",
      "faq": [
        {
          "q": "什么是美国海军体脂公式?",
          "a": "它由 Hodgdon 和 Beckett(1984)为美国海军身体成分评估而制定,根据身高以及颈围、腰围(女性另加臀围)来估算体脂率。男性使用腰围减颈围,女性使用腰围加臀围减颈围。"
        },
        {
          "q": "和 InBody 或 DEXA 相比如何?",
          "a": "由于它是根据围度估算的,结果可能与设备测量值不同,肌肉量较大或脂肪分布不同时尤其明显。如果每次都用同样的方法测量,它很适合用来追踪长期变化。"
        },
        {
          "q": "应该在哪里、怎样测量?",
          "a": "颈围在喉结正下方;腰围男性在肚脐高度,女性在腰部最细处;臀围(女性)在臀部最宽处。呼气后测量,软尺贴合皮肤但不要勒紧。"
        },
        {
          "q": "体脂率区间有哪些?",
          "a": "根据美国运动委员会(ACE):男性必需脂肪 2–5%,运动员 6–13%,健身 14–17%,一般 18–24%,以及 25% 或以上。女性必需脂肪 10–13%,运动员 14–20%,健身 21–24%,一般 25–31%,以及 32% 或以上。"
        },
        {
          "q": "体脂率和 BMI 有什么不同?",
          "a": "BMI 只用身高和体重,无法区分肌肉和脂肪;体脂率则估算体重中有多少是脂肪。两者结合来看,更能了解体重变化是由什么构成的。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "體脂率計算機:美國海軍法",
      "metaDescription": "量好身高、頸圍和腰圍(女性另加臀圍),用美國海軍公式推估體脂率,並查看你的 ACE 範圍。",
      "faqHeader": "常見問題",
      "faq": [
        {
          "q": "美國海軍體脂公式是什麼?",
          "a": "這是 Hodgdon 和 Beckett(1984)為美國海軍身體組成評估所開發的公式。它用身高、頸圍和腰圍來推估體脂率,女性另加臀圍。男性使用腰圍減頸圍,女性使用腰圍加臀圍減頸圍。"
        },
        {
          "q": "和 InBody 或 DEXA 相比如何?",
          "a": "因為是由圍度推估,結果可能和儀器測量不同,尤其是肌肉量較高或脂肪分布不同時。只要每次用相同方式測量,很適合用來追蹤長期變化。"
        },
        {
          "q": "要在哪裡、怎麼測量?",
          "a": "頸圍量喉結正下方;腰圍男性量肚臍高度,女性量最細處;臀圍(女性)量最寬處。吐氣後再量,皮尺貼合但不要勒緊。"
        },
        {
          "q": "體脂率範圍有哪些?",
          "a": "依美國運動委員會(ACE)的標準,男性:必需脂肪 2–5%、運動員 6–13%、健身族 14–17%、一般 18–24%、25% 以上。女性:必需脂肪 10–13%、運動員 14–20%、健身族 21–24%、一般 25–31%、32% 以上。"
        },
        {
          "q": "體脂率和 BMI 有什麼不同?",
          "a": "BMI 只用身高和體重,無法區分肌肉和脂肪;體脂率則是推估體重中有多少是脂肪。兩者一起看,更能了解體重變化是由什麼組成的。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calculadora de grasa corporal: método de la Marina de EE. UU.",
      "metaDescription": "Mide tu estatura, tu cuello y tu cintura (y la cadera en mujeres) para estimar tu porcentaje de grasa corporal con la fórmula de la Marina de EE. UU. y ver tu rango ACE.",
      "faqHeader": "Preguntas frecuentes",
      "faq": [
        {
          "q": "¿Qué es la fórmula de grasa corporal de la Marina de EE. UU.?",
          "a": "La desarrollaron Hodgdon y Beckett (1984) para evaluar la composición corporal en la Marina de EE. UU. (U.S. Navy). Estima la grasa corporal a partir de la estatura y la circunferencia del cuello y la cintura, más la cadera en mujeres. En hombres se usa cintura menos cuello; en mujeres, cintura más cadera menos cuello."
        },
        {
          "q": "¿Cómo se compara con InBody o DEXA?",
          "a": "Como se estima a partir de circunferencias, puede diferir de las mediciones con dispositivos, sobre todo si tienes mucha masa muscular o una distribución de grasa distinta. Funciona bien para seguir los cambios con el tiempo si mides siempre de la misma forma."
        },
        {
          "q": "¿Dónde y cómo debo medir?",
          "a": "El cuello, justo debajo de la laringe; la cintura, a la altura del ombligo en hombres y en el punto más estrecho en mujeres; la cadera (mujeres), en el punto más ancho. Mide después de exhalar, con la cinta ajustada pero sin apretar."
        },
        {
          "q": "¿Cuáles son los rangos de grasa corporal?",
          "a": "Según el Consejo Estadounidense del Ejercicio (ACE), en hombres: grasa esencial 2–5%, atletas 6–13%, fitness 14–17%, promedio 18–24% y 25% o más. En mujeres: grasa esencial 10–13%, atletas 14–20%, fitness 21–24%, promedio 25–31% y 32% o más."
        },
        {
          "q": "¿En qué se diferencia el porcentaje de grasa corporal del IMC?",
          "a": "El IMC solo usa la estatura y el peso y no puede separar el músculo de la grasa, mientras que el porcentaje de grasa corporal estima qué parte de tu peso es grasa. Leer ambos juntos te dice más sobre de qué está hecho un cambio de peso."
        }
      ]
    },
    "pt-br": {
      "metaTitle": "Calculadora de gordura corporal: método da Marinha dos EUA",
      "metaDescription": "Meça altura, pescoço e cintura (e quadril, para mulheres) para estimar seu percentual de gordura corporal com a fórmula da Marinha dos EUA e ver sua faixa ACE.",
      "faqHeader": "Perguntas frequentes",
      "faq": [
        {
          "q": "O que é a fórmula de gordura corporal da Marinha dos EUA?",
          "a": "Foi desenvolvida por Hodgdon e Beckett (1984) para a avaliação de composição corporal da Marinha dos EUA (U.S. Navy). Ela estima a gordura corporal a partir da altura e das circunferências do pescoço e da cintura, e também do quadril para mulheres. Para homens, usa cintura menos pescoço; para mulheres, cintura mais quadril menos pescoço."
        },
        {
          "q": "Como ela se compara ao InBody ou ao DEXA?",
          "a": "Como é estimada a partir de circunferências, pode diferir das medições por aparelho, principalmente com muita massa muscular ou outra distribuição de gordura. Funciona bem para acompanhar mudanças ao longo do tempo, se você medir sempre do mesmo jeito."
        },
        {
          "q": "Onde e como devo medir?",
          "a": "Pescoço logo abaixo da laringe; cintura na altura do umbigo para homens e no ponto mais estreito para mulheres; quadril (mulheres) no ponto mais largo. Meça depois de expirar, com a fita justa, mas sem apertar."
        },
        {
          "q": "Quais são as faixas de gordura corporal?",
          "a": "Segundo o American Council on Exercise (ACE), homens: gordura essencial 2–5%, atletas 6–13%, fitness 14–17%, média 18–24% e 25% ou mais. Mulheres: gordura essencial 10–13%, atletas 14–20%, fitness 21–24%, média 25–31% e 32% ou mais."
        },
        {
          "q": "Qual a diferença entre percentual de gordura e IMC?",
          "a": "O IMC usa só altura e peso e não separa músculo de gordura. Já o percentual de gordura estima quanto do seu peso é gordura. Ler os dois juntos mostra melhor do que é feita uma mudança de peso."
        }
      ]
    },
    "id": {
      "metaTitle": "Kalkulator Lemak Tubuh: Metode Angkatan Laut AS",
      "metaDescription": "Ukur tinggi badan, lingkar leher, dan pinggang (ditambah pinggul untuk perempuan) untuk memperkirakan persentase lemak tubuh dengan rumus Angkatan Laut AS (U.S. Navy) dan lihat rentang ACE Anda.",
      "faqHeader": "Pertanyaan yang sering diajukan",
      "faq": [
        {
          "q": "Apa itu rumus lemak tubuh Angkatan Laut AS?",
          "a": "Rumus ini dikembangkan oleh Hodgdon dan Beckett (1984) untuk penilaian komposisi tubuh di Angkatan Laut AS (U.S. Navy). Rumus ini memperkirakan lemak tubuh dari tinggi badan serta lingkar leher dan pinggang, ditambah pinggul untuk perempuan. Laki-laki menggunakan pinggang dikurangi leher, perempuan menggunakan pinggang ditambah pinggul dikurangi leher."
        },
        {
          "q": "Bagaimana perbandingannya dengan InBody atau DEXA?",
          "a": "Karena diperkirakan dari ukuran lingkar tubuh, hasilnya bisa berbeda dari pengukuran alat, terutama jika massa otot tinggi atau sebaran lemak berbeda. Metode ini cocok untuk memantau perubahan dari waktu ke waktu jika Anda mengukur dengan cara yang sama setiap kali."
        },
        {
          "q": "Di mana dan bagaimana cara mengukurnya?",
          "a": "Leher tepat di bawah laring; pinggang sejajar pusar untuk laki-laki dan di bagian paling ramping untuk perempuan; pinggul (perempuan) di bagian paling lebar. Ukur setelah menghembuskan napas, dengan pita menempel pas tetapi tidak menekan."
        },
        {
          "q": "Berapa saja rentang lemak tubuh?",
          "a": "Menurut American Council on Exercise (ACE), laki-laki: lemak esensial 2–5%, atlet 6–13%, bugar 14–17%, rata-rata 18–24%, dan 25% atau lebih. Perempuan: lemak esensial 10–13%, atlet 14–20%, bugar 21–24%, rata-rata 25–31%, dan 32% atau lebih."
        },
        {
          "q": "Apa bedanya persentase lemak tubuh dengan BMI?",
          "a": "BMI hanya menggunakan tinggi dan berat badan dan tidak dapat memisahkan otot dari lemak, sedangkan persentase lemak tubuh memperkirakan seberapa banyak berat badan Anda berupa lemak. Membaca keduanya bersama-sama memberi tahu lebih banyak tentang apa yang berubah saat berat badan berubah."
        }
      ]
    },
    "de": {
      "metaTitle": "Körperfettrechner: U.S.-Navy-Methode",
      "metaDescription": "Messen Sie Größe, Hals- und Taillenumfang (bei Frauen auch die Hüfte), um Ihren Körperfettanteil mit der U.S.-Navy-Formel zu schätzen und Ihren ACE-Bereich zu sehen.",
      "faqHeader": "Häufig gestellte Fragen",
      "faq": [
        {
          "q": "Was ist die U.S.-Navy-Körperfettformel?",
          "a": "Sie wurde von Hodgdon und Beckett (1984) für die Bewertung der Körperzusammensetzung bei der U.S. Navy entwickelt. Sie schätzt den Körperfettanteil aus Körpergröße sowie Hals- und Taillenumfang, bei Frauen zusätzlich dem Hüftumfang. Bei Männern wird Taille minus Hals verwendet, bei Frauen Taille plus Hüfte minus Hals."
        },
        {
          "q": "Wie schneidet sie im Vergleich zu InBody oder DEXA ab?",
          "a": "Da der Wert aus Umfängen geschätzt wird, kann er von Gerätemessungen abweichen, besonders bei hoher Muskelmasse oder einer anderen Fettverteilung. Gut geeignet ist die Methode, um Veränderungen im Zeitverlauf zu verfolgen, wenn Sie jedes Mal auf die gleiche Weise messen."
        },
        {
          "q": "Wo und wie sollte ich messen?",
          "a": "Hals direkt unterhalb des Kehlkopfs; Taille bei Männern auf Höhe des Bauchnabels und bei Frauen an der schmalsten Stelle; Hüfte (Frauen) an der breitesten Stelle. Messen Sie nach dem Ausatmen, mit anliegendem, aber nicht einschnürendem Maßband."
        },
        {
          "q": "Welche Körperfettbereiche gibt es?",
          "a": "Laut American Council on Exercise (ACE) gilt für Männer: essenzielles Fett 2–5%, Athleten 6–13%, Fitness 14–17%, Durchschnitt 18–24% sowie 25% oder mehr. Für Frauen: essenzielles Fett 10–13%, Athleten 14–20%, Fitness 21–24%, Durchschnitt 25–31% sowie 32% oder mehr."
        },
        {
          "q": "Worin unterscheidet sich der Körperfettanteil vom BMI?",
          "a": "Der BMI verwendet nur Größe und Gewicht und kann Muskeln nicht von Fett unterscheiden, während der Körperfettanteil schätzt, wie viel Ihres Gewichts aus Fett besteht. Wenn Sie beide zusammen betrachten, erfahren Sie mehr darüber, woraus eine Gewichtsveränderung besteht."
        }
      ]
    },
    "fr": {
      "metaTitle": "Calculateur de masse grasse : méthode de l'U.S. Navy",
      "metaDescription": "Mesurez votre taille, votre tour de cou et votre tour de taille (plus le tour de hanches pour les femmes) pour estimer votre pourcentage de masse grasse avec la formule de l'U.S. Navy et voir votre plage ACE.",
      "faqHeader": "Questions fréquentes",
      "faq": [
        {
          "q": "Qu'est-ce que la formule de masse grasse de l'U.S. Navy ?",
          "a": "Elle a été mise au point par Hodgdon et Beckett (1984) pour l'évaluation de la composition corporelle dans l'U.S. Navy. Elle estime la masse grasse à partir de la taille et des tours de cou et de taille, plus le tour de hanches pour les femmes. Pour les hommes, on utilise le tour de taille moins le tour de cou ; pour les femmes, le tour de taille plus le tour de hanches moins le tour de cou."
        },
        {
          "q": "Comment se compare-t-elle à InBody ou DEXA ?",
          "a": "Comme elle est estimée à partir de circonférences, elle peut différer des mesures par appareil, surtout en cas de masse musculaire élevée ou de répartition différente de la graisse. Elle convient bien pour suivre l'évolution dans le temps si vous mesurez toujours de la même façon."
        },
        {
          "q": "Où et comment mesurer ?",
          "a": "Le cou juste sous le larynx ; la taille au niveau du nombril pour les hommes et au point le plus étroit pour les femmes ; les hanches (femmes) au point le plus large. Mesurez après avoir expiré, le ruban ajusté sans serrer."
        },
        {
          "q": "Quelles sont les plages de masse grasse ?",
          "a": "Selon l'American Council on Exercise (ACE), hommes : graisse essentielle 2–5 %, athlètes 6–13 %, forme 14–17 %, moyenne 18–24 %, et 25 % ou plus. Femmes : graisse essentielle 10–13 %, athlètes 14–20 %, forme 21–24 %, moyenne 25–31 %, et 32 % ou plus."
        },
        {
          "q": "En quoi le pourcentage de masse grasse diffère-t-il de l'IMC ?",
          "a": "L'IMC n'utilise que la taille et le poids et ne peut pas distinguer le muscle de la graisse, alors que le pourcentage de masse grasse estime la part de graisse dans votre poids. Lire les deux ensemble vous en dit plus sur ce qui compose une variation de poids."
        }
      ]
    }
  }
};

export const NEW_TOOL_BANNER: Record<ToolLang, Record<'bmi' | 'body-fat', Banner>> = {
  "ko": {
    "bmi": {
      "limit": "BMI는 키와 몸무게만 봐요. 같은 BMI여도 근육과 체지방의 비율은 사람마다 달라요.",
      "havit": "하비트는 AI 체성분 진단으로 근육·체지방·내장지방을 먼저 추정하고, 그 결과로 하루 정량 목표 11가지를 숫자로 처방해요."
    },
    "body-fat": {
      "limit": "이 계산기는 줄자로 잰 둘레 몇 군데로 추정해요. 같은 체지방률이어도 근육량과 내장지방은 알 수 없어요.",
      "havit": "하비트는 장비 없이 AI 체성분 진단으로 체지방률·근육량·내장지방을 추정하고, 그 결과로 하루 정량 목표 11가지를 숫자로 처방해요."
    }
  },
  "en": {
    "bmi": {
      "limit": "BMI only looks at height and weight. Two people with the same BMI can have very different amounts of muscle and body fat.",
      "havit": "HAVIT starts with an AI body composition check that estimates muscle, body fat, and visceral fat, then sets 11 daily quantitative targets in real numbers."
    },
    "body-fat": {
      "limit": "This calculator estimates from a few tape measurements. It can't tell you your muscle mass or visceral fat.",
      "havit": "HAVIT uses an AI body composition check with no equipment to estimate body fat, muscle, and visceral fat, then sets 11 daily quantitative targets in real numbers."
    }
  },
  "ja": {
    "bmi": {
      "limit": "BMIは身長と体重だけを見ています。BMIが同じでも、筋肉や体脂肪の量は人によって大きく違います。",
      "havit": "HAVITはまずAIの体組成チェックで筋肉・体脂肪・内臓脂肪を推定し、毎日の11の定量目標を具体的な数値で設定します。"
    },
    "body-fat": {
      "limit": "この計算ツールは、メジャーでのいくつかの測定値から推定します。筋肉量や内臓脂肪まではわかりません。",
      "havit": "HAVITは機器不要のAI体組成チェックで体脂肪・筋肉・内臓脂肪を推定し、毎日の11の定量目標を具体的な数値で設定します。"
    }
  },
  "zh": {
    "bmi": {
      "limit": "BMI 只看身高和体重。BMI 相同的两个人,肌肉和体脂的含量可能差别很大。",
      "havit": "HAVIT 先用 AI 身体成分检测估算肌肉、体脂和内脏脂肪,再用具体数字为你设定 11 项每日量化目标。"
    },
    "body-fat": {
      "limit": "本计算器只根据几处软尺测量来估算,无法告诉你肌肉量或内脏脂肪。",
      "havit": "HAVIT 无需任何设备,用 AI 身体成分检测估算体脂、肌肉和内脏脂肪,再用具体数字为你设定 11 项每日量化目标。"
    }
  },
  "zh-tw": {
    "bmi": {
      "limit": "BMI 只看身高和體重。BMI 相同的兩個人,肌肉量和體脂肪量可能差很多。",
      "havit": "HAVIT 從 AI 身體組成檢測開始,推估肌肉、體脂肪和內臟脂肪,再用實際數字設定 11 項每日量化目標。"
    },
    "body-fat": {
      "limit": "這個計算機只用幾個皮尺測量值來推估,無法得知你的肌肉量或內臟脂肪。",
      "havit": "HAVIT 不需要任何器材,用 AI 身體組成檢測推估體脂肪、肌肉和內臟脂肪,再用實際數字設定 11 項每日量化目標。"
    }
  },
  "es": {
    "bmi": {
      "limit": "El IMC solo considera la estatura y el peso. Dos personas con el mismo IMC pueden tener cantidades muy distintas de músculo y grasa corporal.",
      "havit": "HAVIT empieza con un análisis de composición corporal con IA que estima el músculo, la grasa corporal y la grasa visceral, y luego fija 11 metas diarias cuantitativas en números reales."
    },
    "body-fat": {
      "limit": "Esta calculadora hace una estimación con unas pocas medidas de cinta. No puede decirte tu masa muscular ni tu grasa visceral.",
      "havit": "HAVIT usa un análisis de composición corporal con IA, sin equipo, para estimar la grasa corporal, el músculo y la grasa visceral, y luego fija 11 metas diarias cuantitativas en números reales."
    }
  },
  "pt-br": {
    "bmi": {
      "limit": "O IMC considera só altura e peso. Duas pessoas com o mesmo IMC podem ter quantidades bem diferentes de músculo e gordura.",
      "havit": "O HAVIT começa com uma análise de composição corporal por IA que estima músculo, gordura corporal e gordura visceral. Depois define 11 metas diárias quantitativas, em números reais."
    },
    "body-fat": {
      "limit": "Esta calculadora faz uma estimativa com poucas medidas de fita. Ela não mostra sua massa muscular nem sua gordura visceral.",
      "havit": "O HAVIT usa uma análise de composição corporal por IA, sem equipamento, para estimar gordura corporal, músculo e gordura visceral. Depois define 11 metas diárias quantitativas, em números reais."
    }
  },
  "id": {
    "bmi": {
      "limit": "BMI hanya melihat tinggi dan berat badan. Dua orang dengan BMI yang sama bisa memiliki jumlah otot dan lemak tubuh yang sangat berbeda.",
      "havit": "HAVIT dimulai dengan pemeriksaan komposisi tubuh berbasis AI yang memperkirakan otot, lemak tubuh, dan lemak viseral, lalu menetapkan 11 target kuantitatif harian dalam angka nyata."
    },
    "body-fat": {
      "limit": "Kalkulator ini memperkirakan dari beberapa ukuran pita. Kalkulator ini tidak bisa mengetahui massa otot atau lemak viseral Anda.",
      "havit": "HAVIT menggunakan pemeriksaan komposisi tubuh berbasis AI tanpa alat untuk memperkirakan lemak tubuh, otot, dan lemak viseral, lalu menetapkan 11 target kuantitatif harian dalam angka nyata."
    }
  },
  "de": {
    "bmi": {
      "limit": "Der BMI berücksichtigt nur Größe und Gewicht. Zwei Personen mit gleichem BMI können sehr unterschiedlich viel Muskelmasse und Körperfett haben.",
      "havit": "HAVIT beginnt mit einem KI-Körperanalyse-Check, der Muskelmasse, Körperfett und viszerales Fett schätzt. Danach legt HAVIT 11 tägliche Zielwerte in konkreten Zahlen fest."
    },
    "body-fat": {
      "limit": "Dieser Rechner schätzt anhand weniger Maßbandmessungen. Ihre Muskelmasse oder Ihr viszerales Fett kann er nicht ermitteln.",
      "havit": "HAVIT nutzt einen KI-Körperanalyse-Check ohne Geräte, um Körperfett, Muskelmasse und viszerales Fett zu schätzen. Danach legt HAVIT 11 tägliche Zielwerte in konkreten Zahlen fest."
    }
  },
  "fr": {
    "bmi": {
      "limit": "L'IMC ne tient compte que de la taille et du poids. Deux personnes avec le même IMC peuvent avoir des quantités de muscle et de graisse très différentes.",
      "havit": "HAVIT commence par une analyse IA de la composition corporelle qui estime le muscle, la graisse corporelle et la graisse viscérale, puis fixe 11 objectifs quantitatifs quotidiens en chiffres concrets."
    },
    "body-fat": {
      "limit": "Ce calculateur fait une estimation à partir de quelques mesures au ruban. Il ne peut pas indiquer votre masse musculaire ni votre graisse viscérale.",
      "havit": "HAVIT utilise une analyse IA de la composition corporelle, sans équipement, pour estimer la masse grasse, le muscle et la graisse viscérale, puis fixe 11 objectifs quantitatifs quotidiens en chiffres concrets."
    }
  }
};

export const NEW_TOOL_INDEX: Record<'bmi' | 'body-fat', Record<ToolLang, Idx>> = {
  "bmi": {
    "ko": {
      "title": "BMI 계산기",
      "desc": "체질량지수와 허리-키 비율. 대한비만학회 기준 분류."
    },
    "en": {
      "title": "BMI Calculator",
      "desc": "Body mass index plus waist-to-height ratio, with WHO categories."
    },
    "ja": {
      "title": "BMI計算",
      "desc": "BMIとウエスト身長比を計算。日本肥満学会の基準で分類します。"
    },
    "zh": {
      "title": "BMI 计算器",
      "desc": "身体质量指数加腰围身高比,采用国家卫健委 WS/T 428-2013 分类。"
    },
    "zh-tw": {
      "title": "BMI 計算機",
      "desc": "身體質量指數加上腰高比,採用衛福部國健署分類。"
    },
    "es": {
      "title": "Calculadora de IMC",
      "desc": "Índice de masa corporal más índice cintura-estatura, con categorías de la OMS."
    },
    "pt-br": {
      "title": "Calculadora de IMC",
      "desc": "Índice de massa corporal e relação cintura-altura, com categorias da OMS."
    },
    "id": {
      "title": "Kalkulator BMI",
      "desc": "Indeks massa tubuh plus rasio lingkar pinggang terhadap tinggi badan, dengan kategori WHO."
    },
    "de": {
      "title": "BMI-Rechner",
      "desc": "Body-Mass-Index plus Taille-zu-Größe-Verhältnis, mit WHO-Kategorien."
    },
    "fr": {
      "title": "Calculateur d'IMC",
      "desc": "Indice de masse corporelle et rapport tour de taille/taille, avec les catégories de l'OMS."
    }
  },
  "body-fat": {
    "ko": {
      "title": "체지방률 계산기",
      "desc": "미 해군 둘레 공식으로 체지방률 추정. ACE 기준 범위."
    },
    "en": {
      "title": "Body Fat Calculator",
      "desc": "U.S. Navy circumference method, with ACE ranges."
    },
    "ja": {
      "title": "体脂肪率計算",
      "desc": "米海軍の周囲径方式で計算。ACEの区分つき。"
    },
    "zh": {
      "title": "体脂率计算器",
      "desc": "美国海军围度测量法,附 ACE 区间。"
    },
    "zh-tw": {
      "title": "體脂率計算機",
      "desc": "美國海軍圍度測量法,附 ACE 範圍。"
    },
    "es": {
      "title": "Calculadora de grasa corporal",
      "desc": "Método de circunferencias de la Marina de EE. UU., con rangos ACE."
    },
    "pt-br": {
      "title": "Calculadora de gordura corporal",
      "desc": "Método de circunferências da Marinha dos EUA, com faixas ACE."
    },
    "id": {
      "title": "Kalkulator Lemak Tubuh",
      "desc": "Metode lingkar tubuh Angkatan Laut AS, dengan rentang ACE."
    },
    "de": {
      "title": "Körperfettrechner",
      "desc": "U.S.-Navy-Umfangsmethode, mit ACE-Bereichen."
    },
    "fr": {
      "title": "Calculateur de masse grasse",
      "desc": "Méthode des circonférences de l'U.S. Navy, avec les plages ACE."
    }
  }
};
