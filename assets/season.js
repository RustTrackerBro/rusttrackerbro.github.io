// Аватар по сезону и празднику — тот же календарь, что у бота (rusttracker/core/design.py: design_for).
// Картинки — assets/avatars/<вариант>.jpg (256×256). Меняются <img> с /assets/avatar.png на странице.
(function () {
  "use strict";
  var LUNAR = { 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23], 2032: [2, 11],
    2033: [1, 31], 2034: [2, 19], 2035: [2, 8] };
  var SEASONS = { 12: "winter", 1: "winter", 2: "winter", 3: "spring", 4: "spring", 5: "spring", 6: "summer",
    7: "summer", 8: "summer", 9: "autumn", 10: "autumn", 11: "autumn" };
  function day(y, m, d) { return Date.UTC(y, m - 1, d) / 86400000; }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      month = Math.floor((h + l - 7 * m + 114) / 31), dd = ((h + l - 7 * m + 114) % 31) + 1;
    return day(y, month, dd);
  }
  function near(t, target, before, after) { return target - before <= t && t <= target + after; }
  function variant(y, m, d) {
    var t = day(y, m, d), out = [];
    if ((m === 12 && d >= 20) || (m === 1 && d <= 10)) out.push("new_year");
    if ((m === 10 && d >= 24) || (m === 11 && d === 1)) out.push("halloween");
    if (near(t, easter(y), 3, 1)) out.push("easter");
    if (LUNAR[y] && near(t, day(y, LUNAR[y][0], LUNAR[y][1]), 2, 5)) out.push("lunar_new_year");
    if (m === 2 && d >= 12 && d <= 15) out.push("valentine");
    if (near(t, day(y, 2, 8), 1, 1)) out.push("birthday");  // день рождения Rust — 8 февраля
    if (m === 4 && d === 1) out.push("april_fools");
    return out.length ? out[0] : SEASONS[m];
  }
  window.rtbSeason = variant;  // для проверки
  var now = new Date(), key = variant(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var imgs = document.querySelectorAll('img[src$="assets/avatar.png"]');
  for (var n = 0; n < imgs.length; n++) {
    var src = imgs[n].getAttribute("src");
    imgs[n].setAttribute("src", src.replace(/assets\/avatar\.png$/, "assets/avatars/" + key + ".jpg"));
  }
})();
