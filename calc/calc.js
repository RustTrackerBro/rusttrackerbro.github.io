// Калькуляторы рейда, крафта и переработки. Страница выбирается атрибутом data-page у <body>.
// Данные — calc/data.js (выгрузка из бота: tools/export_site_data.py), тексты — calc/ui.js.
(function () {
  "use strict";
  var T = window.RTB_CALC_UI, D = window.RTB_CALC, cfg = window.RTB || {};
  var LANGS = ["en", "ru", "es", "fr", "uk", "de", "tr", "pt"];
  var PAGE = document.body.getAttribute("data-page");
  var params = new URLSearchParams(location.search);
  var lang = pickLang();
  var MAX_QTY = 1000;
  // Как в боте (bot/handlers/calc.py): популярные предметы для кнопок.
  var POPULAR = {
    c: ["explosive.timed", "ammo.rocket.basic", "ammo.rifle.explosive", "explosive.satchel", "grenade.beancan",
        "gunpowder", "rifle.ak", "door.hinged.toptier", "wall.external.high.stone", "syringe.medical"],
    r: ["techparts", "metalpipe", "gears", "metalspring", "riflebody", "smgbody", "semibody", "sheetmetal",
        "roadsigns", "propanetank", "tarp", "rope"]
  };
  // «Дешевле всего» — из обычной взрывчатки, как команда !raid в игре (катапульта и миномёт — отдельная техника).
  var CHEAP = ["c4", "rocket", "satchel", "exp556", "beancan"];

  function pickLang() {
    var saved = null;
    try { saved = localStorage.getItem("rtb_lang"); } catch (e) {}
    var wanted = (params.get("lang") || saved || navigator.language || "en").slice(0, 2).toLowerCase();
    return T[wanted] ? wanted : "en";
  }
  function t(key, vars) {
    var s = (T[lang] && T[lang][key] != null) ? T[lang][key] : (T.en[key] || "");
    return vars ? s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; }) : s;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function fmt(v) {
    var r = Math.abs(v - Math.round(v)) < 0.05 ? Math.round(v) : Math.round(v * 10) / 10;
    try { return new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(r); } catch (e) { return String(r); }
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function norm(s) {
    return String(s || "").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  function month(iso) {
    var m = /^(\d{4})-(\d{2})/.exec(iso || "");
    if (!m) return "";
    var names = D.text[lang] || D.text.en;
    return (names["month_" + parseInt(m[2], 10)] || m[2]) + " " + m[1];
  }

  // ------------------------------------------------------------ предметы
  function item(sn) { return D.items[sn]; }
  function itemName(sn) {
    var it = item(sn);
    if (!it) return sn;
    return (lang === "ru" || lang === "uk") && it.ru ? it.ru : it.en;
  }
  function label(sn) {
    var short = D.short[lang];
    if (short && short[sn]) return cap(short[sn]);
    if (lang === "uk" && D.short.ru[sn]) return cap(D.short.ru[sn]);
    return cap(itemName(sn));
  }
  var INDEX = null;
  function index() {
    if (INDEX) return INDEX;
    INDEX = Object.keys(D.items).map(function (sn) {
      var it = D.items[sn];
      var texts = [it.en, it.ru, sn.replace(/\./g, " ")].concat(it.a || []).filter(Boolean).map(norm);
      return { sn: sn, texts: texts };
    });
    return INDEX;
  }
  function search(query, mode) {
    var q = norm(query);
    if (!q) return [];
    var words = q.split(" ");
    var found = [];
    index().forEach(function (row) {
      var it = D.items[row.sn];
      if (!it[mode]) return;
      var score = 9;
      row.texts.forEach(function (text) {
        if (text === q) score = Math.min(score, 0);
        else if (text.indexOf(q) === 0) score = Math.min(score, 1);
        else if (words.every(function (w) { return text.indexOf(w) >= 0; })) score = Math.min(score, 2);
      });
      if (score < 9) found.push({ sn: row.sn, score: score, len: itemName(row.sn).length });
    });
    found.sort(function (a, b) { return a.score - b.score || a.len - b.len || (a.sn < b.sn ? -1 : 1); });
    return found.slice(0, 10).map(function (f) { return f.sn; });
  }

  function craftCalc(sn, qty) {
    var it = item(sn), per = Math.max(1, it.n || 1), crafts = Math.ceil(Math.max(1, qty) / per);
    var parts = it.c.map(function (p) { return [p[0], p[1] * crafts]; });
    var raw = null;
    if (it.c.some(function (p) { return D.expand.indexOf(p[0]) >= 0; })) {
      raw = {};
      var add = function (s, amount, depth) {
        var sub = item(s);
        if (D.expand.indexOf(s) >= 0 && sub && sub.c && depth < 4) {
          var k = amount / Math.max(1, sub.n || 1);
          sub.c.forEach(function (p) { add(p[0], p[1] * k, depth + 1); });
          return;
        }
        raw[s] = (raw[s] || 0) + amount;
      };
      it.c.forEach(function (p) { add(p[0], p[1] * crafts, 0); });
    }
    return { parts: parts, made: crafts * per, per: per, wb: it.wb || 0, seconds: (it.t || 0) * crafts, raw: raw };
  }
  function duration(sec) {
    sec = Math.round(sec);
    if (sec < 120) return t("sec", { n: Math.max(1, sec) });
    var m = Math.floor(sec / 60);
    if (m < 120) return t("min", { n: m });
    return t("hm", { h: Math.floor(m / 60), m: m % 60 });
  }
  function listBox(title, note, rows) {
    var box = el("div", "box"), h = el("h3", null, title);
    if (note) { h.appendChild(document.createTextNode(" ")); h.appendChild(el("small", null, "· " + note)); }
    box.appendChild(h);
    var ul = el("ul", "list");
    rows.forEach(function (r) {
      var li = el("li"), left = el("span", null, r[0]);
      if (r[2]) { left.appendChild(el("br")); left.appendChild(el("small", "muted", r[2])); }  // пояснение под названием
      li.appendChild(left); li.appendChild(el("b", null, r[1])); ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  // ------------------------------------------------------------ крафт и переработка
  function itemPage(mode) {
    var input = document.getElementById("q"), qtyIn = document.getElementById("qty"), results = document.getElementById("results");
    var out = document.getElementById("out"), chips = document.getElementById("chips");
    var state = { sn: null, qty: 1, active: -1, found: [] };
    var start = params.get("item");
    if (start && item(start) && item(start)[mode]) state.sn = start;
    state.qty = clampQty(params.get("qty"));
    qtyIn.value = state.qty;

    function clampQty(v) { var n = parseInt(v, 10); return isNaN(n) ? 1 : Math.max(1, Math.min(MAX_QTY, n)); }
    function saveUrl() {
      var p = new URLSearchParams(location.search);
      if (state.sn) p.set("item", state.sn); else p.delete("item");
      if (state.qty > 1) p.set("qty", state.qty); else p.delete("qty");
      var s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
    }
    function choose(sn) {
      state.sn = sn; input.value = itemName(sn); hideResults(); draw(); saveUrl();
    }
    function hideResults() { results.hidden = true; state.active = -1; input.setAttribute("aria-expanded", "false"); }
    function showResults() {
      clear(results);
      state.found = search(input.value, mode);
      if (!input.value.trim()) { hideResults(); return; }
      if (!state.found.length) {
        results.appendChild(el("li", null, t("nothing")));
      }
      state.found.forEach(function (sn, i) {
        var li = el("li"); li.setAttribute("role", "option"); li.id = "opt-" + i;
        li.setAttribute("aria-selected", String(i === state.active));
        li.appendChild(el("span", null, itemName(sn)));
        if ((lang === "ru" || lang === "uk") && item(sn).ru) li.appendChild(el("small", null, item(sn).en));
        li.addEventListener("mousedown", function (e) { e.preventDefault(); choose(sn); });
        results.appendChild(li);
      });
      results.hidden = false; input.setAttribute("aria-expanded", "true");
    }
    input.addEventListener("input", function () { state.active = -1; showResults(); });
    input.addEventListener("focus", function () { if (input.value && !state.sn) showResults(); });
    input.addEventListener("blur", function () { setTimeout(hideResults, 120); });
    input.addEventListener("keydown", function (e) {
      if (results.hidden) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var n = state.found.length;
        if (!n) return;
        if (state.active < 0) state.active = e.key === "ArrowDown" ? 0 : n - 1;
        else state.active = (state.active + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
        Array.prototype.forEach.call(results.children, function (li, i) { li.setAttribute("aria-selected", String(i === state.active)); });
      } else if (e.key === "Enter") {
        e.preventDefault();
        var pick = state.found[state.active >= 0 ? state.active : 0];
        if (pick) choose(pick);
      } else if (e.key === "Escape") { hideResults(); }
    });
    input.addEventListener("click", function () { input.select(); });
    qtyIn.addEventListener("input", function () { state.qty = clampQty(qtyIn.value); draw(); saveUrl(); });

    function drawChips() {
      clear(chips);
      chips.appendChild(el("span", "lbl", t("popular") + ":"));
      POPULAR[mode].filter(function (sn) { return item(sn) && item(sn)[mode]; }).forEach(function (sn) {
        var b = el("button", "chip", itemName(sn)); b.type = "button";
        b.setAttribute("aria-pressed", String(sn === state.sn));
        b.addEventListener("click", function () { choose(sn); drawChips(); });
        chips.appendChild(b);
      });
    }

    function draw() {
      clear(out);
      if (!state.sn) { out.appendChild(el("p", "muted", t("pick"))); return; }
      var head = el("div", "result-head"), tags = el("div", "tags");
      var title = el("h2", null, itemName(state.sn) + " × " + fmt(mode === "c" ? craftCalc(state.sn, state.qty).made : state.qty));
      head.appendChild(title); head.appendChild(tags); out.appendChild(head);
      var other = mode === "c" ? "r" : "c", otherHref = (mode === "c" ? "../recycle/" : "../craft/") + "?item=" + encodeURIComponent(state.sn) + (state.qty > 1 ? "&qty=" + state.qty : "");
      if (mode === "c") {
        var c = craftCalc(state.sn, state.qty);
        tags.appendChild(el("span", "tag", c.wb ? t("wb", { n: c.wb }) : t("wb0")));
        tags.appendChild(el("span", "tag", "⏱ " + duration(c.seconds)));
        if (c.per > 1) tags.appendChild(el("span", "tag neon", t("batch", { n: c.per })));
        var cols = el("div", "cols");
        cols.appendChild(listBox(t("need"), null, c.parts.map(function (p) { return [label(p[0]), fmt(p[1])]; })));
        if (c.raw) {
          var rows = Object.keys(c.raw).map(function (s) { return [label(s), fmt(c.raw[s])]; });
          cols.appendChild(listBox(t("raw"), t("raw_note"), rows));
        }
        out.appendChild(cols);
      } else {
        var cols2 = el("div", "cols"), fractional = false;
        [["rec_normal", D.recycle.normal], ["rec_safe", D.recycle.safe]].forEach(function (pair) {
          var rows = item(state.sn).r.map(function (p) {
            var v = p[1] * pair[1] * state.qty;
            if (Math.abs(v - Math.round(v)) >= 0.05) fractional = true;
            return [label(p[0]), fmt(v)];
          });
          cols2.appendChild(listBox(t(pair[0]), null, rows));
        });
        out.appendChild(cols2);
        if (fractional) out.appendChild(el("p", "note", t("rec_note")));
      }
      if (item(state.sn)[other]) {
        var actions = el("div", "actions"), a = el("a", "link-btn", t(mode === "c" ? "to_recycle" : "to_craft"));
        a.href = otherHref; actions.appendChild(a); out.appendChild(actions);
      }
    }

    return function render() {
      input.placeholder = t(mode === "c" ? "search_ph" : "search_ph_r");
      if (state.sn) input.value = itemName(state.sn);
      drawChips(); draw();
    };
  }

  // ------------------------------------------------------------ рейд
  function raidPage() {
    var R = D.raid, list = document.getElementById("targets"), sum = document.getElementById("summary");
    var byKey = {};
    R.targets.forEach(function (tg) { byKey[tg.k] = tg; });
    var basket = {}, open = {};
    (params.get("t") || "").split(",").forEach(function (part) {
      var m = /^([a-z_]+):(\d{1,3})$/.exec(part);
      if (m && byKey[m[1]]) basket[m[1]] = Math.min(99, parseInt(m[2], 10));
    });
    var initial = params.get("open");
    if (initial && byKey[initial]) open[initial] = true;

    function name(kind, key) { var x = D.text[lang] || D.text.en; return x[kind + "_" + key] || D.text.en[kind + "_" + key] || key; }
    function sulfur(parts) { return Object.keys(parts).reduce(function (s, m) { return s + (R.cost[m].sulfur || 0) * parts[m]; }, 0); }
    function cheapest(tg) {
      var options = CHEAP.filter(function (m) { return tg.counts[m]; }).map(function (m) { var o = {}; o[m] = tg.counts[m]; return o; });
      if (tg.combo.length && tg.combo.every(function (p) { return CHEAP.indexOf(p[0]) >= 0; })) {
        var c = {}; tg.combo.forEach(function (p) { c[p[0]] = p[1]; }); options.push(c);
      }
      options.sort(function (a, b) { return sulfur(a) - sulfur(b); });
      return options[0] || {};
    }
    function partsText(parts) {
      return Object.keys(parts).map(function (m) { return fmt(parts[m]) + " × " + name("m", m); }).join(" + ");
    }
    function saveUrl() {
      var p = new URLSearchParams(location.search);
      var keys = Object.keys(basket).filter(function (k) { return basket[k] > 0; });
      if (keys.length) p.set("t", keys.map(function (k) { return k + ":" + basket[k]; }).join(",")); else p.delete("t");
      p.delete("open");
      var s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
    }
    function setQty(k, n) {
      n = Math.max(0, Math.min(99, n));
      if (n) basket[k] = n; else delete basket[k];
      drawList(); drawSummary(); saveUrl();
    }

    function detail(tg) {
      var box = el("div", "detail"), table = el("table", "methods"), best = cheapest(tg);
      var single = Object.keys(best).length === 1 ? Object.keys(best)[0] : null;
      var thead = el("tr");
      [t("method"), t("count"), t("sulfur")].forEach(function (h) { thead.appendChild(el("th", null, h)); });
      table.appendChild(thead);
      R.methods.forEach(function (m) {
        var n = tg.counts[m];
        if (!n) return;
        var tr = el("tr", m === single ? "best" : null);
        var nm = R.emoji[m] + " " + name("m", m) + (R.dud[m] ? " (" + t("dud", { n: R.dud[m] }) + ")" : "");
        tr.appendChild(el("td", null, (m === single ? "★ " : "") + nm));
        tr.appendChild(el("td", "n", (tg.approx.indexOf(m) >= 0 ? "≈" : "") + fmt(n)));
        tr.appendChild(el("td", "n", R.cost[m].sulfur ? fmt(R.cost[m].sulfur * n) : "—"));
        table.appendChild(tr);
      });
      box.appendChild(table);
      box.appendChild(el("p", "note", "★ " + t("cheapest") + ": " + partsText(best) + " — " + fmt(sulfur(best)) + " " + t("sulfur").toLowerCase()));
      if (tg.approx.length) box.appendChild(el("p", "note", t("approx")));
      if (tg.disputed) box.appendChild(el("p", "note", t("disputed")));
      return box;
    }

    function drawList() {
      clear(list);
      R.categories.forEach(function (cat) {
        var sec = el("div", "cat");
        sec.appendChild(el("h3", null, name("c", cat)));
        R.targets.filter(function (tg) { return tg.cat === cat; }).forEach(function (tg) {
          var row = el("div", "trow" + (open[tg.k] ? " open" : "")), line = el("div", "tline");
          var btn = el("button", "tname"); btn.type = "button";
          btn.setAttribute("aria-expanded", String(!!open[tg.k]));
          btn.appendChild(el("span", null, name("t", tg.k)));
          btn.appendChild(el("small", null, t("hp", { n: fmt(tg.hp) })));
          btn.addEventListener("click", function () { open[tg.k] = !open[tg.k]; drawList(); });
          var q = basket[tg.k] || 0, step = el("div", "step" + (q ? " on" : ""));
          var minus = el("button", null, "−"), plus = el("button", null, "+"), out = el("output", null, String(q));
          minus.type = plus.type = "button";
          minus.setAttribute("aria-label", "−1 " + name("t", tg.k)); plus.setAttribute("aria-label", "+1 " + name("t", tg.k));
          minus.addEventListener("click", function () { setQty(tg.k, q - 1); });
          plus.addEventListener("click", function () { setQty(tg.k, q + 1); });
          step.appendChild(minus); step.appendChild(out); step.appendChild(plus);
          line.appendChild(btn); line.appendChild(step); row.appendChild(line);
          if (open[tg.k]) row.appendChild(detail(tg));
          sec.appendChild(row);
        });
        list.appendChild(sec);
      });
    }

    function drawSummary() {
      clear(sum);
      sum.appendChild(el("h2", null, t("total_title")));
      var keys = Object.keys(basket);
      if (!keys.length) { sum.appendChild(el("p", "muted", t("empty"))); return; }
      var picked = el("ul", "picked");
      keys.forEach(function (k) { var li = el("li"); li.appendChild(el("span", null, name("t", k))); li.appendChild(el("b", null, "× " + basket[k])); picked.appendChild(li); });
      sum.appendChild(picked);
      var total = {};
      keys.forEach(function (k) {
        var best = cheapest(byKey[k]);
        Object.keys(best).forEach(function (m) { total[m] = (total[m] || 0) + best[m] * basket[k]; });
      });
      sum.appendChild(el("div", "sub", "★ " + t("cheapest")));
      sum.appendChild(el("div", "big", fmt(sulfur(total)) + " " + t("sulfur").toLowerCase()));
      sum.appendChild(el("div", "sub", partsText(total)));
      var res = {};
      Object.keys(total).forEach(function (m) {
        Object.keys(R.cost[m]).forEach(function (r) { res[r] = (res[r] || 0) + R.cost[m][r] * total[m]; });
      });
      var rows = R.resources.filter(function (r) { return res[r]; }).map(function (r) {
        var note = r === "charcoal" ? t("mixing", { n: fmt(res[r] * R.mixingCharcoal) }) : null;
        return [cap(name("r", r)), fmt(res[r]), note];
      });
      sum.appendChild(listBox(t("resources"), null, rows));
      var only = [];
      R.main.filter(function (m) { return CHEAP.indexOf(m) >= 0; }).forEach(function (m) {
        var n = 0, ok = keys.every(function (k) { var c = byKey[k].counts[m]; n += (c || 0) * basket[k]; return !!c; });
        if (ok && n) only.push([R.emoji[m] + " " + name("m", m), fmt(n) + " · " + fmt(R.cost[m].sulfur * n)]);
      });
      if (only.length) sum.appendChild(listBox(t("only_title"), t("sulfur").toLowerCase(), only));
      var actions = el("div", "actions"), reset = el("button", "link-btn", t("reset")); reset.type = "button";
      reset.addEventListener("click", function () { basket = {}; drawList(); drawSummary(); saveUrl(); });
      actions.appendChild(reset); sum.appendChild(actions);
    }

    return function render() { drawList(); drawSummary(); };
  }

  // ------------------------------------------------------------ общее
  var renderPage = PAGE === "raid" ? raidPage() : itemPage(PAGE === "craft" ? "c" : "r");

  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach(function (node) { node.textContent = t(node.getAttribute("data-t")); });
    document.querySelectorAll("#langs button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    var note = document.getElementById("data-note");
    if (note) {
      note.textContent = PAGE === "raid" ? t("data_raid", { v: month(D.raidVersion) }) : t("data_game", { v: month(D.game.updated) });
    }
    if (window.RTB_LEGAL_LINKS) window.RTB_LEGAL_LINKS(lang);
    renderPage();
  }

  var tg = document.getElementById("btn-tg");
  if (tg) tg.href = "https://t.me/" + (cfg.TELEGRAM_BOT || "RustTrackerBroBot");
  var dc = document.getElementById("btn-discord");
  if (dc && cfg.DISCORD_APP_ID) dc.href = "https://discord.com/oauth2/authorize?client_id=" + cfg.DISCORD_APP_ID;

  var langs = document.getElementById("langs");
  LANGS.filter(function (c) { return T[c]; }).forEach(function (code) {
    var b = el("button", null, T[code].name); b.type = "button"; b.dataset.lang = code;
    b.addEventListener("click", function () {
      lang = code;
      try { localStorage.setItem("rtb_lang", code); } catch (e) {}
      render();
    });
    langs.appendChild(b);
  });
  render();
})();
