/* =========================================================
   App shell — header, footer, i18n, interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- i18n core ---------- */
  var DICT = { uz: {}, ru: {}, en: {}, uzc: {} };

  function merge(base, extra) {
    ["uz", "ru", "en"].forEach(function (l) {
      var a = (base && base[l]) || {}, b = (extra && extra[l]) || {}, k;
      for (k in a) DICT[l][k] = a[k];
      for (k in b) DICT[l][k] = b[k];
    });
  }
  merge(window.CORE_I18N, window.PAGE_I18N);

  /* uzc — uz'dan avtomatik kirill */
  (function buildCyr() {
    for (var k in DICT.uz) DICT.uzc[k] = window.toCyrillic(DICT.uz[k]);
  })();

  var LANGS = [
    { id: "uz", label: "Oʻzbekcha", code: "UZ" },
    { id: "uzc", label: "Ўзбекча", code: "ЎЗ" },
    { id: "ru", label: "Русский", code: "RU" },
    { id: "en", label: "English", code: "EN" }
  ];

  function getLang() {
    try { return localStorage.getItem("ufu_lang") || "uz"; } catch (e) { return "uz"; }
  }
  function setLang(l) {
    try { localStorage.setItem("ufu_lang", l); } catch (e) {}
    App.lang = l;
    document.documentElement.setAttribute("lang", l === "uzc" ? "uz-Cyrl" : l);
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }
  function t(key) {
    var l = App.lang;
    if (DICT[l] && DICT[l][key] != null) return DICT[l][key];
    if (DICT.uz[key] != null) return l === "uzc" ? window.toCyrillic(DICT.uz[key]) : DICT.uz[key];
    return key;
  }

  /* Matnni almashtiradi, lekin ichki elementlarni saqlaydi:
     <label data-i18n="…">Klub <span class="req">*</span></label> — yulduzcha joyida qoladi */
  function setText(el, v) {
    if (/<[a-z/]/i.test(v)) { el.innerHTML = v; return; }
    if (!el.firstElementChild) { el.textContent = v; return; }
    var first = el.firstChild;
    if (first && first.nodeType === 3) first.nodeValue = v + " ";
    else el.insertBefore(document.createTextNode(v + " "), first);
  }

  function apply(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      setText(el, t(el.getAttribute("data-i18n")));
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    /* xususiy ismlar: kirill rejimida avtomatik transliteratsiya qilinadi */
    scope.querySelectorAll("[data-nm]").forEach(function (el) {
      if (!el.dataset.nmOrig) el.dataset.nmOrig = el.textContent;
      el.textContent = App.lang === "uzc" ? window.toCyrillic(el.dataset.nmOrig) : el.dataset.nmOrig;
    });
    /* til tugmasi */
    var cur = LANGS.filter(function (x) { return x.id === App.lang; })[0] || LANGS[0];
    document.querySelectorAll("[data-lang-code]").forEach(function (el) { el.textContent = cur.code; });
    document.querySelectorAll(".lang__menu button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.lang === App.lang);
    });
  }

  var App = window.App = {
    lang: getLang(),
    t: t,
    setLang: setLang,
    apply: apply,
    dict: DICT,
    /* JS bilan chiziladigan ism va klub nomlari uchun */
    nm: function (s) { return App.lang === "uzc" ? window.toCyrillic(s) : s; }
  };

  /* ---------- shell markup ---------- */
  var PAGES = {
    home: "index.html", about: "uyushma.html", news: "yangiliklar.html", article: "maqola.html",
    cases: "keyslar.html", kb: "bilim-bazasi.html", video: "video.html", docs: "hujjatlar.html",
    partners: "hamkorlar.html", jobs: "vakansiyalar.html", xi: "symbolic-xi.html",
    camp: "free-agent-camp.html", login: "kirish.html", cabinet: "kabinet.html",
    appeal: "murojaat.html", anon: "anonim.html", admin: "admin.html", contact: "aloqa.html"
  };

  function navItem(id, key, items) {
    var links = items.map(function (it) {
      return '<a href="' + it[0] + '"><span class="ic">' + ico(it[1]) + '</span><span><b data-i18n="' + it[2] + '">' +
        t(it[2]) + '</b><span data-i18n="' + it[3] + '">' + t(it[3]) + '</span></span></a>';
    }).join("");
    return '<div class="nav__item" data-nav="' + id + '">' +
      '<button class="nav__link" type="button"><span data-i18n="' + key + '">' + t(key) + '</span>' + ico("chevronDown") + '</button>' +
      '<div class="nav__drop">' + links + '</div></div>';
  }

  function header() {
    return '' +
    '<a href="#main" class="skip-link" data-i18n="a11y.skip">' + t("a11y.skip") + '</a>' +
    '<div class="topbar"><div class="wrap">' +
      '<div class="topbar__left">' +
        '<span class="fifpro-badge">' + ico("shield") + '<span data-i18n="top.member">' + t("top.member") + '</span></span>' +
        '<a href="' + PAGES.docs + '" data-i18n="top.docs">' + t("top.docs") + '</a>' +
        /* "Namoyish maketi" belgisi faqat onlayn taqdimot havolasida ko'rinadi;
           topshiriladigan fayllar (file:// yoki mijoz serveri) toza qoladi */
        (/claude\.ai|netlify|vercel|github\.io|pages\.dev/.test(location.hostname)
          ? '<span class="demo-chip" data-i18n="top.demo">' + t("top.demo") + '</span>' : '') +
      '</div>' +
      '<div class="topbar__right">' +
        '<a href="tel:+998712000047">+998 71 200 00 47</a>' +
        '<a href="' + PAGES.anon + '">' + ico("telegram") + ' <span data-i18n="top.tg">' + t("top.tg") + '</span></a>' +
      '</div>' +
    '</div></div>' +

    '<header class="hdr" id="hdr">' +
      '<div class="wrap">' +
        '<a href="' + PAGES.home + '" class="brand">' + window.BRAND_MARK +
          '<span class="brand__txt"><b data-i18n="brand.name">' + t("brand.name") + '</b>' +
          '<span data-i18n="brand.sub">' + t("brand.sub") + '</span></span></a>' +

        '<nav class="nav">' +
          navItem("union", "nav.union", [
            [PAGES.about, "shield", "nav.union.about", "nav.union.about.d"],
            [PAGES.about + "#fifpro", "globe", "nav.union.fifpro", "nav.union.fifpro.d"],
            [PAGES.docs, "fileText", "nav.union.docs", "nav.union.docs.d"],
            [PAGES.partners, "handshake", "nav.union.partners", "nav.union.partners.d"]
          ]) +
          navItem("help", "nav.help", [
            [PAGES.appeal, "filePlus", "nav.help.new", "nav.help.new.d"],
            [PAGES.anon, "mask", "nav.help.anon", "nav.help.anon.d"],
            [PAGES.kb, "book", "nav.help.kb", "nav.help.kb.d"],
            [PAGES.cases, "gavel", "nav.help.cases", "nav.help.cases.d"]
          ]) +
          navItem("media", "nav.media", [
            [PAGES.news, "fileText", "nav.media.news", "nav.media.news.d"],
            [PAGES.video, "video", "nav.media.video", "nav.media.video.d"]
          ]) +
          navItem("projects", "nav.projects", [
            [PAGES.xi, "trophy", "nav.projects.xi", "nav.projects.xi.d"],
            [PAGES.camp, "pitch", "nav.projects.camp", "nav.projects.camp.d"],
            [PAGES.jobs, "briefcase", "nav.projects.jobs", "nav.projects.jobs.d"]
          ]) +
          '<a class="nav__link" data-nav="contact" href="' + PAGES.contact + '"><span data-i18n="nav.contact">' + t("nav.contact") + '</span></a>' +
        '</nav>' +

        '<div class="hdr__actions">' +
          '<div class="lang" id="lang">' +
            '<button class="lang__btn" type="button">' + ico("globe") + '<span data-lang-code>UZ</span>' + ico("chevronDown") + '</button>' +
            '<div class="lang__menu">' + LANGS.map(function (l) {
              return '<button type="button" data-lang="' + l.id + '">' + l.label + '<span class="code">' + l.code + '</span></button>';
            }).join("") + '</div>' +
          '</div>' +
          '<a href="' + PAGES.login + '" class="btn btn--dark btn--sm" data-hide-mob>' + ico("telegram") +
            '<span data-i18n="cta.login">' + t("cta.login") + '</span></a>' +
          '<button class="burger" id="burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
    '</header>';
  }

  function mobnav() {
    var items = [
      [PAGES.about, "nav.union.about"], [PAGES.appeal, "nav.help.new"], [PAGES.anon, "nav.help.anon"],
      [PAGES.kb, "nav.help.kb"], [PAGES.cases, "nav.help.cases"], [PAGES.news, "nav.media.news"],
      [PAGES.video, "nav.media.video"], [PAGES.xi, "nav.projects.xi"], [PAGES.camp, "nav.projects.camp"],
      [PAGES.jobs, "nav.projects.jobs"], [PAGES.partners, "nav.union.partners"], [PAGES.docs, "nav.union.docs"],
      [PAGES.contact, "nav.contact"]
    ];
    return '<div class="mobnav" id="mobnav" role="dialog" aria-modal="true" aria-hidden="true">' +
      '<div class="mobnav__head">' +
        '<a href="' + PAGES.home + '" class="brand">' + window.BRAND_MARK +
          '<span class="brand__txt"><b data-i18n="brand.name">' + t("brand.name") + '</b></span></a>' +
        '<button class="mobnav__close" type="button" data-mobnav-close>' +
          '<span data-i18n="m.close">' + t("m.close") + '</span><i aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="mobnav__body">' +
        '<nav class="mobnav__list">' + items.map(function (i) {
          return '<a href="' + i[0] + '"><span data-i18n="' + i[1] + '">' + t(i[1]) + '</span>' + ico("chevronRight") + '</a>';
        }).join("") + '</nav>' +
        '<div class="mobnav__langs"><span class="mobnav__lbl" data-i18n="m.lang">' + t("m.lang") + '</span><div>' +
          LANGS.map(function (l) { return '<button type="button" data-lang="' + l.id + '">' + l.code + '</button>'; }).join("") +
        '</div></div>' +
      '</div>' +
      '<div class="mobnav__foot">' +
        '<a href="' + PAGES.login + '" class="btn btn--dark">' + ico("telegram") +
          '<span data-i18n="cta.login">' + t("cta.login") + '</span></a>' +
        '<a href="' + PAGES.appeal + '" class="btn btn--ghost">' +
          '<span data-i18n="cta.appeal">' + t("cta.appeal") + '</span></a>' +
      '</div>' +
    '</div>';
  }

  /* ---- mobil menyu: to'liq ekranli panel, orqa sahifa qotiriladi (iOS Safari'da ham) ---- */
  var mobState = { open: false, y: 0, pushed: false };
  function markMobLang() {
    document.querySelectorAll(".mobnav__langs button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.lang === App.lang);
    });
  }
  function mobMenu(open, viaLink) {
    var mn = document.getElementById("mobnav"), bg = document.getElementById("burger");
    if (!mn || open === mobState.open) return;
    mobState.open = open;
    mn.classList.toggle("is-open", open);
    mn.setAttribute("aria-hidden", open ? "false" : "true");
    if (bg) { bg.classList.toggle("is-open", open); bg.setAttribute("aria-expanded", open ? "true" : "false"); }
    var b = document.body, html = document.documentElement;
    if (open) {
      mobState.y = window.scrollY || window.pageYOffset || 0;
      b.style.position = "fixed"; b.style.top = -mobState.y + "px";
      b.style.left = "0"; b.style.right = "0"; b.style.width = "100%";
      html.classList.add("is-locked");
      markMobLang();
      mn.querySelector(".mobnav__body").scrollTop = 0;
      /* telefonning "orqaga" tugmasi ham menyuni yopadi */
      try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; history.pushState({ mobnav: 1 }, ""); mobState.pushed = true; } catch (err) { mobState.pushed = false; }
    } else {
      b.style.position = ""; b.style.top = ""; b.style.left = ""; b.style.right = ""; b.style.width = "";
      html.classList.remove("is-locked");
      restoreScroll(mobState.y);
      if (mobState.pushed) {
        mobState.pushed = false;
        if (!viaLink && history.state && history.state.mobnav) { try { history.back(); } catch (err) {} }
      }
    }
  }
  function restoreScroll(y) {
    var html = document.documentElement;
    function go() { var prev = html.style.scrollBehavior; html.style.scrollBehavior = "auto"; window.scrollTo(0, y); html.style.scrollBehavior = prev; }
    go(); requestAnimationFrame(go); setTimeout(go, 60);
  }
  window.addEventListener("popstate", function () {
    if (mobState.open) { mobState.pushed = false; mobMenu(false); } else { restoreScroll(mobState.y); }
    setTimeout(function () { try { history.scrollRestoration = "auto"; } catch (err) {} }, 120);
  });
  window.addEventListener("resize", function () { if (mobState.open && window.innerWidth > 1080) mobMenu(false); });

  function footer() {
    function col(title, links) {
      return '<div><h4 data-i18n="' + title + '">' + t(title) + '</h4><div class="ftr__links">' +
        links.map(function (l) { return '<a href="' + l[0] + '" data-i18n="' + l[1] + '">' + t(l[1]) + '</a>'; }).join("") +
        '</div></div>';
    }
    var soc = [["instagram", "https://instagram.com"], ["telegram", "https://t.me"], ["youtube", "https://youtube.com"],
               ["facebook", "https://facebook.com"], ["linkedin", "https://linkedin.com"]];
    return '<footer class="ftr"><div class="wrap">' +
      '<div class="ftr__top">' +
        '<div>' +
          '<div class="ftr__brand" data-i18n="ftr.tagline">' + t("ftr.tagline") + '</div>' +
          '<div class="small" style="margin-top:16px;opacity:.6" data-i18n="ftr.since">' + t("ftr.since") + '</div>' +
          '<div class="ftr__soc">' + soc.map(function (s) {
            return '<a href="' + s[1] + '" target="_blank" rel="noopener" aria-label="' + s[0] + '">' + ico(s[0]) + '</a>';
          }).join("") + '</div>' +
        '</div>' +
        col("ftr.nav", [[PAGES.about, "nav.union.about"], [PAGES.news, "nav.media.news"], [PAGES.cases, "nav.help.cases"],
                        [PAGES.xi, "nav.projects.xi"], [PAGES.camp, "nav.projects.camp"], [PAGES.partners, "nav.union.partners"]]) +
        col("ftr.help", [[PAGES.appeal, "nav.help.new"], [PAGES.anon, "nav.help.anon"], [PAGES.kb, "nav.help.kb"],
                         [PAGES.jobs, "nav.projects.jobs"], [PAGES.contact, "nav.contact"]]) +
        '<div>' +
          '<h4 data-i18n="ftr.contacts">' + t("ftr.contacts") + '</h4>' +
          '<div class="ftr__links">' +
            '<a href="tel:+998712000047">+998 71 200 00 47</a>' +
            '<a href="mailto:info@futbolchilar.uz">info@futbolchilar.uz</a>' +
          '</div>' +
          '<h4 style="margin-top:26px" data-i18n="ftr.addr.t">' + t("ftr.addr.t") + '</h4>' +
          '<div class="small" style="line-height:1.6" data-i18n="ftr.addr">' + t("ftr.addr") + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ftr__bot">' +
        '<div>© <span data-year>2026</span> <span data-i18n="brand.full">' + t("brand.full") + '</span>. ' +
          '<span data-i18n="ftr.rights">' + t("ftr.rights") + '</span>.</div>' +
        '<div class="ftr__legal">' +
          '<a href="' + PAGES.docs + '" data-i18n="ftr.privacy">' + t("ftr.privacy") + '</a>' +
          '<a href="' + PAGES.docs + '" data-i18n="ftr.terms">' + t("ftr.terms") + '</a>' +
          '<a href="' + PAGES.docs + '" data-i18n="ftr.offer">' + t("ftr.offer") + '</a>' +
          '<a href="' + PAGES.docs + '" data-i18n="ftr.rules">' + t("ftr.rules") + '</a>' +
          '<a href="' + PAGES.admin + '" data-i18n="ftr.admin">' + t("ftr.admin") + '</a>' +
        '</div>' +
      '</div>' +
    '</div></footer>';
  }

  function cookie() {
    return '<div class="cookie" id="cookie">' +
      '<div class="flex" style="align-items:flex-start;gap:14px">' +
        '<span class="ic-box ic-blue" style="width:40px;height:40px;border-radius:11px">' + ico("info") + '</span>' +
        '<div><b class="h-4" data-i18n="cookie.t">' + t("cookie.t") + '</b>' +
        '<p class="small muted" style="margin-top:6px" data-i18n="cookie.d">' + t("cookie.d") + '</p></div>' +
      '</div>' +
      '<div class="flex" style="margin-top:16px;gap:10px">' +
        '<button class="btn btn--dark btn--sm" data-cookie-ok data-i18n="cookie.ok">' + t("cookie.ok") + '</button>' +
        '<button class="btn btn--ghost btn--sm" data-cookie-ok data-i18n="cookie.no">' + t("cookie.no") + '</button>' +
      '</div></div>';
  }

  /* ---------- mount ---------- */
  function mount() {
    var h = document.getElementById("shell-header");
    if (h) h.outerHTML = header() + mobnav();
    var f = document.getElementById("shell-footer");
    if (f) f.outerHTML = footer();
    if (!document.querySelector(".toasts")) {
      var tw = document.createElement("div"); tw.className = "toasts"; document.body.appendChild(tw);
    }
    if (!document.getElementById("cookie")) {
      var c = document.createElement("div"); c.innerHTML = cookie(); document.body.appendChild(c.firstChild);
    }
    /* active nav */
    var page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach(function (n) {
      var map = { union: ["about", "docs", "partners"], help: ["appeal", "anon", "kb", "cases"],
                  media: ["news", "article", "video"], projects: ["xi", "camp", "jobs"], contact: ["contact"] };
      if ((map[n.dataset.nav] || []).indexOf(page) > -1) {
        var lk = n.classList.contains("nav__link") ? n : n.querySelector(".nav__link");
        if (lk) lk.classList.add("is-active");
      }
    });
    document.querySelectorAll("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
    App.icons();
    apply();
  }

  /* ---------- interactions ---------- */
  function bind() {
    /* header shadow */
    var hdr = document.getElementById("hdr");
    var onScroll = function () { if (hdr) hdr.classList.toggle("is-scrolled", window.scrollY > 12); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    /* dropdowns + lang + burger */
    document.addEventListener("click", function (e) {
      var navBtn = e.target.closest(".nav__item > .nav__link");
      var langBtn = e.target.closest(".lang__btn");
      document.querySelectorAll(".nav__item.is-open").forEach(function (n) {
        if (!navBtn || n !== navBtn.parentNode) n.classList.remove("is-open");
      });
      if (navBtn) { navBtn.parentNode.classList.toggle("is-open"); e.preventDefault(); }

      var lang = document.getElementById("lang");
      if (lang && !langBtn && !e.target.closest(".lang__menu")) lang.classList.remove("is-open");
      if (langBtn) lang.classList.toggle("is-open");

      var pick = e.target.closest(".lang__menu button");
      if (pick) { setLang(pick.dataset.lang); document.getElementById("lang").classList.remove("is-open"); }

      if (e.target.closest("#burger")) mobMenu(!mobState.open);
      if (e.target.closest("[data-mobnav-close]")) mobMenu(false);
      var mlang = e.target.closest(".mobnav__langs button");
      if (mlang) { setLang(mlang.dataset.lang); markMobLang(); }
      if (e.target.closest(".mobnav a")) mobMenu(false, true);

      /* accordion */
      var accHead = e.target.closest(".acc__head");
      if (accHead) {
        var item = accHead.closest(".acc__item");
        var group = item.closest(".acc");
        if (!group.hasAttribute("data-multi")) {
          group.querySelectorAll(".acc__item").forEach(function (i) { if (i !== item) i.classList.remove("is-open"); });
        }
        item.classList.toggle("is-open");
      }

      /* tabs */
      var tab = e.target.closest(".tab");
      if (tab && tab.dataset.tab) {
        var box = tab.closest("[data-tabs]");
        box.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("is-active"); });
        tab.classList.add("is-active");
        box.querySelectorAll(".tabpane").forEach(function (p) {
          p.classList.toggle("is-active", p.dataset.pane === tab.dataset.tab);
        });
      }

      /* modal */
      var mo = e.target.closest("[data-modal-open]");
      if (mo) { App.modal(mo.getAttribute("data-modal-open"), true); e.preventDefault(); }
      if (e.target.closest("[data-modal-close]") || e.target.classList.contains("modal__bg")) {
        var open = document.querySelector(".modal.is-open");
        if (open) App.modal(open.id, false);
      }

      /* cookie */
      if (e.target.closest("[data-cookie-ok]")) {
        document.getElementById("cookie").classList.remove("is-in");
        try { localStorage.setItem("ufu_cookie", "1"); } catch (err) {}
      }

      /* chips (filter groups) */
      var chip = e.target.closest("[data-chips] .chip");
      if (chip) {
        var g = chip.closest("[data-chips]");
        g.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var key = chip.dataset.val, list = document.querySelector(g.dataset.chips);
        if (list) list.querySelectorAll("[data-cat]").forEach(function (it) {
          it.style.display = (key === "all" || it.dataset.cat === key) ? "" : "none";
        });
      }

      /* radio option cards */
      var opt = e.target.closest(".opt");
      if (opt && opt.querySelector('input[type="radio"]')) {
        var inp = opt.querySelector("input");
        inp.checked = true;
        document.querySelectorAll('.opt input[name="' + inp.name + '"]').forEach(function (i) {
          i.closest(".opt").classList.toggle("is-checked", i.checked);
        });
      }
    });

    /* esc */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (mobState.open) mobMenu(false);
        var open = document.querySelector(".modal.is-open");
        if (open) App.modal(open.id, false);
        document.querySelectorAll(".nav__item.is-open").forEach(function (n) { n.classList.remove("is-open"); });
      }
    });

    /* reveal */
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    /* counters */
    var co = new IntersectionObserver(function (ent) {
      ent.forEach(function (x) {
        if (!x.isIntersecting) return;
        co.unobserve(x.target);
        var el = x.target, to = parseFloat(el.dataset.count), dur = 1500, st = performance.now();
        var dec = (el.dataset.count.indexOf(".") > -1) ? 1 : 0;
        (function step(now) {
          var p = Math.min((now - st) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          var v = to * e;
          el.textContent = dec ? v.toFixed(1) : Math.round(v).toLocaleString("ru-RU").replace(/,/g, " ");
          if (p < 1) requestAnimationFrame(step);
        })(st);
      });
    }, { threshold: .4 });
    document.querySelectorAll("[data-count]").forEach(function (el) { co.observe(el); });

    /* marquee duplicate */
    document.querySelectorAll(".marquee__track").forEach(function (tr) {
      if (tr.dataset.dup) return;
      tr.dataset.dup = "1";
      tr.innerHTML = tr.innerHTML + tr.innerHTML;
    });

    /* cookie show */
    var shown = false;
    try { shown = !!localStorage.getItem("ufu_cookie"); } catch (e) {}
    if (!shown) setTimeout(function () {
      var c = document.getElementById("cookie"); if (c) c.classList.add("is-in");
    }, 1800);
  }

  /* ---------- public helpers ---------- */
  /* [data-ico="name"] -> svg element boshiga qo'shiladi */
  App.icons = function (root) {
    (root || document).querySelectorAll("[data-ico]").forEach(function (el) {
      if (el.dataset.icoDone) return;
      el.dataset.icoDone = "1";
      el.insertAdjacentHTML("afterbegin", ico(el.dataset.ico));
    });
  };

  App.modal = function (id, open) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.toggle("is-open", open !== false);
    document.body.style.overflow = (open !== false) ? "hidden" : "";
  };

  App.toast = function (title, text, icon) {
    var w = document.querySelector(".toasts");
    if (!w) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="ic">' + ico(icon || "checkCircle") + '</span><div><b>' + title + '</b>' +
                   (text ? '<span>' + text + '</span>' : '') + '</div>';
    w.appendChild(el);
    setTimeout(function () {
      el.style.transition = ".4s"; el.style.opacity = "0"; el.style.transform = "translateX(24px)";
      setTimeout(function () { el.remove(); }, 400);
    }, 4200);
  };

  App.ticket = function () {
    var n = Math.floor(100000 + Math.random() * 899999);
    return "UFU-" + new Date().getFullYear() + "-" + n;
  };

  /* ---------- boot ---------- */
  function boot() { mount(); bind(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
