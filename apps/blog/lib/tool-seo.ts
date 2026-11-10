/**
 * 계산기 페이지 검색 노출 보강 — 검색 결과 제목·설명(tool-labels 에 없는 언어만)과 FAQ.
 *
 * 2026-11-10 서치콘솔 4주(10/12~11/8): 계산기 페이지는 1페이지 하단(7~9위)인데 클릭률이 매우 낮았다
 * (예: es "calculadora de sueño" 노출 4,561·순위 7.7·클릭 6). 제목을 실제 검색어 중심으로 바꾸고,
 * 본문에 FAQ 와 FAQPage·WebApplication 구조화 데이터를 붙인다.
 * 수치·예시는 lib/calculators.ts 공식과 맞춰 검증했다(예: 단백질 감량 2.0~2.4 g/kg, 수면 90분×n+14분).
 * tool-labels 에 metaTitle·faq 가 이미 있으면 그쪽이 우선한다.
 */
import type { ToolLang } from './tool-labels';

export type ToolSlug = 'bmr' | 'protein' | 'water' | 'caffeine' | 'sleep-cycle' | 'exercise-calories';
export interface ToolSeo {
  metaTitle?: string;
  metaDescription?: string;
  faqHeader?: string;
  faq?: { q: string; a: string }[];
}

export const TOOL_SEO: Record<ToolSlug, Record<ToolLang, ToolSeo>> = {
  "bmr": {
    "ko": {
      "metaTitle": "TDEE 계산기: BMR·하루 소비 칼로리 한번에",
      "metaDescription": "성별·나이·체중·키·활동량만 입력하면 Mifflin-St Jeor 공식으로 기초대사량(BMR)과 하루 총소비 칼로리(TDEE)를 계산합니다.",
      "faqHeader": "자주 묻는 질문",
      "faq": [
        {
          "q": "TDEE 뜻이 뭔가요?",
          "a": "TDEE(Total Daily Energy Expenditure)는 하루 동안 소비하는 총 칼로리로, 기초대사량(BMR)에 활동으로 쓰는 에너지를 더한 값입니다. 이 계산기는 BMR에 활동 계수(1.2~1.9)를 곱해 TDEE를 구합니다. 다이어트·유지·증량 목표 칼로리를 정할 때 기준이 됩니다."
        },
        {
          "q": "기초대사량(BMR)은 어떻게 계산하나요?",
          "a": "Mifflin-St Jeor 공식으로 계산합니다. 남성은 10×체중(kg) + 6.25×키(cm) − 5×나이 + 5이고, 여성은 같은 식에서 마지막 +5 대신 −161을 씁니다. 결과는 하루 kcal 단위로 나옵니다."
        },
        {
          "q": "BMR과 TDEE는 뭐가 다른가요?",
          "a": "BMR은 가만히 쉬고 있을 때 생명 유지에 쓰는 최소 에너지이고, TDEE는 여기에 일상 활동과 운동까지 더한 하루 총소비량입니다. 그래서 TDEE는 항상 BMR보다 크고, 활동량이 많을수록 둘의 차이가 커집니다."
        },
        {
          "q": "TDEE 계산할 때 활동량은 뭘 골라야 하나요?",
          "a": "주당 운동 횟수를 기준으로 고르면 됩니다. 운동을 거의 안 하면 좌식, 주 1~3회는 가벼움, 주 3~5회는 보통, 주 6~7회는 활동적, 하루 2회 운동하거나 몸을 쓰는 일을 하면 매우 활동적입니다. 두 단계 사이에서 애매하면 낮은 쪽을 고르는 편이 TDEE를 실제보다 높게 잡을 가능성을 줄여 줍니다."
        },
        {
          "q": "TDEE 계산기 결과로 다이어트 칼로리는 어떻게 정하나요?",
          "a": "체중을 줄이려면 TDEE보다 적게, 유지하려면 TDEE만큼, 근육 증량이 목표라면 TDEE보다 조금 더 먹는 것이 기본 원리입니다. 얼마나 줄이거나 늘릴지는 원하는 속도에 맞춰 정하고, 실제 체중 변화를 보면서 조정하면 됩니다."
        }
      ]
    },
    "en": {
      "metaTitle": "TDEE Calculator: BMR & Daily Calories Burned",
      "metaDescription": "Enter your sex, age, weight, height, and activity level to get your BMR and TDEE in kcal/day, calculated with the Mifflin-St Jeor equation.",
      "faqHeader": "Frequently asked questions",
      "faq": [
        {
          "q": "What is TDEE?",
          "a": "TDEE (Total Daily Energy Expenditure) is the total number of calories you burn in a day, made up of your BMR plus the energy you spend on activity. This calculator finds it by multiplying your BMR by an activity factor between 1.2 and 1.9. It's the baseline number for setting cut, maintenance, or bulk targets."
        },
        {
          "q": "How do you calculate BMR?",
          "a": "This calculator uses the Mifflin-St Jeor equation. For men it's 10×weight (kg) + 6.25×height (cm) − 5×age + 5, and for women the same formula ends in −161 instead of +5. The result is given in kcal per day."
        },
        {
          "q": "What's the difference between BMR and TDEE?",
          "a": "BMR is the minimum energy your body uses at complete rest just to keep core functions running, while TDEE adds everything you burn through daily movement and exercise. That means TDEE is always higher than BMR, and the gap gets bigger the more active you are."
        },
        {
          "q": "Which activity level should I choose?",
          "a": "Choose based on how many days a week you exercise: sedentary for little or none, light for 1–3 days, moderate for 3–5, active for 6–7, and very active if you train twice a day or have a physical job. If you're between two levels, picking the lower one keeps your TDEE from being overestimated."
        },
        {
          "q": "How accurate is the Mifflin-St Jeor equation?",
          "a": "It's considered the most accurate way to estimate BMR without lab equipment, which is why ACSM and ISSN recommend it. It's still an estimate, though, so your real expenditure may be somewhat different. Use the result as a starting point and adjust it based on how your weight actually changes."
        }
      ]
    },
    "ja": {
      "metaTitle": "TDEE計算機｜基礎代謝(BMR)と1日の消費カロリー",
      "metaDescription": "性別・年齢・体重・身長・活動量を入力するだけで、Mifflin-St Jeor式により基礎代謝量(BMR)と1日の総消費カロリー(TDEE)を計算します。",
      "faqHeader": "よくある質問",
      "faq": [
        {
          "q": "TDEEとは?",
          "a": "TDEE(Total Daily Energy Expenditure)は1日の総消費カロリーのことで、基礎代謝量(BMR)に活動で使うエネルギーを加えたものです。この計算機ではBMRに活動係数(1.2〜1.9)を掛けて求めます。減量・維持・増量の目標カロリーを決めるときの基準になります。"
        },
        {
          "q": "基礎代謝とTDEEの違いは?",
          "a": "基礎代謝(BMR)は安静にしていても生命維持のために使われる最低限のエネルギーで、TDEEはそれに日常の動きや運動の分を足した1日の総消費量です。そのためTDEEは必ずBMRより大きく、活動量が多いほどその差も広がります。"
        },
        {
          "q": "基礎代謝量(BMR)の計算式は?",
          "a": "Mifflin-St Jeor式を使います。男性は10×体重(kg)+6.25×身長(cm)−5×年齢+5、女性は最後の+5を−161に替えた式です。結果は1日あたりのkcalで表示されます。"
        },
        {
          "q": "TDEE計算機の活動レベルはどれを選べばいい?",
          "a": "週に何回運動しているかで選びます。ほぼ運動しないなら座位中心、週1〜3回は軽い運動、週3〜5回は中程度、週6〜7回は活発、1日2回の運動や肉体労働なら非常に活発です。迷ったら低いほうを選ぶと、TDEEを高く見積もりすぎずに済みます。"
        },
        {
          "q": "TDEEはダイエットにどう使う?",
          "a": "減量したいならTDEEより少なく、体重を維持したいならTDEE前後、筋肉を増やしたいならTDEEより少し多く摂るのが基本です。どれくらい増減させるかは目標のペースで決め、実際の体重の変化を見ながら調整していきます。"
        }
      ]
    },
    "zh": {
      "metaTitle": "基础代谢计算器:算出BMR与每日总消耗TDEE",
      "metaDescription": "输入性别、年龄、体重、身高和活动量,用 Mifflin-St Jeor 公式算出基础代谢率(BMR)和每日总消耗(TDEE),单位 kcal。",
      "faqHeader": "常见问题",
      "faq": [
        {
          "q": "基础代谢是什么?",
          "a": "基础代谢(BMR)是身体在完全静息状态下维持呼吸、心跳等基本功能所需的最低每日能量。它是每日总消耗的主要部分,也是计算 TDEE 的起点。本计算器的结果单位为 kcal/天。"
        },
        {
          "q": "基础代谢怎么计算?",
          "a": "本计算器使用 Mifflin-St Jeor 公式。男性:10×体重(kg)+ 6.25×身高(cm)− 5×年龄 + 5;女性将最后的 +5 换成 −161。只需输入性别、年龄、体重和身高即可得出结果。"
        },
        {
          "q": "基础代谢和 TDEE 有什么区别?",
          "a": "基础代谢只算静息时的消耗,TDEE 则在此基础上加上日常活动和运动的消耗,是一天的总消耗。计算方法是 BMR 乘以活动系数(1.2~1.9),所以 TDEE 一定高于基础代谢,活动越多差距越大。"
        },
        {
          "q": "活动量应该怎么选?",
          "a": "按每周运动次数选择:几乎不运动选久坐,每周1–3次选轻度,3–5次选中等,6–7次选活跃,每天练两次或从事体力劳动选非常活跃。拿不准时选低一档,可以避免 TDEE 估得过高。"
        },
        {
          "q": "为什么男女的基础代谢不一样?",
          "a": "因为 Mifflin-St Jeor 公式对男女使用不同的常数:男性 +5,女性 −161。在体重、身高、年龄都相同的情况下,女性的计算结果比男性低 166 kcal。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "基礎代謝率計算機:BMR與TDEE一次算好",
      "metaDescription": "輸入性別、年齡、體重、身高與活動量,以 Mifflin-St Jeor 公式算出基礎代謝率(BMR)與每日總消耗熱量(TDEE)。",
      "faqHeader": "常見問題",
      "faq": [
        {
          "q": "基礎代謝率是什麼?",
          "a": "基礎代謝率(BMR)是身體在完全靜止時,維持呼吸、心跳等基本功能所需的最低每日熱量。它占每日消耗的一大部分,也是計算 TDEE 的基礎。本計算機的結果單位為 kcal/天。"
        },
        {
          "q": "基礎代謝的計算方法是什麼?",
          "a": "本計算機採用 Mifflin-St Jeor 公式。男性為 10×體重(kg)+ 6.25×身高(cm)− 5×年齡 + 5,女性則把最後的 +5 換成 −161。輸入性別、年齡、體重和身高就能算出來。"
        },
        {
          "q": "TDEE 是什麼?跟基礎代謝差在哪?",
          "a": "TDEE 是每日總消耗熱量,也就是基礎代謝再加上日常活動與運動的消耗。計算方式是 BMR 乘以活動係數(1.2 ~ 1.9),所以 TDEE 一定比基礎代謝高,活動量越大差距越多。"
        },
        {
          "q": "TDEE 計算機的活動量要怎麼選?",
          "a": "依每週運動次數來選:幾乎不運動選久坐,每週1–3次選輕度,3–5次選中等,6–7次選活躍,一天練兩次或從事體力勞動選非常活躍。在兩級之間猶豫時選低一級,比較不會把 TDEE 估得太高。"
        },
        {
          "q": "TDEE 要怎麼用在減脂或增肌?",
          "a": "想減脂就吃得比 TDEE 少,想維持體重就吃到 TDEE 左右,想增肌則吃得比 TDEE 稍多,這是基本原則。要增減多少可依目標速度決定,再看實際體重變化慢慢調整。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calculadora TMB y TDEE para mujer y hombre",
      "metaDescription": "Introduce sexo, edad, peso, altura y actividad y obtén tu tasa metabólica basal (TMB) y tu gasto calórico diario (TDEE) con Mifflin-St Jeor.",
      "faqHeader": "Preguntas frecuentes",
      "faq": [
        {
          "q": "¿Qué es la TMB?",
          "a": "La TMB (tasa metabólica basal) es la energía mínima que tu cuerpo gasta al día en reposo total solo para mantener las funciones vitales. Es la mayor parte de tu gasto diario y el punto de partida para calcular el TDEE. El resultado se expresa en kcal al día."
        },
        {
          "q": "¿Cómo se calcula la TMB en mujeres y hombres?",
          "a": "Con la ecuación de Mifflin-St Jeor: en hombres es 10×peso (kg) + 6.25×altura (cm) − 5×edad + 5, y en mujeres la misma fórmula termina en −161 en vez de +5. Por eso, con el mismo peso, altura y edad, la TMB de una mujer sale 166 kcal más baja."
        },
        {
          "q": "¿Qué diferencia hay entre TMB y TDEE?",
          "a": "La TMB solo cuenta lo que gastas en reposo, mientras que el TDEE suma también todo lo que quemas con la actividad diaria y el ejercicio. Se obtiene multiplicando la TMB por un factor de actividad de 1.2 a 1.9, así que siempre es mayor que la TMB."
        },
        {
          "q": "¿Qué nivel de actividad debo elegir?",
          "a": "Elige según los días que entrenas por semana: sedentario si casi no haces ejercicio, ligero de 1 a 3 días, moderado de 3 a 5, activo de 6 a 7 y muy activo si entrenas dos veces al día o tienes un trabajo físico. Si dudas entre dos niveles, quédate con el más bajo para no sobrestimar tu TDEE."
        },
        {
          "q": "¿Cómo uso el TDEE para bajar o subir de peso?",
          "a": "Para bajar de peso, come por debajo de tu TDEE; para mantenerte, alrededor de tu TDEE; y para ganar músculo, un poco por encima. Cuánto ajustar depende del ritmo que busques, y conviene ir corrigiendo según cómo cambie tu peso."
        }
      ]
    },
    "pt-br": {
      "faqHeader": "Perguntas frequentes",
      "faq": [
        {
          "q": "O que é TMB (taxa metabólica basal)?",
          "a": "A TMB é a quantidade mínima de energia que seu corpo gasta por dia em repouso total, só para manter as funções vitais funcionando. Ela é a maior parte do seu gasto diário e o ponto de partida para calcular o gasto total. O resultado aparece em kcal por dia."
        },
        {
          "q": "Como calcular a TMB?",
          "a": "A calculadora usa a equação de Mifflin-St Jeor: para homens, 10×peso (kg) + 6,25×altura (cm) − 5×idade + 5; para mulheres, a mesma conta termina em −161 em vez de +5. Basta informar sexo, idade, peso e altura."
        },
        {
          "q": "Como calcular o GET (gasto energético total)?",
          "a": "O GET, também chamado de TDEE, é a sua TMB multiplicada por um fator de atividade que vai de 1,2 a 1,9. Quanto mais ativo você é, maior o fator e maior o gasto do dia. A calculadora faz essa conta automaticamente depois que você escolhe seu nível de atividade."
        },
        {
          "q": "Qual nível de atividade devo escolher?",
          "a": "Escolha pela quantidade de dias de treino por semana: sedentário se quase não se exercita, leve para 1 a 3 dias, moderado para 3 a 5, ativo para 6 a 7 e muito ativo se treina duas vezes por dia ou tem trabalho braçal. Na dúvida entre dois níveis, fique com o mais baixo para não superestimar o gasto."
        },
        {
          "q": "Qual a diferença entre TMB e gasto calórico total?",
          "a": "A TMB conta só o que o corpo gasta parado, enquanto o gasto total (GET ou TDEE) soma também o que você queima nas atividades do dia e nos treinos. Por isso o gasto total é sempre maior que a TMB, e é ele que serve de base para déficit, manutenção ou superávit."
        }
      ]
    },
    "id": {
      "faqHeader": "Pertanyaan yang sering diajukan",
      "faq": [
        {
          "q": "Apa itu BMR dan TDEE?",
          "a": "BMR (Basal Metabolic Rate) adalah energi minimum yang dibakar tubuh per hari saat istirahat total untuk menjalankan fungsi vital. TDEE (Total Daily Energy Expenditure) adalah total kalori yang terbakar dalam sehari, yaitu BMR ditambah energi untuk aktivitas dan olahraga. Keduanya dihitung dalam kcal per hari."
        },
        {
          "q": "Bagaimana cara menghitung BMR?",
          "a": "Kalkulator ini memakai rumus Mifflin-St Jeor: untuk pria 10×berat (kg) + 6,25×tinggi (cm) − 5×usia + 5, sedangkan untuk wanita angka terakhirnya −161, bukan +5. Cukup masukkan jenis kelamin, usia, berat badan, dan tinggi badan."
        },
        {
          "q": "Bagaimana cara menghitung TDEE?",
          "a": "TDEE didapat dengan mengalikan BMR dengan faktor aktivitas antara 1,2 dan 1,9. Semakin aktif Anda, semakin besar faktornya dan semakin tinggi TDEE Anda. Kalkulator BMR dan TDEE ini menghitungnya otomatis setelah Anda memilih tingkat aktivitas."
        },
        {
          "q": "Tingkat aktivitas mana yang harus saya pilih?",
          "a": "Pilih berdasarkan berapa hari Anda berolahraga dalam seminggu: tidak aktif jika jarang olahraga, ringan untuk 1–3 hari, sedang untuk 3–5 hari, aktif untuk 6–7 hari, dan sangat aktif jika berlatih dua kali sehari atau bekerja fisik. Kalau ragu di antara dua tingkat, pilih yang lebih rendah agar TDEE tidak terlalu tinggi."
        },
        {
          "q": "Bagaimana memakai TDEE untuk diet atau menambah otot?",
          "a": "Untuk menurunkan berat badan, makan di bawah TDEE; untuk mempertahankan, makan sekitar TDEE; untuk menambah otot, makan sedikit di atas TDEE. Besarnya selisih bisa disesuaikan dengan target kecepatan Anda, lalu diatur ulang sesuai perubahan berat badan."
        }
      ]
    },
    "de": {
      "faqHeader": "Häufige Fragen",
      "faq": [
        {
          "q": "Was ist der BMR-Wert?",
          "a": "Der BMR-Wert (Basal Metabolic Rate) ist Ihr Grundumsatz, also die Energie, die Ihr Körper täglich in völliger Ruhe für die lebenswichtigen Funktionen verbraucht. Er macht den größten Teil Ihres Tagesverbrauchs aus und wird in kcal pro Tag angegeben."
        },
        {
          "q": "Wie berechnet man den BMR?",
          "a": "Dieser Rechner nutzt die Mifflin-St-Jeor-Formel: für Männer 10×Gewicht (kg) + 6,25×Größe (cm) − 5×Alter + 5, für Frauen endet dieselbe Formel mit −161 statt +5. Sie brauchen dafür nur Geschlecht, Alter, Gewicht und Größe."
        },
        {
          "q": "Was ist der Unterschied zwischen Grundumsatz und TDEE?",
          "a": "Der Grundumsatz erfasst nur den Verbrauch in Ruhe, der TDEE zählt zusätzlich alles, was Sie durch Alltag und Sport verbrennen. Er ergibt sich aus dem BMR mal einem Aktivitätsfaktor von 1,2 bis 1,9 und liegt daher immer über dem Grundumsatz."
        },
        {
          "q": "Welches Aktivitätslevel soll ich wählen?",
          "a": "Entscheidend ist, an wie vielen Tagen pro Woche Sie trainieren: sitzend bei kaum Sport, leicht aktiv bei 1–3 Tagen, mäßig aktiv bei 3–5, aktiv bei 6–7 und sehr aktiv bei zwei Einheiten täglich oder körperlicher Arbeit. Wenn Sie zwischen zwei Stufen schwanken, nehmen Sie die niedrigere, damit der TDEE nicht zu hoch ausfällt."
        },
        {
          "q": "Warum ist der Grundumsatz bei Frauen niedriger?",
          "a": "Weil die Mifflin-St-Jeor-Formel für Männer und Frauen unterschiedliche Konstanten verwendet: +5 bzw. −161. Bei gleichem Gewicht, gleicher Größe und gleichem Alter liegt der berechnete Grundumsatz einer Frau deshalb 166 kcal unter dem eines Mannes."
        }
      ]
    },
    "fr": {
      "faqHeader": "Questions fréquentes",
      "faq": [
        {
          "q": "Qu’est-ce que le métabolisme de base ?",
          "a": "Le métabolisme de base (MB) est l’énergie minimale que votre corps dépense chaque jour au repos complet, uniquement pour assurer ses fonctions vitales. Il représente la plus grande part de votre dépense quotidienne et sert de point de départ au calcul du TDEE. Il s’exprime en kcal par jour."
        },
        {
          "q": "Comment calculer son métabolisme de base ?",
          "a": "Ce calculateur utilise l’équation de Mifflin-St Jeor : pour un homme, 10×poids (kg) + 6,25×taille (cm) − 5×âge + 5 ; pour une femme, la même formule se termine par −161 au lieu de +5. Il suffit d’indiquer votre sexe, votre âge, votre poids et votre taille."
        },
        {
          "q": "Quelle différence entre métabolisme de base et TDEE ?",
          "a": "Le métabolisme de base ne compte que la dépense au repos, alors que le TDEE y ajoute tout ce que vous brûlez au quotidien et pendant le sport. On l’obtient en multipliant le MB par un coefficient d’activité de 1,2 à 1,9 : il est donc toujours supérieur au métabolisme de base."
        },
        {
          "q": "Quel niveau d’activité choisir ?",
          "a": "Choisissez selon le nombre de jours d’entraînement par semaine : sédentaire si vous ne faites presque pas d’exercice, légèrement actif pour 1 à 3 jours, modérément actif pour 3 à 5, actif pour 6 à 7, et très actif si vous vous entraînez deux fois par jour ou avez un travail physique. En cas d’hésitation entre deux niveaux, prenez le plus bas pour ne pas surestimer votre TDEE."
        },
        {
          "q": "Le calcul du métabolisme de base est-il fiable ?",
          "a": "L’équation de Mifflin-St Jeor est considérée comme l’estimation la plus précise sans matériel de laboratoire, c’est pourquoi l’ACSM et l’ISSN la recommandent. Elle reste une estimation : votre dépense réelle peut s’en écarter. Servez-vous du résultat comme point de départ et ajustez-le selon l’évolution de votre poids."
        }
      ]
    }
  },
  "protein": {
    "ko": {
      "metaTitle": "단백질 섭취량 계산 – 하루 몇 g 먹어야 할까",
      "metaDescription": "체중(kg)과 목표(근력·지구력·다이어트·60세+)를 넣으면 하루 단백질 권장량과 한 끼 섭취량(g)을 계산해 줍니다(ISSN 2017).",
      "faqHeader": "자주 묻는 질문",
      "faq": [
        {
          "q": "하루 단백질 섭취량은 어떻게 계산하나요?",
          "a": "체중(kg)과 목표로 계산합니다. 체중을 입력하고 비활동·지구력·근력·다이어트·60세 이상 중 하나를 고르면 하루 권장량이 g으로 나옵니다. 하루 양을 4끼로 나눈 한 끼 양도 함께 보여 줍니다(ISSN 2017 기준)."
        },
        {
          "q": "운동을 안 하면 단백질은 하루 몇 g 먹어야 하나요?",
          "a": "일반 권장량은 체중 1kg당 0.8g입니다. 체중이 60kg이면 하루 48g입니다. 계산기에서 '비활동 (좌식)'을 고르면 내 체중에 맞는 범위를 볼 수 있습니다."
        },
        {
          "q": "다이어트할 때는 단백질을 더 먹어야 하나요?",
          "a": "네, 일반 권장량(0.8 g/kg)의 2배 이상이 필요합니다. 그래야 체중이 줄 때 근육이 함께 빠지지 않습니다. 목표에서 '다이어트 (근손실 방지)'를 고르면 이 기준으로 계산됩니다."
        },
        {
          "q": "단백질은 한 끼에 몇 g까지 흡수되나요?",
          "a": "한 끼에 30g이 넘으면 흡수율이 떨어집니다. 그래서 하루 필요량을 4끼로 나눠 먹는 것을 권장합니다. 계산 결과에도 4식 기준 한 끼 양이 함께 나옵니다."
        },
        {
          "q": "60세 이상은 단백질을 얼마나 먹어야 하나요?",
          "a": "60세 이상은 목표를 따로 골라 계산합니다. '60세 이상'을 선택하고 체중을 입력하면 하루 권장량과 4끼 기준 한 끼 양이 g 단위로 나옵니다."
        }
      ]
    },
    "en": {
      "metaTitle": "Protein Calculator: How Much Protein Per Day?",
      "metaDescription": "Enter your weight (kg) and goal (strength, endurance, cutting or 60+) to get your daily protein range in grams and how much to eat per meal.",
      "faqHeader": "Frequently asked questions",
      "faq": [
        {
          "q": "How much protein do I need per day?",
          "a": "It depends on your body weight and your goal. The standard RDA is 0.8 g per kg of body weight, and your range changes if you train, cut, or are 60+. Enter your weight in kg and pick a goal to see your daily range in grams (ISSN 2017)."
        },
        {
          "q": "How much protein should I eat when cutting?",
          "a": "When cutting, aim for about 2.0–2.4 g of protein per kg of body weight to prevent muscle loss. For a 70 kg person, that's about 140–168 g a day. Choose the “Cutting” goal to get your exact range."
        },
        {
          "q": "Is there a protein calculator for GLP-1 users?",
          "a": "Yes. If you're losing weight on a GLP-1 medication, choose the “Cutting (muscle preservation)” goal. During weight loss you need about 2.0–2.4 g/kg, well above the standard 0.8 g/kg, to prevent muscle loss, and the calculator splits your total across 4 meals."
        },
        {
          "q": "How much protein can you absorb in one meal?",
          "a": "Absorption levels off above roughly 30 g per meal. So spreading your protein across 4 meals works better than eating it all in one or two large servings. The calculator shows a per-meal amount based on 4 meals a day."
        },
        {
          "q": "How much protein do adults over 60 need?",
          "a": "The calculator has a separate goal for adults 60+, apart from the activity and training goals. Choose “Adult 60+” and enter your weight in kg to see your daily range and how much to eat at each of 4 meals."
        }
      ]
    },
    "ja": {
      "metaTitle": "たんぱく質計算｜1日何g必要？ダイエット・筋トレ別",
      "metaDescription": "体重(kg)と目標を入力するだけで、1日のたんぱく質推奨量と1食あたりの量(g)がわかります。減量・筋トレ・持久力・60歳以上に対応(ISSN 2017)。",
      "faqHeader": "よくある質問",
      "faq": [
        {
          "q": "たんぱく質は1日に何g必要？",
          "a": "体重と目標によって変わります。一般的な推奨量は体重1kgあたり0.8gで、体重60kgなら1日48gです。体重と目標を入力すると、自分に合った1日の推奨量がわかります(ISSN 2017)。"
        },
        {
          "q": "ダイエット中はたんぱく質をどれくらいとればいい？",
          "a": "減量中は通常の推奨量(0.8 g/kg)の2倍以上が目安です。そうすることで筋肉が落ちるのを防げます。目標で「減量(筋肉保持)」を選ぶと、この基準で計算できます。"
        },
        {
          "q": "ウゴービやオゼンピックでダイエット中でも使える？",
          "a": "はい、使えます。薬を使った減量でも、体重を落としている間は目標で「減量(筋肉保持)」を選んでください。体重を入力すると、1日の推奨量と4食に分けた1食あたりの量が表示されます。"
        },
        {
          "q": "1食で吸収できるたんぱく質は何gまで？",
          "a": "1食30gを超えると、それ以上は吸収されにくくなります。そのため1日の必要量は4食に分けてとるのがおすすめです。計算結果には4食基準の1食あたりの量も表示されます。"
        },
        {
          "q": "筋トレしている人のたんぱく質量は？",
          "a": "目標ごとに推奨量が異なるため、目標で「筋トレ」を選んで計算します。体重を入力すると、1日の推奨量と1食あたりの量がg単位で表示されます。"
        }
      ]
    },
    "zh": {
      "metaTitle": "蛋白质计算器：每天该吃多少克蛋白质？",
      "metaDescription": "输入体重(kg)和目标（力量训练、耐力、减脂或60岁以上），即可算出每日蛋白质推荐量及每餐摄入克数（ISSN 2017标准）。",
      "faqHeader": "常见问题",
      "faq": [
        {
          "q": "每天需要吃多少蛋白质？",
          "a": "取决于体重和目标。一般推荐量是每公斤体重0.8 g，体重60 kg的人每天约48 g。输入体重并选择目标，就能看到适合自己的每日推荐范围（ISSN 2017）。"
        },
        {
          "q": "减脂期间蛋白质要吃多少？",
          "a": "减脂期建议每公斤体重摄入约2.0~2.4 g蛋白质，这样可以防止肌肉流失。选择“减脂(肌肉保持)”目标，就会按这个标准计算。"
        },
        {
          "q": "一餐能吸收多少蛋白质？",
          "a": "单餐超过约30 g，吸收率就会下降。所以建议把每天的总量分成4餐吃，计算器也会按每天4餐显示每餐的克数。"
        },
        {
          "q": "做力量训练每天要吃多少蛋白质？",
          "a": "每个目标的推荐量都不一样，需要按目标单独计算。选择“力量训练”并输入体重，计算器会给出每日推荐范围和每餐克数。"
        },
        {
          "q": "60岁以上每天需要多少蛋白质？",
          "a": "计算器为60岁以上人群单独设置了目标。选择“60岁以上”并输入体重（kg），就能看到每日推荐范围，以及分4餐时每餐的量。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "蛋白質計算機：一天要吃多少克蛋白質？",
      "metaDescription": "輸入體重(kg)與目標（力量訓練、耐力、減脂或60歲以上），立即算出每日蛋白質建議量與每餐攝取克數（ISSN 2017標準）。",
      "faqHeader": "常見問題",
      "faq": [
        {
          "q": "一天要吃多少蛋白質？",
          "a": "要看體重和目標。一般建議量是每公斤體重0.8 g，體重60 kg的人一天約48 g。輸入體重並選擇目標，就能看到適合自己的每日建議範圍（ISSN 2017）。"
        },
        {
          "q": "減脂期蛋白質要吃多少？",
          "a": "減脂期建議每公斤體重攝取約2.0~2.4 g蛋白質，才能避免肌肉流失。選擇「減脂(肌肉保持)」目標，就會依這個標準計算。"
        },
        {
          "q": "一餐可以吸收多少蛋白質？",
          "a": "單餐超過約30 g，吸收率就會下降。所以建議把一天的總量分成4餐攝取，計算機也會依每天4餐顯示每餐的克數。"
        },
        {
          "q": "有在重訓的人一天要吃多少蛋白質？",
          "a": "每個目標的建議量都不同，需要依目標分開計算。選擇「力量訓練」並輸入體重，計算機會算出每日建議範圍和每餐克數。"
        },
        {
          "q": "60歲以上一天需要多少蛋白質？",
          "a": "計算機為60歲以上族群另外設了目標。選擇「60歲以上」並輸入體重（kg），就能看到每日建議範圍，以及分4餐時每餐的份量。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calcular proteína: ¿cuántos gramos al día?",
      "metaDescription": "Introduce tu peso (kg) y tu objetivo (fuerza, resistencia, definición o 60+) y obtén los gramos de proteína diarios y la cantidad por comida.",
      "faqHeader": "Preguntas frecuentes",
      "faq": [
        {
          "q": "¿Cómo calcular la proteína que necesito al día?",
          "a": "Se calcula con tu peso en kg y tu objetivo. La recomendación estándar (RDA) es de 0.8 g por kg, y el rango cambia si entrenas, estás en definición o tienes más de 60 años. Introduce tu peso y elige un objetivo para ver tu rango diario (ISSN 2017)."
        },
        {
          "q": "¿Cuánta proteína comer en definición?",
          "a": "Alrededor de 2.0–2.4 g por kg de peso corporal, para evitar la pérdida muscular. Una persona de 70 kg necesitaría unos 140–168 g al día. Elige «Definición» en la calculadora para ver tu rango exacto."
        },
        {
          "q": "¿Cuánta proteína se absorbe por comida?",
          "a": "Por encima de unos 30 g por toma, la absorción se estabiliza. Por eso conviene repartir la proteína del día en 4 comidas. La calculadora te muestra directamente la cantidad para cada una."
        },
        {
          "q": "¿Cuánta proteína necesito si hago pesas?",
          "a": "Cada objetivo tiene su propio rango recomendado, así que se calcula aparte. Elige «Fuerza (pesas)» e introduce tu peso en kg para ver los gramos diarios y la cantidad para cada una de tus 4 comidas."
        },
        {
          "q": "¿Cuánta proteína necesita un adulto mayor de 60 años?",
          "a": "La calculadora tiene un objetivo propio para adultos de 60+. Selecciona «Adulto 60+» e introduce tu peso para ver tu rango diario de proteína y la cantidad por comida, repartida en 4 tomas."
        }
      ]
    },
    "pt-br": {
      "faqHeader": "Perguntas frequentes",
      "faq": [
        {
          "q": "Como fazer o cálculo de proteína por kg de peso?",
          "a": "Multiplique seu peso em kg pela quantidade indicada para o seu objetivo. A recomendação padrão é de 0,8 g por kg, então uma pessoa de 70 kg precisa de 56 g por dia. Se você treina, está emagrecendo ou tem 60+, escolha o objetivo na calculadora para ver sua faixa diária."
        },
        {
          "q": "Como saber minha meta de proteína diária?",
          "a": "Sua meta depende do seu peso e do seu objetivo. Informe o peso em kg e escolha entre sedentário, resistência, musculação, emagrecimento ou 60+. A calculadora mostra a faixa diária em gramas e quanto comer por refeição (ISSN 2017)."
        },
        {
          "q": "Quanto de proteína comer por dia para emagrecer?",
          "a": "No emagrecimento, você precisa de cerca de 2,0 a 2,4 g de proteína por kg de peso, para não perder massa muscular. Para quem pesa 70 kg, isso dá cerca de 140 a 168 g por dia."
        },
        {
          "q": "Quantos gramas de proteína o corpo aproveita por refeição?",
          "a": "Acima de ~30 g por refeição, o aproveitamento se estabiliza. Por isso vale dividir a proteína do dia em 4 refeições. A calculadora já mostra a quantidade para cada uma."
        },
        {
          "q": "Quanto de proteína quem faz musculação precisa?",
          "a": "Cada objetivo tem sua própria faixa recomendada. Selecione “Musculação” e informe seu peso em kg para ver na hora quantos gramas de proteína comer por dia e por refeição."
        }
      ]
    },
    "id": {
      "faqHeader": "Pertanyaan yang Sering Diajukan",
      "faq": [
        {
          "q": "Berapa gram protein yang dibutuhkan per hari?",
          "a": "Tergantung berat badan dan target Anda. Angka kecukupan standar adalah 0,8 g per kg berat badan, jadi orang dengan berat 60 kg butuh sekitar 48 g sehari. Masukkan berat badan dan pilih target untuk melihat kisaran harian Anda (ISSN 2017)."
        },
        {
          "q": "Apakah ada kalkulator protein untuk pengguna GLP-1 seperti Ozempic atau Zepbound?",
          "a": "Ada. Kalau berat badan Anda sedang turun saat memakai obat GLP-1, pilih target “Diet (mempertahankan otot)”. Kalkulator akan menghitung kebutuhan harian Anda dan membaginya ke 4 kali makan."
        },
        {
          "q": "Berapa kebutuhan protein saat diet?",
          "a": "Saat diet, Anda butuh sekitar 2,0–2,4 g protein per kg berat badan agar otot tidak ikut hilang. Untuk berat 70 kg, itu sekitar 140–168 g per hari."
        },
        {
          "q": "Berapa gram protein yang bisa diserap dalam sekali makan?",
          "a": "Di atas ~30 g per sekali makan, penyerapan cenderung stagnan. Karena itu, kebutuhan harian sebaiknya dibagi ke 4 kali makan. Kalkulator langsung menampilkan porsi untuk setiap kali makan."
        },
        {
          "q": "Apakah kebutuhan protein wanita dihitung berbeda?",
          "a": "Kalkulator ini menghitung berdasarkan berat badan dan target, bukan jenis kelamin. Jadi perempuan cukup memasukkan berat badan dalam kg dan memilih target untuk mendapatkan kisaran protein harian dan porsi per makan."
        }
      ]
    },
    "de": {
      "faqHeader": "Häufige Fragen",
      "faq": [
        {
          "q": "Wie viel Protein brauche ich am Tag?",
          "a": "Das hängt von Ihrem Körpergewicht und Ihrem Ziel ab. Die Standardempfehlung liegt bei 0,8 g pro kg Körpergewicht – bei 70 kg sind das 56 g am Tag. Geben Sie Gewicht und Ziel ein, dann sehen Sie Ihren persönlichen Tagesbedarf (ISSN 2017)."
        },
        {
          "q": "Wie viel Protein am Tag zum Abnehmen?",
          "a": "In der Diät brauchen Sie etwa 2,0–2,4 g Protein pro kg Körpergewicht, um Muskelabbau zu verhindern. Bei 70 kg sind das etwa 140–168 g pro Tag."
        },
        {
          "q": "Wie viel Eiweiß kann der Körper pro Mahlzeit verwerten?",
          "a": "Ab etwa 30 g pro Mahlzeit stagniert die Verwertung. Deshalb lohnt es sich, die Tagesmenge auf 4 Mahlzeiten zu verteilen. Der Rechner zeigt die Menge pro Mahlzeit gleich mit an."
        },
        {
          "q": "Wie viel Protein brauche ich beim Krafttraining?",
          "a": "Für jedes Ziel gilt ein eigener Empfehlungsbereich. Wählen Sie „Krafttraining“ und geben Sie Ihr Gewicht in kg ein. Der Rechner zeigt dann Ihren Tagesbedarf und die Menge pro Mahlzeit."
        },
        {
          "q": "Wie viel Eiweiß brauchen Menschen ab 60?",
          "a": "Für Erwachsene ab 60 gibt es im Rechner ein eigenes Ziel. Wählen Sie „Erwachsene ab 60“ und geben Sie Ihr Gewicht ein. Sie erhalten Ihren Tagesbedarf in Gramm und die Menge pro Mahlzeit bei 4 Mahlzeiten."
        }
      ]
    },
    "fr": {
      "faqHeader": "Questions fréquentes",
      "faq": [
        {
          "q": "Combien de grammes de protéines par jour ?",
          "a": "Tout dépend de votre poids et de votre objectif. L’apport recommandé standard est de 0,8 g par kg de poids corporel, soit 56 g par jour pour 70 kg. Indiquez votre poids et votre objectif pour connaître votre apport quotidien (ISSN 2017)."
        },
        {
          "q": "Combien de protéines manger en sèche ?",
          "a": "En sèche, il faut environ 2,0 à 2,4 g de protéines par kg de poids corporel, pour éviter la fonte musculaire. Pour 70 kg, cela fait environ 140 à 168 g par jour."
        },
        {
          "q": "Combien de protéines le corps absorbe-t-il par repas ?",
          "a": "Au-delà d’environ 30 g par repas, l’absorption plafonne. Mieux vaut donc répartir l’apport de la journée sur 4 repas. Le calculateur indique directement la quantité pour chaque repas."
        },
        {
          "q": "Combien de protéines pour la musculation ?",
          "a": "Chaque objectif a sa propre fourchette recommandée. Choisissez « Musculation » et saisissez votre poids en kg pour obtenir votre apport quotidien et la quantité par repas."
        },
        {
          "q": "Quels sont les besoins en protéines après 60 ans ?",
          "a": "Le calculateur propose un objectif dédié aux adultes de 60 ans et plus. Sélectionnez « Adulte de 60 ans et + » et indiquez votre poids pour obtenir votre apport quotidien et sa répartition sur 4 repas."
        }
      ]
    }
  },
  "water": {
    "ko": {
      "metaTitle": "하루 물 섭취량 계산기 – 체중별 권장량",
      "metaDescription": "체중·하루 운동 시간·기후를 입력하면 하루 권장 수분량을 리터와 250ml 컵 수로 바로 알려 드립니다. 체중 1kg당 35ml 기준(NAM 2004).",
      "faqHeader": "자주 묻는 질문",
      "faq": [
        {
          "q": "하루 물 섭취량은 얼마가 적당한가요?",
          "a": "기본 권장량은 체중 1kg당 35ml입니다. 여기에 운동 1시간마다 700ml, 덥거나 습한 날에는 500ml를 더합니다. 이 계산기는 이 기준(NAM 2004)으로 체중·운동 시간·기후를 함께 반영해 하루 목표량을 보여 줍니다."
        },
        {
          "q": "체중 60kg이면 하루에 물을 몇 리터 마셔야 하나요?",
          "a": "운동을 하지 않고 기후가 보통이라면 약 2.1L입니다. 60kg × 35ml로 계산한 값이며, 250ml 컵으로는 약 8잔입니다. 같은 조건에서 1시간 운동하면 약 2.8L로 늘어납니다."
        },
        {
          "q": "운동하는 날에는 물을 얼마나 더 마셔야 하나요?",
          "a": "운동 1시간마다 700ml를 더하면 됩니다. 예를 들어 하루 2시간 운동하면 기본량에 1.4L가 추가됩니다. 계산기에 하루 운동 시간을 입력하면 이 양이 자동으로 합산됩니다."
        },
        {
          "q": "여름이나 더운 날에는 물을 더 마셔야 하나요?",
          "a": "네, 덥거나 습한 기후에서는 하루 500ml를 더합니다. 땀으로 빠져나가는 수분을 보충하기 위한 양입니다. 계산기에서 기후를 '덥거나 습함'으로 선택하면 결과에 반영됩니다."
        },
        {
          "q": "커피나 음식으로 섭취한 수분도 포함되나요?",
          "a": "계산 결과는 음료와 음식으로 섭취하는 수분을 모두 합친 양입니다. 다만 카페인과 알코올은 이뇨 작용이 있어, 커피나 술을 마셨다면 그만큼 물을 추가로 보충하는 것이 좋습니다."
        }
      ]
    },
    "en": {
      "metaTitle": "How Much Water Should I Drink a Day? Calculator",
      "metaDescription": "Enter your weight, daily exercise hours and climate to get your daily water target in liters and 250 ml cups. Based on 35 ml per kg (NAM 2004).",
      "faqHeader": "Frequently Asked Questions",
      "faq": [
        {
          "q": "How much water should I drink a day?",
          "a": "A common baseline is 35 ml per kg of body weight. Add 700 ml for each hour of exercise and 500 ml if it's hot or humid. This calculator applies those rules (NAM 2004) to your weight, activity and climate to give one daily target."
        },
        {
          "q": "How much water should a 60 kg person drink?",
          "a": "About 2.1 L per day with no exercise in a normal climate. That's 60 kg × 35 ml, or roughly 8 cups of 250 ml. Add one hour of exercise and the target rises to about 2.8 L."
        },
        {
          "q": "How much more water do I need when I exercise?",
          "a": "Add about 700 ml for every hour of exercise. Two hours of training, for example, adds 1.4 L to your baseline. Enter your daily exercise hours in the calculator and it's included automatically."
        },
        {
          "q": "Should I drink more water in hot weather?",
          "a": "Yes, add about 500 ml per day in hot or humid conditions to cover extra fluid lost through sweat. Select Hot or humid as your climate and the calculator adds it to your result."
        },
        {
          "q": "Do coffee and food count toward daily water intake?",
          "a": "Yes, the daily target includes water from both drinks and food. Caffeine and alcohol have a diuretic effect, though, so on days you drink coffee or alcohol, add some extra water to make up for it."
        }
      ]
    },
    "ja": {
      "metaTitle": "1日の水分摂取量計算|体重から必要量がわかる",
      "metaDescription": "体重・1日の運動時間・気候を入力すると、1日に必要な水分量をLと250mlのコップ数で表示。体重1kgあたり35ml(NAM 2004)が基準です。",
      "faqHeader": "よくある質問",
      "faq": [
        {
          "q": "1日に必要な水分量はどれくらい?",
          "a": "基本は体重1kgあたり35mlです。運動1時間ごとに700ml、暑い・湿気の多い日は500mlを加えます。この計算機はこの基準(NAM 2004)で、体重・運動時間・気候をまとめて反映します。"
        },
        {
          "q": "体重60kgだと1日何リットル飲めばいい?",
          "a": "運動なし・通常の気候なら約2.1Lです。60kg×35mlで計算した量で、250mlのコップで約8杯分です。同じ条件で1時間運動すると約2.8Lになります。"
        },
        {
          "q": "運動する日は水分をどれくらい増やすべき?",
          "a": "運動1時間ごとに700mlを追加します。たとえば2時間運動する日は、基本量に1.4Lが上乗せされます。1日の運動時間を入力すれば自動で合算されます。"
        },
        {
          "q": "夏や暑い日は水を多めに飲むべき?",
          "a": "はい、暑い・湿気の多い気候では1日500mlを追加します。汗で失われる水分を補うための量です。気候で「暑い・湿気」を選ぶと結果に反映されます。"
        },
        {
          "q": "コーヒーや食事の水分も含まれる?",
          "a": "計算結果は、飲み物と食事から摂る水分を合わせた量です。ただしカフェインやアルコールには利尿作用があるため、コーヒーやお酒を飲んだ日はその分の水分を追加で補給するのがおすすめです。"
        }
      ]
    },
    "zh": {
      "metaTitle": "每天喝多少水?按体重计算每日饮水量",
      "metaDescription": "输入体重、每日运动时间和气候,即可算出每日建议饮水量(L)及250ml杯数。以体重每kg 35ml为基础(NAM 2004)。",
      "faqHeader": "常见问题",
      "faq": [
        {
          "q": "一个人每天应该喝多少水?",
          "a": "基础量是每公斤体重35ml。每运动1小时再加700ml,炎热或潮湿天气再加500ml。本计算器按这一标准(NAM 2004),结合体重、运动时间和气候算出每日目标。"
        },
        {
          "q": "体重60kg每天要喝几升水?",
          "a": "不运动、气候正常时约为2.1L。这是按60kg×35ml计算的,约合8杯250ml的水。同样条件下运动1小时,目标会增加到约2.8L。"
        },
        {
          "q": "运动的时候要多喝多少水?",
          "a": "每运动1小时增加约700ml。例如一天运动2小时,就在基础量上多加1.4L。在计算器中填写每日运动时间,会自动计入结果。"
        },
        {
          "q": "夏天天热需要多喝水吗?",
          "a": "需要,炎热或潮湿的天气每天多加约500ml,用来补充出汗流失的水分。在计算器中把气候选为“炎热或潮湿”即可计入。"
        },
        {
          "q": "喝咖啡和吃饭摄入的水分算不算?",
          "a": "算,计算结果包括饮料和食物中的全部水分。不过咖啡因和酒精有利尿作用,喝了咖啡或酒的日子,最好额外多补充一些水。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "一天喝多少水?依體重計算每日飲水量",
      "metaDescription": "輸入體重、每日運動時間與氣候,即可算出每日建議飲水量(L)及250ml杯數。以體重每kg 35ml為基準(NAM 2004)。",
      "faqHeader": "常見問題",
      "faq": [
        {
          "q": "一天應該喝多少水才夠?",
          "a": "基本量是每公斤體重35ml。每運動1小時再加700ml,天氣炎熱或潮濕再加500ml。這個計算機依照此標準(NAM 2004),綜合體重、運動時間與氣候算出每日目標。"
        },
        {
          "q": "體重60kg一天要喝幾公升水?",
          "a": "不運動、氣候正常的話約2.1L。這是以60kg×35ml計算,大約是8杯250ml的水。同樣條件下運動1小時,目標會提高到約2.8L。"
        },
        {
          "q": "運動時要多喝多少水?",
          "a": "每運動1小時增加約700ml。例如一天運動2小時,就要在基本量上再多1.4L。在計算機輸入每日運動時間,就會自動加進結果。"
        },
        {
          "q": "夏天天氣熱要多喝水嗎?",
          "a": "要,炎熱或潮濕的天氣每天多加約500ml,用來補充流汗損失的水分。把氣候選成「炎熱或潮濕」就會計入結果。"
        },
        {
          "q": "喝咖啡、吃東西的水分也算嗎?",
          "a": "算,計算結果包含飲料和食物中的所有水分。不過咖啡因和酒精有利尿作用,有喝咖啡或喝酒的日子,建議再額外多補充一些水。"
        }
      ]
    },
    "es": {
      "metaTitle": "¿Cuánta agua beber al día? Calculadora por peso",
      "metaDescription": "Introduce tu peso, horas de ejercicio y clima para saber cuánta agua beber al día, en litros y vasos de 250 ml. Base: 35 ml por kg (NAM 2004).",
      "faqHeader": "Preguntas frecuentes",
      "faq": [
        {
          "q": "¿Cuánta agua hay que beber al día?",
          "a": "La base es 35 ml por kg de peso corporal. A eso se suman 700 ml por cada hora de ejercicio y 500 ml si hace calor o hay humedad. Esta calculadora aplica esos criterios (NAM 2004) a tu peso, actividad y clima."
        },
        {
          "q": "¿Cuántos litros de agua debe tomar una persona de 60 kg?",
          "a": "Unos 2,1 L al día sin ejercicio y en clima normal. Sale de multiplicar 60 kg × 35 ml, lo que equivale a unos 8 vasos de 250 ml. Con una hora de ejercicio, la meta sube a unos 2,8 L."
        },
        {
          "q": "¿Cuánta agua extra necesito si hago ejercicio?",
          "a": "Suma unos 700 ml por cada hora de ejercicio. Si entrenas dos horas, por ejemplo, se añaden 1,4 L a tu cantidad base. Al indicar tus horas de ejercicio, la calculadora lo incluye automáticamente."
        },
        {
          "q": "¿Hay que beber más agua cuando hace calor?",
          "a": "Sí, en clima cálido o húmedo se añaden unos 500 ml al día para reponer lo que se pierde con el sudor. Elige «Cálido o húmedo» en el clima y se sumará a tu resultado."
        },
        {
          "q": "¿El café y la comida cuentan como agua?",
          "a": "Sí, la meta diaria incluye el agua de bebidas y alimentos. Eso sí, la cafeína y el alcohol tienen efecto diurético, así que los días que tomes café o alcohol conviene beber algo más de agua."
        }
      ]
    },
    "pt-br": {
      "faqHeader": "Perguntas frequentes",
      "faq": [
        {
          "q": "Quantos litros de água devo beber por dia?",
          "a": "A base é 35 ml por kg de peso corporal. Some 700 ml para cada hora de exercício e 500 ml se o clima estiver quente ou úmido. A calculadora aplica esses critérios (NAM 2004) ao seu peso, atividade e clima."
        },
        {
          "q": "Quem pesa 60 kg deve beber quanto de água?",
          "a": "Cerca de 2,1 L por dia, sem exercício e em clima ameno. A conta é 60 kg × 35 ml, o que dá uns 8 copos de 250 ml. Com uma hora de exercício, a meta sobe para cerca de 2,8 L."
        },
        {
          "q": "Quanto de água a mais beber quando faço exercício?",
          "a": "Acrescente cerca de 700 ml por hora de exercício. Se você treina duas horas, por exemplo, são 1,4 L a mais sobre a base. Informe as horas de exercício na calculadora e o valor entra automaticamente."
        },
        {
          "q": "No calor é preciso beber mais água?",
          "a": "Sim, em clima quente ou úmido acrescente cerca de 500 ml por dia para repor o que se perde no suor. Selecione “Quente ou úmido” no campo de clima e isso entra no resultado."
        },
        {
          "q": "Café e comida contam como consumo de água?",
          "a": "Contam: a meta diária inclui a água de bebidas e alimentos. Mas cafeína e álcool são diuréticos, então nos dias em que você toma café ou bebida alcoólica vale beber um pouco mais de água."
        }
      ]
    },
    "id": {
      "faqHeader": "Pertanyaan yang sering diajukan",
      "faq": [
        {
          "q": "Berapa liter air yang harus diminum per hari?",
          "a": "Patokan dasarnya 35 ml per kg berat badan. Tambahkan 700 ml untuk setiap jam olahraga dan 500 ml jika cuaca panas atau lembap. Kalkulator ini memakai patokan tersebut (NAM 2004) sesuai berat badan, olahraga, dan iklim Anda."
        },
        {
          "q": "Berat badan 60 kg harus minum berapa liter sehari?",
          "a": "Sekitar 2,1 L per hari jika tidak berolahraga dan iklimnya biasa. Angka ini dari 60 kg × 35 ml, atau kira-kira 8 gelas 250 ml. Dengan olahraga satu jam, targetnya naik menjadi sekitar 2,8 L."
        },
        {
          "q": "Kalau olahraga, perlu tambah minum berapa banyak?",
          "a": "Tambahkan sekitar 700 ml untuk setiap jam olahraga. Misalnya olahraga dua jam berarti tambahan 1,4 L dari kebutuhan dasar. Masukkan jam olahraga harian di kalkulator dan jumlahnya otomatis dihitung."
        },
        {
          "q": "Apakah saat cuaca panas harus minum lebih banyak?",
          "a": "Ya, di iklim panas atau lembap tambahkan sekitar 500 ml per hari untuk mengganti cairan yang keluar lewat keringat. Pilih “Panas atau lembap” pada pilihan iklim agar masuk ke hasil."
        },
        {
          "q": "Apakah kopi dan makanan dihitung sebagai asupan air?",
          "a": "Ya, target harian sudah mencakup air dari minuman dan makanan. Namun kafein dan alkohol bersifat diuretik, jadi pada hari Anda minum kopi atau alkohol, sebaiknya tambah sedikit asupan air."
        }
      ]
    },
    "de": {
      "faqHeader": "Häufige Fragen",
      "faq": [
        {
          "q": "Wie viel Wasser sollte man am Tag trinken?",
          "a": "Als Basis gelten 35 ml pro kg Körpergewicht. Dazu kommen 700 ml pro Stunde Sport und 500 ml bei heißem oder schwülem Wetter. Der Rechner wendet diese Werte (NAM 2004) auf Ihr Gewicht, Ihre Aktivität und das Klima an."
        },
        {
          "q": "Wie viel Liter Wasser bei 60 kg Körpergewicht?",
          "a": "Ohne Sport und bei gemäßigtem Klima sind es etwa 2,1 L pro Tag. Das ergibt sich aus 60 kg × 35 ml und entspricht rund 8 Gläsern à 250 ml. Mit einer Stunde Sport steigt der Wert auf etwa 2,8 L."
        },
        {
          "q": "Wie viel mehr trinken beim Sport?",
          "a": "Pro Stunde Sport kommen etwa 700 ml hinzu. Wer zum Beispiel zwei Stunden trainiert, braucht 1,4 L mehr als den Grundbedarf. Tragen Sie Ihre tägliche Sportdauer ein, dann wird das automatisch eingerechnet."
        },
        {
          "q": "Muss man bei Hitze mehr Wasser trinken?",
          "a": "Ja, bei heißem oder schwülem Klima kommen etwa 500 ml pro Tag hinzu, um den Flüssigkeitsverlust durch Schwitzen auszugleichen. Wählen Sie beim Klima „Heiß oder schwül“, dann fließt das ins Ergebnis ein."
        },
        {
          "q": "Zählen Kaffee und Essen zur Trinkmenge?",
          "a": "Ja, das Tagesziel umfasst Flüssigkeit aus Getränken und Nahrung. Koffein und Alkohol wirken allerdings harntreibend – an Tagen mit Kaffee oder Alkohol sollten Sie daher etwas mehr Wasser trinken."
        }
      ]
    },
    "fr": {
      "faqHeader": "Questions fréquentes",
      "faq": [
        {
          "q": "Combien de litres d’eau faut-il boire par jour ?",
          "a": "La base est de 35 ml par kg de poids corporel. On ajoute 700 ml par heure d’exercice et 500 ml par temps chaud ou humide. Ce calculateur applique ces repères (NAM 2004) à votre poids, votre activité et votre climat."
        },
        {
          "q": "Combien d’eau boire par jour quand on pèse 60 kg ?",
          "a": "Environ 2,1 L par jour, sans exercice et par climat tempéré. C’est le résultat de 60 kg × 35 ml, soit à peu près 8 verres de 250 ml. Avec une heure d’exercice, l’objectif passe à environ 2,8 L."
        },
        {
          "q": "Combien d’eau en plus boire quand on fait du sport ?",
          "a": "Comptez environ 700 ml de plus par heure d’exercice. Deux heures d’entraînement ajoutent donc 1,4 L à votre besoin de base. Indiquez vos heures d’exercice dans le calculateur et elles sont prises en compte automatiquement."
        },
        {
          "q": "Faut-il boire plus d’eau quand il fait chaud ?",
          "a": "Oui, par temps chaud ou humide, ajoutez environ 500 ml par jour pour compenser l’eau perdue par la transpiration. Choisissez « Chaud ou humide » dans le champ climat pour l’intégrer au résultat."
        },
        {
          "q": "Le café et l’alimentation comptent-ils dans l’hydratation ?",
          "a": "Oui, l’objectif quotidien inclut l’eau apportée par les boissons et les aliments. La caféine et l’alcool étant diurétiques, les jours où vous en consommez, buvez un peu plus d’eau pour compenser."
        }
      ]
    }
  },
  "caffeine": {
    "ko": {
      "metaTitle": "카페인 반감기 계산기: 마지막 커피는 몇 시?",
      "metaDescription": "취침 시각·한 잔 카페인(mg)·잔류 허용량을 넣으면 반감기 5시간 기준으로 마지막 커피를 마셔도 되는 시각을 알려줍니다.",
      "faqHeader": "카페인 계산기 자주 묻는 질문",
      "faq": [
        {
          "q": "카페인 반감기는 몇 시간인가요?",
          "a": "평균 5시간입니다. 100mg을 마시면 5시간 뒤 50mg, 10시간 뒤 25mg이 몸에 남습니다. 대사가 빠른 사람과 느린 사람 사이에는 ±50% 정도 차이가 있습니다."
        },
        {
          "q": "카페인 30mg 지속 시간은 얼마나 되나요?",
          "a": "반감기 5시간 기준으로 30mg은 5시간 뒤 15mg, 10시간 뒤 약 7.5mg으로 줄어듭니다. 이 페이지가 30mg을 기준선으로 보는 건, 잔류 30mg 이상이면 깊은 잠(N3) 비율이 40% 감소했다는 연구(Drake 2013) 때문입니다."
        },
        {
          "q": "커피는 자기 몇 시간 전까지 마셔야 하나요?",
          "a": "드립커피 한 잔(약 95mg)이라면 취침 약 8시간 20분 전까지입니다. 밤 11시에 잔다면 오후 2시 40분 무렵이 마지노선입니다. 콜드브루(약 155mg)는 약 12시간 전, 에스프레소(약 63mg)는 약 5시간 20분 전이 기준입니다."
        },
        {
          "q": "카페인 권장량 계산기와 무엇이 다른가요?",
          "a": "이 계산기는 하루 총섭취량이 아니라 마지막 잔을 마셔도 되는 시각을 계산합니다. 취침 시각, 한 잔의 카페인(mg), 취침 시 남아도 되는 양(mg)을 넣으면 반감기 5시간으로 거꾸로 계산해 마지노선 시각을 보여줍니다."
        },
        {
          "q": "카페인 잔류 시간은 사람마다 다른가요?",
          "a": "네, 대사 속도에 따라 ±50% 정도 차이가 납니다. 같은 커피를 마셔도 대사가 느린 사람은 카페인이 더 오래 남으므로, 늦은 커피에 잠이 잘 안 온다면 잔류 허용량을 더 낮게 넣어 보세요."
        }
      ]
    },
    "en": {
      "metaTitle": "Caffeine Calculator: When to Have Your Last Coffee",
      "metaDescription": "Enter your bedtime, caffeine per cup (mg) and allowed residual to get the latest time for your last coffee, based on caffeine's 5-hour half-life.",
      "faqHeader": "Caffeine Calculator FAQ",
      "faq": [
        {
          "q": "What is the half-life of caffeine?",
          "a": "About 5 hours on average. If you drink 100mg, roughly 50mg is left after 5 hours and 25mg after 10 hours. Fast and slow metabolizers can differ from that average by about ±50% in either direction."
        },
        {
          "q": "How long does 100mg of caffeine stay in your system?",
          "a": "With a 5-hour half-life, 100mg drops to 50mg after 5 hours and 25mg after 10 hours. It falls below 30mg after roughly 8 hours 40 minutes, the residual level this calculator uses as its bedtime threshold."
        },
        {
          "q": "How many hours before bed should I stop drinking coffee?",
          "a": "For a cup of drip coffee (≈95mg), stop about 8 hours 20 minutes before bed to be under 30mg at bedtime. With an 11 pm bedtime, that puts your last cup around 2:40 pm. Cold brew (≈155mg) needs about 12 hours; espresso (≈63mg) about 5 hours 20 minutes."
        },
        {
          "q": "How does the caffeine cutoff calculator work?",
          "a": "Enter your bedtime, the caffeine in one cup, and how many mg you're fine with having left at bedtime. The calculator works backward from a 5-hour half-life and shows the latest time you can have your last cup."
        },
        {
          "q": "Why does 30mg of caffeine at bedtime matter?",
          "a": "Residual caffeine above 30mg cut deep sleep (N3) by 40% in Drake 2013, so the calculator leans conservative. If you know you metabolize caffeine slowly, set a lower residual allowed to account for the ±50% individual variation."
        }
      ]
    },
    "ja": {
      "metaTitle": "カフェイン計算：最後のコーヒーは何時まで？",
      "metaDescription": "就寝時刻・1杯のカフェイン量(mg)・残存許容量を入力すると、半減期5時間から最後のコーヒーを飲んでよい時刻を計算します。",
      "faqHeader": "カフェイン計算のよくある質問",
      "faq": [
        {
          "q": "カフェインの半減期はどれくらい？",
          "a": "平均5時間です。100mgを摂ると、5時間後に50mg、10時間後に25mgが体に残ります。代謝が速い人と遅い人とで±50%ほどの個人差があります。"
        },
        {
          "q": "コーヒーは寝る何時間前までに飲めばいい？",
          "a": "ドリップコーヒー1杯(約95mg)なら、就寝の約8時間20分前までが目安です。23時に寝るなら14時40分ごろが最終杯の門限です。コールドブリュー(約155mg)は約12時間前、エスプレッソ(約63mg)は約5時間20分前になります。"
        },
        {
          "q": "カフェイン25mgはどのくらいの量？",
          "a": "半減期5時間で計算すると、100mgのカフェインが10時間後に残る量にあたります。就寝時の残存30mgを下回る量で、30mg超で深睡眠(N3)が40%減ったという報告(Drake 2013)がこの計算機の基準です。"
        },
        {
          "q": "カフェイン計算サイトの使い方は？",
          "a": "就寝時刻、1杯あたりのカフェイン量(mg)、就寝時に残ってもよい量(mg)を入れて「計算」を押すだけです。半減期5時間から逆算し、最後の1杯を飲んでよい時刻を表示します。"
        },
        {
          "q": "カフェインの抜け方には個人差がある？",
          "a": "あります。代謝の速さによって±50%ほど違い、遅い人ほどカフェインが長く残ります。夕方のコーヒーで寝つきが悪くなりやすいなら、残存許容量を低めに入力してみてください。"
        }
      ]
    },
    "zh": {
      "metaTitle": "咖啡因代谢时间计算：最后一杯几点喝",
      "metaDescription": "输入就寝时间、每杯咖啡因(mg)和允许残留量，按5小时半衰期算出最后一杯咖啡的最迟饮用时间。",
      "faqHeader": "咖啡因代谢常见问题",
      "faq": [
        {
          "q": "咖啡因代谢时间是多久？",
          "a": "咖啡因的平均半衰期是5小时。喝下100mg，5小时后体内剩50mg，10小时后剩25mg。代谢快和代谢慢的人之间，个体差异约±50%。"
        },
        {
          "q": "咖啡因代谢周期怎么算？",
          "a": "按半衰期算：每过5小时，体内的咖啡因减少一半。比如100mg，5小时后剩50mg，10小时后剩25mg，大约8小时40分降到30mg以下。"
        },
        {
          "q": "睡前几小时不能喝咖啡？",
          "a": "一杯滴漏咖啡(约95mg)要在睡前约8小时20分喝完，睡觉时残留才会低于30mg。如果23点睡，最后一杯大约在14:40之前。冷萃(约155mg)约需提前12小时，浓缩(约63mg)约5小时20分。"
        },
        {
          "q": "咖啡因计算器怎么用？",
          "a": "输入就寝时间、每杯咖啡因含量(mg)和睡觉时允许残留的量(mg)，点击计算即可。计算器按5小时半衰期倒推，给出最后一杯的最迟饮用时间。"
        },
        {
          "q": "为什么睡前残留要控制在30mg？",
          "a": "研究(Drake 2013)显示，睡前咖啡因残留超过30mg，深睡眠(N3)会减少40%。再加上约±50%的个体差异，所以计算结果偏保守；代谢慢的人可以把允许残留调得更低。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "咖啡因代謝時間計算：最後一杯幾點喝",
      "metaDescription": "輸入就寢時間、每杯咖啡因(mg)和允許殘留量，用5小時半衰期算出最後一杯咖啡的最遲飲用時間。",
      "faqHeader": "咖啡因代謝常見問題",
      "faq": [
        {
          "q": "咖啡因半衰期多久？",
          "a": "咖啡因的平均半衰期是5小時。喝下100mg，5小時後體內剩50mg，10小時後剩25mg。代謝快和代謝慢的人之間，個體差異約±50%。"
        },
        {
          "q": "咖啡因多久會代謝掉？",
          "a": "每過5小時，體內的咖啡因就減少一半。以100mg為例，5小時後剩50mg，10小時後剩25mg，大約8小時40分會降到30mg以下。"
        },
        {
          "q": "睡前幾小時不要喝咖啡？",
          "a": "一杯滴漏咖啡(約95mg)要在睡前約8小時20分喝完，睡覺時殘留才會低於30mg。如果晚上11點睡，最後一杯大約在下午2點40分前。冷萃(約155mg)約需提前12小時，濃縮(約63mg)約5小時20分。"
        },
        {
          "q": "咖啡因計算機怎麼用？",
          "a": "輸入就寢時間、每杯咖啡因含量(mg)和睡覺時允許殘留的量(mg)，按下計算即可。計算機會用5小時半衰期往回推算，告訴你最後一杯的最遲飲用時間。"
        },
        {
          "q": "為什麼睡前殘留要低於30mg？",
          "a": "研究(Drake 2013)發現，睡前咖啡因殘留超過30mg，深睡眠(N3)會減少40%。加上約±50%的個體差異，所以計算結果偏保守；代謝較慢的人可以把允許殘留設得更低。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calculadora de cafeína: hora de tu último café",
      "metaDescription": "Indica tu hora de dormir, la cafeína por taza (mg) y el residual permitido, y obtén la hora límite de tu último café según la vida media de 5 horas.",
      "faqHeader": "Preguntas frecuentes sobre la cafeína",
      "faq": [
        {
          "q": "¿Cuánto tiempo dura la cafeína en el cuerpo?",
          "a": "Su vida media promedio es de 5 horas: de 100mg quedan 50mg a las 5 horas y 25mg a las 10 horas. Según si la metabolizas rápido o lento, ese tiempo puede variar alrededor de un ±50%."
        },
        {
          "q": "¿Cuántas horas antes de dormir hay que dejar el café?",
          "a": "Con una taza de café filtrado (≈95mg), unas 8 horas y 20 minutos antes para acostarte con menos de 30mg. Si duermes a las 23:00, tu última taza sería hacia las 14:40. Un cold brew (≈155mg) pide unas 12 horas, y un espresso (≈63mg), unas 5 horas y 20 minutos."
        },
        {
          "q": "¿Cómo funciona la calculadora de cafeína?",
          "a": "Introduces tu hora de dormir, la cafeína de una taza y cuántos mg aceptas tener en el cuerpo al acostarte. La calculadora hace la cuenta hacia atrás con una vida media de 5 horas y te da la hora límite de la última taza."
        },
        {
          "q": "¿Por qué el límite de 30mg de cafeína al dormir?",
          "a": "Porque más de 30mg residuales reducen el sueño profundo (N3) un 40%, según Drake 2013. Por eso el cálculo es conservador; si metabolizas la cafeína despacio, puedes bajar el residual permitido."
        },
        {
          "q": "¿Cuánta cafeína tiene una taza de café?",
          "a": "Como referencia, un café filtrado tiene ≈95mg, un espresso ≈63mg, un cold brew ≈155mg y un té verde ≈30mg. Si conoces la cantidad exacta de tu bebida, escríbela en el campo de cafeína por taza."
        }
      ]
    },
    "pt-br": {
      "faqHeader": "Perguntas frequentes sobre cafeína",
      "faq": [
        {
          "q": "Quanto tempo a cafeína fica no corpo?",
          "a": "A meia-vida média da cafeína é de 5 horas: de 100mg sobram 50mg depois de 5h e 25mg depois de 10h. Esse tempo pode variar cerca de ±50% conforme você metaboliza a cafeína rápido ou devagar."
        },
        {
          "q": "Quantas horas antes de dormir posso tomar café?",
          "a": "Com uma xícara de café coado (≈95mg), cerca de 8 horas e 20 minutos antes, para ir para a cama com menos de 30mg. Se você dorme às 23h, a última xícara fica por volta das 14h40. Um cold brew (≈155mg) pede umas 12 horas, e um expresso (≈63mg), umas 5 horas e 20 minutos."
        },
        {
          "q": "100 mg de cafeína é muito para quem quer dormir?",
          "a": "Depende do horário. Com meia-vida de 5 horas, 100mg viram 50mg em 5h e 25mg em 10h. Para chegar à hora de dormir com menos de 30mg, essa dose precisa ser tomada cerca de 8 horas e 40 minutos antes."
        },
        {
          "q": "Como funciona a calculadora de cafeína?",
          "a": "Você informa a hora de dormir, a cafeína de uma xícara e quantos mg aceita ter no corpo ao deitar. A calculadora faz a conta de trás para frente com a meia-vida de 5 horas e mostra o horário limite da última xícara."
        },
        {
          "q": "Por que o limite de 30mg de cafeína na hora de dormir?",
          "a": "Porque mais de 30mg residuais reduzem o sono profundo (N3) em 40%, segundo Drake 2013. Por isso o cálculo é conservador; se você metaboliza cafeína devagar, vale baixar o resíduo tolerado."
        }
      ]
    },
    "id": {
      "faqHeader": "Pertanyaan Seputar Kafein",
      "faq": [
        {
          "q": "Berapa lama kafein bertahan di tubuh?",
          "a": "Rata-rata waktu paruh kafein adalah 5 jam: dari 100mg tersisa 50mg setelah 5 jam dan 25mg setelah 10 jam. Durasi ini bisa berbeda sekitar ±50% tergantung cepat atau lambatnya metabolisme kafein Anda."
        },
        {
          "q": "Berapa jam sebelum tidur harus berhenti minum kopi?",
          "a": "Untuk secangkir kopi seduh (≈95mg), sekitar 8 jam 20 menit sebelum tidur agar sisa kafein di bawah 30mg. Jika Anda tidur pukul 23.00, cangkir terakhir sekitar pukul 14.40. Cold brew (≈155mg) butuh sekitar 12 jam, espresso (≈63mg) sekitar 5 jam 20 menit."
        },
        {
          "q": "Bagaimana cara menghitung waktu paruh kafein?",
          "a": "Setiap 5 jam, jumlah kafein di tubuh tinggal separuhnya. Misalnya 100mg menjadi 50mg setelah 5 jam dan 25mg setelah 10 jam, lalu turun di bawah 30mg setelah sekitar 8 jam 40 menit."
        },
        {
          "q": "Bagaimana cara memakai kalkulator kafein ini?",
          "a": "Masukkan jam tidur, kandungan kafein per cangkir, dan sisa kafein yang Anda toleransi saat tidur (mg). Kalkulator menghitung mundur dengan waktu paruh 5 jam dan menampilkan jam terakhir Anda boleh minum."
        },
        {
          "q": "Kenapa sisa kafein saat tidur dibatasi 30mg?",
          "a": "Sisa kafein di atas 30mg mengurangi tidur nyenyak (N3) hingga 40% menurut Drake 2013, jadi hitungannya sengaja ketat. Jika metabolisme kafein Anda lambat, turunkan angka sisa yang ditoleransi."
        }
      ]
    },
    "de": {
      "faqHeader": "Häufige Fragen zu Koffein",
      "faq": [
        {
          "q": "Wie lange bleibt Koffein im Körper?",
          "a": "Die durchschnittliche Halbwertszeit von Koffein liegt bei 5 Stunden: Von 100mg sind nach 5 h noch 50mg übrig, nach 10 h noch 25mg. Je nachdem, ob Sie Koffein schnell oder langsam abbauen, weicht das um etwa ±50 % ab."
        },
        {
          "q": "Wie viele Stunden vor dem Schlafen keinen Kaffee mehr?",
          "a": "Bei einer Tasse Filterkaffee (≈95mg) etwa 8 Stunden 20 Minuten vorher, damit zur Schlafenszeit weniger als 30mg übrig sind. Wer um 23 Uhr schläft, trinkt die letzte Tasse also gegen 14:40 Uhr. Cold Brew (≈155mg) braucht rund 12 Stunden, Espresso (≈63mg) rund 5 Stunden 20 Minuten."
        },
        {
          "q": "Wie berechnet man den Koffeinabbau?",
          "a": "Alle 5 Stunden halbiert sich die Koffeinmenge im Körper. Aus 100mg werden so nach 5 h 50mg und nach 10 h 25mg; unter 30mg fällt der Wert nach etwa 8 Stunden 40 Minuten."
        },
        {
          "q": "Wie funktioniert der Koffein-Rechner?",
          "a": "Sie geben Ihre Schlafenszeit, das Koffein pro Tasse und den erlaubten Rest zur Schlafenszeit in mg ein. Der Rechner rechnet mit einer Halbwertszeit von 5 Stunden zurück und zeigt, bis wann Sie die letzte Tasse trinken können."
        },
        {
          "q": "Warum höchstens 30mg Koffein beim Schlafengehen?",
          "a": "Ein Rest über 30mg verringerte den Tiefschlaf (N3) laut Drake 2013 um 40 %. Deshalb rechnet der Rechner vorsichtig. Bauen Sie Koffein eher langsam ab, setzen Sie den erlaubten Rest niedriger an."
        }
      ]
    },
    "fr": {
      "faqHeader": "Questions fréquentes sur la caféine",
      "faq": [
        {
          "q": "Combien de temps la caféine reste-t-elle dans le corps ?",
          "a": "Sa demi-vie moyenne est de 5 heures : sur 100mg, il reste 50mg au bout de 5 h et 25mg au bout de 10 h. Selon que l’on métabolise la caféine vite ou lentement, cette durée varie d’environ ±50 %."
        },
        {
          "q": "Combien d’heures avant de dormir arrêter le café ?",
          "a": "Pour une tasse de café filtre (≈95mg), environ 8 h 20 avant le coucher, afin d’avoir moins de 30mg dans l’organisme en vous couchant. Si vous dormez à 23 h, la dernière tasse se situe vers 14 h 40. Un cold brew (≈155mg) demande environ 12 h, un expresso (≈63mg) environ 5 h 20."
        },
        {
          "q": "Comment fonctionne le calculateur de caféine ?",
          "a": "Vous indiquez votre heure de coucher, la caféine d’une tasse et la quantité résiduelle tolérée au coucher, en mg. Le calculateur remonte le temps à partir d’une demi-vie de 5 heures et affiche l’heure limite de votre dernière tasse."
        },
        {
          "q": "Pourquoi viser moins de 30mg de caféine au coucher ?",
          "a": "Au-delà de 30mg résiduels, le sommeil profond (N3) baisse de 40 % (Drake 2013). C’est pourquoi le calcul reste prudent ; si vous éliminez la caféine lentement, abaissez le résiduel toléré."
        },
        {
          "q": "Combien de caféine contient une tasse de café ?",
          "a": "À titre de repère : un café filtre contient ≈95mg, un expresso ≈63mg, un cold brew ≈155mg et un thé vert ≈30mg. Si vous connaissez la dose exacte de votre boisson, saisissez-la dans le champ caféine par tasse."
        }
      ]
    }
  },
  "sleep-cycle": {
    "ko": {
      "metaTitle": "수면 사이클 계산기: 몇 시에 자야 개운할까?",
      "metaDescription": "기상 시각을 입력하면 90분 수면 사이클과 잠드는 시간 14분을 반영한 추천 취침 시각 4가지를 바로 알려 드립니다.",
      "faqHeader": "수면 사이클 계산기 자주 묻는 질문",
      "faq": [
        {
          "q": "수면 사이클 계산기는 어떻게 계산하나요?",
          "a": "기상 시각에서 90분 사이클을 거꾸로 빼고, 잠드는 데 걸리는 14분을 더 빼서 취침 시각을 구합니다. 추천 시각에 누우면 사이클 중간이 아니라 사이클이 끝나는 시점에 맞춰 깰 수 있습니다. 결과는 추천 취침 시각 4가지로 보여 줍니다."
        },
        {
          "q": "수면 사이클 1회는 몇 분인가요?",
          "a": "수면 사이클 1회는 약 90분입니다. 한 사이클은 얕은잠 → 깊은잠 → REM 순서로 진행되고, 밤새 이 흐름이 여러 번 반복됩니다."
        },
        {
          "q": "하루에 수면 사이클 몇 번이 적당한가요?",
          "a": "성인은 4~6 사이클, 시간으로는 6~9시간이 권장됩니다. 4 사이클은 6시간, 5 사이클은 7시간 30분, 6 사이클은 9시간에 해당합니다."
        },
        {
          "q": "7시에 일어나려면 몇 시에 자야 하나요?",
          "a": "오전 7시에 일어나려면 밤 9시 46분, 밤 11시 16분, 새벽 0시 46분 중 하나에 잠자리에 들면 됩니다. 각각 6·5·4 사이클에 잠드는 시간 14분을 더해 계산한 시각입니다. 다른 기상 시각은 계산기에 입력하면 바로 확인할 수 있습니다."
        },
        {
          "q": "자다가 중간에 깨면 왜 더 피곤한가요?",
          "a": "사이클 중간에 깨면 sleep inertia, 즉 정신이 흐릿한 상태가 30분 이상 이어질 수 있기 때문입니다. 반대로 사이클이 끝나는 REM 직후에 깨면 바로 상쾌하게 일어나기 쉽습니다."
        }
      ]
    },
    "en": {
      "metaTitle": "Sleep Cycle Calculator: When Should I Go to Bed?",
      "metaDescription": "Enter the time you want to wake up and get 4 bedtimes timed to 90-minute sleep cycles, with 14 minutes allowed to fall asleep.",
      "faqHeader": "Sleep Cycle Calculator FAQ",
      "faq": [
        {
          "q": "How does a sleep cycle calculator work?",
          "a": "It counts backward from your wake time in 90-minute cycles, then subtracts about 14 minutes for falling asleep. Going to bed at one of the suggested times lets you wake at the end of a cycle rather than in the middle of one. You get 4 bedtime options."
        },
        {
          "q": "How long is one sleep cycle?",
          "a": "One sleep cycle lasts about 90 minutes. Each cycle moves from light sleep to deep sleep and then REM, and the pattern repeats several times through the night."
        },
        {
          "q": "How many sleep cycles do I need a night?",
          "a": "Adults are recommended 4–6 cycles a night, which works out to 6–9 hours of sleep. Four cycles equal 6 hours, five equal 7.5 hours, and six equal 9 hours."
        },
        {
          "q": "What time should I go to bed to wake up at 7 am?",
          "a": "To wake up at 7:00 am, go to bed at 9:46 pm, 11:16 pm or 12:46 am. Those times cover 6, 5 and 4 full cycles, plus 14 minutes to fall asleep. Enter any other wake time in the calculator to get your own bedtimes."
        },
        {
          "q": "Why do I feel groggy after waking up?",
          "a": "Waking in the middle of a cycle triggers sleep inertia, a groggy feeling that can last 30 minutes or more. Waking at the end of a cycle, just after REM, usually feels fresh right away."
        }
      ]
    },
    "ja": {
      "metaTitle": "睡眠サイクル計算:何時に寝ればスッキリ起きられる?",
      "metaDescription": "起きたい時刻を入れるだけで、90分の睡眠サイクルと寝つき14分をもとに、おすすめの就寝時刻を4つ表示します。",
      "faqHeader": "睡眠サイクル計算機のよくある質問",
      "faq": [
        {
          "q": "睡眠サイクルの計算方法は?",
          "a": "起床時刻から90分単位のサイクルをさかのぼり、寝つきにかかる14分を差し引いて就寝時刻を出します。推奨時刻に布団に入れば、サイクルの途中ではなく終わりに目覚めやすくなります。結果は4つの就寝時刻で表示されます。"
        },
        {
          "q": "睡眠サイクルは何分?",
          "a": "睡眠サイクル1回はおよそ90分です。浅い睡眠→深い睡眠→REM睡眠の順に進み、ひと晩のうちにこの流れを何度も繰り返します。"
        },
        {
          "q": "睡眠サイクルは何回がいい?",
          "a": "成人には4〜6サイクル、時間にすると6〜9時間が推奨されています。4サイクルで6時間、5サイクルで7時間30分、6サイクルで9時間です。"
        },
        {
          "q": "7時に起きるには何時に寝ればいい?",
          "a": "朝7時に起きたいなら、21時46分、23時16分、0時46分のいずれかに布団に入るのが目安です。それぞれ6・5・4サイクルに寝つきの14分を足して計算しています。ほかの起床時刻は計算機に入力するとすぐに確認できます。"
        },
        {
          "q": "途中で起きると頭がぼーっとするのはなぜ?",
          "a": "サイクルの途中で起きると、睡眠惰性(頭が重い状態)が30分以上続くことがあるためです。サイクルの終わり、REM睡眠の直後に起きると、すっきり目覚めやすくなります。"
        }
      ]
    },
    "zh": {
      "metaTitle": "睡眠周期计算器:几点睡觉醒来最清爽?",
      "metaDescription": "输入起床时间,按90分钟睡眠周期并预留14分钟入睡时间,立即算出4个推荐入睡时间。",
      "faqHeader": "睡眠周期计算器常见问题",
      "faq": [
        {
          "q": "睡眠周期怎么计算?",
          "a": "从起床时间往前按90分钟一个周期倒推,再减去入睡所需的14分钟,就能得到推荐的入睡时间。按推荐时间上床,更容易在周期结束时醒来,而不是在周期中间。计算器会给出4个入睡时间供选择。"
        },
        {
          "q": "一个睡眠周期多长时间?",
          "a": "一个睡眠周期约为90分钟。每个周期依次经历浅睡眠、深睡眠和REM睡眠,整晚会循环多次。"
        },
        {
          "q": "每晚睡几个睡眠周期合适?",
          "a": "成人一般推荐4–6个周期,也就是6–9小时睡眠。4个周期是6小时,5个周期是7.5小时,6个周期是9小时。"
        },
        {
          "q": "早上7点起床,几点睡最好?",
          "a": "想早上7点起床,可以在21:46、23:16或0:46上床。这三个时间分别对应6个、5个、4个完整周期,再加上14分钟入睡时间。其他起床时间直接输入计算器即可查看。"
        },
        {
          "q": "为什么睡醒后还是昏昏沉沉?",
          "a": "在周期中间醒来会产生睡眠惯性,头脑迷糊的状态可能持续30分钟以上。在周期末尾、REM刚结束时醒来,通常会立刻感觉清爽。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "睡眠週期計算:幾點睡起床最有精神?",
      "metaDescription": "輸入起床時間,依90分鐘睡眠週期並預留14分鐘入睡時間,馬上算出4個建議就寢時間。",
      "faqHeader": "睡眠週期計算機常見問題",
      "faq": [
        {
          "q": "睡眠週期怎麼計算?",
          "a": "從起床時間往回推,以90分鐘為一個週期,再扣掉入睡需要的14分鐘,就能算出建議的就寢時間。睡眠週期依序是淺眠、深眠和REM,照建議時間上床,比較容易在週期結束時醒來。"
        },
        {
          "q": "睡眠週期計算一定要下載app嗎?",
          "a": "不用,直接在這個頁面輸入起床時間就能算。按下計算後,會馬上列出4個建議就寢時間,並標示各自對應的週期數。"
        },
        {
          "q": "一天睡幾個睡眠週期才夠?",
          "a": "成人建議睡4–6個週期,也就是6–9小時。4個週期是6小時,5個週期是7.5小時,6個週期是9小時。"
        },
        {
          "q": "早上7點起床,幾點睡最好?",
          "a": "想在早上7點起床,可以在晚上9:46、11:16或凌晨12:46上床。這三個時間分別是6個、5個、4個完整週期,再加上14分鐘的入睡時間。其他起床時間輸入計算機就能查詢。"
        },
        {
          "q": "為什麼睡醒還是昏昏沉沉?",
          "a": "在週期中間醒來會產生睡眠慣性,頭腦迷糊的狀態可能持續30分鐘以上。在週期末尾、REM剛結束時醒來,通常馬上就會覺得清爽。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calculadora de sueño: ¿a qué hora dormir?",
      "metaDescription": "Introduce tu hora de despertar y obtén 4 horas para acostarte, calculadas con ciclos de 90 minutos y 14 minutos para quedarte dormido."
    },
    "pt-br": {
      "faqHeader": "Perguntas frequentes sobre a calculadora do sono",
      "faq": [
        {
          "q": "Como calcular o ciclo do sono?",
          "a": "A calculadora parte da hora em que você quer acordar e volta no tempo em ciclos de 90 minutos, descontando ainda 14 minutos para pegar no sono. Assim, ao deitar em um dos horários sugeridos, você tende a acordar no fim de um ciclo, e não no meio. O resultado traz 4 opções de horário."
        },
        {
          "q": "Quanto tempo dura um ciclo do sono?",
          "a": "Cada ciclo do sono dura cerca de 90 minutos. Ele passa pelo sono leve, pelo sono profundo e pelo REM, e esse padrão se repete várias vezes durante a noite."
        },
        {
          "q": "Quantos ciclos de sono por noite são ideais?",
          "a": "Para adultos, a recomendação é de 4 a 6 ciclos, o que equivale a 6 a 9 horas de sono. Quatro ciclos somam 6 horas, cinco somam 7 horas e meia, e seis somam 9 horas."
        },
        {
          "q": "Que horas eu devo dormir para acordar às 6?",
          "a": "Para acordar às 6h, o ideal é deitar às 20h46, às 22h16 ou às 23h46. Esses horários correspondem a 6, 5 e 4 ciclos completos, mais 14 minutos para pegar no sono. Para outro horário, é só informá-lo na calculadora."
        },
        {
          "q": "Por que acordo grogue?",
          "a": "Acordar no meio de um ciclo causa inércia do sono, uma sensação de estar grogue que pode durar mais de 30 minutos. Acordar no fim do ciclo, logo após o REM, costuma trazer disposição imediata."
        }
      ]
    },
    "id": {
      "faqHeader": "Pertanyaan Umum seputar Kalkulator Tidur",
      "faq": [
        {
          "q": "Bagaimana cara kerja kalkulator tidur?",
          "a": "Kalkulator menghitung mundur dari jam bangun Anda dalam siklus 90 menit, lalu mengurangi 14 menit sebagai waktu untuk terlelap. Jika Anda berbaring di salah satu jam yang disarankan, Anda lebih mungkin bangun di akhir siklus, bukan di tengahnya. Hasilnya berupa 4 rekomendasi jam tidur."
        },
        {
          "q": "Berapa lama satu siklus tidur?",
          "a": "Satu siklus tidur berlangsung sekitar 90 menit. Setiap siklus bergerak dari tidur ringan ke tidur nyenyak, lalu REM, dan pola ini berulang beberapa kali sepanjang malam."
        },
        {
          "q": "Berapa siklus tidur yang ideal untuk orang dewasa?",
          "a": "Orang dewasa disarankan tidur 4–6 siklus per malam, atau sekitar 6–9 jam. Empat siklus sama dengan 6 jam, lima siklus 7,5 jam, dan enam siklus 9 jam."
        },
        {
          "q": "Siklus tidur 90 menit: mau bangun jam 4, tidur jam berapa?",
          "a": "Untuk bangun jam 04.00, Anda bisa berbaring di tempat tidur pukul 18.46, 20.16, atau 21.46. Ketiga jam itu setara dengan 6, 5, dan 4 siklus penuh ditambah 14 menit untuk terlelap. Untuk jam bangun lain, cukup masukkan ke kalkulator."
        },
        {
          "q": "Kenapa bangun tidur malah terasa linglung?",
          "a": "Bangun di tengah siklus memicu inersia tidur, yaitu rasa linglung yang bisa bertahan lebih dari 30 menit. Bangun di akhir siklus, tepat setelah REM, biasanya langsung terasa segar."
        }
      ]
    },
    "de": {
      "faqHeader": "Häufige Fragen zum Schlafzyklus-Rechner",
      "faq": [
        {
          "q": "Wie funktioniert ein Schlafrechner?",
          "a": "Der Rechner zählt von Ihrer Weckzeit in 90-Minuten-Zyklen zurück und zieht zusätzlich 14 Minuten fürs Einschlafen ab. Wer zu einer der vorgeschlagenen Zeiten ins Bett geht, wacht eher am Ende eines Zyklus auf statt mittendrin. Sie erhalten 4 mögliche Schlafenszeiten."
        },
        {
          "q": "Wie lange dauert ein Schlafzyklus?",
          "a": "Ein Schlafzyklus dauert etwa 90 Minuten. Er durchläuft Leichtschlaf, Tiefschlaf und REM-Phase, und dieser Ablauf wiederholt sich mehrmals pro Nacht."
        },
        {
          "q": "Wie viele Schlafzyklen braucht man pro Nacht?",
          "a": "Für Erwachsene werden 4–6 Zyklen empfohlen, also 6–9 Stunden Schlaf. Vier Zyklen entsprechen 6 Stunden, fünf Zyklen 7,5 Stunden und sechs Zyklen 9 Stunden."
        },
        {
          "q": "Wann ins Bett, wenn ich um 6 Uhr aufstehen muss?",
          "a": "Wer um 6:00 Uhr aufstehen will, geht am besten um 20:46, 22:16 oder 23:46 Uhr ins Bett. Diese Zeiten ergeben 6, 5 bzw. 4 volle Zyklen plus 14 Minuten zum Einschlafen. Andere Weckzeiten können Sie direkt im Rechner eingeben."
        },
        {
          "q": "Warum bin ich nach dem Aufwachen so benommen?",
          "a": "Wer mitten in einem Zyklus aufwacht, erlebt Schlafträgheit – eine Benommenheit, die über 30 Minuten anhalten kann. Wer am Ende eines Zyklus direkt nach der REM-Phase aufwacht, fühlt sich dagegen meist sofort frisch."
        }
      ]
    },
    "fr": {
      "faqHeader": "Questions fréquentes sur le calcul des cycles de sommeil",
      "faq": [
        {
          "q": "Comment calculer ses cycles de sommeil ?",
          "a": "Le calculateur part de votre heure de réveil et remonte le temps par cycles de 90 minutes, en retirant aussi 14 minutes d’endormissement. En vous couchant à l’une des heures proposées, vous avez plus de chances de vous réveiller en fin de cycle plutôt qu’en plein milieu. Vous obtenez 4 heures de coucher."
        },
        {
          "q": "Combien de temps dure un cycle de sommeil ?",
          "a": "Un cycle de sommeil dure environ 90 minutes. Il enchaîne sommeil léger, sommeil profond puis sommeil paradoxal, et ce schéma se répète plusieurs fois au cours de la nuit."
        },
        {
          "q": "Combien de cycles de sommeil faut-il par nuit ?",
          "a": "Chez l’adulte, on recommande 4 à 6 cycles, soit 6 à 9 heures de sommeil. Quatre cycles font 6 heures, cinq cycles 7 h 30 et six cycles 9 heures."
        },
        {
          "q": "À quelle heure se coucher pour se lever à 7 h ?",
          "a": "Pour vous lever à 7 h, couchez-vous à 21 h 46, 23 h 16 ou 0 h 46. Ces horaires correspondent à 6, 5 ou 4 cycles complets, plus 14 minutes pour vous endormir. Pour une autre heure de réveil, il suffit de la saisir dans le calculateur."
        },
        {
          "q": "Pourquoi suis-je groggy au réveil ?",
          "a": "Se réveiller en plein cycle provoque une inertie du sommeil, une sensation d’être groggy qui peut durer plus de 30 minutes. Se réveiller en fin de cycle, juste après le sommeil paradoxal, donne en général une sensation de fraîcheur immédiate."
        }
      ]
    }
  },
  "exercise-calories": {
    "ko": {
      "metaTitle": "운동 칼로리 계산기: 체중·시간별 소모량",
      "metaDescription": "운동 종류·체중(kg)·운동 시간(분)을 입력하면 소모 칼로리(kcal)를 바로 계산합니다. 걷기·달리기·수영 등 18종 지원.",
      "faqHeader": "운동 칼로리 소모 자주 묻는 질문",
      "faq": [
        {
          "q": "30분 빠르게 걷기 칼로리 소모량은 얼마나 되나요?",
          "a": "체중 70kg 기준 약 158kcal입니다. 빠르게 걷기는 4.3 METs라서 4.3 × 3.5 × 70 × 30 / 200으로 계산합니다. 체중이나 운동 시간이 다르면 계산기에 그 값을 넣으면 바로 나옵니다."
        },
        {
          "q": "운동 칼로리 소모는 어떻게 계산하나요?",
          "a": "METs × 3.5 × 체중(kg) × 시간(분) / 200 공식으로 계산합니다. 운동 종류마다 정해진 METs 값에 체중과 운동 시간을 곱하는 방식입니다. 이 계산기는 Compendium of Physical Activities 2024의 METs 값을 씁니다."
        },
        {
          "q": "METs가 무슨 뜻인가요?",
          "a": "METs(Metabolic Equivalent of Task)는 가만히 쉴 때 쓰는 에너지를 1로 놓고, 운동할 때 그 몇 배를 쓰는지 나타낸 값입니다. 빠르게 걷기가 4.3 METs라면 쉴 때보다 칼로리를 4.3배 더 쓴다는 뜻입니다. 숫자가 클수록 같은 시간에 더 많이 소모합니다."
        },
        {
          "q": "체중이 많이 나가면 운동 칼로리도 더 많이 소모되나요?",
          "a": "네, 같은 운동을 같은 시간 동안 하면 소모 칼로리는 체중에 비례해 늘어납니다. 30분 빠르게 걷기 기준으로 60kg은 약 135kcal, 80kg은 약 181kcal입니다. 그래서 지금 체중을 넣어야 결과가 정확합니다."
        },
        {
          "q": "운동 칼로리 계산기 결과는 얼마나 정확한가요?",
          "a": "평균값을 바탕으로 한 추정치이고, 실제 소모량은 체성분에 따라 ±15% 정도 차이가 날 수 있습니다. 체중이 같아도 몸의 구성이 다르면 쓰는 에너지가 달라지기 때문입니다. 운동별 소모량을 비교하는 기준으로 쓰기에 알맞습니다."
        }
      ]
    },
    "en": {
      "metaTitle": "Calories Burned Calculator for 18 Exercises",
      "metaDescription": "Enter your exercise, minutes, and weight (kg) to see calories burned for walking, running, swimming, strength training and more, with 2024 METs.",
      "faqHeader": "Calories Burned: Common Questions",
      "faq": [
        {
          "q": "How many calories does a 30-minute brisk walk burn?",
          "a": "At 70 kg, a 30-minute brisk walk burns about 158 kcal. Brisk walking is rated 4.3 METs, so the math is 4.3 × 3.5 × 70 × 30 / 200. Enter your own weight and time in the calculator to get your number."
        },
        {
          "q": "How do you calculate calories burned during exercise?",
          "a": "Use the formula METs × 3.5 × weight (kg) × time (min) / 200 = kcal. Each activity has a set METs value, which is multiplied by your weight and how long you exercise. This calculator uses METs values from the Compendium of Physical Activities 2024."
        },
        {
          "q": "What does METs mean?",
          "a": "METs (Metabolic Equivalent of Task) compares the energy an activity uses to the energy you use at rest, which counts as 1. Brisk walking at 4.3 METs burns 4.3 times your resting calories. The higher the METs, the more you burn in the same amount of time."
        },
        {
          "q": "Do heavier people burn more calories doing the same exercise?",
          "a": "Yes. For the same activity and duration, calories burned go up in direct proportion to body weight. A 30-minute brisk walk burns about 135 kcal at 60 kg and about 181 kcal at 80 kg, so enter your current weight for an accurate result."
        },
        {
          "q": "How accurate is an exercise calorie calculator?",
          "a": "It gives an average estimate, and your actual burn can vary by about ±15% depending on body composition. Two people of the same weight can use different amounts of energy if their bodies are built differently. It works well for comparing activities and planning workouts."
        }
      ]
    },
    "ja": {
      "metaTitle": "運動カロリー消費計算機|体重・時間で消費kcal",
      "metaDescription": "運動の種類・体重(kg)・時間(分)を入れるだけで消費カロリー(kcal)を計算。ウォーキング、ランニング、水泳、筋トレなど18種目に対応。",
      "faqHeader": "運動の消費カロリーに関するよくある質問",
      "faq": [
        {
          "q": "早歩き30分の消費カロリーはどれくらい?",
          "a": "体重70kgなら約158kcalです。早歩きは4.3 METsなので、4.3 × 3.5 × 70 × 30 / 200で計算できます。体重や時間が違う場合は、計算機に入力すればすぐに分かります。"
        },
        {
          "q": "運動の消費カロリーの計算方法は?",
          "a": "METs × 3.5 × 体重(kg) × 時間(分) / 200 = kcalという式で求めます。運動ごとに決まったMETsの値に、体重と運動時間を掛ける仕組みです。この計算機はCompendium of Physical Activities 2024のMETs値を使っています。"
        },
        {
          "q": "METsとはどういう意味?",
          "a": "METs(代謝当量)は、安静時のエネルギー消費を1として、運動中にその何倍を使うかを示す数値です。早歩きの4.3 METsは、安静時の4.3倍のカロリーを消費するという意味です。数値が大きい運動ほど、同じ時間で多く消費します。"
        },
        {
          "q": "体重が重いほど消費カロリーは多くなる?",
          "a": "はい、同じ運動を同じ時間行えば、消費カロリーは体重に比例して増えます。早歩き30分の場合、60kgで約135kcal、80kgで約181kcalです。正確な結果を出すには、今の体重を入力してください。"
        },
        {
          "q": "消費カロリー計算の結果はどのくらい正確?",
          "a": "平均値にもとづく目安で、実際の消費量は体組成によって±15%ほど差が出ることがあります。同じ体重でも体の組成が違えば、使うエネルギーが変わるためです。運動ごとの消費量を比べる目安として役立ちます。"
        }
      ]
    },
    "zh": {
      "metaTitle": "运动卡路里消耗计算器:按体重和时长算热量",
      "metaDescription": "输入运动种类、体重(kg)和时长(分钟),即可算出消耗的卡路里(kcal)。支持跑步、步行、游泳、力量训练等18种运动。",
      "faqHeader": "运动卡路里消耗常见问题",
      "faq": [
        {
          "q": "快走30分钟消耗多少卡路里?",
          "a": "体重70kg的话,大约消耗158kcal。快走为4.3 METs,计算方法是4.3 × 3.5 × 70 × 30 / 200。体重或时长不同,直接输入计算器就能得到结果。"
        },
        {
          "q": "运动消耗的卡路里怎么算?",
          "a": "公式是METs × 3.5 × 体重(kg) × 时间(分钟) / 200 = kcal。每种运动都有对应的METs值,再乘以体重和运动时长即可。本计算器采用Compendium of Physical Activities 2024的METs数据。"
        },
        {
          "q": "METs是什么意思?",
          "a": "METs(代谢当量)以静息时的能量消耗为1,表示运动时的消耗是静息时的几倍。快走4.3 METs,就是消耗静息时4.3倍的卡路里。METs越高,同样时间内消耗越多。"
        },
        {
          "q": "体重越大,运动消耗的卡路里越多吗?",
          "a": "是的,同样的运动、同样的时长,消耗的卡路里与体重成正比。以快走30分钟为例,60kg约消耗135kcal,80kg约消耗181kcal。所以输入当前体重,结果才更准确。"
        },
        {
          "q": "运动卡路里计算器准确吗?",
          "a": "结果是基于平均值的估算,实际消耗会因体成分不同而有±15%左右的差异。即使体重相同,身体组成不同,消耗的能量也会不一样。用来比较不同运动的消耗量很合适。"
        }
      ]
    },
    "zh-tw": {
      "metaTitle": "運動卡路里消耗計算機:依體重與時間算熱量",
      "metaDescription": "輸入運動種類、體重(kg)與時間(分鐘),立即算出消耗的卡路里(kcal)。支援跑步、走路、游泳、重訓等18種運動。",
      "faqHeader": "運動卡路里消耗常見問題",
      "faq": [
        {
          "q": "快走30分鐘會消耗多少卡路里?",
          "a": "體重70kg的話,大約消耗158kcal。快走是4.3 METs,算法是4.3 × 3.5 × 70 × 30 / 200。體重或時間不同,直接輸入計算機就能看到結果。"
        },
        {
          "q": "運動消耗的卡路里要怎麼算?",
          "a": "公式是METs × 3.5 × 體重(kg) × 時間(分鐘) / 200 = kcal。每種運動都有對應的METs值,再乘上體重和運動時間就好。本計算機採用Compendium of Physical Activities 2024的METs數據。"
        },
        {
          "q": "METs是什麼意思?",
          "a": "METs(代謝當量)是把靜止休息時的能量消耗當作1,表示運動時消耗的是休息時的幾倍。快走4.3 METs,代表消耗休息時4.3倍的卡路里。METs越高,同樣時間內消耗越多。"
        },
        {
          "q": "體重越重,運動消耗的卡路里越多嗎?",
          "a": "是的,做同樣的運動、同樣的時間,消耗的卡路里會跟體重成正比。以快走30分鐘來說,60kg約消耗135kcal,80kg約消耗181kcal。所以輸入目前的體重,結果才會準確。"
        },
        {
          "q": "運動卡路里計算機準不準?",
          "a": "結果是依平均值推算的估計值,實際消耗會因體組成不同而有±15%左右的差距。就算體重相同,身體組成不同,消耗的能量也會不一樣。拿來比較各種運動的消耗量很好用。"
        }
      ]
    },
    "es": {
      "metaTitle": "Calorías quemadas por ejercicio: calculadora",
      "metaDescription": "Indica el ejercicio, los minutos y tu peso (kg) y obtén las calorías quemadas al correr, caminar, nadar, hacer pesas y 14 actividades más.",
      "faqHeader": "Preguntas frecuentes sobre calorías quemadas",
      "faq": [
        {
          "q": "¿Cuántas calorías se queman caminando rápido 30 minutos?",
          "a": "Con 70 kg de peso, unas 158 kcal. Caminar rápido equivale a 4.3 METs, así que el cálculo es 4.3 × 3.5 × 70 × 30 / 200. Si tu peso o el tiempo son otros, introdúcelos en la calculadora y verás tu resultado."
        },
        {
          "q": "¿Cómo se calculan las calorías quemadas al hacer ejercicio?",
          "a": "Con la fórmula METs × 3.5 × peso (kg) × tiempo (min) / 200 = kcal. Cada actividad tiene un valor de METs fijo, que se multiplica por tu peso y por la duración. Esta calculadora usa los METs del Compendium of Physical Activities 2024."
        },
        {
          "q": "¿Qué significa METs?",
          "a": "METs (Equivalente Metabólico de Tarea) indica cuántas veces más energía gasta una actividad respecto al reposo, que vale 1. Caminar rápido, con 4.3 METs, quema 4.3 veces las calorías que gastas en reposo. Cuanto más alto el valor, más calorías en el mismo tiempo."
        },
        {
          "q": "¿Una persona con más peso quema más calorías con el mismo ejercicio?",
          "a": "Sí. Con la misma actividad y la misma duración, las calorías quemadas aumentan en proporción al peso. Caminar rápido 30 minutos quema unas 135 kcal con 60 kg y unas 181 kcal con 80 kg, por eso conviene introducir tu peso actual."
        },
        {
          "q": "¿Qué tan exacta es una calculadora de calorías por ejercicio?",
          "a": "Ofrece una estimación media, y la quema real puede variar alrededor de ±15% según la composición corporal. Dos personas con el mismo peso pueden gastar distinta energía si su cuerpo está compuesto de forma diferente. Sirve muy bien para comparar actividades."
        }
      ]
    },
    "pt-br": {
      "faqHeader": "Perguntas frequentes sobre calorias gastas",
      "faq": [
        {
          "q": "Quantas calorias gasta uma caminhada rápida de 30 minutos?",
          "a": "Com 70 kg, cerca de 158 kcal. A caminhada rápida vale 4,3 METs, então a conta é 4,3 × 3,5 × 70 × 30 / 200. Se o seu peso ou o tempo forem diferentes, é só colocar na calculadora."
        },
        {
          "q": "Como calcular as calorias gastas no exercício?",
          "a": "Pela fórmula METs × 3,5 × peso (kg) × tempo (min) / 200 = kcal. Cada atividade tem um valor de METs, que é multiplicado pelo seu peso e pela duração do treino. A calculadora usa os valores de METs do Compendium of Physical Activities 2024."
        },
        {
          "q": "O que significa METs?",
          "a": "METs (Equivalente Metabólico da Tarefa) mostra quantas vezes mais energia uma atividade gasta em relação ao repouso, que vale 1. A caminhada rápida, com 4,3 METs, gasta 4,3 vezes as calorias do repouso. Quanto maior o valor, mais calorias no mesmo tempo."
        },
        {
          "q": "Quem pesa mais gasta mais calorias no mesmo exercício?",
          "a": "Sim. Na mesma atividade e pelo mesmo tempo, o gasto calórico aumenta na mesma proporção do peso. Uma caminhada rápida de 30 minutos gasta cerca de 135 kcal com 60 kg e 181 kcal com 80 kg, por isso vale usar o seu peso atual."
        },
        {
          "q": "A calculadora de calorias gastas é precisa?",
          "a": "Ela dá uma estimativa média, e o gasto real pode variar cerca de ±15% conforme a composição corporal. Duas pessoas com o mesmo peso podem gastar energia diferente se a composição do corpo for diferente. É uma ótima referência para comparar atividades."
        }
      ]
    },
    "id": {
      "faqHeader": "Pertanyaan Umum seputar Kalori Olahraga",
      "faq": [
        {
          "q": "Berapa kalori yang terbakar saat jalan cepat 30 menit?",
          "a": "Dengan berat badan 70 kg, sekitar 158 kkal. Jalan cepat bernilai 4,3 METs, jadi hitungannya 4,3 × 3,5 × 70 × 30 / 200. Kalau berat badan atau durasinya berbeda, cukup masukkan ke kalkulator."
        },
        {
          "q": "Bagaimana cara menghitung kalori yang terbakar saat olahraga?",
          "a": "Gunakan rumus METs × 3,5 × berat badan (kg) × waktu (menit) / 200 = kkal. Setiap aktivitas punya nilai METs sendiri, lalu dikalikan dengan berat badan dan lama olahraga. Kalkulator ini memakai nilai METs dari Compendium of Physical Activities 2024."
        },
        {
          "q": "Apa arti METs?",
          "a": "METs (Metabolic Equivalent of Task) menunjukkan berapa kali lipat energi yang dipakai suatu aktivitas dibandingkan saat istirahat, yang bernilai 1. Jalan cepat 4,3 METs berarti membakar 4,3 kali kalori saat istirahat. Makin tinggi nilainya, makin banyak kalori terbakar dalam waktu yang sama."
        },
        {
          "q": "Apakah orang yang lebih berat membakar lebih banyak kalori?",
          "a": "Ya. Untuk aktivitas dan durasi yang sama, kalori yang terbakar naik sebanding dengan berat badan. Jalan cepat 30 menit membakar sekitar 135 kkal pada 60 kg dan sekitar 181 kkal pada 80 kg, jadi masukkan berat badan Anda saat ini."
        },
        {
          "q": "Seberapa akurat kalkulator kalori olahraga?",
          "a": "Hasilnya berupa perkiraan rata-rata, dan pembakaran sebenarnya bisa berbeda sekitar ±15% tergantung komposisi tubuh. Dua orang dengan berat yang sama bisa memakai energi berbeda jika komposisi tubuhnya tidak sama. Kalkulator ini cocok untuk membandingkan berbagai aktivitas."
        }
      ]
    },
    "de": {
      "faqHeader": "Häufige Fragen zum Kalorienverbrauch beim Sport",
      "faq": [
        {
          "q": "Wie viele Kalorien verbrennt man bei 30 Minuten zügigem Gehen?",
          "a": "Bei 70 kg Körpergewicht sind es etwa 158 kcal. Zügiges Gehen hat 4,3 METs, die Rechnung lautet also 4,3 × 3,5 × 70 × 30 / 200. Mit anderem Gewicht oder anderer Dauer geben Sie Ihre Werte einfach in den Rechner ein."
        },
        {
          "q": "Wie berechnet man den Kalorienverbrauch beim Sport?",
          "a": "Mit der Formel METs × 3,5 × Gewicht (kg) × Zeit (Min.) / 200 = kcal. Jede Aktivität hat einen festen METs-Wert, der mit Ihrem Gewicht und der Trainingsdauer multipliziert wird. Der Rechner nutzt die METs-Werte aus dem Compendium of Physical Activities 2024."
        },
        {
          "q": "Was bedeutet MET?",
          "a": "METs (metabolisches Äquivalent) geben an, wie viel Energie eine Aktivität im Vergleich zum Ruhezustand verbraucht, der mit 1 angesetzt wird. Zügiges Gehen mit 4,3 METs verbraucht also das 4,3-Fache des Ruheumsatzes. Je höher der Wert, desto mehr Kalorien in derselben Zeit."
        },
        {
          "q": "Verbrennen schwerere Menschen beim gleichen Sport mehr Kalorien?",
          "a": "Ja. Bei gleicher Aktivität und Dauer steigt der Kalorienverbrauch im selben Verhältnis wie das Körpergewicht. 30 Minuten zügiges Gehen verbrauchen bei 60 kg etwa 135 kcal und bei 80 kg etwa 181 kcal – tragen Sie daher Ihr aktuelles Gewicht ein."
        },
        {
          "q": "Wie genau ist ein Kalorienverbrauch-Rechner?",
          "a": "Er liefert einen Durchschnittswert; der tatsächliche Verbrauch kann je nach Körperzusammensetzung um etwa ±15 % abweichen. Zwei gleich schwere Menschen können unterschiedlich viel Energie verbrauchen, wenn ihr Körper anders zusammengesetzt ist. Zum Vergleichen von Sportarten eignet er sich gut."
        }
      ]
    },
    "fr": {
      "faqHeader": "Questions fréquentes sur les calories brûlées",
      "faq": [
        {
          "q": "Combien de calories brûle-t-on en 30 minutes de marche rapide ?",
          "a": "Pour 70 kg, environ 158 kcal. La marche rapide vaut 4,3 METs, le calcul est donc 4,3 × 3,5 × 70 × 30 / 200. Si votre poids ou la durée diffèrent, saisissez-les dans le calculateur pour obtenir votre résultat."
        },
        {
          "q": "Comment calculer les calories brûlées pendant le sport ?",
          "a": "Avec la formule METs × 3,5 × poids (kg) × durée (min) / 200 = kcal. Chaque activité a sa propre valeur en METs, multipliée par votre poids et la durée de l’effort. Le calculateur utilise les valeurs du Compendium of Physical Activities 2024."
        },
        {
          "q": "Que veut dire MET ?",
          "a": "Le MET (équivalent métabolique) indique combien de fois plus d’énergie une activité consomme par rapport au repos, qui vaut 1. La marche rapide à 4,3 METs brûle donc 4,3 fois les calories dépensées au repos. Plus la valeur est élevée, plus on brûle de calories dans le même temps."
        },
        {
          "q": "Brûle-t-on plus de calories quand on est plus lourd ?",
          "a": "Oui. Pour une même activité et une même durée, la dépense augmente en proportion du poids. 30 minutes de marche rapide brûlent environ 135 kcal à 60 kg et 181 kcal à 80 kg : indiquez donc votre poids actuel pour un résultat juste."
        },
        {
          "q": "Un calculateur de calories brûlées est-il fiable ?",
          "a": "Il donne une estimation moyenne, et la dépense réelle peut varier d’environ ±15 % selon la composition corporelle. Deux personnes de même poids peuvent dépenser une énergie différente si leur corps n’est pas composé de la même façon. Il reste un bon repère pour comparer les activités."
        }
      ]
    }
  }
};
