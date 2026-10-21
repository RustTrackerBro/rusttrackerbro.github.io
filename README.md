# rusttrackerbro.com

Сайт бота Rust Tracker Bro (Discord и Telegram) на GitHub Pages.

- `/` — описание и кнопки «Добавить в Discord» / «Открыть в Telegram»; `?ref=<id>` — приглашение, `?p=<код>` — партнёр.
- Промо-ролик на главной — `assets/promo/`: `ru_*` (русская озвучка — только для языка ru), `en_*` (все остальные языки);
  `*_9x16` — экран до 620 px, `*_16x9` — шире; `.jpg` — обложки. Загружается только по нажатию (`preload="none"`),
  меняется вместе с языком страницы. Под ним — ссылка на страницу просмотра `/video/` (en) или `/ru/video/` (ru):
  видео как основное содержимое, главы, разметка VideoObject и запись в `sitemap.xml` — их собирает `tools/build_site.py`. Ролики 720p, H.264 + AAC (собраны из промо 9:16 / 16:9, озвучка «геймер», музыка rock).
- `/pricing/` — тарифы (цены и лимиты — `TIERS` в `pricing/index.html`, тексты — `pricing/texts.js`).
- `/raid/`, `/craft/`, `/recycle/`, `/genes/` — калькуляторы (`calc/`), английские; версии на других языках —
  `/ru/raid/`, `/de/genes/` … (`hreflang` между ними). Справочник: `/raid/<цель>/` (сколько взрывчатки и серы) и
  `/item/<предмет>/` (крафт и переработка) на всех языках.
- Эти страницы, `calc/data.js` и `sitemap.xml` генерирует `tools/build_site.py` из репозитория бота — руками не править,
  а пересобрать: `python -I tools/build_site.py ../rusttrackerbro.github.io`.
- `/discord`, `/telegram` — переходы к боту; `/legal/terms/`, `/legal/privacy/`, `/legal/refunds/` — правовые страницы.
- Поиск: `robots.txt`, `sitemap.xml` (со связками языков; новую страницу вне генератора — добавить в `tools/build_site.py`),
  `<link rel="canonical">` на страницах.
- Настройки — `config.js`; тексты — `i18n.js`, `pricing/texts.js`, `calc/ui.js`, `legal/texts.js` (8 языков).
- Защита: на каждой странице — Content-Security-Policy (только свои скрипты, стили, картинки и шрифты); весь текст
  выводится как текст (без innerHTML), параметры ссылок разбираются строго.

Шрифт Russo One — лицензия OFL (`assets/RussoOne-OFL.txt`).
