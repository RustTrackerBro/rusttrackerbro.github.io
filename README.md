# rusttrackerbro.com

Сайт бота Rust Tracker Bro (Discord и Telegram) на GitHub Pages.

- `/` — описание и кнопки «Добавить в Discord» / «Открыть в Telegram»; `?ref=<id>` — приглашение, `?p=<код>` — партнёр.
- `/pricing/` — тарифы (цены и лимиты — `TIERS` в `pricing/index.html`, тексты — `pricing/texts.js`).
- `/raid/`, `/craft/`, `/recycle/`, `/genes/` — калькуляторы (`calc/`; `calc/data.js` генерируется из репозитория бота).
- `/discord`, `/telegram` — переходы к боту; `/legal/terms/`, `/legal/privacy/`, `/legal/refunds/` — правовые страницы.
- Поиск: `robots.txt`, `sitemap.xml` (новую страницу — добавить), `<link rel="canonical">` на страницах.
- Настройки — `config.js`; тексты — `i18n.js`, `pricing/texts.js`, `calc/ui.js`, `legal/texts.js` (8 языков).
- Защита: на каждой странице — Content-Security-Policy (только свои скрипты, стили, картинки и шрифты); весь текст
  выводится как текст (без innerHTML), параметры ссылок разбираются строго.

Шрифт Russo One — лицензия OFL (`assets/RussoOne-OFL.txt`).
