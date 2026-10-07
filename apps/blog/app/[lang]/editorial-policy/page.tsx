/**
 * GET /{lang}/editorial-policy — Editorial Policy (PRD §13.2.2 / VG-04 / INV-004).
 *
 * SSG: 6 lang × 1 = 6 정적 페이지.
 * 필수 5 요소 (VG-04, 각 ≥50자):
 *   (1) AI scope (research aid + draft generation)
 *   (2) Editorial workflow
 *   (3) Reviewer credential
 *   (4) Corrections policy
 *   (5) Contact
 * 마지막 검토일: 2026-05-25 (본 PRD 배포일).
 * 인라인 i18n: const POLICY_I18N 자체포함 (lib/i18n.ts 미사용 — INV-010).
 * JSON-LD: WebPage schema (PRD §6.3 T3).
 */

import type { Metadata } from 'next';
import { isLangIndexable } from '@/lib/articles-v2';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toFullLang } from '@/lib/i18n';
import { SITE } from '@/lib/site';

const ROUTE_LANGS = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'pt-br', 'id', 'de', 'fr'] as const;
type RouteLang = (typeof ROUTE_LANGS)[number];

interface Props {
  params: { lang: string };
}

export function generateStaticParams() {
  return ROUTE_LANGS.map((lang) => ({ lang }));
}

const CONTACT_EMAIL = 'havit@aihavit.com';
const PUBLISHER_NAME = 'Havit Inc.';
const PUBLISHER_URL = 'https://www.aihavit.com';
const LAST_REVIEWED = '2026-05-25';

interface PolicyI18n {
  title: string;
  metaDescription: string;
  heading: string;
  lastReviewedLabel: string;
  // (1) AI scope
  aiScopeHeading: string;
  aiScopeBody: string;
  // (2) Workflow
  workflowHeading: string;
  workflowBody: string;
  workflowSteps: string[];
  // (3) Reviewer
  reviewerHeading: string;
  reviewerBody: string;
  // (4) Corrections
  correctionsHeading: string;
  correctionsBody: string;
  // (5) Contact
  contactHeading: string;
  contactBody: string;
  contactLabel: string;
}

const POLICY_I18N: Record<RouteLang, PolicyI18n> = {
  en: {
    title: 'Editorial Policy',
    metaDescription:
      'HAVIT Blog editorial policy: AI scope, human review workflow, reviewer credentials, corrections, and contact. Published by Havit Inc.',
    heading: 'Editorial Policy',
    lastReviewedLabel: 'Last reviewed',
    aiScopeHeading: 'How We Use AI',
    aiScopeBody:
      'HAVIT Blog uses generative AI as a research aid and as a drafting tool. Specifically, AI helps us (a) synthesize peer-reviewed studies and clinical guidelines into structured outlines, (b) draft first versions of explanations, comparisons, and FAQs, and (c) translate finalized English content into five additional languages. AI never publishes directly. Every article — including translations — passes through human editorial review before going live.',
    workflowHeading: 'Editorial Workflow',
    workflowBody:
      'Every article on HAVIT Blog moves through the following four stages before publication:',
    workflowSteps: [
      'Draft — AI generates a structured first draft from peer-reviewed sources, clinical guidelines, and the article brief.',
      'Fact-check — A human editor verifies every statistic, citation, and claim against the listed primary sources. Unverified claims are removed or marked as such.',
      'Medical advisory review — For YMYL categories (Health & Conditions, Medication Guide, Mental Health & Stress, etc.), HAVIT Medical Advisory reviews the article for medical accuracy, risk language, and disclaimer adequacy.',
      'Publish — Only after both fact-check and (where applicable) medical review pass does the article go live, with the last_updated date set to the review completion date.',
    ],
    reviewerHeading: 'Reviewer Credentials',
    reviewerBody:
      'HAVIT Medical Advisory is an editorial review board composed of contributors with backgrounds in medicine, pharmacology, nutrition science, and public health. Reviewers are credentialed to review content within their domain expertise. As of 2026-05-25, this is a collective entity name; individual reviewer disclosures will be added in a future update as we expand the board. For verification or to inquire about reviewer credentials for a specific article, contact us via the email below.',
    correctionsHeading: 'Corrections Policy',
    correctionsBody:
      'When a factual error is reported and verified, we (a) update the article, (b) set a new last_updated date, and (c) preserve a brief change note when the correction materially changes guidance. We respond to verified correction requests within 7 business days. Editorial decisions (style, scope) may differ from correction requests and are handled separately.',
    contactHeading: 'Contact',
    contactBody:
      'For corrections, source verification requests, partnership inquiries, or any other editorial concern, please email the HAVIT Editorial Team. We monitor this address during business hours and respond to verified concerns within 7 business days.',
    contactLabel: 'Email',
  },
  ko: {
    title: '편집 정책',
    metaDescription:
      'HAVIT 블로그 편집 정책: AI 활용 범위, 사람 검토 워크플로, 검수자 자격, 정정 정책, 연락처. 발행: 주식회사 하비트',
    heading: '편집 정책',
    lastReviewedLabel: '마지막 검토',
    aiScopeHeading: 'AI 활용 범위',
    aiScopeBody:
      'HAVIT 블로그는 생성형 AI를 리서치 보조 도구와 초안 작성 도구로 사용합니다. 구체적으로 AI는 (a) 동료 검토를 거친 연구와 임상 가이드라인을 구조화된 개요로 종합하고, (b) 설명·비교·FAQ의 초안을 작성하며, (c) 확정된 영어 원문을 5개 추가 언어로 번역하는 데 사용됩니다. AI는 직접 게시하지 않습니다. 번역을 포함한 모든 글은 게시 전 사람 편집 검토를 거칩니다.',
    workflowHeading: '편집 워크플로',
    workflowBody: 'HAVIT 블로그의 모든 글은 게시 전 다음 4단계를 거칩니다:',
    workflowSteps: [
      '초안 — AI가 동료 검토 연구, 임상 가이드라인, 글 브리프로부터 구조화된 첫 초안을 생성합니다.',
      '사실 확인 — 사람 편집자가 모든 통계·인용·주장을 명시된 1차 출처와 대조해 검증합니다. 검증되지 않은 주장은 삭제하거나 그렇게 표시합니다.',
      '의료 자문 검토 — YMYL 카테고리(Health & Conditions, Medication Guide, Mental Health & Stress 등)의 경우, HAVIT Medical Advisory가 의학적 정확성, 위험 어휘, 면책 충분성을 검토합니다.',
      '게시 — 사실 확인과 (해당 시) 의료 검토를 모두 통과한 후에만 게시되며, last_updated 날짜는 검토 완료일로 설정됩니다.',
    ],
    reviewerHeading: '검수자 자격',
    reviewerBody:
      'HAVIT Medical Advisory는 의학·약리학·영양학·공중보건 분야의 기여자로 구성된 편집 자문 위원회입니다. 검수자는 자신의 도메인 전문성 내에서 콘텐츠를 검토할 자격을 갖춥니다. 2026-05-25 기준 본 명칭은 집합 주체 표기이며, 위원회 확장에 따라 향후 개별 검수자 공개를 추가할 예정입니다. 특정 글의 검수자 자격 확인 또는 문의는 아래 이메일로 연락 바랍니다.',
    correctionsHeading: '정정 정책',
    correctionsBody:
      '사실 오류가 보고·검증되면 (a) 글을 업데이트하고, (b) last_updated 날짜를 새로 설정하며, (c) 정정이 가이드를 실질적으로 변경하는 경우 짧은 변경 노트를 보존합니다. 확인된 정정 요청에는 영업일 기준 7일 이내 회신합니다. 편집 판단(스타일, 범위)은 정정 요청과 별개로 처리됩니다.',
    contactHeading: '문의',
    contactBody:
      '정정 요청, 출처 확인, 파트너십 문의, 기타 편집 관련 사안은 HAVIT 편집팀 이메일로 보내주세요. 영업시간 동안 모니터링하며, 확인된 사안에 영업일 기준 7일 이내 회신합니다.',
    contactLabel: '이메일',
  },
  ja: {
    title: '編集ポリシー',
    metaDescription:
      'HAVITブログ編集ポリシー: AI活用範囲、人間によるレビューワークフロー、レビュアー資格、訂正方針、お問い合わせ。発行: Havit Inc.',
    heading: '編集ポリシー',
    lastReviewedLabel: '最終レビュー',
    aiScopeHeading: 'AIの活用範囲',
    aiScopeBody:
      'HAVITブログは生成AIをリサーチ補助ツールおよび下書きツールとして使用しています。具体的には、AIは(a)査読付き研究と臨床ガイドラインを構造化されたアウトラインに統合し、(b)説明・比較・FAQの初稿を作成し、(c)確定した英語コンテンツを5つの追加言語に翻訳する用途で使用されます。AIが直接公開することはありません。翻訳を含むすべての記事は公開前に人間の編集レビューを経ます。',
    workflowHeading: '編集ワークフロー',
    workflowBody: 'HAVITブログのすべての記事は公開前に以下の4段階を経ます:',
    workflowSteps: [
      '下書き — AIが査読付き研究、臨床ガイドライン、記事ブリーフから構造化された初稿を生成します。',
      'ファクトチェック — 人間の編集者がすべての統計・引用・主張を一次出典と照合して検証します。未検証の主張は削除またはその旨表示されます。',
      '医療アドバイザリーレビュー — YMYLカテゴリー(Health & Conditions、Medication Guide、Mental Health & Stressなど)については、HAVIT Medical Advisoryが医学的正確性、リスク表現、免責の十分性をレビューします。',
      '公開 — ファクトチェックと(該当する場合)医療レビューの両方を通過した後のみ公開され、last_updated日はレビュー完了日に設定されます。',
    ],
    reviewerHeading: 'レビュアー資格',
    reviewerBody:
      'HAVIT Medical Advisoryは、医学・薬理学・栄養学・公衆衛生のバックグラウンドを持つ寄稿者で構成される編集レビュー委員会です。レビュアーは各自の専門領域内のコンテンツをレビューする資格を持ちます。2026-05-25時点で本名称は集合的なエンティティ名称であり、委員会の拡大に伴い今後個別レビュアー開示を追加予定です。特定記事のレビュアー資格確認やお問い合わせは下記メールまでご連絡ください。',
    correctionsHeading: '訂正方針',
    correctionsBody:
      '事実誤りが報告・検証された場合、(a)記事を更新し、(b)新しいlast_updated日を設定し、(c)訂正がガイダンスを実質的に変更する場合は短い変更注記を保存します。検証された訂正リクエストには営業日7日以内に返信します。編集判断(スタイル、範囲)は訂正リクエストとは別に処理されます。',
    contactHeading: 'お問い合わせ',
    contactBody:
      '訂正リクエスト、出典確認、パートナーシップに関するお問い合わせ、その他編集関連事項はHAVIT編集チームまでメールでご連絡ください。営業時間内に対応し、確認された事項には営業日7日以内に返信します。',
    contactLabel: 'メール',
  },
  zh: {
    title: '编辑政策',
    metaDescription:
      'HAVIT 博客编辑政策: AI 使用范围、人工审核工作流、审核员资格、更正政策、联系方式。发行: Havit Inc.',
    heading: '编辑政策',
    lastReviewedLabel: '最后审核',
    aiScopeHeading: 'AI 使用范围',
    aiScopeBody:
      'HAVIT 博客将生成式 AI 用作研究辅助工具和起草工具。具体而言，AI 协助我们 (a) 将同行评审研究和临床指南综合为结构化大纲，(b) 起草说明、比较和常见问题的初稿，(c) 将定稿的英文内容翻译为另外五种语言。AI 不直接发布。包括翻译在内的每篇文章在上线前都经过人工编辑审核。',
    workflowHeading: '编辑工作流',
    workflowBody: 'HAVIT 博客的所有文章在发布前都经过以下四个阶段:',
    workflowSteps: [
      '起草 — AI 根据同行评审研究、临床指南和文章简介生成结构化的首稿。',
      '事实核查 — 人工编辑核对所有统计数据、引用和主张与所列一手来源的一致性。未经核实的主张将被删除或标记。',
      '医疗咨询审核 — 对于 YMYL 类别(Health & Conditions、Medication Guide、Mental Health & Stress 等)，HAVIT Medical Advisory 审核医学准确性、风险表述和免责声明的充分性。',
      '发布 — 仅在通过事实核查和(适用时)医疗审核后才会发布，last_updated 日期设置为审核完成日期。',
    ],
    reviewerHeading: '审核员资格',
    reviewerBody:
      'HAVIT Medical Advisory 是由医学、药理学、营养科学和公共卫生背景的贡献者组成的编辑审核委员会。审核员有资格审核其领域专长内的内容。截至 2026-05-25，本名称为集体实体名称；随着委员会扩展，未来更新中将添加个人审核员披露。如需验证特定文章的审核员资格或咨询，请通过以下邮箱联系我们。',
    correctionsHeading: '更正政策',
    correctionsBody:
      '当事实错误被报告并核实后，我们会 (a) 更新文章，(b) 设置新的 last_updated 日期，并且 (c) 在更正实质性改变指导意见时保留简短变更说明。我们在 7 个工作日内回复经核实的更正请求。编辑决策(风格、范围)与更正请求分开处理。',
    contactHeading: '联系方式',
    contactBody:
      '如需更正、来源验证请求、合作咨询或其他编辑相关事宜，请发送邮件至 HAVIT 编辑团队。我们在工作时间内监控此邮箱，并在 7 个工作日内回复经核实的问题。',
    contactLabel: '邮箱',
  },
  'zh-tw': {
    title: '編輯政策',
    metaDescription:
      'HAVIT 部落格編輯政策: AI 使用範圍、人工審核工作流程、審核員資格、更正政策、聯絡方式。發行: Havit Inc.',
    heading: '編輯政策',
    lastReviewedLabel: '最後審核',
    aiScopeHeading: 'AI 使用範圍',
    aiScopeBody:
      'HAVIT 部落格將生成式 AI 用作研究輔助工具和起草工具。具體而言，AI 協助我們 (a) 將同行評審研究和臨床指南綜合為結構化大綱，(b) 起草說明、比較和常見問題的初稿，(c) 將定稿的英文內容翻譯為另外五種語言。AI 不直接發布。包括翻譯在內的每篇文章在上線前都經過人工編輯審核。',
    workflowHeading: '編輯工作流程',
    workflowBody: 'HAVIT 部落格的所有文章在發布前都經過以下四個階段:',
    workflowSteps: [
      '草稿 — AI 根據同行評審研究、臨床指南和文章簡介生成結構化的首稿。',
      '事實查核 — 人工編輯核對所有統計數據、引用和主張與所列一手來源的一致性。未經查證的主張將被刪除或標記。',
      '醫療諮詢審核 — 對於 YMYL 類別(Health & Conditions、Medication Guide、Mental Health & Stress 等)，HAVIT Medical Advisory 審核醫學準確性、風險表述和免責聲明的充分性。',
      '發布 — 僅在通過事實查核和(適用時)醫療審核後才會發布，last_updated 日期設置為審核完成日期。',
    ],
    reviewerHeading: '審核員資格',
    reviewerBody:
      'HAVIT Medical Advisory 是由醫學、藥理學、營養科學和公共衛生背景的貢獻者組成的編輯審核委員會。審核員有資格審核其領域專長內的內容。截至 2026-05-25，本名稱為集體實體名稱；隨著委員會擴展，未來更新中將添加個人審核員披露。如需驗證特定文章的審核員資格或諮詢，請透過以下信箱聯絡我們。',
    correctionsHeading: '更正政策',
    correctionsBody:
      '當事實錯誤被報告並查證後，我們會 (a) 更新文章，(b) 設定新的 last_updated 日期，並且 (c) 在更正實質性改變指導意見時保留簡短變更說明。我們在 7 個工作日內回覆經查證的更正請求。編輯決策(風格、範圍)與更正請求分開處理。',
    contactHeading: '聯絡方式',
    contactBody:
      '如需更正、來源驗證請求、合作諮詢或其他編輯相關事宜，請寄送電子郵件至 HAVIT 編輯團隊。我們在工作時間內監控此信箱，並在 7 個工作日內回覆經查證的問題。',
    contactLabel: '電子郵件',
  },
  es: {
    title: 'Política Editorial',
    metaDescription:
      'Política editorial de HAVIT Blog: alcance de IA, flujo de revisión humana, credenciales de revisores, política de correcciones y contacto. Publicado por Havit Inc.',
    heading: 'Política Editorial',
    lastReviewedLabel: 'Última revisión',
    aiScopeHeading: 'Cómo Usamos IA',
    aiScopeBody:
      'HAVIT Blog utiliza IA generativa como herramienta de apoyo a la investigación y como herramienta de redacción. Específicamente, la IA nos ayuda a (a) sintetizar estudios revisados por pares y guías clínicas en esquemas estructurados, (b) redactar primeras versiones de explicaciones, comparaciones y preguntas frecuentes, y (c) traducir contenido finalizado en inglés a cinco idiomas adicionales. La IA nunca publica directamente. Cada artículo — incluidas las traducciones — pasa por revisión editorial humana antes de su publicación.',
    workflowHeading: 'Flujo Editorial',
    workflowBody:
      'Cada artículo en HAVIT Blog pasa por las siguientes cuatro etapas antes de su publicación:',
    workflowSteps: [
      'Borrador — La IA genera un primer borrador estructurado a partir de fuentes revisadas por pares, guías clínicas y el brief del artículo.',
      'Verificación de hechos — Un editor humano verifica cada estadística, cita y afirmación contra las fuentes primarias listadas. Las afirmaciones no verificadas se eliminan o se marcan como tales.',
      'Revisión de asesoría médica — Para categorías YMYL (Health & Conditions, Medication Guide, Mental Health & Stress, etc.), HAVIT Medical Advisory revisa el artículo en cuanto a precisión médica, lenguaje de riesgo y adecuación del descargo.',
      'Publicación — Solo después de que tanto la verificación de hechos como (cuando corresponda) la revisión médica sean aprobadas, el artículo se publica, con la fecha last_updated establecida en la fecha de finalización de la revisión.',
    ],
    reviewerHeading: 'Credenciales de Revisores',
    reviewerBody:
      'HAVIT Medical Advisory es un comité editorial de revisión compuesto por colaboradores con formación en medicina, farmacología, ciencia de la nutrición y salud pública. Los revisores están acreditados para revisar contenido dentro de su área de experiencia. Al 2026-05-25, este es un nombre de entidad colectiva; las divulgaciones individuales de revisores se añadirán en una actualización futura a medida que ampliemos el comité. Para verificación o para consultar credenciales de revisores para un artículo específico, contáctenos a través del correo a continuación.',
    correctionsHeading: 'Política de Correcciones',
    correctionsBody:
      'Cuando se reporta y verifica un error fáctico, (a) actualizamos el artículo, (b) establecemos una nueva fecha last_updated, y (c) preservamos una nota breve de cambio cuando la corrección cambia materialmente la orientación. Respondemos a solicitudes de corrección verificadas en 7 días hábiles. Las decisiones editoriales (estilo, alcance) pueden diferir de las solicitudes de corrección y se manejan por separado.',
    contactHeading: 'Contacto',
    contactBody:
      'Para correcciones, solicitudes de verificación de fuentes, consultas de asociación o cualquier otra inquietud editorial, envíe un correo al Equipo Editorial de HAVIT. Monitoreamos esta dirección durante horario laboral y respondemos a inquietudes verificadas en 7 días hábiles.',
    contactLabel: 'Correo',
  },
  'pt-br': {
    title: 'Política Editorial',
    metaDescription:
      'Política editorial do HAVIT Blog: escopo da IA, fluxo de revisão humana, credenciais dos revisores, política de correções e contato. Publicado pela Havit Inc.',
    heading: 'Política Editorial',
    lastReviewedLabel: 'Última revisão',
    aiScopeHeading: 'Como Usamos IA',
    aiScopeBody:
      'O HAVIT Blog usa IA generativa como ferramenta de apoio à pesquisa e ferramenta de redação. Especificamente, a IA nos ajuda a (a) sintetizar estudos revisados por pares e diretrizes clínicas em estruturas organizadas, (b) redigir primeiras versões de explicações, comparações e perguntas frequentes, e (c) traduzir o conteúdo finalizado em inglês para cinco idiomas adicionais. A IA nunca publica diretamente. Cada artigo — incluindo traduções — passa por revisão editorial humana antes da publicação.',
    workflowHeading: 'Fluxo Editorial',
    workflowBody:
      'Cada artigo no HAVIT Blog passa pelas quatro etapas a seguir antes da publicação:',
    workflowSteps: [
      'Rascunho — A IA gera um primeiro rascunho estruturado a partir de fontes revisadas por pares, diretrizes clínicas e o briefing do artigo.',
      'Verificação de fatos — Um editor humano verifica cada estatística, citação e afirmação em relação às fontes primárias listadas. Afirmações não verificadas são removidas ou marcadas como tal.',
      'Revisão de assessoria médica — Para categorias YMYL (Health & Conditions, Medication Guide, Mental Health & Stress, etc.), o HAVIT Medical Advisory revisa o artigo quanto à precisão médica, linguagem de risco e adequação do aviso legal.',
      'Publicação — Somente após a verificação de fatos e (quando aplicável) a revisão médica serem aprovadas, o artigo é publicado, com a data last_updated definida como a data de conclusão da revisão.',
    ],
    reviewerHeading: 'Credenciais dos Revisores',
    reviewerBody:
      'O HAVIT Medical Advisory é um comitê editorial de revisão composto por colaboradores com formação em medicina, farmacologia, ciência da nutrição e saúde pública. Os revisores são credenciados para revisar conteúdo dentro de sua área de especialização. Em 2026-05-25, este é um nome de entidade coletiva; divulgações individuais de revisores serão adicionadas em uma atualização futura conforme expandirmos o comitê. Para verificação ou para consultar credenciais de revisores para um artigo específico, entre em contato pelo e-mail abaixo.',
    correctionsHeading: 'Política de Correções',
    correctionsBody:
      'Quando um erro factual é relatado e verificado, (a) atualizamos o artigo, (b) definimos uma nova data last_updated, e (c) preservamos uma breve nota de alteração quando a correção altera materialmente a orientação. Respondemos a solicitações de correção verificadas em 7 dias úteis. Decisões editoriais (estilo, escopo) podem diferir das solicitações de correção e são tratadas separadamente.',
    contactHeading: 'Contato',
    contactBody:
      'Para correções, solicitações de verificação de fontes, consultas de parceria ou qualquer outra preocupação editorial, envie um e-mail para a Equipe Editorial do HAVIT. Monitoramos este endereço durante o horário comercial e respondemos a preocupações verificadas em 7 dias úteis.',
    contactLabel: 'E-mail',
  },
  id: {
    title: 'Kebijakan Editorial',
    metaDescription:
      'Kebijakan editorial HAVIT Blog: cakupan AI, alur tinjauan manusia, kredensial peninjau, kebijakan koreksi, dan kontak. Diterbitkan oleh Havit Inc.',
    heading: 'Kebijakan Editorial',
    lastReviewedLabel: 'Terakhir ditinjau',
    aiScopeHeading: 'Cara Kami Menggunakan AI',
    aiScopeBody:
      'HAVIT Blog menggunakan AI generatif sebagai alat bantu riset dan penyusunan draf. Secara spesifik, AI membantu kami (a) merangkum studi yang ditinjau sejawat dan pedoman klinis menjadi kerangka terstruktur, (b) menyusun versi awal penjelasan, perbandingan, dan FAQ, serta (c) menerjemahkan konten bahasa Inggris yang sudah final ke lima bahasa tambahan. AI tidak pernah menerbitkan secara langsung. Setiap artikel — termasuk terjemahan — melewati tinjauan editorial manusia sebelum diterbitkan.',
    workflowHeading: 'Alur Editorial',
    workflowBody:
      'Setiap artikel di HAVIT Blog melalui empat tahap berikut sebelum dipublikasikan:',
    workflowSteps: [
      'Draf — AI menghasilkan draf pertama yang terstruktur dari sumber yang ditinjau sejawat, pedoman klinis, dan ringkasan artikel.',
      'Pemeriksaan fakta — Editor manusia memverifikasi setiap statistik, kutipan, dan klaim terhadap sumber primer yang tercantum. Klaim yang tidak terverifikasi dihapus atau ditandai.',
      'Tinjauan penasihat medis — Untuk kategori YMYL (Health & Conditions, Medication Guide, Mental Health & Stress, dll.), HAVIT Medical Advisory meninjau artikel untuk akurasi medis, bahasa risiko, dan kecukupan pernyataan penyangkalan.',
      'Publikasi — Hanya setelah baik pemeriksaan fakta maupun (jika berlaku) tinjauan medis lolos, artikel akan dipublikasikan, dengan tanggal last_updated yang ditetapkan ke tanggal penyelesaian tinjauan.',
    ],
    reviewerHeading: 'Kredensial Peninjau',
    reviewerBody:
      'HAVIT Medical Advisory adalah komite tinjauan editorial yang terdiri dari kontributor dengan latar belakang kedokteran, farmakologi, ilmu gizi, dan kesehatan masyarakat. Peninjau dikreditkan untuk meninjau konten dalam bidang keahliannya. Per 2026-05-25, ini adalah nama entitas kolektif; pengungkapan peninjau individu akan ditambahkan di pembaruan mendatang seiring perluasan komite. Untuk verifikasi atau menanyakan kredensial peninjau artikel tertentu, hubungi kami melalui email di bawah.',
    correctionsHeading: 'Kebijakan Koreksi',
    correctionsBody:
      'Ketika kesalahan faktual dilaporkan dan diverifikasi, kami (a) memperbarui artikel, (b) menetapkan tanggal last_updated baru, dan (c) menyimpan catatan perubahan singkat ketika koreksi mengubah panduan secara material. Kami merespons permintaan koreksi yang terverifikasi dalam 7 hari kerja. Keputusan editorial (gaya, cakupan) dapat berbeda dari permintaan koreksi dan ditangani secara terpisah.',
    contactHeading: 'Kontak',
    contactBody:
      'Untuk koreksi, permintaan verifikasi sumber, pertanyaan kemitraan, atau kekhawatiran editorial lainnya, kirim email ke Tim Editorial HAVIT. Kami memantau alamat ini selama jam kerja dan merespons kekhawatiran yang terverifikasi dalam 7 hari kerja.',
    contactLabel: 'Email',
  },
  de: {
    title: 'Redaktionsrichtlinie',
    metaDescription:
      'HAVIT Blog Redaktionsrichtlinie: KI-Umfang, menschlicher Prüfprozess, Prüfer-Qualifikationen, Korrekturrichtlinie und Kontakt. Herausgegeben von Havit Inc.',
    heading: 'Redaktionsrichtlinie',
    lastReviewedLabel: 'Zuletzt geprüft',
    aiScopeHeading: 'Wie wir KI nutzen',
    aiScopeBody:
      'HAVIT Blog setzt generative KI als Recherchehilfe und als Entwurfswerkzeug ein. Konkret hilft uns die KI dabei, (a) peer-reviewed Studien und klinische Leitlinien in strukturierte Gliederungen zu synthetisieren, (b) erste Entwürfe von Erklärungen, Vergleichen und FAQs zu erstellen und (c) finalisierte englische Inhalte in fünf weitere Sprachen zu übersetzen. KI veröffentlicht niemals direkt. Jeder Artikel — auch Übersetzungen — durchläuft vor der Veröffentlichung eine menschliche redaktionelle Prüfung.',
    workflowHeading: 'Redaktioneller Workflow',
    workflowBody:
      'Jeder Artikel im HAVIT Blog durchläuft die folgenden vier Stufen vor der Veröffentlichung:',
    workflowSteps: [
      'Entwurf — Die KI erstellt einen strukturierten ersten Entwurf aus peer-reviewed Quellen, klinischen Leitlinien und dem Artikel-Briefing.',
      'Faktencheck — Ein menschlicher Redakteur überprüft jede Statistik, jedes Zitat und jede Behauptung anhand der angegebenen Primärquellen. Nicht überprüfbare Behauptungen werden entfernt oder als solche gekennzeichnet.',
      'Medizinische Beirat-Prüfung — Für YMYL-Kategorien (Health & Conditions, Medication Guide, Mental Health & Stress usw.) prüft das HAVIT Medical Advisory den Artikel auf medizinische Genauigkeit, Risikosprache und Angemessenheit des Disclaimers.',
      'Veröffentlichung — Erst nach bestandenem Faktencheck und (falls zutreffend) medizinischer Prüfung wird der Artikel veröffentlicht, wobei das last_updated-Datum auf das Datum des Prüfungsabschlusses gesetzt wird.',
    ],
    reviewerHeading: 'Prüfer-Qualifikationen',
    reviewerBody:
      'Das HAVIT Medical Advisory ist ein redaktioneller Prüfungsausschuss aus Mitwirkenden mit Hintergrund in Medizin, Pharmakologie, Ernährungswissenschaft und öffentlicher Gesundheit. Prüfer sind berechtigt, Inhalte innerhalb ihres Fachgebiets zu überprüfen. Stand 2026-05-25 ist dies eine kollektive Bezeichnung; individuelle Prüfer-Angaben werden in einer zukünftigen Aktualisierung hinzugefügt, sobald wir das Komitee erweitern. Für die Verifizierung oder zur Anfrage von Prüfer-Qualifikationen zu einem bestimmten Artikel wenden Sie sich bitte an die unten genannte E-Mail-Adresse.',
    correctionsHeading: 'Korrekturrichtlinie',
    correctionsBody:
      'Wenn ein sachlicher Fehler gemeldet und überprüft wird, (a) aktualisieren wir den Artikel, (b) setzen ein neues last_updated-Datum und (c) bewahren eine kurze Änderungsnotiz auf, wenn die Korrektur die Empfehlung wesentlich verändert. Wir antworten auf bestätigte Korrekturanfragen innerhalb von 7 Werktagen. Redaktionelle Entscheidungen (Stil, Umfang) können von Korrekturanfragen abweichen und werden separat behandelt.',
    contactHeading: 'Kontakt',
    contactBody:
      'Für Korrekturen, Quellenüberprüfungen, Partnerschaftsanfragen oder andere redaktionelle Anliegen wenden Sie sich bitte per E-Mail an das HAVIT Redaktionsteam. Wir überwachen diese Adresse während der Geschäftszeiten und antworten auf bestätigte Anliegen innerhalb von 7 Werktagen.',
    contactLabel: 'E-Mail',
  },
  fr: {
    title: 'Politique Éditoriale',
    metaDescription:
      "Politique éditoriale du HAVIT Blog : portée de l'IA, processus de relecture humaine, qualifications des relecteurs, politique de corrections et contact. Publié par Havit Inc.",
    heading: 'Politique Éditoriale',
    lastReviewedLabel: 'Dernière révision',
    aiScopeHeading: "Comment nous utilisons l'IA",
    aiScopeBody:
      "HAVIT Blog utilise l'IA générative comme outil d'aide à la recherche et outil de rédaction. Concrètement, l'IA nous aide à (a) synthétiser des études évaluées par des pairs et des directives cliniques en plans structurés, (b) rédiger les premières versions d'explications, de comparaisons et de FAQ, et (c) traduire le contenu anglais finalisé en cinq langues supplémentaires. L'IA ne publie jamais directement. Chaque article — y compris les traductions — passe par une révision éditoriale humaine avant publication.",
    workflowHeading: 'Processus Éditorial',
    workflowBody:
      'Chaque article sur HAVIT Blog passe par les quatre étapes suivantes avant publication :',
    workflowSteps: [
      "Brouillon — L'IA génère un premier brouillon structuré à partir de sources évaluées par des pairs, de directives cliniques et du brief de l'article.",
      'Vérification des faits — Un éditeur humain vérifie chaque statistique, citation et affirmation par rapport aux sources primaires listées. Les affirmations non vérifiées sont supprimées ou signalées comme telles.',
      "Révision médicale — Pour les catégories YMYL (Health & Conditions, Medication Guide, Mental Health & Stress, etc.), le HAVIT Medical Advisory examine l'article pour vérifier l'exactitude médicale, le langage du risque et l'adéquation du disclaimer.",
      "Publication — L'article est publié uniquement après validation de la vérification des faits et (le cas échéant) de la révision médicale, avec la date last_updated fixée à la date d'achèvement de la révision.",
    ],
    reviewerHeading: 'Qualifications des Relecteurs',
    reviewerBody:
      "Le HAVIT Medical Advisory est un comité éditorial de relecture composé de contributeurs ayant une formation en médecine, pharmacologie, sciences de la nutrition et santé publique. Les relecteurs sont qualifiés pour examiner le contenu dans leur domaine d'expertise. Au 2026-05-25, il s'agit d'un nom d'entité collective ; les divulgations individuelles des relecteurs seront ajoutées lors d'une mise à jour future à mesure que nous étendons le comité. Pour vérifier ou demander les qualifications des relecteurs d'un article spécifique, contactez-nous à l'adresse e-mail ci-dessous.",
    correctionsHeading: 'Politique de Corrections',
    correctionsBody:
      "Lorsqu'une erreur factuelle est signalée et vérifiée, nous (a) mettons à jour l'article, (b) fixons une nouvelle date last_updated et (c) conservons une brève note de modification lorsque la correction modifie significativement les conseils. Nous répondons aux demandes de correction vérifiées dans un délai de 7 jours ouvrables. Les décisions éditoriales (style, périmètre) peuvent différer des demandes de correction et sont traitées séparément.",
    contactHeading: 'Contact',
    contactBody:
      "Pour les corrections, les demandes de vérification de sources, les demandes de partenariat ou toute autre préoccupation éditoriale, envoyez un e-mail à l'Équipe Éditoriale HAVIT. Nous surveillons cette adresse pendant les heures de bureau et répondons aux préoccupations vérifiées dans un délai de 7 jours ouvrables.",
    contactLabel: 'E-mail',
  },
};

export function generateMetadata({ params }: Props): Metadata {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) return { title: 'Not Found — HAVIT Blog' };
  const i18n = POLICY_I18N[params.lang as RouteLang];
  return {
    title: `${i18n.title} — HAVIT Blog`,
    description: i18n.metaDescription,
    // SEO staging — index only priority langs first (PRIORITY_INDEX_LANGS).
    robots: isLangIndexable(params.lang)
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: {
      canonical: `${SITE}/${params.lang}/editorial-policy`,
      languages: Object.fromEntries(ROUTE_LANGS.filter(isLangIndexable).map((l) => [l, `${SITE}/${l}/editorial-policy`])),
    },
    openGraph: {
      title: i18n.title,
      description: i18n.metaDescription,
      type: 'website',
      url: `${SITE}/${params.lang}/editorial-policy`,
      siteName: 'HAVIT Blog',
      locale: params.lang,
      images: [{ url: `${SITE}/og-card.png`, width: 1200, height: 630, alt: 'HAVIT Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: i18n.title,
      description: i18n.metaDescription,
      images: [`${SITE}/og-card.png`],
    },
  };
}

interface PolicyJsonLd {
  '@context': 'https://schema.org';
  '@type': 'WebPage';
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  lastReviewed: string;
  publisher: {
    '@type': 'Organization';
    name: string;
    url: string;
    logo: { '@type': 'ImageObject'; url: string };
  };
}

function buildPolicyJsonLd(lang: RouteLang, i18n: PolicyI18n): PolicyJsonLd {
  const fullLang = toFullLang(lang === 'zh-tw' ? 'zh-tw' : lang === 'zh' ? 'zh-cn' : lang);
  const bcp = fullLang === 'uz_cyrl_uz'
    ? 'uz-Cyrl-UZ'
    : `${fullLang.split('_')[0]}-${fullLang.split('_')[1].toUpperCase()}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: i18n.title,
    description: i18n.metaDescription,
    url: `${SITE}/${lang}/editorial-policy`,
    inLanguage: bcp,
    lastReviewed: LAST_REVIEWED,
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: PUBLISHER_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/havit-logo.png`,
      },
    },
  };
}

export default function EditorialPolicyPage({ params }: Props) {
  if (!ROUTE_LANGS.includes(params.lang as RouteLang)) notFound();
  const lang = params.lang as RouteLang;
  const i18n = POLICY_I18N[lang];
  const fullLang = toFullLang(lang === 'zh-tw' ? 'zh-tw' : lang === 'zh' ? 'zh-cn' : lang);
  const jsonLd = buildPolicyJsonLd(lang, i18n);

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={fullLang} />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-12">
          <header className="mb-8">
            <h1 className="font-bold text-3xl md:text-4xl xl:text-5xl leading-tight mb-4">
              {i18n.heading}
            </h1>
            <p className="text-sm text-gray-500">
              {i18n.lastReviewedLabel}: <strong className="text-gray-700">{LAST_REVIEWED}</strong>
            </p>
          </header>

          <div className="prose prose-gray max-w-none">
            <h2>{i18n.aiScopeHeading}</h2>
            <p>{i18n.aiScopeBody}</p>

            <h2>{i18n.workflowHeading}</h2>
            <p>{i18n.workflowBody}</p>
            <ol>
              {i18n.workflowSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <h2>{i18n.reviewerHeading}</h2>
            <p>{i18n.reviewerBody}</p>

            <h2>{i18n.correctionsHeading}</h2>
            <p>{i18n.correctionsBody}</p>

            <h2>{i18n.contactHeading}</h2>
            <p>{i18n.contactBody}</p>
            <p>
              <strong>{i18n.contactLabel}:</strong>{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hover:text-primary-600"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          {/* PRD §6.3 T3 — WebPage JSON-LD with lastReviewed */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </article>
      </main>
      <Footer lang={fullLang} />
    </div>
  );
}
