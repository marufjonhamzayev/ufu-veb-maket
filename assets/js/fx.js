/* =========================================================
   FX — futbol to'pi: intro, hero ichidagi interaktiv to'p,
   skroll to'pi, "yuqoriga" tugmasi, liquid glass yorqinligi.
   Tashqi kutubxonasiz; app.js'dan keyin ulanadi.
   ========================================================= */
(function () {
  "use strict";

  var doc = document, html = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var T = function (k, fb) { var v = window.App && App.t ? App.t(k) : k; return v === k ? fb : v; };

  /* ---------- to'p rasmi (bitta SVG symbol, hamma joyda qayta ishlatiladi) ---------- */
  function ballSymbol() {
    if (doc.getElementById("fx-ball-sym")) return;
    var P = [], cx = 50, cy = 50;
    function poly(x, y, r, rot) {
      var pts = [];
      for (var i = 0; i < 5; i++) {
        var a = (rot + i * 72) * Math.PI / 180;
        pts.push((x + r * Math.cos(a)).toFixed(2) + "," + (y + r * Math.sin(a)).toFixed(2));
      }
      return pts.join(" ");
    }
    var seams = "";
    P.push('<polygon points="' + poly(cx, cy, 15.5, -90) + '" fill="#0E1512"/>');
    for (var k = 0; k < 5; k++) {
      var va = (-90 + k * 72) * Math.PI / 180;          // markaziy beshburchak uchi
      var vx = cx + 15.5 * Math.cos(va), vy = cy + 15.5 * Math.sin(va);
      var ox = cx + 31 * Math.cos(va), oy = cy + 31 * Math.sin(va);
      seams += '<line x1="' + vx.toFixed(2) + '" y1="' + vy.toFixed(2) + '" x2="' + ox.toFixed(2) + '" y2="' + oy.toFixed(2) + '"/>';
      var ea = (-54 + k * 72) * Math.PI / 180;          // tashqi beshburchaklar (qirrada)
      var ex = cx + 47 * Math.cos(ea), ey = cy + 47 * Math.sin(ea);
      P.push('<polygon points="' + poly(ex, ey, 14.5, -54 + k * 72 + 180) + '" fill="#0E1512"/>');
      var sa = (-54 + k * 72) * Math.PI / 180;
      var s1x = ox, s1y = oy;
      var nva = (-90 + (k + 1) * 72) * Math.PI / 180;
      var s2x = cx + 31 * Math.cos(nva), s2y = cy + 31 * Math.sin(nva);
      var mx = cx + 36 * Math.cos(sa), my = cy + 36 * Math.sin(sa);
      seams += '<path d="M' + s1x.toFixed(2) + ' ' + s1y.toFixed(2) + ' L' + mx.toFixed(2) + ' ' + my.toFixed(2) + ' L' + s2x.toFixed(2) + ' ' + s2y.toFixed(2) + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">' +
      '<defs><clipPath id="fx-ball-clip"><circle cx="50" cy="50" r="49"/></clipPath></defs>' +
      '<symbol id="fx-ball-sym" viewBox="0 0 100 100">' +
        '<circle cx="50" cy="50" r="49" fill="#FDFDFB"/>' +
        '<g clip-path="url(#fx-ball-clip)">' + P.join("") +
          '<g stroke="#0E1512" stroke-width="1.6" stroke-opacity=".55" fill="none">' + seams + '</g>' +
        '</g>' +
        '<circle cx="50" cy="50" r="48.6" fill="none" stroke="rgba(14,21,18,.18)" stroke-width="1.2"/>' +
      '</symbol></svg>';
    var holder = doc.createElement("div");
    holder.innerHTML = svg;
    doc.body.insertBefore(holder.firstChild, doc.body.firstChild);
  }
  function ballEl(extra) {
    var b = doc.createElement("span");
    b.className = "fx-ball" + (extra ? " " + extra : "");
    b.innerHTML = '<svg class="fx-ball__pat" viewBox="0 0 100 100" aria-hidden="true"><use href="#fx-ball-sym"/></svg><span class="fx-ball__shade"></span>';
    return b;
  }

  /* ---------- liquid glass: yorug'lik kursorga ergashadi (faqat sichqonchada) ---------- */
  function glassLight() {
    if (!finePointer || reduce) return;
    var sel = ".hdr>.wrap,.hero__float,.card--dark,.nav__drop,.lang__menu,.modal__box,.cookie,.sticky-vote,.cd";
    var raf = 0, last = null;
    doc.addEventListener("pointermove", function (e) {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var t = last.target && last.target.closest ? last.target.closest(sel) : null;
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty("--mx", ((last.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        t.style.setProperty("--my", ((last.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    }, { passive: true });
  }

  /* ---------- header ichida skroll bo'yicha dumalaydigan to'p ---------- */
  function scrollBall() {
    var wrap = doc.querySelector(".hdr>.wrap");
    if (!wrap) return;
    var track = doc.createElement("div");
    track.className = "fx-track";
    track.innerHTML = '<span class="fx-track__fill"></span>';
    var b = ballEl();
    track.appendChild(b);
    wrap.appendChild(track);
    var fill = track.firstChild, raf = 0;
    function upd() {
      raf = 0;
      var max = Math.max(1, doc.documentElement.scrollHeight - innerHeight);
      var p = Math.min(1, Math.max(0, scrollY / max));
      var w = track.clientWidth - 12;
      var x = p * w;
      track.classList.toggle("is-on", scrollY > 40);
      fill.style.width = (x + 6) + "px";
      b.style.transform = "translateX(" + x.toFixed(1) + "px) rotate(" + (reduce ? 0 : (x / 6 * 57.3).toFixed(0)) + "deg)";
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener("resize", upd);
    upd();
  }

  /* ---------- "yuqoriga" — to'pni tepib yuqoriga chiqish ---------- */
  function topButton() {
    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "fx-top";
    btn.setAttribute("aria-label", T("fx.top", "Yuqoriga"));
    btn.setAttribute("data-i18n-aria", "fx.top");
    btn.appendChild(ballEl());
    doc.body.appendChild(btn);
    var raise = !!doc.querySelector(".sticky-vote");
    function upd() {
      var cookie = doc.querySelector(".cookie.is-in");
      btn.classList.toggle("is-on", scrollY > 900 && !cookie);
      btn.classList.toggle("is-raised", raise && innerWidth < 980);
    }
    addEventListener("scroll", upd, { passive: true });
    setInterval(upd, 1500);
    btn.addEventListener("click", function () {
      btn.classList.add("is-kicked");
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { btn.classList.remove("is-kicked"); upd(); }, 900);
    });
    upd();
  }

  /* =========================================================
     HERO ICHIDAGI TO'P — oddiy 2D fizika
     ========================================================= */
  var Kick = null;
  function heroBall() {
    var hero = doc.querySelector(".hero");
    if (!hero) return null;

    var pitch = doc.createElement("div");
    pitch.className = "hero__pitch";
    hero.insertBefore(pitch, hero.firstChild);

    var layer = doc.createElement("div");
    layer.className = "fx-play";
    layer.innerHTML = '<div class="fx-ground"></div>';
    var shadow = doc.createElement("div"); shadow.className = "fx-shadow";
    var trails = [];
    for (var i = 0; i < 4; i++) { var tr = doc.createElement("div"); tr.className = "fx-trail"; layer.appendChild(tr); trails.push(tr); }
    var el = doc.createElement("div");
    el.className = "fx-kick";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", T("fx.hint", "Tepib ko'ring"));
    var ball = ballEl();
    el.appendChild(ball);
    layer.appendChild(shadow);
    layer.appendChild(el);
    var hint = doc.createElement("div");
    hint.className = "fx-hint";
    hint.innerHTML = '<i></i><span data-i18n="' + (finePointer ? "fx.hint" : "fx.hint.touch") + '">' +
      T(finePointer ? "fx.hint" : "fx.hint.touch", finePointer ? "Tepib ko'ring" : "Barmoq bilan tepib ko'ring") + '</span>';
    layer.appendChild(hint);
    hero.appendChild(layer);

    var pat = ball.firstChild;
    var W = 0, H = 0, R = 32;
    var s = { x: 0, y: -80, vx: 0, vy: 0, a: 0, run: false, drag: false, touched: false };
    var G = 2300, BOUNCE = 0.62, AIR = 0.9985, ROLL = 0.985;
    var hist = [], last = 0, raf = 0, hintTimer = 0, hintShown = false;

    function measure() {
      W = layer.clientWidth; H = layer.clientHeight;
      R = el.offsetWidth / 2;
    }
    function restX() {
      // kompyuterda: matn va rasm oralig'i; telefonda: o'ng tomon
      if (W >= 1080) {
        var vis = hero.querySelector(".hero__visual");
        if (vis) {
          var left = 0, n = vis;
          while (n && n !== hero) { left += n.offsetLeft; n = n.offsetParent; }
          if (n === hero) return Math.max(R + 8, left - R - 26);
        }
        return W * 0.52;
      }
      return W - R - 22;
    }
    function floor() { return H - R - 2; }

    function draw() {
      el.style.transform = "translate3d(" + (s.x - R).toFixed(1) + "px," + (s.y - R).toFixed(1) + "px,0)";
      pat.style.transform = "rotate(" + (s.a * 57.2958).toFixed(1) + "deg)";
      var h = Math.max(0, floor() - s.y);
      var k = Math.max(0.25, 1 - h / 420);
      shadow.style.transform = "translate3d(" + (s.x - R).toFixed(1) + "px," + (H - 9) + "px,0) scale(" + k.toFixed(2) + ",1)";
      shadow.style.opacity = (0.25 + 0.75 * k).toFixed(2);
      var speed = Math.hypot(s.vx, s.vy);
      hist.unshift([s.x, s.y]); if (hist.length > 16) hist.pop();
      for (var i = 0; i < trails.length; i++) {
        var p = hist[(i + 1) * 3];
        if (!p || speed < 700 || reduce) { trails[i].style.opacity = 0; continue; }
        trails[i].style.transform = "translate3d(" + (p[0] - R).toFixed(1) + "px," + (p[1] - R).toFixed(1) + "px,0) scale(" + (1 - i * 0.16).toFixed(2) + ")";
        trails[i].style.opacity = (Math.min(1, (speed - 700) / 900) * (0.5 - i * 0.11)).toFixed(2);
      }
      if (hint.classList.contains("is-on")) {
        hint.style.transform = "translate3d(" + Math.min(W - hint.offsetWidth - 8, Math.max(8, s.x - hint.offsetWidth / 2)).toFixed(0) + "px," + (s.y - R - 46).toFixed(0) + "px,0)";
      }
    }
    function step(now) {
      raf = 0;
      var dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
      if (!s.drag) {
        s.vy += G * dt;
        s.vx *= AIR; s.vy *= AIR;
        s.x += s.vx * dt; s.y += s.vy * dt;
        var fl = floor();
        if (s.y > fl) {
          s.y = fl;
          if (Math.abs(s.vy) > 120) { s.vy = -s.vy * BOUNCE; }
          else { s.vy = 0; }
          s.vx *= ROLL;
          s.a += s.vx * dt / R;
        } else {
          s.a += s.vx * dt / R * 0.6;
        }
        if (s.x < R) { s.x = R; s.vx = Math.abs(s.vx) * 0.7; }
        if (s.x > W - R) { s.x = W - R; s.vx = -Math.abs(s.vx) * 0.7; }
        if (s.y < R && s.vy < 0) { s.y = R; s.vy = Math.abs(s.vy) * 0.5; }
        if (s.y >= fl && Math.abs(s.vx) < 6 && s.vy === 0) { s.vx = 0; s.run = false; }
      }
      draw();
      if (s.run || s.drag) raf = requestAnimationFrame(step);
    }
    function wake() { if (!raf) { last = 0; s.run = true; raf = requestAnimationFrame(step); } }

    function showHint() {
      if (s.touched || hintShown) return;
      hintShown = true;
      hint.classList.add("is-on"); draw();
      hintTimer = setTimeout(function () { hint.classList.remove("is-on"); }, 7000);
    }
    function touched() {
      if (s.touched) return;
      s.touched = true; clearTimeout(hintTimer); hint.classList.remove("is-on");
    }

    /* zarba: bosish = tepish, sudrab qo'yib yuborish = otish */
    var down = null;
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      touched();
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      var r = layer.getBoundingClientRect();
      down = { t: performance.now(), x: e.clientX, y: e.clientY, ox: s.x - (e.clientX - r.left), oy: s.y - (e.clientY - r.top), moved: false };
      hist.length = 0;
      s.drag = true; s.vx = s.vy = 0; wake();
      down.samples = [[down.t, s.x, s.y]];
    });
    el.addEventListener("pointermove", function (e) {
      if (!down) return;
      var r = layer.getBoundingClientRect();
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
      if (!down.moved) return;
      s.x = Math.max(R, Math.min(W - R, e.clientX - r.left + down.ox));
      s.y = Math.max(R, Math.min(floor(), e.clientY - r.top + down.oy));
      var now = performance.now();
      down.samples.push([now, s.x, s.y]);
      while (down.samples.length > 2 && now - down.samples[0][0] > 90) down.samples.shift();
    });
    function up(e) {
      if (!down) return;
      var d = down; down = null; s.drag = false;
      if (!d.moved) {
        var r = layer.getBoundingClientRect();
        var off = (s.x - (e.clientX - r.left)) / R;       // qaysi tomonidan tepildi
        s.vx = off * 520 + (Math.random() - 0.5) * 260;
        s.vy = -(1050 + Math.random() * 350);
      } else {
        var a = d.samples[0], b = d.samples[d.samples.length - 1], dt = Math.max(16, b[0] - a[0]) / 1000;
        s.vx = Math.max(-2600, Math.min(2600, (b[1] - a[1]) / dt));
        s.vy = Math.max(-2600, Math.min(2600, (b[2] - a[2]) / dt));
      }
      wake();
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); touched(); s.vy = -1200; s.vx = (Math.random() - 0.5) * 900; wake(); }
    });

    /* kompyuterda kursor bilan "dribling" */
    if (finePointer) {
      var pm = null;
      hero.addEventListener("pointermove", function (e) {
        if (s.drag) return;
        var r = layer.getBoundingClientRect(), now = performance.now();
        var px = e.clientX - r.left, py = e.clientY - r.top;
        if (pm) {
          var dt = Math.max(8, now - pm.t) / 1000, pvx = (px - pm.x) / dt, pvy = (py - pm.y) / dt;
          var dx = s.x - px, dy = s.y - py, dist = Math.hypot(dx, dy), minD = R + 10;
          if (dist < minD && Math.hypot(pvx, pvy) > 250) {
            var nx = dx / (dist || 1), ny = dy / (dist || 1);
            s.x = px + nx * minD; s.y = Math.min(floor(), py + ny * minD);
            s.vx = pvx * 0.85 + nx * 240; s.vy = Math.min(pvy * 0.85 + ny * 240, -380);
            touched(); wake();
          }
        }
        pm = { t: now, x: px, y: py };
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { pm = null; });
    }

    addEventListener("resize", function () {
      measure();
      s.x = Math.max(R, Math.min(W - R, s.x));
      if (!s.run) { s.x = restX(); s.y = floor(); draw(); }
    });
    doc.addEventListener("langchange", function () { if (window.App && App.apply) App.apply(hint); });

    measure();
    s.x = restX(); s.y = -R * 2;
    draw();

    return {
      el: el,
      /* yuqoridan hero ichiga tushadi */
      drop: function (delay) {
        setTimeout(function () {
          measure();
          s.x = restX(); s.y = -R * 2; s.vx = reduce ? 0 : -40; s.vy = 0;
          if (reduce) { s.y = floor(); draw(); showHint(); return; }
          wake();
          setTimeout(showHint, 1500);
        }, delay || 0);
      },
      /* intro to'pi qayerda "qo'nishi" kerak (ekran koordinatalari) */
      target: function () {
        measure();
        var r = layer.getBoundingClientRect();
        return { x: r.left + restX(), y: r.top + floor(), r: R };
      }
    };
  }

  /* =========================================================
     INTRO — to'p tepiladi, kameraga uchib keladi, sayt ochiladi
     ========================================================= */
  function splitWords(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/);
          var frag = doc.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(p)); return; }
            var sp = doc.createElement("span"); sp.className = "fx-w"; sp.textContent = p;
            frag.appendChild(sp); words.push(sp);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          walk(n);
        }
      });
    })(el);
    return words;
  }

  function burst(hero, cx, cy, instant) {
    var title = hero.querySelector(".hero__title");
    var parts = [hero.querySelector(".eyebrow")];
    var words = title ? splitWords(title) : [];
    var rest = [hero.querySelector(".lead"), hero.querySelector(".hero__cta"), hero.querySelector(".hero__trust"), hero.querySelector(".hero__visual")];
    var all = parts.concat(words, rest).filter(Boolean);
    [title].concat(parts, rest).forEach(function (n) { if (n) { n.classList.remove("reveal", "fx-pre"); n.classList.add("is-in"); } });
    if (instant) return;
    if (title) { title.classList.add("fx-mark-off"); setTimeout(function () { title.classList.remove("fx-mark-off"); }, 250 + words.length * 35 + 700); }
    all.forEach(function (n, i) {
      var r = n.getBoundingClientRect();
      var ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      var far = n.classList.contains("fx-w") ? 0.9 : 0.35;
      n.style.setProperty("--dx", ((cx - ex) * far).toFixed(0) + "px");
      n.style.setProperty("--dy", ((cy - ey) * far).toFixed(0) + "px");
      n.style.setProperty("--rot", ((Math.random() - 0.5) * 50).toFixed(0) + "deg");
      var dl = n.classList.contains("fx-w") ? 0.04 + i * 0.035 : 0.28 + (rest.indexOf(n) + 1) * 0.09 + words.length * 0.02;
      n.style.setProperty("--dl", dl.toFixed(2) + "s");
      n.classList.add("fx-fly");
    });
    void hero.offsetWidth;
    requestAnimationFrame(function () {
      all.forEach(function (n) { n.classList.add("fx-land"); n.classList.remove("fx-fly"); });
      setTimeout(function () {
        all.forEach(function (n) { n.classList.remove("fx-land"); ["--dx", "--dy", "--rot", "--dl"].forEach(function (p) { n.style.removeProperty(p); }); });
      }, 2600);
    });
  }

  function intro(hero) {
    var W = innerWidth, H = innerHeight, small = W < 700;
    var size = small ? 70 : 96;
    var groundY = Math.round(H * (small ? 0.66 : 0.7));
    var bx = W / 2, by = groundY - size / 2;

    var ov = doc.createElement("div");
    ov.className = "fx-intro";
    ov.setAttribute("aria-hidden", "true");
    ov.innerHTML =
      '<svg class="fx-intro__pitch" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
        '<g fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1.5">' +
          '<circle cx="' + (W / 2) + '" cy="' + groundY + '" r="' + Math.min(W, H) * 0.28 + '"/>' +
          '<line x1="0" y1="' + groundY + '" x2="' + W + '" y2="' + groundY + '"/>' +
          '<rect x="' + (W * 0.06) + '" y="' + (H * 0.12) + '" width="' + (W * 0.88) + '" height="' + (H * 0.8) + '" rx="6"/>' +
        '</g></svg>' +
      '<div class="fx-intro__glow"></div>' +
      '<div class="fx-intro__flash"></div>' +
      '<div class="fx-intro__brand">' + (window.BRAND_MARK || "") + '<span data-i18n="brand.full">' + T("brand.full", "Oʻzbekiston futbolchilar uyushmasi") + '</span></div>' +
      '<div class="fx-intro__ground" style="top:' + groundY + 'px"></div>' +
      '<svg class="fx-intro__swoosh" viewBox="0 0 ' + W + ' ' + H + '"><path d=""/></svg>' +
      '<div class="fx-intro__ring"></div>';
    var ghosts = [];
    for (var g = 0; g < 5; g++) {
      var gh = doc.createElement("div"); gh.className = "fx-intro__ghost";
      gh.style.width = gh.style.height = size + "px"; ov.appendChild(gh); ghosts.push(gh);
    }
    var bwrap = doc.createElement("div");
    bwrap.className = "fx-intro__ball";
    bwrap.style.width = bwrap.style.height = size + "px";
    var ball = ballEl(); bwrap.appendChild(ball); ov.appendChild(bwrap);
    var skip = doc.createElement("button");
    skip.type = "button"; skip.className = "fx-intro__skip";
    skip.innerHTML = '<span data-i18n="fx.skip">' + T("fx.skip", "Oʻtkazib yuborish") + '</span><span aria-hidden="true">→</span>';
    skip.setAttribute("aria-hidden", "false");
    ov.appendChild(skip);
    doc.body.appendChild(ov);

    var hdr = doc.querySelector(".hdr");
    if (hdr) hdr.classList.add("fx-drop");
    var done = false, timers = [], anims = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function A(el, kf, opt) { var a = el.animate(kf, opt); anims.push(a); return a; }

    function finish(skipped) {
      if (done) return; done = true;
      timers.forEach(clearTimeout);
      html.classList.remove("fx-intro");
      if (hdr) { hdr.classList.add("fx-drop--in"); setTimeout(function () { hdr.classList.remove("fx-drop", "fx-drop--in"); }, 1000); }
      if (skipped) {
        anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
        burst(hero, 0, 0, true);
        ov.remove();
        if (Kick) Kick.drop(80);
      } else {
        A(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease-out", fill: "forwards" })
          .onfinish = function () { ov.remove(); };
        if (Kick) Kick.drop(650);
      }
    }
    skip.addEventListener("click", function () { finish(true); });
    doc.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { doc.removeEventListener("keydown", esc); finish(true); } });

    var brand = ov.querySelector(".fx-intro__brand");
    A(brand, [{ opacity: 0, transform: "translate(-50%,-8px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 500, delay: 80, easing: "ease-out", fill: "forwards" });

    /* A) to'p tepadan tushib, ikki marta sakraydi */
    var tf = function (y, sx, sy, rot) { return "translate(" + (bx - size / 2) + "px," + y + "px) rotate(" + rot + "deg) scale(" + sx + "," + sy + ")"; };
    var top = -size * 1.5;
    A(bwrap, [
      { transform: tf(top, 1, 1, -120), offset: 0, easing: "cubic-bezier(.55,0,1,.45)" },
      { transform: tf(by - size / 2, 1, 1, 30), offset: 0.43, easing: "linear" },
      { transform: tf(by - size / 2 + size * 0.07, 1.14, 0.86, 36), offset: 0.47, easing: "linear" },
      { transform: tf(by - size / 2, 1, 1, 42), offset: 0.51, easing: "cubic-bezier(0,.55,.45,1)" },
      { transform: tf(by - size / 2 - (small ? 60 : 90), 1, 1, 110), offset: 0.67, easing: "cubic-bezier(.55,0,1,.45)" },
      { transform: tf(by - size / 2, 1, 1, 160), offset: 0.82, easing: "linear" },
      { transform: tf(by - size / 2 + size * 0.04, 1.08, 0.92, 164), offset: 0.85, easing: "linear" },
      { transform: tf(by - size / 2, 1, 1, 168), offset: 0.88, easing: "cubic-bezier(0,.55,.45,1)" },
      { transform: tf(by - size / 2 - 12, 1, 1, 182), offset: 0.94, easing: "cubic-bezier(.55,0,1,.45)" },
      { transform: tf(by - size / 2, 1, 1, 190), offset: 1 }
    ], { duration: 900, fill: "forwards" });

    /* B) zarba chizig'i to'pga uriladi */
    later(function () {
      var sw = ov.querySelector(".fx-intro__swoosh path");
      var sx0 = bx - Math.min(W * 0.42, 420), sy0 = groundY + (small ? 70 : 110);
      sw.setAttribute("d", "M" + sx0 + " " + sy0 + " Q " + (bx - size * 1.6) + " " + (groundY + size * 0.5) + " " + (bx - size * 0.45) + " " + (by + size * 0.05));
      var len = sw.getTotalLength();
      sw.style.strokeDasharray = len; sw.style.strokeDashoffset = len;
      A(sw, [{ strokeDashoffset: len, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.7 }, { strokeDashoffset: -len * 0.6, opacity: 0 }],
        { duration: 420, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" });
    }, 900);

    /* C) zarba: halqa, chaqnash, ekran silkinishi — to'p kameraga uchadi */
    later(function () {
      var ring = ov.querySelector(".fx-intro__ring");
      ring.style.width = ring.style.height = size + "px";
      ring.style.transform = "translate(" + (bx - size / 2) + "px," + (by - size / 2) + "px)";
      A(ring, [{ opacity: 1, transform: ring.style.transform + " scale(.6)" }, { opacity: 0, transform: ring.style.transform + " scale(4.2)" }], { duration: 560, easing: "ease-out", fill: "forwards" });
      var flash = ov.querySelector(".fx-intro__flash");
      flash.style.setProperty("--fx", (bx / W * 100) + "%"); flash.style.setProperty("--fy", (by / H * 100) + "%");
      A(flash, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: 520, easing: "ease-out" });
      A(ov, [{ transform: "translate(0,0)" }, { transform: "translate(-6px,4px)" }, { transform: "translate(5px,-3px)" }, { transform: "translate(-2px,2px)" }, { transform: "translate(0,0)" }], { duration: 260 });

      var tx = W * (small ? 0.5 : 0.6), ty = H * 0.36;
      var path = [];
      for (var i = 0; i <= 12; i++) {
        var p = i / 12, e = p * p * (3 - 2 * p);
        var x = bx + (tx - bx) * e, y = by + (ty - by) * e - Math.sin(p * Math.PI) * H * 0.16;
        var sc = 1 + Math.pow(p, 2.2) * (small ? 16 : 13);
        path.push({ x: x, y: y, sc: sc, p: p });
      }
      var kf = path.map(function (q) {
        return { transform: "translate(" + (q.x - size / 2) + "px," + (q.y - size / 2) + "px) rotate(" + (190 + q.p * 1080) + "deg) scale(" + q.sc + ")", offset: q.p };
      });
      kf[0].transform = "translate(" + (bx - size / 2) + "px," + (by - size / 2) + "px) rotate(190deg) scale(1.2,.8)";
      A(bwrap, kf, { duration: 900, easing: "cubic-bezier(.45,0,.75,.55)", fill: "forwards" });
      A(bwrap, [{ opacity: 1 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
      ghosts.forEach(function (gh, gi) {
        A(gh, kf.map(function (k) { return { transform: k.transform.replace(/rotate\([^)]+\)/, ""), offset: k.offset }; }),
          { duration: 900, delay: 45 * (gi + 1), easing: "cubic-bezier(.45,0,.75,.55)", fill: "forwards" });
        A(gh, [{ opacity: 0 }, { opacity: 0.55 - gi * 0.09, offset: 0.25 }, { opacity: 0, offset: 0.8 }, { opacity: 0 }], { duration: 900, delay: 45 * (gi + 1), fill: "forwards" });
      });
      A(brand, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 250, fill: "forwards" });

      /* D) to'p "kameradan o'tib" ketadi — orqasidan sayt ochiladi, matn zarba nuqtasidan uchib keladi */
      later(function () {
        A(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: "ease-in", fill: "forwards" });
        burst(hero, tx, ty, false);
        finish(false);
      }, 640);
    }, 1210);

    /* xavfsizlik: nima bo'lganda ham 5 soniyada intro yopiladi */
    setTimeout(function () { finish(true); }, 5000);
  }

  /* ---------- ishga tushirish ---------- */
  function init() {
    ballSymbol();
    glassLight();
    scrollBall();
    topButton();

    var hero = doc.querySelector(".hero");
    if (hero && doc.querySelector(".hero__title")) {
      Kick = heroBall();
    }
    var wantIntro = html.classList.contains("fx-intro") && hero && Kick && !reduce;
    window.__fxIntro = true;
    if (wantIntro) {
      try { sessionStorage.setItem("ufu-intro", "1"); } catch (e) {}
      /* hero elementlari intro tugaguncha yashirin turadi */
      [".eyebrow", ".hero__title", ".lead", ".hero__cta", ".hero__trust", ".hero__visual"].forEach(function (q) {
        var n = hero.querySelector(q); if (n) n.classList.add("fx-pre");
      });
      var go = function () { intro(hero); };
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go, go); else go();
    } else {
      html.classList.remove("fx-intro");
      try { sessionStorage.setItem("ufu-intro", "1"); } catch (e) {}
      if (Kick) Kick.drop(700);
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
