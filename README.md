# rusttrackerbro.com

Визитка бота Rust Tracker Bro (Discord и Telegram) на GitHub Pages.

- `/` — описание и кнопки «Добавить в Discord» / «Открыть в Telegram»; `?ref=<id>` — приглашение
  (Telegram открывается с `start=ref_<id>`, для Discord показывается команда `/start ref_<id>`), `?p=<код>` — партнёр.
- `/pricing/` — тарифы и цены (USD, как в Discord-боте), переключатель срока 1/3/6/12 мес. со скидкой, кнопки «Купить в Discord»,
  «Как купить» и вопросы. Оплата — в самом боте; про способ оплаты на сайте не пишем. Цены и лимиты — в `pricing/index.html`
  (`TIERS`), сверять с ботом (`core/usdt.py`, `core/tiers.py`); тексты — `pricing/texts.js`.
- `/discord` — сразу добавление бота в Discord, `/telegram` — сразу бот в Telegram (`?ref=` сохраняется).
- Настройки — `config.js` (имя бота в Telegram, Application ID Discord), тексты — `i18n.js` (ru, en, es, fr, uk).

Оформление — в цветах бренда бота: аватар в неоновом кольце, надпись RUST TRACKER / BROBOT (шрифт Russo One,
лицензия OFL — `assets/RussoOne-OFL.txt`), сталь / «кость» / ржавчина / неон. `assets/og.jpg` — картинка превью
ссылки в Discord и Telegram, `assets/favicon.png` — иконка вкладки.
