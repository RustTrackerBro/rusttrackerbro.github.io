// Страницы справочника (/raid/<цель>/, /item/<предмет>/): ссылки на правовые страницы на языке страницы
// и запоминание выбранного языка. Текст страницы — статический (tools/build_site.py в репозитории бота).
(function () {
  "use strict";
  var lang = document.documentElement.lang || "en";
  if (window.RTB_LEGAL_LINKS) window.RTB_LEGAL_LINKS(lang);
  document.querySelectorAll("#langs a").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("rtb_lang", a.dataset.lang || "en"); } catch (e) {}
    });
  });
})();
