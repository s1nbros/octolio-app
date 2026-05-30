import { Link } from 'react-router-dom';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { useLang } from '../contexts/LanguageContext';

const COMPANY_NAME = '[COMPANY NAME]';
const COMPANY_ADDRESS = '[COMPANY ADDRESS]';
const CONTACT_EMAIL = '[CONTACT EMAIL]';
const DPO_EMAIL = '[DPO EMAIL]';
const LAST_UPDATED = '2026-05-31';

type Section = {
  id: string;
  title: { en: string; bg: string };
  body: { en: string[]; bg: string[] };
};

const SECTIONS: Section[] = [
  {
    id: 'who-we-are',
    title: { en: '1. Who We Are', bg: '1. Кои сме ние' },
    body: {
      en: [
        `Octolio ("we", "us", "our") is a gamified personal finance learning app operated by ${COMPANY_NAME}, registered at ${COMPANY_ADDRESS}.`,
        `For any privacy-related question you can reach us at ${CONTACT_EMAIL}. Our Data Protection Officer is reachable at ${DPO_EMAIL}.`,
        `This Privacy Policy explains how we collect, use, store and share your personal data in accordance with the EU General Data Protection Regulation (Regulation (EU) 2016/679, "GDPR") and applicable national laws.`,
      ],
      bg: [
        `Octolio („ние", „нас", „наш") е геймифицирано приложение за финансово обучение, управлявано от ${COMPANY_NAME}, регистрирано на ${COMPANY_ADDRESS}.`,
        `За въпроси, свързани с поверителността, можеш да се свържеш с нас на ${CONTACT_EMAIL}. Нашият Длъжностно лице по защита на данните е достъпен на ${DPO_EMAIL}.`,
        `Тази Политика за поверителност обяснява как събираме, използваме, съхраняваме и споделяме твоите лични данни в съответствие с Общия регламент за защита на данните на ЕС (Регламент (ЕС) 2016/679, „GDPR") и приложимото национално законодателство.`,
      ],
    },
  },
  {
    id: 'what-we-collect',
    title: { en: '2. What Data We Collect', bg: '2. Какви данни събираме' },
    body: {
      en: [
        '**Account data** — name (nickname), email address, hashed password, email-verification status, language preference, theme preference.',
        '**Learning progress** — modules and lessons you complete, XP earned, current streak, hearts/energy state, spaced-repetition cards, quest progress, equipped cosmetics, owned items, coin balance, chests opened.',
        '**Social data** — friend connections, friend requests, notifications (e.g., when a friend overtakes your XP).',
        '**Payment data** — if you subscribe to Pro, Stripe processes your payment. We receive a Stripe customer ID and subscription status but **never your full card number or CVC**.',
        '**AI Advisor conversations** — if you use the Pro-only AI Advisor, the messages you send are forwarded to Anthropic to generate a reply. We do not store the full conversation history server-side beyond the active session.',
        '**Technical data** — IP address (during authentication and at the network edge), browser user-agent, basic device info, locale.',
      ],
      bg: [
        '**Данни за акаунта** — име (прякор), имейл адрес, хеширана парола, статус на верификация на имейла, езикови предпочитания, тема.',
        '**Прогрес от обучението** — завършените модули и уроци, спечелени XP, текущ стрийк, състояние на сърца/енергия, карти за интервално повторение, прогрес по куестове, екипирани козметики, притежавани предмети, баланс на монети, отворени сандъци.',
        '**Социални данни** — приятелски връзки, заявки за приятелство, нотификации (напр. когато приятел те задмине по XP).',
        '**Платежни данни** — ако се абонираш за Pro, Stripe обработва плащането ти. Получаваме Stripe customer ID и статус на абонамента, но **никога пълния номер на картата или CVC**.',
        '**Разговори с AI съветника** — ако използваш AI съветника (само за Pro), съобщенията ти се препращат към Anthropic, за да се генерира отговор. Не съхраняваме цялата история на разговора на сървъра след активната сесия.',
        '**Технически данни** — IP адрес (по време на удостоверяване и в края на мрежата), браузър user-agent, основна информация за устройството, локал.',
      ],
    },
  },
  {
    id: 'lawful-basis',
    title: { en: '3. Lawful Basis for Processing', bg: '3. Правно основание за обработката' },
    body: {
      en: [
        'We process your personal data on the following lawful bases under Article 6 GDPR:',
        '**Performance of a contract (Art. 6(1)(b))** — to create and operate your account, deliver lessons, track your progress, and provide the Pro features you have subscribed to.',
        '**Consent (Art. 6(1)(a))** — for any optional marketing communications. You can withdraw consent at any time.',
        '**Legitimate interest (Art. 6(1)(f))** — to keep the service secure (e.g., rate limiting, fraud prevention), to send transactional emails (verification, password reset, abuse alerts), and to improve the product through aggregated, non-identifying analytics.',
        '**Legal obligation (Art. 6(1)(c))** — to retain billing records for tax and accounting purposes.',
      ],
      bg: [
        'Обработваме твоите лични данни на следните правни основания по чл. 6 от GDPR:',
        '**Изпълнение на договор (чл. 6(1)(б))** — за създаване и поддръжка на акаунта ти, доставяне на уроци, проследяване на прогреса и предоставяне на Pro функциите, за които си се абонирал.',
        '**Съгласие (чл. 6(1)(а))** — за всякакви маркетингови комуникации по избор. Можеш да оттеглиш съгласието си по всяко време.',
        '**Легитимен интерес (чл. 6(1)(е))** — за поддържане на сигурността (rate limiting, превенция на измами), за изпращане на транзакционни имейли (верификация, смяна на парола, сигнали за злоупотреба) и за подобряване на продукта чрез агрегирана, неидентифицираща аналитика.',
        '**Правно задължение (чл. 6(1)(в))** — за съхранение на счетоводни записи за данъчни цели.',
      ],
    },
  },
  {
    id: 'how-we-use',
    title: { en: '4. How We Use Your Data', bg: '4. Как използваме данните ти' },
    body: {
      en: [
        'To provide and maintain the Octolio service (account, progress, leaderboards, friends, notifications).',
        'To verify your email and prevent fake registrations or abuse.',
        'To send transactional emails (account verification, password reset, billing receipts).',
        'To process Pro subscriptions via Stripe and grant/revoke Pro entitlements.',
        'To generate AI Advisor replies via Anthropic (Pro only, message-by-message basis).',
        'To compute leaderboard rankings and detect cross-XP overtakes between friends.',
        'To protect the service: detect abuse, rate-limit suspicious activity, enforce our Terms.',
      ],
      bg: [
        'За предоставяне и поддръжка на услугата Octolio (акаунт, прогрес, класации, приятели, нотификации).',
        'За верификация на имейла ти и превенция на фалшиви регистрации или злоупотреби.',
        'За изпращане на транзакционни имейли (верификация на акаунт, смяна на парола, разписки за плащане).',
        'За обработка на Pro абонаменти чрез Stripe и предоставяне/отнемане на Pro правата.',
        'За генериране на отговори от AI съветника чрез Anthropic (само за Pro, на принципа съобщение по съобщение).',
        'За изчисляване на класациите и засичане на задминавания по XP между приятели.',
        'За защита на услугата: засичане на злоупотреби, ограничаване на подозрителна активност, прилагане на Условията ни.',
      ],
    },
  },
  {
    id: 'third-parties',
    title: { en: '5. Third-Party Processors', bg: '5. Трети страни (обработващи)' },
    body: {
      en: [
        'We rely on the following trusted sub-processors, each contractually bound by GDPR-compatible data processing terms:',
        '**Neon (Postgres hosting)** — stores account, progress and economy data. Servers in the EU.',
        '**Render (hosting)** — runs our backend and frontend. EU region.',
        '**Resend (email delivery)** — sends verification, password-reset, and transactional emails. EU sub-processors.',
        '**Stripe (payments)** — processes Pro subscription payments. Stripe is GDPR-compliant and PCI-DSS Level 1 certified.',
        '**Anthropic (AI Advisor)** — receives the message you send the AI Advisor to generate a reply. Anthropic does not train on your data when accessed via API.',
        'A current list of sub-processors is available on request via ' + CONTACT_EMAIL + '.',
      ],
      bg: [
        'Разчитаме на следните доверени подизпълнители, всеки от които е договорно обвързан с условия за обработка на данни, съвместими с GDPR:',
        '**Neon (хостинг на Postgres)** — съхранява данните на акаунта, прогреса и икономиката. Сървъри в ЕС.',
        '**Render (хостинг)** — пуска нашия backend и frontend. Регион в ЕС.',
        '**Resend (доставка на имейл)** — изпраща имейли за верификация, смяна на парола и транзакционни известия. Подизпълнители в ЕС.',
        '**Stripe (плащания)** — обработва плащанията за Pro абонамент. Stripe е съвместим с GDPR и сертифициран PCI-DSS Level 1.',
        '**Anthropic (AI съветник)** — получава съобщението, което изпращаш на AI съветника, за да генерира отговор. Anthropic не обучава върху данните ти при достъп през API.',
        'Актуален списък на подизпълнителите е достъпен при поискване на ' + CONTACT_EMAIL + '.',
      ],
    },
  },
  {
    id: 'transfers',
    title: { en: '6. International Data Transfers', bg: '6. Международни прехвърляния на данни' },
    body: {
      en: [
        'Where any sub-processor transfers data outside the European Economic Area (e.g., Anthropic in the United States), the transfer is governed by the European Commission\'s Standard Contractual Clauses (SCCs) and supplementary safeguards as required by Schrems II.',
        'You can request a copy of these safeguards by writing to ' + DPO_EMAIL + '.',
      ],
      bg: [
        'Когато подизпълнител прехвърля данни извън Европейското икономическо пространство (напр. Anthropic в САЩ), прехвърлянето се регулира от Стандартните договорни клаузи на Европейската комисия (SCC) и допълнителни предпазни мерки, изисквани от Schrems II.',
        'Можеш да поискаш копие на тези гаранции, като пишеш на ' + DPO_EMAIL + '.',
      ],
    },
  },
  {
    id: 'retention',
    title: { en: '7. Data Retention', bg: '7. Срокове на съхранение' },
    body: {
      en: [
        '**Account data** — kept as long as your account is active. If you delete your account, we erase personal data within 30 days, except where retention is required by law (e.g., invoicing records for 10 years under EU accounting rules).',
        '**Pending registrations** — automatically purged 30 minutes after the verification window expires.',
        '**Password-reset tokens** — invalidated after 1 hour or first use.',
        '**Notifications & friend activity** — retained while your account exists; you can clear notifications at any time.',
        '**AI Advisor messages** — not stored long-term server-side once the SSE stream completes; only retained transiently to deliver the response.',
      ],
      bg: [
        '**Данни за акаунта** — съхраняват се, докато акаунтът ти е активен. Ако изтриеш акаунта си, изтриваме личните данни в рамките на 30 дни, освен когато съхранението е изисквано от закона (напр. фактури за 10 години по счетоводните правила на ЕС).',
        '**Чакащи регистрации** — автоматично изтриват се 30 минути след изтичането на прозореца за верификация.',
        '**Токени за смяна на парола** — обезсилват се след 1 час или след първа употреба.',
        '**Нотификации и приятелска активност** — съхраняват се, докато съществува акаунтът ти; можеш да изчистиш нотификациите по всяко време.',
        '**Съобщения към AI съветника** — не се съхраняват дългосрочно на сървъра след приключване на SSE потока; запазват се само транзитно за доставка на отговора.',
      ],
    },
  },
  {
    id: 'your-rights',
    title: { en: '8. Your Rights Under GDPR', bg: '8. Твоите права по GDPR' },
    body: {
      en: [
        'You have the following rights regarding your personal data:',
        '**Right of access (Art. 15)** — request a copy of the data we hold about you.',
        '**Right to rectification (Art. 16)** — correct inaccurate or incomplete data.',
        '**Right to erasure (Art. 17)** — request deletion of your account and personal data.',
        '**Right to restriction (Art. 18)** — limit how we process your data.',
        '**Right to data portability (Art. 20)** — receive your data in a structured, machine-readable format.',
        '**Right to object (Art. 21)** — object to processing based on legitimate interest.',
        '**Right to withdraw consent** — at any time, where processing is based on consent.',
        `To exercise any of these rights, email ${CONTACT_EMAIL}. We will respond within 30 days. You also have the right to lodge a complaint with your national data protection authority.`,
      ],
      bg: [
        'Имаш следните права относно личните си данни:',
        '**Право на достъп (чл. 15)** — да поискаш копие на данните, които съхраняваме за теб.',
        '**Право на коригиране (чл. 16)** — да коригираш неточни или непълни данни.',
        '**Право на изтриване (чл. 17)** — да поискаш изтриване на акаунта си и личните си данни.',
        '**Право на ограничаване (чл. 18)** — да ограничиш начина, по който обработваме данните ти.',
        '**Право на преносимост (чл. 20)** — да получиш данните си в структуриран, машинно четим формат.',
        '**Право на възражение (чл. 21)** — да възразиш срещу обработване, базирано на легитимен интерес.',
        '**Право на оттегляне на съгласието** — по всяко време, когато обработването е базирано на съгласие.',
        `За да упражниш някое от тези права, изпрати имейл на ${CONTACT_EMAIL}. Ще отговорим в рамките на 30 дни. Имаш и право да подадеш жалба до националния орган за защита на данните.`,
      ],
    },
  },
  {
    id: 'cookies',
    title: { en: '9. Cookies & Local Storage', bg: '9. Бисквитки и Local Storage' },
    body: {
      en: [
        'Octolio uses local storage (not classic tracking cookies) to remember your language, theme, and the "What\'s New" modal state. These are strictly necessary for the app to function and do not require consent under the ePrivacy Directive.',
        'We do not use third-party advertising trackers or cross-site analytics cookies.',
        'When you log in, a JWT token is stored in your browser to keep you signed in. Logging out clears it.',
      ],
      bg: [
        'Octolio използва local storage (не класически tracking cookies), за да запомни езика, темата и състоянието на „Какво ново" модала. Те са строго необходими за работата на приложението и не изискват съгласие по Директивата за е-Поверителност.',
        'Не използваме рекламни тракери от трети страни или cross-site аналитични бисквитки.',
        'Когато влезеш, JWT токен се съхранява в браузъра ти, за да останеш в системата. Излизането го изчиства.',
      ],
    },
  },
  {
    id: 'security',
    title: { en: '10. Security', bg: '10. Сигурност' },
    body: {
      en: [
        'We protect your data using:',
        'Encryption in transit (HTTPS / TLS 1.2+) on every request.',
        'Encryption at rest at our database provider (Neon).',
        'Passwords hashed with bcrypt (cost factor 10+) — we never store passwords in plain text.',
        'JWT-based session tokens with expiration.',
        'Rate limiting on authentication endpoints to deter brute-force attacks.',
        'A banned-words filter on nicknames to keep the community safe.',
        'No system is 100% secure. If we become aware of a data breach affecting your personal data, we will notify the relevant supervisory authority within 72 hours, and you directly without undue delay, as required by Articles 33–34 GDPR.',
      ],
      bg: [
        'Защитаваме данните ти чрез:',
        'Криптиране при пренос (HTTPS / TLS 1.2+) на всяка заявка.',
        'Криптиране при съхранение при доставчика на база данни (Neon).',
        'Парола, хеширана с bcrypt (cost factor 10+) — никога не съхраняваме пароли в чист вид.',
        'Сесийни токени, базирани на JWT, с изтичане.',
        'Ограничения за скорост на endpoint-ите за вход, за да възпрем атаки тип brute-force.',
        'Филтър за забранени думи при прякорите, за да поддържаме общност на сигурно място.',
        'Никоя система не е 100% сигурна. Ако установим пробив, засягащ личните ти данни, ще уведомим съответния надзорен орган в рамките на 72 часа и теб лично без неоправдано забавяне, както изисква чл. 33–34 от GDPR.',
      ],
    },
  },
  {
    id: 'children',
    title: { en: '11. Children', bg: '11. Деца' },
    body: {
      en: [
        'Octolio is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16 without verifiable parental consent, as required by Article 8 GDPR. If you believe we have collected data from a child, please contact ' + CONTACT_EMAIL + ' and we will delete it promptly.',
      ],
      bg: [
        'Octolio не е предназначен за деца под 16-годишна възраст. Не събираме съзнателно лични данни от деца под 16 години без проверимо родителско съгласие, както изисква чл. 8 от GDPR. Ако смяташ, че сме събрали данни от дете, моля свържи се на ' + CONTACT_EMAIL + ' и ще ги изтрием своевременно.',
      ],
    },
  },
  {
    id: 'changes',
    title: { en: '12. Changes to This Policy', bg: '12. Промени в тази Политика' },
    body: {
      en: [
        'We may update this Privacy Policy to reflect changes to our service or applicable law. Material changes will be communicated via email or in-app notification at least 30 days before they take effect.',
        `Last updated: ${LAST_UPDATED}.`,
      ],
      bg: [
        'Може да актуализираме тази Политика за поверителност, за да отразим промени в услугата или приложимото право. Съществени промени ще бъдат съобщавани по имейл или чрез нотификация в приложението поне 30 дни преди влизане в сила.',
        `Последна актуализация: ${LAST_UPDATED}.`,
      ],
    },
  },
  {
    id: 'contact',
    title: { en: '13. Contact', bg: '13. Контакт' },
    body: {
      en: [
        `Controller: ${COMPANY_NAME}, ${COMPANY_ADDRESS}.`,
        `Privacy questions: ${CONTACT_EMAIL}.`,
        `Data Protection Officer: ${DPO_EMAIL}.`,
      ],
      bg: [
        `Администратор на данни: ${COMPANY_NAME}, ${COMPANY_ADDRESS}.`,
        `Въпроси за поверителност: ${CONTACT_EMAIL}.`,
        `Длъжностно лице по защита на данните: ${DPO_EMAIL}.`,
      ],
    },
  },
];

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} style={{ color: 'hsl(var(--c-fg))' }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function Privacy() {
  const { lang } = useLang();

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12" style={{ zIndex: 1 }}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: 'hsl(var(--c-primary))' }}
        >
          ← {lang === 'en' ? 'Back to home' : 'Обратно към началото'}
        </Link>

        <header className="mb-10">
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-3"
            style={{ color: 'hsl(var(--c-fg))' }}
          >
            {lang === 'en' ? 'Privacy Policy' : 'Политика за поверителност'}
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? 'Last updated: ' : 'Последна актуализация: '}
            {LAST_UPDATED}
          </p>
        </header>

        <nav className="glass-card rounded-2xl p-5 mb-8">
          <p
            className="text-xs uppercase tracking-wide font-semibold mb-3"
            style={{ color: 'hsl(var(--c-fg-muted))' }}
          >
            {lang === 'en' ? 'Contents' : 'Съдържание'}
          </p>
          <ol className="space-y-1.5">
            {SECTIONS.map((s) => (
              <li key={s.id} className="text-sm">
                <a
                  href={`#${s.id}`}
                  style={{ color: 'hsl(var(--c-primary))' }}
                  className="hover:underline"
                >
                  {s.title[lang]}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: 'hsl(var(--c-fg))' }}
              >
                {s.title[lang]}
              </h2>
              <div className="space-y-3 leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {s.body[lang].map((para, i) => (
                  <p key={i}>{renderInline(para)}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <footer className="mt-16 pt-8 border-t" style={{ borderColor: 'hsl(var(--c-fg)/0.08)' }}>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Questions about this policy? '
              : 'Въпроси за тази политика? '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'hsl(var(--c-primary))' }}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <div className="mt-4 text-sm flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/faq" style={{ color: 'hsl(var(--c-primary))' }}>
              {lang === 'en' ? 'FAQ' : 'Често задавани въпроси'}
            </Link>
            <Link to="/" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Home' : 'Начало'}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
