// Правовые страницы сайта: правила, конфиденциальность, возвраты.
// Документы — на английском и русском (на остальных языках сайта показывается английская версия с пометкой).
// Сверять с ботом: /terms и /privacy (rusttracker/i18n/locales/*.toml, разделы [terms] и [privacy]).
// Нельзя: называть источники данных и способ отслеживания, писать про криптовалюту и про то, где дешевле.
// Разметка тела: строка «• …» — пункт списка; `…` — команда; {contact} — как связаться (config.js → CONTACT_EMAIL).
window.RTB_LEGAL_UPDATED = "2026-10-19";

window.RTB_LEGAL_UI = {
  en: { name: "English", terms: "Terms of Service", privacy: "Privacy Policy", refunds: "Refund Policy", home: "Home",
        updated: "Last updated: {d}", fallback: "",
        contact_bot: "the `/support` command in the bot (Telegram or Discord)", contact_mail: "or email {m}",
        legal: "Rust is a trademark of Facepunch Studios. This project is not affiliated with Facepunch." },
  ru: { name: "Русский", terms: "Правила сервиса", privacy: "Конфиденциальность", refunds: "Возвраты", home: "Главная",
        updated: "Обновлено: {d}", fallback: "",
        contact_bot: "команда `/support` в боте (Telegram или Discord)", contact_mail: "или почта {m}",
        legal: "Rust — товарный знак Facepunch Studios. Проект не связан с Facepunch." },
  es: { name: "Español", terms: "Términos del servicio", privacy: "Privacidad", refunds: "Reembolsos", home: "Inicio",
        updated: "Actualizado: {d}", fallback: "Este documento está disponible en inglés y ruso. Se muestra la versión en inglés.",
        legal: "Rust es una marca de Facepunch Studios. Este proyecto no está relacionado con Facepunch." },
  fr: { name: "Français", terms: "Conditions d’utilisation", privacy: "Confidentialité", refunds: "Remboursements", home: "Accueil",
        updated: "Mis à jour : {d}", fallback: "Ce document est disponible en anglais et en russe. La version anglaise est affichée.",
        legal: "Rust est une marque de Facepunch Studios. Ce projet n’est pas affilié à Facepunch." },
  uk: { name: "Українська", terms: "Правила сервісу", privacy: "Конфіденційність", refunds: "Повернення", home: "Головна",
        updated: "Оновлено: {d}", fallback: "Документ доступний англійською та російською. Показано англійську версію.",
        legal: "Rust — торговельна марка Facepunch Studios. Проєкт не пов’язаний з Facepunch." },
  de: { name: "Deutsch", terms: "Nutzungsbedingungen", privacy: "Datenschutz", refunds: "Erstattungen", home: "Startseite",
        updated: "Aktualisiert: {d}", fallback: "Dieses Dokument gibt es auf Englisch und Russisch. Angezeigt wird die englische Version.",
        legal: "Rust ist eine Marke von Facepunch Studios. Dieses Projekt steht in keiner Verbindung zu Facepunch." },
  tr: { name: "Türkçe", terms: "Hizmet Şartları", privacy: "Gizlilik", refunds: "İadeler", home: "Ana sayfa",
        updated: "Güncellendi: {d}", fallback: "Bu belge İngilizce ve Rusça olarak mevcuttur. İngilizce sürüm gösteriliyor.",
        legal: "Rust, Facepunch Studios'un ticari markasıdır. Bu proje Facepunch ile bağlantılı değildir." },
  pt: { name: "Português", terms: "Termos de serviço", privacy: "Privacidade", refunds: "Reembolsos", home: "Início",
        updated: "Atualizado: {d}", fallback: "Este documento está disponível em inglês e russo. A versão em inglês é exibida.",
        legal: "Rust é uma marca registrada da Facepunch Studios. Este projeto não é afiliado à Facepunch." },
};

window.RTB_LEGAL_DOCS = {
  en: {
    terms: [
      { h: "1. About the service", b: [
        "RustTrackerBro (the “Service”) is the bot @RustTrackerBroBot in Telegram, the RustTrackerBro app in Discord and the website rusttrackerbro.com. The Service is run by an independent developer (“we”). It is not affiliated with Facepunch Studios, Valve, Telegram or Discord.",
        "The Service shows the activity of Rust players on game servers — when they connect and leave, session history and statistics — and sends notifications. It also offers Rust+ notifications, clan tools and a player board.",
      ] },
      { h: "2. Your account", b: [
        "Your account is tied to your Telegram or Discord account. You can link a Telegram and a Discord account into one account inside the bot.",
        "• One person — one account. Creating several accounts to get free features again is not allowed.",
        "• You are responsible for what is done through your account.",
        "• The Service is not intended for persons under 16.",
      ] },
      { h: "3. Plans and payment", b: [
        "The Free plan is free. Paid plans (Bronze, Silver, Gold, Platinum, Diamond, Clan) and the “Invisible” features are paid for a fixed period. Current prices are shown in the bot.",
        "• In Telegram, payment is made with Telegram Stars. A monthly subscription in Telegram may renew automatically; you can turn renewal off at any time in the bot, and the paid period is kept.",
        "• In Discord, payment is made on the payment page of an external payment provider. Every period is a one-time payment without auto-renewal.",
        "• Access opens as soon as the payment is confirmed and lasts until the date shown in `/premium`.",
        "• New users can try Gold for free once (up to 3 days).",
        "If you get days of different plans at the same time (for example, a purchase and a gift), the higher plan is active and the days of the other plan wait in reserve; nothing is lost.",
      ] },
      { h: "4. “Invisible” and “Invisible+”", b: [
        "These paid features hide a confirmed Steam account inside the Service: “Invisible” — from everyone except Diamond subscribers, “Invisible+” — from everyone. Privacy applies only inside the Service. After the paid period ends, data collection and display resume as usual. Sessions recorded by Diamond users while the basic “Invisible” was active may become visible to other users after it is turned off. The hidden account can be changed at most once every 30 days.",
      ] },
      { h: "5. Bonuses", b: [
        "Bonus points 🪙 are earned through the referral and partner programs and giveaways and can be used only to pay for a subscription, fully or partly — in Telegram and in Discord. In Discord, 1 🪙 is worth as much as 1 ⭐ of the price of the same period; if bonuses do not cover the full price, at least $0.50 remains to pay. Bonuses cannot be withdrawn or exchanged for money and expire 3 months after they are credited; a reminder is sent 7 days before.",
      ] },
      { h: "6. Rules of use", b: [
        "You must not:",
        "• use the Service to stalk, threaten, harass or pressure anyone;",
        "• bypass technical limits (including adding and removing players over and over);",
        "• abuse free features with several accounts, interfere with the Service or resell access without our permission.",
        "If these rules are broken, we may restrict or block access without compensation for the unused period.",
      ] },
      { h: "7. Availability and liability", b: [
        "The Service is provided “as is”. Game data comes from third parties and may be delayed, incomplete or temporarily unavailable; we do not guarantee that every event will be detected. If the bot is unavailable for a long time through our fault, active subscriptions are extended by the downtime.",
        "To the extent permitted by law, we are not liable for indirect losses, including in-game losses, arising from use of the Service.",
      ] },
      { h: "8. Refunds", b: [
        "See the Refund Policy.",
      ] },
      { h: "9. Support and changes", b: [
        "Contact: {contact}. For payment problems use `/paysupport`.",
        "We may change these terms. The current version is published on this page and in the bot (`/terms`) and applies from the moment of publication. Using the Service or making a purchase means you accept the current terms.",
      ] },
    ],
    privacy: [
      { h: "1. Who we are", b: [
        "This policy explains how RustTrackerBro (the bot @RustTrackerBroBot in Telegram, the RustTrackerBro app in Discord and the website rusttrackerbro.com) processes personal data. The Service is run by an independent developer (“we”). Contact: {contact}.",
      ] },
      { h: "2. Data about users of the Service", b: [
        "• Telegram or Discord account ID, name and language as provided by the platform.",
        "• Your settings, the players, servers and clans you track, and your notifications.",
        "• Subscription and payment records: plan, period, amount, date and the payment ID. We never receive card or wallet credentials.",
        "• If you connect Rust+: encrypted access tokens, paired servers and devices.",
        "• Player board: your listings, responses, ratings and confirmed Steam account. Your contacts are shown only to the other side of an accepted response.",
        "• Support messages and technical logs; anonymous usage statistics of the bot’s screens (kept up to 90 days).",
      ] },
      { h: "3. Data about Rust players", b: [
        "To provide the Service we process publicly available information about Rust players and game servers from publicly accessible sources: SteamID, public nickname and avatar, which server a player is on and when, session history and statistics derived from it. We do not access accounts, passwords or private messages.",
      ] },
      { h: "4. Why we process data", b: [
        "• To provide the Service you asked for (performance of a contract): accounts, tracking, notifications, payments.",
        "• Our legitimate interest in running a game-statistics service based on public game activity, and in preventing abuse and fraud.",
        "• To meet legal obligations (for example, payment records).",
        "We do not sell personal data and do not use it for advertising profiles.",
      ] },
      { h: "5. Who receives data", b: [
        "• Telegram and Discord — to deliver messages.",
        "• Hosting provider in the EU (Netherlands) where the Service runs; encrypted backups are stored with a cloud storage provider.",
        "• Payment providers — to process payments.",
        "• Cloudflare — website delivery and protection.",
        "Data may be processed outside your country; we use providers that apply appropriate safeguards.",
      ] },
      { h: "6. How long we keep data", b: [
        "• Session history is kept as long as needed for the plans of the users who track the player (from 30 days up to unlimited for the highest plan).",
        "• Account data is kept while you use the Service; you can delete your tracked players at any time with `/forget`, and Rust+ data with “Disconnect Rust+”.",
        "• Payment records are kept as long as required for accounting and disputes.",
        "• Backups are kept for a limited time and deleted by rotation.",
      ] },
      { h: "7. Your rights", b: [
        "Depending on your country (including the EU GDPR), you may request access to your data, correction, deletion, restriction, data portability, and object to processing based on legitimate interest. This also applies to Rust players whose public game data is processed by the Service.",
        "Send requests via {contact}. For data about a Steam account we will ask you to confirm that the account is yours. We answer within one month. You may also complain to your data protection authority.",
      ] },
      { h: "8. Security", b: [
        "Access to the server and the database is limited to the administrator; Rust+ tokens and backups are encrypted.",
      ] },
      { h: "9. Website and cookies", b: [
        "The website does not use advertising or tracking cookies. It stores only your selected language in your browser.",
      ] },
      { h: "10. Changes", b: [
        "We may update this policy; the current version is always on this page.",
      ] },
    ],
    refunds: [
      { h: "1. General rule", b: [
        "Subscriptions are digital services that start immediately after payment. By paying, you agree that the service starts at once and acknowledge that, once it has started, the right of withdrawal no longer applies. Money for a paid period is therefore not refunded, including when you stop using the Service early.",
        "To try the Service before paying, use the Free plan and the free Gold trial.",
      ] },
      { h: "2. When we fix or refund", b: [
        "• You were charged twice for the same order.",
        "• Payment went through but the plan was not activated, or the wrong plan was activated, and we cannot fix it.",
        "• The Service was unavailable for a long time through our fault — we extend active subscriptions by the downtime; if that is not possible, we discuss a refund.",
        "Where a refund is made, it is made by the same method as the payment where technically possible (for Telegram Stars — back to your Telegram account). Days bought with bonuses are returned as bonuses.",
      ] },
      { h: "3. Account blocks", b: [
        "If access is blocked for breaking the Terms of Service, the unused period is not compensated.",
      ] },
      { h: "4. How to ask", b: [
        "Use `/paysupport` in the bot or {contact}. Describe the problem and the date of payment. We reply as soon as possible, usually within 3 days.",
      ] },
    ],
  },
  ru: {
    terms: [
      { h: "1. О сервисе", b: [
        "RustTrackerBro («Сервис») — это бот @RustTrackerBroBot в Telegram, приложение RustTrackerBro в Discord и сайт rusttrackerbro.com. Сервис ведёт независимый разработчик («мы»). Сервис не связан с Facepunch Studios, Valve, Telegram и Discord.",
        "Сервис показывает активность игроков Rust на игровых серверах — время входа и выхода, историю сессий и статистику — и присылает уведомления. Также есть уведомления Rust+, инструменты для кланов и биржа игроков.",
      ] },
      { h: "2. Аккаунт", b: [
        "Аккаунт привязан к вашему аккаунту Telegram или Discord. Telegram и Discord можно связать в один аккаунт внутри бота.",
        "• Один человек — один аккаунт. Создавать несколько аккаунтов, чтобы снова получать бесплатные возможности, нельзя.",
        "• Вы отвечаете за действия, совершённые через ваш аккаунт.",
        "• Сервис не предназначен для лиц младше 16 лет.",
      ] },
      { h: "3. Тарифы и оплата", b: [
        "Тариф Free бесплатный. Платные уровни (Bronze, Silver, Gold, Platinum, Diamond, Clan) и «Невидимка» оплачиваются на срок. Актуальные цены показаны в боте.",
        "• В Telegram оплата — Telegram Stars. Месячная подписка в Telegram может продлеваться автоматически; автопродление можно выключить в боте в любой момент, оплаченный срок сохраняется.",
        "• В Discord оплата — на странице оплаты внешнего платёжного сервиса. Каждый срок — разовый платёж без автопродления.",
        "• Доступ открывается сразу после подтверждения оплаты и действует до даты, указанной в `/premium`.",
        "• Новым пользователям один раз доступен бесплатный Gold (до 3 дней).",
        "Если у вас одновременно есть дни разных уровней (например, покупка и подарок), действует более высокий уровень, а дни другого ждут в запасе — ничего не теряется.",
      ] },
      { h: "4. «Невидимка» и «Невидимка+»", b: [
        "Платные функции скрывают подтверждённый аккаунт Steam внутри Сервиса: «Невидимка» — от всех, кроме подписчиков Diamond, «Невидимка+» — от всех. Приватность действует только внутри Сервиса. После окончания оплаченного срока сбор и показ данных возобновляются. Сессии, записанные пользователями Diamond во время базовой «Невидимки», после её отключения могут стать видны остальным. Скрываемый аккаунт можно менять не чаще раза в 30 дней.",
      ] },
      { h: "5. Бонусы", b: [
        "Бонусы 🪙 начисляются по реферальной и партнёрской программам и в розыгрышах и тратятся только на оплату подписки — полностью или частично, в Telegram и в Discord. В Discord 1 🪙 стоит столько же, сколько 1 ⭐ цены того же срока; если бонусов не хватает на всю цену, к оплате остаётся не меньше $0.50. Бонусы нельзя вывести или обменять на деньги; они сгорают через 3 месяца после начисления, напоминание приходит за 7 дней.",
      ] },
      { h: "6. Правила использования", b: [
        "Запрещается:",
        "• использовать Сервис для преследования, угроз, травли или давления на кого-либо;",
        "• обходить технические ограничения (в том числе многократно добавлять и удалять игроков);",
        "• злоупотреблять бесплатными возможностями через несколько аккаунтов, мешать работе Сервиса или перепродавать доступ без нашего разрешения.",
        "При нарушении правил доступ может быть ограничен или заблокирован без компенсации неиспользованного срока.",
      ] },
      { h: "7. Доступность и ответственность", b: [
        "Сервис предоставляется «как есть». Игровые данные поступают от третьих сторон и могут приходить с задержкой, быть неполными или временно недоступными; мы не гарантируем, что будет замечено каждое событие. Если бот долго недоступен по нашей вине, активные подписки продлеваются на время простоя.",
        "В пределах, допустимых законом, мы не отвечаем за косвенные потери, в том числе игровые, связанные с использованием Сервиса.",
      ] },
      { h: "8. Возвраты", b: [
        "См. правила возвратов.",
      ] },
      { h: "9. Поддержка и изменения", b: [
        "Связь: {contact}. По вопросам оплаты — `/paysupport`.",
        "Мы можем менять правила. Актуальная редакция публикуется на этой странице и в боте (`/terms`) и действует с момента публикации. Пользуясь Сервисом или совершая покупку, вы принимаете действующие правила.",
      ] },
    ],
    privacy: [
      { h: "1. Кто мы", b: [
        "Здесь описано, как RustTrackerBro (бот @RustTrackerBroBot в Telegram, приложение RustTrackerBro в Discord и сайт rusttrackerbro.com) обрабатывает персональные данные. Сервис ведёт независимый разработчик («мы»). Связь: {contact}.",
      ] },
      { h: "2. Данные пользователей Сервиса", b: [
        "• ID аккаунта Telegram или Discord, имя и язык — в том виде, как их передаёт платформа.",
        "• Ваши настройки, отслеживаемые игроки, серверы и кланы, уведомления.",
        "• Сведения о подписках и оплатах: уровень, срок, сумма, дата и номер платежа. Данные карт и кошельков мы не получаем.",
        "• Если подключён Rust+: зашифрованные токены доступа, привязанные серверы и устройства.",
        "• Биржа игроков: ваши объявления, отклики, оценки и подтверждённый аккаунт Steam. Контакты видит только другая сторона принятого отклика.",
        "• Обращения в поддержку и технические журналы; обезличенная статистика открытия экранов бота (хранится до 90 дней).",
      ] },
      { h: "3. Данные об игроках Rust", b: [
        "Для работы Сервиса мы обрабатываем общедоступные сведения об игроках и серверах Rust из общедоступных источников: SteamID, публичный ник и аватар, на каком сервере и когда находится игрок, а также история сессий и статистика на их основе. Мы не получаем доступ к аккаунтам, паролям и личной переписке.",
      ] },
      { h: "4. Зачем мы обрабатываем данные", b: [
        "• Чтобы оказывать Сервис, о котором вы попросили (исполнение договора): аккаунт, отслеживание, уведомления, оплата.",
        "• Наш законный интерес — работа сервиса игровой статистики на основе общедоступной игровой активности, защита от злоупотреблений и мошенничества.",
        "• Выполнение требований закона (например, учёт платежей).",
        "Мы не продаём персональные данные и не строим по ним рекламные профили.",
      ] },
      { h: "5. Кому передаются данные", b: [
        "• Telegram и Discord — для доставки сообщений.",
        "• Хостинг-провайдер в ЕС (Нидерланды), где работает Сервис; зашифрованные резервные копии хранятся у облачного хранилища.",
        "• Платёжные сервисы — для проведения оплаты.",
        "• Cloudflare — доставка и защита сайта.",
        "Данные могут обрабатываться за пределами вашей страны; мы пользуемся поставщиками, которые применяют надлежащие меры защиты.",
      ] },
      { h: "6. Сколько хранятся данные", b: [
        "• История сессий хранится столько, сколько нужно для тарифов пользователей, отслеживающих игрока (от 30 дней до бессрочно для старшего тарифа).",
        "• Данные аккаунта хранятся, пока вы пользуетесь Сервисом; отслеживаемых игроков можно удалить в любой момент командой `/forget`, данные Rust+ — кнопкой «Отключить Rust+».",
        "• Сведения об оплатах хранятся столько, сколько нужно для учёта и споров.",
        "• Резервные копии хранятся ограниченное время и удаляются по ротации.",
      ] },
      { h: "7. Ваши права", b: [
        "В зависимости от вашей страны (в том числе по GDPR в ЕС) вы можете запросить доступ к своим данным, их исправление, удаление, ограничение обработки, перенос, а также возразить против обработки на основании законного интереса. Это относится и к игрокам Rust, чьи общедоступные игровые данные обрабатывает Сервис.",
        "Запросы направляйте через {contact}. По данным аккаунта Steam мы попросим подтвердить, что аккаунт ваш. Отвечаем в течение месяца. Вы также можете подать жалобу в надзорный орган по защите данных.",
      ] },
      { h: "8. Безопасность", b: [
        "Доступ к серверу и базе есть только у администратора; токены Rust+ и резервные копии зашифрованы.",
      ] },
      { h: "9. Сайт и cookie", b: [
        "Сайт не использует рекламные и отслеживающие cookie. В браузере сохраняется только выбранный язык.",
      ] },
      { h: "10. Изменения", b: [
        "Мы можем обновлять эту политику; актуальная редакция всегда на этой странице.",
      ] },
    ],
    refunds: [
      { h: "1. Общее правило", b: [
        "Подписка — цифровая услуга, которая начинает оказываться сразу после оплаты. Оплачивая, вы соглашаетесь на немедленное начало оказания услуги и признаёте, что после этого право на отказ от покупки не действует. Поэтому деньги за оплаченный срок не возвращаются, в том числе если вы перестали пользоваться Сервисом раньше.",
        "Попробовать Сервис до оплаты можно на тарифе Free и в бесплатном пробном Gold.",
      ] },
      { h: "2. Когда мы исправляем или возвращаем", b: [
        "• С вас дважды списали оплату за один и тот же заказ.",
        "• Оплата прошла, но уровень не включился или включился не тот, и исправить это мы не можем.",
        "• Сервис долго не работал по нашей вине — продлеваем активные подписки на время простоя; если это невозможно, обсуждаем возврат.",
        "Возврат делается тем же способом, что и оплата, если это технически возможно (Telegram Stars — обратно на ваш аккаунт Telegram). Дни, оплаченные бонусами, возвращаются бонусами.",
      ] },
      { h: "3. Блокировка аккаунта", b: [
        "Если доступ заблокирован за нарушение правил сервиса, неиспользованный срок не компенсируется.",
      ] },
      { h: "4. Как обратиться", b: [
        "Команда `/paysupport` в боте или {contact}. Опишите проблему и дату оплаты. Отвечаем как можно быстрее, обычно в течение 3 дней.",
      ] },
    ],
  },
};
