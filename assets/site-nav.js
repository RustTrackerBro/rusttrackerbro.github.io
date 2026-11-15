/* Шапка сайта на языке страницы — tools/site_header.py */
window.RTB_NAV = {"en": {"p": "", "n": {"rustplus": "Rust+", "raid": "Raid", "craft": "Craft", "recycle": "Recycle", "genes": "Genes", "cctv": "CCTV codes", "force-wipe": "Global wipe", "pricing": "Pricing"}}, "ru": {"p": "/ru", "n": {"rustplus": "Rust+", "raid": "Рейд", "craft": "Крафт", "recycle": "Переработка", "genes": "Гены", "cctv": "Коды камер", "force-wipe": "Глобал вайп", "pricing": "Тарифы"}}, "es": {"p": "/es", "n": {"rustplus": "Rust+", "raid": "Raid", "craft": "Crafteo", "recycle": "Reciclaje", "genes": "Genes", "cctv": "Códigos CCTV", "force-wipe": "Wipe global", "pricing": "Precios"}}, "fr": {"p": "/fr", "n": {"rustplus": "Rust+", "raid": "Raid", "craft": "Craft", "recycle": "Recyclage", "genes": "Gènes", "cctv": "Codes CCTV", "force-wipe": "Wipe global", "pricing": "Tarifs"}}, "uk": {"p": "/uk", "n": {"rustplus": "Rust+", "raid": "Рейд", "craft": "Крафт", "recycle": "Переробка", "genes": "Гени", "cctv": "Коди камер", "force-wipe": "Глобал вайп", "pricing": "Тарифи"}}, "de": {"p": "/de", "n": {"rustplus": "Rust+", "raid": "Raid", "craft": "Craften", "recycle": "Recyceln", "genes": "Gene", "cctv": "CCTV-Codes", "force-wipe": "Globaler Wipe", "pricing": "Preise"}}, "tr": {"p": "/tr", "n": {"rustplus": "Rust+", "raid": "Raid", "craft": "Üretim", "recycle": "Geri dönüşüm", "genes": "Genler", "cctv": "CCTV kodları", "force-wipe": "Global wipe", "pricing": "Fiyatlar"}}, "pt": {"p": "/pt", "n": {"rustplus": "Rust+", "raid": "Raid", "craft": "Craft", "recycle": "Reciclagem", "genes": "Genes", "cctv": "Códigos CCTV", "force-wipe": "Wipe global", "pricing": "Preços"}}};
window.RTB_NAV_SET = function (lang, name) {
  var d = window.RTB_NAV[lang] || window.RTB_NAV.en;
  document.querySelectorAll("header.sh [data-sh]").forEach(function (a) {
    var k = a.getAttribute("data-sh"); a.href = d.p + "/" + k + "/"; a.querySelector("span").textContent = d.n[k];
  });
  var br = document.querySelector("header.sh .sh-br"); if (br) br.href = d.p + "/";
  var cur = document.getElementById("sh-cur"); if (cur && name) cur.textContent = name;
};
(function () {  // на телефоне строка разделов листается вбок — показать текущий раздел
  var r = document.querySelector("header.sh .sh-row"), a = r && r.querySelector("[aria-current]");
  if (a && r.scrollWidth > r.clientWidth) r.scrollLeft = a.offsetLeft - (r.clientWidth - a.offsetWidth) / 2;
})();
