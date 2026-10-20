// 🧬 Планировщик генов — тот же расчёт, что в боте (rusttracker/core/genes.py). Страница /genes/.
(function () {
  "use strict";
  var WEIGHT = { G: 0.6, Y: 0.6, H: 0.6, W: 1.0, X: 1.0 };
  var RED = { W: true, X: true };
  var MAX_DONORS = 8, MAX_COPIES = 9, MAX_KINDS = 8, MAX_STEPS = 3, NEW_CLONE_COPIES = 4, EPS = 1e-9;
  var IW = { G: 3, Y: 3, H: 3, W: 5, X: 5 };  // веса ×5 — целые, без ошибок округления
  var ALPHA = "GHWXY".split("");  // порядок генов в ничьей — как в боте
  var LOOK = { "Г": "G", "У": "Y", "Н": "H", "Х": "X", "Ш": "W" };

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
    normalize(text).slice(0, 2000).split(/[,;\n]+/).forEach(function (chunk) {
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
    return { plants: trim(order.map(function (g) { return { genes: g, count: plants[g] }; }), limit || MAX_KINDS), bad: bad.slice(0, 5) };
  }
  function trim(plants, limit) {
    return plants.slice(0, limit).map(function (p) { return { genes: p.genes, count: Math.max(1, Math.min(MAX_COPIES, p.count)) }; });
  }
  function count(s, ch) { var n = 0; for (var i = 0; i < s.length; i++) if (s[i] === ch) n++; return n; }
  function isGod(g) { return count(g, "G") === 3 && count(g, "Y") === 3; }
  function closeness(g) { return Math.min(count(g, "G"), 3) + Math.min(count(g, "Y"), 3); }
  function reds(g) { return count(g, "W") + count(g, "X"); }
  function r9(x) { return Math.round(x * 1e9) / 1e9; }

  function slotWinners(donors, slot) {
    var sums = {}, top = 0, keys = [];
    donors.forEach(function (g) { var c = g[slot]; sums[c] = (sums[c] || 0) + WEIGHT[c]; });
    keys = Object.keys(sums);
    if (!keys.length) return [[], 0];
    keys.forEach(function (k) { if (sums[k] > top) top = sums[k]; });
    return [keys.filter(function (k) { return Math.abs(sums[k] - top) < EPS; }).sort(), top];
  }
  var cache = {};
  function outcome(slots) {
    var key = slots.map(function (s) { return s.join(""); }).join("|");
    if (cache[key]) return cache[key];
    var dist = { "0,0,0": 1 };
    slots.forEach(function (opts) {
      var p = 1 / opts.length, next = {};
      Object.keys(dist).forEach(function (k) {
        var a = k.split(",").map(Number), q = dist[k];
        opts.forEach(function (gene) {
          var nk = [a[0] + (gene === "G" ? 1 : 0), a[1] + (gene === "Y" ? 1 : 0), a[2] + (RED[gene] ? 1 : 0)].join(",");
          next[nk] = (next[nk] || 0) + q * p;
        });
      });
      dist = next;
    });
    var pGod = 0, eClose = 0, eRed = 0;
    Object.keys(dist).forEach(function (k) {
      var a = k.split(",").map(Number), q = dist[k];
      if (a[0] === 3 && a[1] === 3) pGod += q;
      eClose += q * (Math.min(a[0], 3) + Math.min(a[1], 3));
      eRed += q * a[2];
    });
    var o = { slots: slots, pGod: r9(pGod), eClose: r9(eClose), eRed: r9(eRed) };
    o.sure = slots.every(function (s) { return s.length === 1; });
    o.genes = slots.map(function (s) { return s.length === 1 ? s[0] : "?"; }).join("");
    cache[key] = o;
    return o;
  }
  function greater(a, b) {  // лексикографически a > b
    for (var i = 0; i < a.length; i++) { if (a[i] > b[i]) return true; if (a[i] < b[i]) return false; }
    return false;
  }
  function bestPlan(plants) {
    var kinds = plants.map(function (p) { return p.genes; }), counts = plants.map(function (p) { return p.count; });
    if (counts.reduce(function (a, b) { return a + b; }, 0) < 2) return null;
    var idx = {}; ALPHA.forEach(function (g, i) { idx[g] = i; });
    var kindSlots = kinds.map(function (k) { return [0, 1, 2, 3, 4, 5].map(function (s) { return idx[k[s]]; }); });
    var wOf = ALPHA.map(function (g) { return IW[g]; });
    var centers = kinds.map(function (c) { return [0, 1, 2, 3, 4, 5].map(function (s) { return [IW[c[s]], c[s]]; }); });
    var sums = [0, 1, 2, 3, 4, 5].map(function () { return [0, 0, 0, 0, 0]; });
    var chosen = kinds.map(function () { return 0; }), best = null, bestAt = null;
    function evaluate(nDonors) {
      var tops = [], wins = [];
      for (var s = 0; s < 6; s++) {
        var row = sums[s], top = Math.max.apply(null, row), w = [];
        if (top > 0) for (var i = 0; i < 5; i++) if (row[i] === top) w.push(ALPHA[i]);
        tops.push(top); wins.push(w);
      }
      var nKinds = chosen.filter(function (n) { return n; }).length;
      for (var ci = 0; ci < kinds.length; ci++) {
        if (chosen[ci] >= counts[ci]) continue;
        var cs = centers[ci], slots = [];
        for (var t = 0; t < 6; t++) slots.push(wins[t].length && tops[t] > cs[t][0] ? wins[t] : [cs[t][1]]);
        var o = outcome(slots), key = [o.pGod, o.eClose, -o.eRed, -nDonors, -nKinds];
        if (best === null || greater(key, best)) { best = key; bestAt = [ci, chosen.slice(), o]; }
      }
    }
    function put(i, n) { kindSlots[i].forEach(function (gi, s) { sums[s][gi] += wOf[gi] * n; }); }
    function dfs(i, left) {
      if (i === kinds.length) { if (left < MAX_DONORS) evaluate(MAX_DONORS - left); return; }
      var topN = Math.min(counts[i], left);
      for (var n = 0; n <= topN; n++) { chosen[i] = n; dfs(i + 1, left - n); if (n < topN) put(i, 1); }
      put(i, -topN); chosen[i] = 0;
    }
    dfs(0, MAX_DONORS);
    if (!bestAt) return null;
    var picked = bestAt[1], plan = { center: kinds[bestAt[0]], result: bestAt[2] };
    plan.donors = kinds.map(function (g, i) { return [g, picked[i]]; }).filter(function (d) { return d[1]; });
    plan.donorCount = plan.donors.reduce(function (a, d) { return a + d[1]; }, 0);
    return plan;
  }
  function better(o, g) { return greater([o.eClose, -o.eRed], [closeness(g), -reds(g)]); }
  function improves(a, b) { return greater([a.pGod, a.eClose, -a.eRed], [b.pGod, b.eClose, -b.eRed]); }
  function advise(plants) {
    var adv = { plants: plants, haveGod: null, steps: [], bestNow: null };
    var god = plants.filter(function (p) { return isGod(p.genes); })[0];
    if (god) { adv.haveGod = god.genes; return adv; }
    if (plants.length) {
      adv.bestNow = plants.map(function (p) { return p.genes; }).reduce(function (a, b) {
        return greater([closeness(b), -reds(b)], [closeness(a), -reds(a)]) ? b : a;
      });
    }
    var pool = trim(plants, MAX_KINDS);
    for (var step = 0; step < MAX_STEPS; step++) {
      var plan = bestPlan(pool);
      if (!plan) break;
      if (adv.steps.length && !improves(plan.result, adv.steps[adv.steps.length - 1].result)) break;
      if (!adv.steps.length && plan.result.pGod === 0 && !better(plan.result, adv.bestNow || "XXXXXX")) { adv.steps.push(plan); break; }
      adv.steps.push(plan);
      if (plan.result.pGod >= 1 - EPS || !plan.result.sure) break;
      var neu = plan.result.genes;
      if (pool.some(function (p) { return p.genes === neu; })) break;
      pool = pool.concat([{ genes: neu, count: NEW_CLONE_COPIES }]);
    }
    if (adv.steps.length) {
      var f = adv.steps[adv.steps.length - 1].result;
      adv.gain = f.pGod > 0 || better(f, adv.bestNow || "XXXXXX");
    }
    return adv;
  }
  window.RTB_GENES = { parse: parse, advise: advise, crossbreed: function (c, d) { return [0, 1, 2, 3, 4, 5].map(function (s) { var w = slotWinners(d, s); return w[0].length && w[1] > WEIGHT[c[s]] + EPS ? w[0] : [c[s]]; }); }, MAX_KINDS: MAX_KINDS, MAX_COPIES: MAX_COPIES };
})();
