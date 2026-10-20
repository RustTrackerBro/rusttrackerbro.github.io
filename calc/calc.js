// Калькуляторы рейда, крафта и переработки. Страница выбирается атрибутом data-page у <body>.
// Данные — calc/data.js (выгрузка из бота: tools/export_site_data.py), тексты — calc/ui.js.
(function () {
  "use strict";
  var T = window.RTB_CALC_UI, D = window.RTB_CALC, cfg = window.RTB || {};
  var LANGS = ["en", "ru", "es", "fr", "uk", "de", "tr", "pt"];
  var PAGE = document.body.getAttribute("data-page");
  var params = new URLSearchParams(location.search);
  // Языковые версии (/ru/raid/ …) — язык задан страницей (<html data-lang>); английская (корень) — по выбору посетителя.
  var FIXED = document.documentElement.getAttribute("data-lang");
  var lang = FIXED && T[FIXED] ? FIXED : pickLang();
  var MAX_QTY = 1000;
  // Как в боте (bot/handlers/calc.py): популярные предметы для кнопок.
  var POPULAR = {
    c: ["explosive.timed", "ammo.rocket.basic", "ammo.rifle.explosive", "explosive.satchel", "grenade.beancan",
        "gunpowder", "rifle.ak", "door.hinged.toptier", "wall.external.high.stone", "syringe.medical"],
    r: ["techparts", "metalpipe", "gears", "metalspring", "riflebody", "smgbody", "semibody", "sheetmetal",
        "roadsigns", "propanetank", "tarp", "rope"]
  };

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

  // ------------------------------------------------------------ рейд: расчёт (как core/raid_data.py в боте)
  var RAID = !D ? null : (function () {  // на странице генов данных рейда нет
    var R = D.raid, EPS = 1e-6;
    function ceil(x) { return Math.max(0, Math.ceil(x - EPS)); }
    function craftable(m) { return (R.cost[m] && R.cost[m].sulfur) > 0; }
    function sulfur(parts) { return Object.keys(parts).reduce(function (s, m) { return s + (R.cost[m].sulfur || 0) * parts[m]; }, 0); }
    function actions(parts) { return Object.keys(parts).reduce(function (s, m) { return s + (R.actionWeight[m] != null ? R.actionWeight[m] : 1) * parts[m]; }, 0); }
    function dmg(tg, m) { return tg.dmg[m] ? tg.dmg[m][0] : 0; }
    function overkill(tg, m) { var d = tg.dmg[m]; return d && d[1] ? tg.counts[m] * d[0] / tg.hp - 1 : null; }
    function pairs(list) { var o = {}; list.forEach(function (p) { o[p[0]] = p[1]; }); return o; }
    function key(parts) { return Object.keys(parts).sort().map(function (m) { return m + "=" + parts[m]; }).join(","); }
    function withKnown(parts, known) {
      known.forEach(function (combo) {
        var ks = Object.keys(combo);
        if (ks.length !== 2 || Object.keys(parts).length !== 2 || !(ks[0] in parts) || !(ks[1] in parts)) return;
        var a = ks[0], b = ks[1], next = {};
        next[a] = parts[a]; next[b] = parts[b];
        if (parts[a] === combo[a]) next[b] = Math.max(parts[b], combo[b]);
        else if (parts[b] === combo[b]) next[a] = Math.max(parts[a], combo[a]);
        parts = next;
      });
      return parts;
    }
    function options(tg, methods) {
      var chosen = R.selectable.filter(function (m) { return methods.indexOf(m) >= 0 && tg.counts[m] && craftable(m); });
      var known = (tg.combo.length ? [tg.combo] : []).concat(tg.also).filter(function (c) {
        return c.every(function (p) { return chosen.indexOf(p[0]) >= 0; });
      }).map(pairs);
      var out = new Map();
      function add(p) { out.set(key(p), p); }
      chosen.forEach(function (m) { var p = {}; p[m] = tg.counts[m]; add(p); });
      known.forEach(add);
      chosen.forEach(function (a) {
        var da = dmg(tg, a);
        chosen.forEach(function (b) {
          if (a === b) return;
          var db = dmg(tg, b);
          for (var k = 1; k < Math.min(tg.counts[a], R.maxK); k++) {
            var j = ceil((tg.hp - k * da) / db);
            if (j < 1 || j >= tg.counts[b]) continue;
            var p = {}; p[a] = k; p[b] = j;
            add(withKnown(p, known));
          }
        });
      });
      return Array.from(out.values());
    }
    function minBy(list) {
      var best = null;
      list.forEach(function (p) {
        if (!best) { best = p; return; }
        var s = sulfur(p), bs = sulfur(best);
        if (s < bs || (s === bs && actions(p) < actions(best))) best = p;
      });
      return best || {};
    }
    function best(tg, methods) { return minBy(options(tg, methods)); }
    function fastest(tg, methods) {
      var opts = options(tg, methods);
      if (!opts.length) return {};
      var limit = Math.min.apply(null, opts.map(actions)) * R.fastSlack + EPS;
      return minBy(opts.filter(function (p) { return actions(p) <= limit; }));
    }
    return { best: best, fastest: fastest, sulfur: sulfur, overkill: overkill, options: options };
  })();
  window.RTB_RAID = RAID;  // для проверки расчёта

  function raidPage() {
    var R = D.raid, list = document.getElementById("targets"), sum = document.getElementById("summary");
    var chipsBox = document.getElementById("methods");
    var byKey = {};
    R.targets.forEach(function (tg) { byKey[tg.k] = tg; });
    var basket = {}, open = {};
    // Чем рейдим — только пока страница открыта (так решил владелец), по умолчанию — как в боте.
    var methods = R.defaultSelected.slice();
    (params.get("t") || "").split(",").forEach(function (part) {
      var m = /^([a-z_]+):(\d{1,3})$/.exec(part);
      if (m && byKey[m[1]]) basket[m[1]] = Math.min(99, parseInt(m[2], 10));
    });
    var initial = params.get("open");
    if (initial && byKey[initial]) open[initial] = true;

    function name(kind, key) { var x = D.text[lang] || D.text.en; return x[kind + "_" + key] || D.text.en[kind + "_" + key] || key; }
    function partsText(parts) {
      return Object.keys(parts).sort(function (a, b) { return (R.cost[b].sulfur || 0) - (R.cost[a].sulfur || 0); })
        .map(function (m) { return fmt(parts[m]) + " × " + name("m", m); }).join(" + ");
    }
    function sulfurWord() { return t("sulfur").toLowerCase(); }
    function saveUrl() {
      var p = new URLSearchParams(location.search);
      var keys = Object.keys(basket).filter(function (k) { return basket[k] > 0; });
      if (keys.length) p.set("t", keys.map(function (k) { return k + ":" + basket[k]; }).join(",")); else p.delete("t");
      p.delete("open");
      var s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
    }
    function redraw() { drawChips(); drawList(); drawSummary(); }
    function setQty(k, n) {
      n = Math.max(0, Math.min(99, n));
      if (n) basket[k] = n; else delete basket[k];
      drawList(); drawSummary(); saveUrl();
    }

    function drawChips() {
      clear(chipsBox);
      chipsBox.appendChild(el("span", "lbl", t("methods") + ":"));
      R.selectable.forEach(function (m) {
        var on = methods.indexOf(m) >= 0, b = el("button", "chip", (on ? "✓ " : "") + name("m", m));
        b.type = "button"; b.setAttribute("aria-pressed", String(on));
        b.addEventListener("click", function () {
          if (on && methods.length === 1) { b.classList.add("shake"); setTimeout(function () { b.classList.remove("shake"); }, 400); return; }
          if (on) methods.splice(methods.indexOf(m), 1); else methods.push(m);
          redraw();
        });
        chipsBox.appendChild(b);
      });
      var reset = el("button", "chip ghost", t("methods_default")); reset.type = "button";
      reset.addEventListener("click", function () { methods = R.defaultSelected.slice(); redraw(); });
      chipsBox.appendChild(reset);
    }

    function planLine(cls, label, parts) {
      var p = el("p", "plan " + cls);
      p.appendChild(el("b", null, label + ": "));
      p.appendChild(document.createTextNode(partsText(parts) + " — " + fmt(RAID.sulfur(parts)) + " " + sulfurWord()
        + (parts.catapult ? " (" + t("catapult") + ")" : "")));
      return p;
    }

    function detail(tg) {
      var box = el("div", "detail"), table = el("table", "methods"), best = RAID.best(tg, methods), fast = RAID.fastest(tg, methods);
      var single = Object.keys(best).length === 1 ? Object.keys(best)[0] : null;
      var thead = el("tr"), rows = 0;
      [t("method"), t("count"), t("sulfur")].forEach(function (h) { thead.appendChild(el("th", null, h)); });
      table.appendChild(thead);
      R.methods.forEach(function (m) {
        var n = tg.counts[m];
        if (!n || (R.cost[m].sulfur && methods.indexOf(m) < 0)) return;
        rows++;
        var tr = el("tr", m === single ? "best" : null), cell = el("td", null, (m === single ? "★ " : "") + R.emoji[m] + " " + name("m", m));
        if (R.dud[m]) cell.appendChild(el("small", "muted", " · " + t("dud", { n: R.dud[m] })));
        var over = RAID.overkill(tg, m);
        if (over != null && over >= R.overkillShown) cell.appendChild(el("small", "over", " · " + t("over", { n: Math.round(over * 100) })));
        tr.appendChild(cell);
        tr.appendChild(el("td", "n", (tg.approx.indexOf(m) >= 0 ? "≈" : "") + fmt(n)));
        tr.appendChild(el("td", "n", R.cost[m].sulfur ? fmt(R.cost[m].sulfur * n) : "—"));
        table.appendChild(tr);
      });
      if (rows) box.appendChild(table);
      if (!Object.keys(best).length) { box.appendChild(el("p", "note", t("none"))); return box; }
      box.appendChild(planLine("cheap", "💡 " + t("cheapest"), best));
      if (Object.keys(fast).length && key2(fast) !== key2(best)) {
        box.appendChild(planLine("fast", "⚡ " + t("fast"), fast));
      }
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

    function total(keys, pick) {
      var out = {};
      keys.forEach(function (k) {
        var p = pick(byKey[k], methods);
        Object.keys(p).forEach(function (m) { out[m] = (out[m] || 0) + p[m] * basket[k]; });
      });
      return out;
    }

    function drawSummary() {
      clear(sum);
      sum.appendChild(el("h2", null, t("total_title")));
      var keys = Object.keys(basket);
      if (!keys.length) { sum.appendChild(el("p", "muted", t("empty"))); return; }
      var picked = el("ul", "picked");
      keys.forEach(function (k) { var li = el("li"); li.appendChild(el("span", null, name("t", k))); li.appendChild(el("b", null, "× " + basket[k])); picked.appendChild(li); });
      sum.appendChild(picked);
      var missing = keys.filter(function (k) { return !Object.keys(RAID.best(byKey[k], methods)).length; });
      if (missing.length) sum.appendChild(el("p", "note warn", t("missing", { names: missing.map(function (k) { return name("t", k); }).join(", ") })));
      var cheap = total(keys, RAID.best), fast = total(keys, RAID.fastest);
      if (Object.keys(cheap).length) {
        sum.appendChild(el("div", "sub", "💡 " + t("cheapest")));
        sum.appendChild(el("div", "big", fmt(RAID.sulfur(cheap)) + " " + sulfurWord()));
        sum.appendChild(el("div", "sub", partsText(cheap)));
        if (key2(fast) !== key2(cheap)) {
          var f = el("div", "fastline");
          f.appendChild(el("div", "sub", "⚡ " + t("fast")));
          f.appendChild(el("div", "mid", fmt(RAID.sulfur(fast)) + " " + sulfurWord()));
          f.appendChild(el("div", "sub", partsText(fast)));
          sum.appendChild(f);
        }
        var res = {};
        Object.keys(cheap).forEach(function (m) {
          Object.keys(R.cost[m]).forEach(function (r) { res[r] = (res[r] || 0) + R.cost[m][r] * cheap[m]; });
        });
        var rows = R.resources.filter(function (r) { return res[r]; }).map(function (r) {
          var note = r === "charcoal" ? t("mixing", { n: fmt(res[r] * R.mixingCharcoal) }) : null;
          return [cap(name("r", r)), fmt(res[r]), note];
        });
        sum.appendChild(listBox(t("resources"), null, rows));
      }
      var only = [];
      R.selectable.filter(function (m) { return methods.indexOf(m) >= 0; }).forEach(function (m) {
        var n = 0, ok = keys.every(function (k) { var c = byKey[k].counts[m]; n += (c || 0) * basket[k]; return !!c; });
        if (ok && n) only.push([R.emoji[m] + " " + name("m", m), fmt(n) + " · " + fmt(R.cost[m].sulfur * n)]);
      });
      if (only.length > 1) sum.appendChild(listBox(t("only_title"), sulfurWord(), only));
      var actions = el("div", "actions"), reset = el("button", "link-btn", t("reset")); reset.type = "button";
      reset.addEventListener("click", function () { basket = {}; drawList(); drawSummary(); saveUrl(); });
      actions.appendChild(reset); sum.appendChild(actions);
    }
    function key2(p) { return Object.keys(p).sort().map(function (m) { return m + p[m]; }).join(","); }

    return function render() { redraw(); };
  }

  // ------------------------------------------------------------ гены
  function genesPage() {
    var G = window.RTB_GENES, pad = document.getElementById("keypad"), input = document.getElementById("gq");
    var list = document.getElementById("plants"), out = document.getElementById("gout"), msg = document.getElementById("gmsg");
    var plants = [], typed = "", lastAdvice = null;
    // ?p=GGYYXH:2,GYGYHH — чтобы делиться набором
    var fromUrl = G.parse((params.get("p") || "").replace(/:/g, " x").replace(/,/g, "\n"));
    plants = fromUrl.plants;

    function geneSpan(g) {
      var wrap = el("span", "genes");
      g.split("").forEach(function (c) { wrap.appendChild(el("span", "gene g-" + (c === "?" ? "q" : c), c)); });
      return wrap;
    }
    function total() { return plants.reduce(function (a, p) { return a + p.count; }, 0); }
    function note(text) { msg.textContent = text || ""; msg.hidden = !text; }
    function saveUrl() {
      var p = new URLSearchParams(location.search);
      if (plants.length) p.set("p", plants.map(function (x) { return x.genes + (x.count > 1 ? ":" + x.count : ""); }).join(",")); else p.delete("p");
      var s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
    }
    function addPlants(found) {
      var merged = {}, order = [];
      plants.concat(found).forEach(function (p) {
        if (!(p.genes in merged)) { merged[p.genes] = 0; order.push(p.genes); }
        merged[p.genes] = Math.min(G.MAX_COPIES, merged[p.genes] + p.count);
      });
      plants = order.slice(0, G.MAX_KINDS).map(function (g) { return { genes: g, count: merged[g] }; });
      return order.length > G.MAX_KINDS;
    }
    function changed() { out.hidden = true; lastAdvice = null; drawList(); saveUrl(); }

    function drawPad() {
      clear(pad);
      var slots = el("div", "typed");
      for (var i = 0; i < 6; i++) slots.appendChild(el("span", "gene slot" + (typed[i] ? " g-" + typed[i] : ""), typed[i] || "·"));
      pad.appendChild(slots);
      var keys = el("div", "keys");
      "GYHWX".split("").forEach(function (c) {
        var b = el("button", "key g-" + c, c); b.type = "button";
        b.addEventListener("click", function () {
          typed += c;
          if (typed.length === 6) {
            var over = addPlants([{ genes: typed, count: 1 }]);
            typed = ""; note(over ? t("g_limit", { n: G.MAX_KINDS }) : ""); changed();
          }
          drawPad();
        });
        keys.appendChild(b);
      });
      var back = el("button", "key back", "⌫"); back.type = "button";
      back.addEventListener("click", function () { typed = typed.slice(0, -1); drawPad(); });
      keys.appendChild(back);
      pad.appendChild(keys);
    }
    function drawList() {
      clear(list);
      if (!plants.length) { list.appendChild(el("p", "muted small", t("g_empty"))); return; }
      plants.forEach(function (p, i) {
        var row = el("div", "prow");
        row.appendChild(geneSpan(p.genes));
        var step = el("div", "step on"), minus = el("button", null, "−"), plus = el("button", null, "+");
        minus.type = plus.type = "button";
        minus.addEventListener("click", function () { if (p.count > 1) p.count--; else plants.splice(i, 1); changed(); });
        plus.addEventListener("click", function () { if (p.count < G.MAX_COPIES) { p.count++; changed(); } });
        step.appendChild(minus); step.appendChild(el("output", null, "×" + p.count)); step.appendChild(plus);
        row.appendChild(step);
        list.appendChild(row);
      });
    }
    function gridBox(plan) {
      var around = [];
      plan.donors.forEach(function (d) { for (var n = 0; n < d[1]; n++) around.push(d[0]); });
      while (around.length < 8) around.push(null);
      var cells = around.slice(0, 4).concat(["C"]).concat(around.slice(4));
      var box = el("div", "planter");
      cells.forEach(function (g) {
        var c = el("div", "cell" + (g === "C" ? " center" : g ? "" : " empty"));
        if (g === "C") { c.appendChild(el("small", null, t("g_center"))); c.appendChild(geneSpan(plan.center)); }
        else if (g) c.appendChild(geneSpan(g));
        else c.textContent = "·";
        box.appendChild(c);
      });
      return box;
    }
    function pct(p) { var v = p * 100; return v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10); }
    function drawAdvice(adv) {
      clear(out); out.hidden = false;
      if (adv.haveGod) {
        var p = el("p", "big-note"); p.textContent = t("g_have_god", { g: adv.haveGod }); out.appendChild(p); return;
      }
      if (!adv.steps.length) { out.appendChild(el("p", "muted", t("g_need_two"))); return; }
      if (!adv.gain) {
        out.appendChild(el("p", "big-note", t("g_no_gain", { g: adv.bestNow })));
        out.appendChild(el("p", "note", t("g_tips")));
        return;
      }
      adv.steps.forEach(function (plan, i) {
        var card = el("div", "gstep");
        if (adv.steps.length > 1) card.appendChild(el("h3", null, t("g_step", { n: i + 1, t: adv.steps.length })));
        if (i > 0) card.appendChild(el("p", "muted small", t("g_from_new", { g: adv.steps[i - 1].result.genes })));
        var row = el("div", "gcols");
        row.appendChild(gridBox(plan));
        var info = el("div", "ginfo");
        info.appendChild(el("div", "lbl", t("g_result")));
        info.appendChild(geneSpan(plan.result.genes));
        var o = plan.result;
        o.slots.forEach(function (opts, s) {
          if (opts.length > 1) {
            var share = Math.round(100 / opts.length);
            info.appendChild(el("p", "note", t("g_slot", { n: s + 1, list: opts.map(function (g) { return g + " " + share + "%"; }).join(" / ") })));
          }
        });
        if (o.pGod >= 1 - 1e-9) info.appendChild(el("p", "badge-ok", t("g_god_sure")));
        else if (o.pGod > 0) info.appendChild(el("p", "badge-chance", t("g_god_chance", { p: pct(o.pGod) })));
        var donors = plan.donors.map(function (d) { return d[0] + (d[1] > 1 ? " ×" + d[1] : ""); }).join(", ");
        info.appendChild(el("p", "small", t("g_center") + ": " + plan.center + " · " + t("g_around") + ": " + donors));
        row.appendChild(info);
        card.appendChild(row);
        out.appendChild(card);
      });
      var last = adv.steps[adv.steps.length - 1].result;
      if (last.pGod === 0) out.appendChild(el("p", "note warn", t("g_no_god")));
      out.appendChild(el("p", "note", t("g_tips")));
    }
    function addFromInput() {
      var r = G.parse(input.value);
      if (!r.plants.length) { note(t("g_skipped", { list: r.bad.join(", ") || input.value.slice(0, 20) })); return; }
      var over = addPlants(r.plants);
      note([over ? t("g_limit", { n: G.MAX_KINDS }) : "", r.bad.length ? t("g_skipped", { list: r.bad.join(", ") }) : ""].filter(Boolean).join(" "));
      input.value = ""; changed();
    }
    document.getElementById("gadd").addEventListener("click", addFromInput);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addFromInput(); } });
    document.getElementById("gclear").addEventListener("click", function () { plants = []; typed = ""; note(""); drawPad(); changed(); });
    document.getElementById("gcalc").addEventListener("click", function () {
      if (total() < 2) { note(t("g_need_two")); return; }
      note("");
      lastAdvice = G.advise(plants);
      drawAdvice(lastAdvice);
      out.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return function render() {
      input.placeholder = t("g_paste");
      drawPad(); drawList();
      if (lastAdvice) drawAdvice(lastAdvice);
    };
  }

  // ------------------------------------------------------------ общее
  var renderPage = PAGE === "raid" ? raidPage() : PAGE === "genes" ? genesPage() : itemPage(PAGE === "craft" ? "c" : "r");

  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach(function (node) { node.textContent = t(node.getAttribute("data-t")); });
    document.querySelectorAll("#langs a").forEach(function (a) {
      if (a.dataset.lang === lang) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    var note = document.getElementById("data-note");
    if (note) {
      note.textContent = PAGE === "raid" ? t("data_raid", { v: month(D.raidVersion) }) : PAGE === "genes" ? "" : t("data_game", { v: month(D.game.updated) });
    }
    if (window.RTB_LEGAL_LINKS) window.RTB_LEGAL_LINKS(lang);
    renderPage();
  }

  var tg = document.getElementById("btn-tg");
  if (tg) tg.href = "https://t.me/" + (cfg.TELEGRAM_BOT || "RustTrackerBroBot");
  var dc = document.getElementById("btn-discord");
  if (dc && cfg.DISCORD_APP_ID) dc.href = "https://discord.com/oauth2/authorize?client_id=" + cfg.DISCORD_APP_ID;

  // Ссылки на языковые версии: запоминаем выбор и переносим состояние калькулятора (?t=…, ?item=…).
  document.querySelectorAll("#langs a").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var code = a.dataset.lang;
      if (!T[code]) return;
      try { localStorage.setItem("rtb_lang", code); } catch (e) {}
      ev.preventDefault();
      location.href = a.getAttribute("href").split("?")[0] + location.search.replace(/([?&])lang=[^&]*&?/, "$1").replace(/[?&]$/, "");
    });
  });
  render();
})();
