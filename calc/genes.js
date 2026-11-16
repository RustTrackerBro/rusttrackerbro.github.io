// 🧬 Планировщик генов — тот же расчёт, что rusttracker/core/genes.py бота (tests/test_genes_site_parity.py сверяет).
// Страница /genes/. С 17.11.2026 считает только сайт: бот присылает ссылку ?p=…&t=…; до 50 разных клонов, цели 3G+3Y,
// 4G+2Y, 2G+4Y, 2G+2Y+2H; полный перебор — по отбору (shortlist), потом доводка по всему списку (refine).
(function () {
  "use strict";
  var WEIGHT = { G: 0.6, Y: 0.6, H: 0.6, W: 1.0, X: 1.0 };
  var RED = { W: true, X: true };
  var MAX_DONORS = 8, MAX_COPIES = 9, MAX_KINDS = 50, SHORTLIST = 12, COVER_COPIES = 2, MAX_STEPS = 3;
  var NEW_CLONE_COPIES = 4, REFINE_ROUNDS = 30, EPS = 1e-9;
  var TARGETS = { "3g3y": [3, 3, 0], "4g2y": [4, 2, 0], "2g4y": [2, 4, 0], "2g2y2h": [2, 2, 2] };
  var TARGET_KEYS = ["3g3y", "4g2y", "2g4y", "2g2y2h"], DEFAULT_TARGET = "3g3y";
  var IW = { G: 3, Y: 3, H: 3, W: 5, X: 5 };  // веса ×5 — целые, без ошибок округления
  var ALPHA = "GHWXY".split("");  // порядок генов в ничьей — как в боте
  var LOOK = { "Г": "G", "У": "Y", "Н": "H", "Х": "X", "Ш": "W" };

  function targetOf(key) { return TARGETS[key] || TARGETS[DEFAULT_TARGET]; }
  function targetName(key) {
    var t = targetOf(key), parts = [];
    ["G", "Y", "H"].forEach(function (c, i) { if (t[i]) parts.push(t[i] + c); });
    return parts.join(" + ");
  }
  function wanted(t) { return ["G", "Y", "H"].filter(function (c, i) { return t[i]; }).join(""); }

  function normalize(text) {
    return String(text || "").toUpperCase().replace(/[ГУНХШ]/g, function (c) { return LOOK[c]; });
  }
  function parse(text, limit) {
    var plants = {}, order = [], bad = [];
    var FULL = /^([GYHWX]{6})(?:[X×*]?(\d{1,3}))?$/, MULT = /^[X×*]?(\d{1,3})$/;
    function add(g, c) {
      var n = c ? Math.max(1, Math.min(MAX_COPIES, parseInt(c, 10))) : 1;
      if (!(g in plants)) { plants[g] = 0; order.push(g); }
      plants[g] = Math.min(MAX_COPIES, plants[g] + n);
    }
    normalize(text).slice(0, 4000).split(/[,;\n]+/).forEach(function (chunk) {
      chunk = chunk.trim();
      if (!chunk) return;
      var m = FULL.exec(chunk.replace(/\s+/g, ""));
      if (m) { add(m[1], m[2]); return; }
      var words = chunk.split(/\s+/);
      for (var i = 0; i < words.length; i++) {
        m = FULL.exec(words[i]);
        if (m) {
          var c = m[2];
          if (c == null && i + 1 < words.length && MULT.test(words[i + 1])) { c = MULT.exec(words[i + 1])[1]; i++; }
          add(m[1], c);
        } else bad.push(words[i].slice(0, 20));
      }
    });
    var all = order.map(function (g) { return { genes: g, count: plants[g] }; });
    return { plants: trim(all, limit || MAX_KINDS), bad: bad.slice(0, 5), over: all.length > (limit || MAX_KINDS) };
  }
  function trim(plants, limit) {
    return plants.slice(0, limit).map(function (p) { return { genes: p.genes, count: Math.max(1, Math.min(MAX_COPIES, p.count)) }; });
  }
  function count(s, ch) { var n = 0; for (var i = 0; i < s.length; i++) if (s[i] === ch) n++; return n; }
  function isGod(g, t) { t = t || TARGETS[DEFAULT_TARGET]; return count(g, "G") === t[0] && count(g, "Y") === t[1] && count(g, "H") === t[2]; }
  function closeness(g, t) {
    t = t || TARGETS[DEFAULT_TARGET];
    return Math.min(count(g, "G"), t[0]) + Math.min(count(g, "Y"), t[1]) + Math.min(count(g, "H"), t[2]);
  }
  function reds(g) { return count(g, "W") + count(g, "X"); }
  function r9(x) { return Math.round(x * 1e9) / 1e9; }
  function greater(a, b) {  // лексикографически a > b
    for (var i = 0; i < a.length; i++) { if (a[i] > b[i]) return true; if (a[i] < b[i]) return false; }
    return false;
  }

  function slotWinners(donors, slot) {
    var sums = {}, top = 0, keys;
    donors.forEach(function (g) { var c = g[slot]; sums[c] = (sums[c] || 0) + WEIGHT[c]; });
    keys = Object.keys(sums);
    if (!keys.length) return [[], 0];
    keys.forEach(function (k) { if (sums[k] > top) top = sums[k]; });
    return [keys.filter(function (k) { return Math.abs(sums[k] - top) < EPS; }).sort(), top];
  }
  function crossbreed(center, donors) {
    var out = [];
    for (var s = 0; s < 6; s++) {
      var w = slotWinners(donors, s);
      out.push(w[0].length && w[1] > WEIGHT[center[s]] + EPS ? w[0] : [center[s]]);
    }
    return out;
  }

  var cache = {};
  function outcome(slots, t) {
    t = t || TARGETS[DEFAULT_TARGET];
    var key = t.join("") + ":" + slots.map(function (s) { return s.join(""); }).join("|");
    if (cache[key]) return cache[key];
    var dist = { "0,0,0,0": 1 };
    slots.forEach(function (opts) {
      var p = 1 / opts.length, next = {};
      Object.keys(dist).forEach(function (k) {
        var a = k.split(",").map(Number), q = dist[k];
        opts.forEach(function (gene) {
          var nk = [a[0] + (gene === "G" ? 1 : 0), a[1] + (gene === "Y" ? 1 : 0), a[2] + (gene === "H" ? 1 : 0),
            a[3] + (RED[gene] ? 1 : 0)].join(",");
          next[nk] = (next[nk] || 0) + q * p;
        });
      });
      dist = next;
    });
    var pGod = 0, eClose = 0, eRed = 0;
    Object.keys(dist).forEach(function (k) {
      var a = k.split(",").map(Number), q = dist[k];
      if (a[0] === t[0] && a[1] === t[1] && a[2] === t[2]) pGod += q;
      eClose += q * (Math.min(a[0], t[0]) + Math.min(a[1], t[1]) + Math.min(a[2], t[2]));
      eRed += q * a[3];
    });
    var o = { slots: slots, pGod: r9(pGod), eClose: r9(eClose), eRed: r9(eRed) };
    o.sure = slots.every(function (s) { return s.length === 1; });
    o.genes = slots.map(function (s) { return s.length === 1 ? s[0] : "?"; }).join("");
    cache[key] = o;
    return o;
  }

  // Полный перебор по отобранному списку (как best_plan в боте: тот же порядок обхода и тот же выбор при равенстве).
  function bestPlan(plants, t) {
    var kinds = plants.map(function (p) { return p.genes; }), counts = plants.map(function (p) { return p.count; });
    if (counts.reduce(function (a, b) { return a + b; }, 0) < 2) return null;
    var idx = {}; ALPHA.forEach(function (g, i) { idx[g] = i; });
    var kindSlots = kinds.map(function (k) { return [0, 1, 2, 3, 4, 5].map(function (s) { return idx[k[s]]; }); });
    var wOf = ALPHA.map(function (g) { return IW[g]; });
    var centers = kinds.map(function (c) { return [0, 1, 2, 3, 4, 5].map(function (s) { return IW[c[s]]; }); });
    var centerCodes = kinds.map(function (c) { return [0, 1, 2, 3, 4, 5].map(function (s) { return idx[c[s]]; }); });
    var codeOf = {}, genesOf = [];
    ALPHA.forEach(function (g, i) { codeOf[g] = i; genesOf.push([g]); });
    var scored = new Map(), sums = [0, 1, 2, 3, 4, 5].map(function () { return [0, 0, 0, 0, 0]; });
    var chosen = kinds.map(function () { return 0; }), best = null, bestAt = null;
    var tops = [0, 0, 0, 0, 0, 0], wins = [0, 0, 0, 0, 0, 0];
    function evaluate(nDonors) {
      for (var s = 0; s < 6; s++) {
        var row = sums[s], top = Math.max(row[0], row[1], row[2], row[3], row[4]);
        if (top <= 0) { tops[s] = 0; wins[s] = -1; continue; }
        var w = "";
        for (var i = 0; i < 5; i++) if (row[i] === top) w += ALPHA[i];
        var code = codeOf[w];
        if (code === undefined) { code = codeOf[w] = genesOf.length; genesOf.push(w.split("")); }
        tops[s] = top; wins[s] = code;
      }
      var nKinds = 0;
      for (var j = 0; j < chosen.length; j++) if (chosen[j]) nKinds++;
      for (var ci = 0; ci < kinds.length; ci++) {
        if (chosen[ci] >= counts[ci]) continue;
        var cs = centers[ci], cc = centerCodes[ci], ck = 0;
        for (var t2 = 0; t2 < 6; t2++) ck = ck * 64 + (tops[t2] > cs[t2] ? wins[t2] : cc[t2]);
        var got = scored.get(ck);
        if (got === undefined) {
          var slots = [];
          for (var t3 = 5, rest = ck; t3 >= 0; t3--) { slots[t3] = genesOf[rest % 64]; rest = Math.floor(rest / 64); }
          var o = outcome(slots, t);
          got = [o.pGod, o.eClose, -o.eRed];
          scored.set(ck, got);
        }
        // ключ (pGod, eClose, -eRed, -nDonors, -nKinds) — сравнение без временных массивов
        var better = best === null;
        if (!better) {
          if (got[0] !== best[0]) better = got[0] > best[0];
          else if (got[1] !== best[1]) better = got[1] > best[1];
          else if (got[2] !== best[2]) better = got[2] > best[2];
          else if (-nDonors !== best[3]) better = -nDonors > best[3];
          else better = -nKinds > best[4];
        }
        if (better) { best = [got[0], got[1], got[2], -nDonors, -nKinds]; bestAt = [ci, chosen.slice(), ck]; }
      }
    }
    function put(i, n) { var ks = kindSlots[i]; for (var s = 0; s < 6; s++) sums[s][ks[s]] += wOf[ks[s]] * n; }
    function dfs(i, left) {
      if (i === kinds.length) { if (left < MAX_DONORS) evaluate(MAX_DONORS - left); return; }
      var topN = Math.min(counts[i], left);
      for (var n = 0; n <= topN; n++) { chosen[i] = n; dfs(i + 1, left - n); if (n < topN) put(i, 1); }
      put(i, -topN); chosen[i] = 0;
    }
    dfs(0, MAX_DONORS);
    if (!bestAt) return null;
    var picked = bestAt[1];
    var slotsAt = [];
    for (var t4 = 5, rest = bestAt[2]; t4 >= 0; t4--) { slotsAt[t4] = genesOf[rest % 64]; rest = Math.floor(rest / 64); }
    var result = outcome(slotsAt, t);
    return makePlan(kinds[bestAt[0]], kinds.map(function (g, i) { return [g, picked[i]]; }).filter(function (d) { return d[1]; }), result);
  }
  function makePlan(center, donors, result) {
    return { center: center, donors: donors, result: result,
      donorCount: donors.reduce(function (a, d) { return a + d[1]; }, 0) };
  }

  // До SHORTLIST клонов для перебора: для каждой ячейки и нужного гена — лучшие клоны с ним (до COVER_COPIES копий),
  // затем лучшие по близости к цели. Порядок — исходный (как shortlist в боте).
  function shortlist(plants, t, limit) {
    limit = limit || SHORTLIST;
    if (plants.length <= limit) return plants.slice();
    var order = plants.map(function (p, i) { return i; });
    order.sort(function (a, b) {
      var ka = [-closeness(plants[a].genes, t), reds(plants[a].genes), -plants[a].count, a];
      var kb = [-closeness(plants[b].genes, t), reds(plants[b].genes), -plants[b].count, b];
      return greater(kb, ka) ? -1 : greater(ka, kb) ? 1 : 0;
    });
    var cover = [], want = wanted(t);
    for (var s = 0; s < 6; s++) {
      for (var w = 0; w < want.length; w++) {
        var got = 0;
        for (var r = 0; r < order.length && got < COVER_COPIES; r++) {
          var i = order[r];
          if (plants[i].genes[s] === want[w]) { got += plants[i].count; if (cover.indexOf(i) < 0) cover.push(i); }
        }
      }
    }
    var rank = {}; order.forEach(function (i, r) { rank[i] = r; });
    var picked = cover.slice().sort(function (a, b) { return rank[a] - rank[b]; }).slice(0, limit);
    for (var q = 0; q < order.length && picked.length < limit; q++) if (picked.indexOf(order[q]) < 0) picked.push(order[q]);
    return picked.sort(function (a, b) { return a - b; }).map(function (i) { return plants[i]; });
  }

  function planKey(center, donors, t) {
    var o = outcome(crossbreed(center, donors), t), uniq = {};
    donors.forEach(function (d) { uniq[d] = 1; });
    return [o.pGod, o.eClose, -o.eRed, -donors.length, -Object.keys(uniq).length];
  }
  // Доводка по всему списку — как refine в боте: заменить соседа, добавить, сменить центр, убрать соседа.
  function refine(plan, plants, t) {
    var have = {}, kinds = plants.map(function (p) { have[p.genes] = p.count; return p.genes; });
    var center = plan.center, donors = [];
    plan.donors.forEach(function (d) { for (var n = 0; n < d[1]; n++) donors.push(d[0]); });
    var start = donors.slice().sort().join(), best = planKey(center, donors, t);
    function fits(c, ds) { return count2(ds, c) + (c === center ? 1 : 0) <= (have[c] || 0); }
    function count2(ds, c) { var n = 0; ds.forEach(function (d) { if (d === c) n++; }); return n; }
    for (var round = 0; round < REFINE_ROUNDS; round++) {
      var found = null, k, ds;
      for (var ci = 0; ci < kinds.length; ci++) {
        var c = kinds[ci];
        for (var i = 0; i < donors.length; i++) {
          if (donors[i] === c) continue;
          ds = donors.slice(0, i).concat([c], donors.slice(i + 1));
          if (fits(c, ds) && greater(k = planKey(center, ds, t), best)) { best = k; found = [center, ds]; }
        }
        if (donors.length < MAX_DONORS) {
          ds = donors.concat([c]);
          if (fits(c, ds) && greater(k = planKey(center, ds, t), best)) { best = k; found = [center, ds]; }
        }
        if (c !== center && count2(donors, c) + 1 <= have[c]) {
          if (greater(k = planKey(c, donors, t), best)) { best = k; found = [c, donors.slice()]; }
        }
      }
      for (var j = 0; j < donors.length; j++) {
        ds = donors.slice(0, j).concat(donors.slice(j + 1));
        if (ds.length && greater(k = planKey(center, ds, t), best)) { best = k; found = [center, ds]; }
      }
      if (!found) break;
      center = found[0]; donors = found[1];
    }
    if (center === plan.center && donors.slice().sort().join() === start) return plan;
    var grouped = kinds.filter(function (g) { return donors.indexOf(g) >= 0; }).map(function (g) { return [g, count2(donors, g)]; });
    return makePlan(center, grouped, outcome(crossbreed(center, donors), t));
  }
  function planFor(plants, t) {
    var plan = bestPlan(shortlist(plants, t), t);
    return plan ? refine(plan, plants, t) : null;
  }

  function better(o, g, t) { return greater([o.eClose, -o.eRed], [closeness(g, t), -reds(g)]); }
  function improves(a, b) { return greater([a.pGod, a.eClose, -a.eRed], [b.pGod, b.eClose, -b.eRed]); }
  function advise(plants, targetKey) {
    var t = targetOf(targetKey);
    var adv = { plants: plants, target: t, haveGod: null, steps: [], bestNow: null, gain: false, missing: [], unused: [] };
    var god = plants.filter(function (p) { return isGod(p.genes, t); })[0];
    if (god) { adv.haveGod = god.genes; return adv; }
    if (plants.length) {
      adv.bestNow = plants.map(function (p) { return p.genes; }).reduce(function (a, b) {
        return greater([closeness(b, t), -reds(b)], [closeness(a, t), -reds(a)]) ? b : a;
      });
    }
    var pool = trim(plants, MAX_KINDS);
    for (var step = 0; step < MAX_STEPS; step++) {
      var plan = planFor(pool, t);
      if (!plan) break;
      if (adv.steps.length && !improves(plan.result, adv.steps[adv.steps.length - 1].result)) break;
      if (!adv.steps.length && plan.result.pGod === 0 && !better(plan.result, adv.bestNow || "XXXXXX", t)) { adv.steps.push(plan); break; }
      adv.steps.push(plan);
      if (plan.result.pGod >= 1 - EPS || !plan.result.sure) break;
      var neu = plan.result.genes;
      if (pool.some(function (p) { return p.genes === neu; })) break;
      pool = pool.concat([{ genes: neu, count: NEW_CLONE_COPIES }]);
    }
    if (adv.steps.length) {
      var f = adv.steps[adv.steps.length - 1].result;
      adv.gain = f.pGod > 0 || better(f, adv.bestNow || "XXXXXX", t);
      if (f.pGod === 0) {  // ячейки, где итог не дотянул до цели — для подсказки
        var need = wanted(t);
        f.slots.forEach(function (opts, i) { if (!opts.every(function (g) { return need.indexOf(g) >= 0; })) adv.missing.push(i + 1); });
      }
      if (adv.gain) {
        var used = {};
        adv.steps.forEach(function (p) { used[p.center] = 1; p.donors.forEach(function (d) { used[d[0]] = 1; }); });
        adv.unused = plants.filter(function (p) { return !used[p.genes]; }).map(function (p) { return p.genes; });
      }
    }
    return adv;
  }
  window.RTB_GENES = {
    parse: parse, advise: advise, crossbreed: crossbreed, shortlist: shortlist, wanted: wanted,
    targetOf: targetOf, targetName: targetName, TARGET_KEYS: TARGET_KEYS, DEFAULT_TARGET: DEFAULT_TARGET,
    MAX_KINDS: MAX_KINDS, MAX_COPIES: MAX_COPIES
  };
})();
