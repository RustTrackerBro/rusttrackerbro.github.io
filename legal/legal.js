// Отрисовка правовой страницы (data-doc у <body>: terms | privacy | refunds) и ссылки на них в подвалах сайта.
(function () {
  var UI = window.RTB_LEGAL_UI, DOCS = window.RTB_LEGAL_DOCS, cfg = window.RTB || {};
  var LANGS = ["en", "ru", "es", "fr", "uk", "de", "tr", "pt"];
  var PAGES = ["terms", "privacy", "refunds"];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fill(s, v) { return s.replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }

  // Строка с `командами` и {contact} → узлы (без innerHTML: только текст, <code> и ссылка на почту).
  function rich(parent, text, ui) {
    var mail = (cfg.CONTACT_EMAIL || "").trim();
    var contact = ui.contact_bot + (mail ? " " + fill(ui.contact_mail, { m: "\u0000" + mail + "\u0000" }) : "");
    text = text.replace("{contact}", contact);
    text.split(/(`[^`]+`|\u0000[^\u0000]+\u0000)/).forEach(function (part) {
      if (!part) return;
      if (part[0] === "`") { parent.appendChild(el("code", null, part.slice(1, -1))); return; }
      if (part[0] === "\u0000") { var a = el("a", null, part.slice(1, -1)); a.href = "mailto:" + part.slice(1, -1); parent.appendChild(a); return; }
      parent.appendChild(document.createTextNode(part));
    });
  }

  function pickLang(T) {
    var saved = null, params = new URLSearchParams(location.search);
    try { saved = localStorage.getItem("rtb_lang"); } catch (e) {}
    var wanted = (params.get("lang") || saved || navigator.language || "en").slice(0, 2).toLowerCase();
    return T[wanted] ? wanted : "en";
  }

  // Ссылки «Правила · Конфиденциальность · Возвраты» в подвале главной и тарифов: <div class="legal-links" data-base="legal/">.
  window.RTB_LEGAL_LINKS = function (lang) {
    var ui = UI[lang] || UI.en;
    document.querySelectorAll(".legal-links").forEach(function (box) {
      var base = box.getAttribute("data-base") || "legal/";
      box.textContent = "";
      PAGES.forEach(function (p) { var a = el("a", null, ui[p]); a.href = base + p + "/"; box.appendChild(a); });
    });
  };

  var doc = document.body.getAttribute("data-doc");
  if (!doc) return;

  function render(lang) {
    var ui = UI[lang] || UI.en, docLang = DOCS[lang] ? lang : "en", dui = UI[docLang];
    document.documentElement.lang = docLang;
    document.title = ui[doc] + " — Rust Tracker Bro";
    document.getElementById("home").textContent = ui.home;
    var nav = document.getElementById("docs"); nav.textContent = "";
    PAGES.forEach(function (p) {
      var a = el("a", null, ui[p]); a.href = "../" + p + "/";
      if (p === doc) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    document.getElementById("title").textContent = ui[doc];
    document.getElementById("updated").textContent = fill(ui.updated, { d: window.RTB_LEGAL_UPDATED });
    var note = document.getElementById("note");
    note.hidden = docLang === lang || !ui.fallback; note.textContent = ui.fallback || "";

    var body = document.getElementById("body"); body.textContent = "";
    DOCS[docLang][doc].forEach(function (sec) {
      body.appendChild(el("h2", null, sec.h));
      var list = null;
      sec.b.forEach(function (line) {
        if (line.indexOf("• ") === 0) {
          if (!list) { list = el("ul"); body.appendChild(list); }
          var li = el("li"); rich(li, line.slice(2), dui); list.appendChild(li);
        } else {
          list = null; var p = el("p"); rich(p, line, dui); body.appendChild(p);
        }
      });
    });
    document.getElementById("legal").textContent = ui.legal;
    document.querySelectorAll("#langs button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
  }

  var langs = document.getElementById("langs");
  LANGS.forEach(function (code) {
    var b = el("button", null, UI[code].name); b.type = "button"; b.dataset.lang = code;
    b.addEventListener("click", function () { try { localStorage.setItem("rtb_lang", code); } catch (e) {} render(code); });
    langs.appendChild(b);
  });
  render(pickLang(UI));
})();
