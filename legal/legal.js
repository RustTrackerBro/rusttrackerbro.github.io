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

  // Значок Discord в подвале (вместо эмодзи 💬, 16.11.2026) — собран через DOM, без innerHTML.
  function discordIcon() {
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg"), path = document.createElementNS(ns, "path");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "14"); svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "dc-ico");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4C.6 9-.3 13.6.1 18.1A19.9 19.9 0 0 0 6.2 21l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6.1-2.9c.5-5.2-.8-9.7-3.6-13.7ZM8.5 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z");
    svg.appendChild(path); return svg;
  }

  // Ссылки «Правила · Конфиденциальность · Возвраты» в подвале главной и тарифов: <div class="legal-links" data-base="legal/">.
  window.RTB_LEGAL_LINKS = function (lang) {
    var ui = UI[lang] || UI.en;
    document.querySelectorAll(".legal-links").forEach(function (box) {
      var base = box.getAttribute("data-base") || "legal/";
      box.textContent = "";
      if (cfg.DISCORD_SERVER) {  // сервер проекта в Discord — первым
        var d = el("a", "dc", ui.server || UI.en.server); d.insertBefore(discordIcon(), d.firstChild); d.href = cfg.DISCORD_SERVER; d.rel = "noopener"; box.appendChild(d);
      }
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
    if (window.RTB_NAV_SET) window.RTB_NAV_SET(lang, UI[lang].name);  // общая шапка — на языке документа
    var menu = document.querySelector("header.sh details"); if (menu) menu.open = false;
  }

  var langs = document.getElementById("langs");
  LANGS.forEach(function (code) {
    var b = el("button", null, UI[code].name); b.type = "button"; b.dataset.lang = code;
    b.addEventListener("click", function () { try { localStorage.setItem("rtb_lang", code); } catch (e) {} render(code); });
    langs.appendChild(b);
  });
  render(pickLang(UI));
})();
