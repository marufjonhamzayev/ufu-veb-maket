/* =========================================================
   FX — futbol to'pi: penalti intro, hero ichidagi interaktiv 3D to'p,
   skroll to'pi, "yuqoriga" tugmasi, liquid glass yorqinligi.
   Tashqi kutubxonasiz; app.js'dan keyin ulanadi.
   ========================================================= */
(function () {
  "use strict";

  var doc = document, html = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var T = function (k, fb) { var v = window.App && App.t ? App.t(k) : k; return v === k ? fb : v; };
  var DPR = function (cap) { return Math.min(window.devicePixelRatio || 1, cap || 2); };

  /* =========================================================
     3D TO'P — klassik 32 panelli to'p, har piksel uchun hisoblanadi
     (panel = sferadagi og'irlikli Voronoi: 12 beshburchak + 20 oltiburchak)
     ========================================================= */
  var BALL = (function () {
    var P = (1 + Math.sqrt(5)) / 2;
    var v = [[-1, P, 0], [1, P, 0], [-1, -P, 0], [1, -P, 0], [0, -1, P], [0, 1, P], [0, -1, -P], [0, 1, -P], [P, 0, -1], [P, 0, 1], [-P, 0, -1], [-P, 0, 1]];
    function nrm(a) { var l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
    v = v.map(nrm);
    var dot = function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; };
    var adj = -2;
    for (var i = 1; i < 12; i++) adj = Math.max(adj, dot(v[0], v[i]));
    var hex = [];
    for (var a = 0; a < 12; a++) for (var b = a + 1; b < 12; b++) for (var c = b + 1; c < 12; c++) {
      if (dot(v[a], v[b]) > adj - 1e-6 && dot(v[a], v[c]) > adj - 1e-6 && dot(v[b], v[c]) > adj - 1e-6) {
        hex.push(nrm([v[a][0] + v[b][0] + v[c][0], v[a][1] + v[b][1] + v[c][1], v[a][2] + v[b][2] + v[c][2]]));
      }
    }
    return { pent: v, hex: hex };
  })();
  var LIGHT = (function () { var l = [-0.42, -0.62, 0.66], n = Math.hypot(l[0], l[1], l[2]); l = l.map(function (x) { return x / n; });
    var h = [l[0], l[1], l[2] + 1], m = Math.hypot(h[0], h[1], h[2]); return { l: l, h: h.map(function (x) { return x / m; }) }; })();

  function Ball3D(cap) {
    this.cv = doc.createElement("canvas");
    this.ctx = this.cv.getContext("2d");
    this.cap = cap || 2;
    this.px = 0;
    /* aylanish matritsasi (3x3, satr bo'yicha) — boshlang'ich burilish chiroyli ko'rinsin */
    this.R = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    this.rotate(0.35, -0.5, 0.2, 1);
    this.cp = new Float32Array(36); this.ch = new Float32Array(60);
  }
  Ball3D.prototype.setPx = function (px) {
    px = Math.max(8, Math.round(px));
    if (px === this.px) return;
    this.px = px;
    this.cv.width = this.cv.height = px;
    this.img = this.ctx.createImageData(px, px);
    var r = px / 2, n = 0, N = [], A = [], I = [];
    for (var y = 0; y < px; y++) for (var x = 0; x < px; x++) {
      var dx = (x + 0.5 - r) / r, dy = (y + 0.5 - r) / r, d2 = dx * dx + dy * dy;
      if (d2 > 1.0 + 2 / r) continue;
      var d = Math.sqrt(d2), k = d > 1 ? 1 / d : 1;
      var nx = dx * k, ny = dy * k, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      N.push(nx, ny, nz); A.push(Math.max(0, Math.min(1, (1 - d) * r + 0.5))); I.push((y * px + x) * 4); n++;
    }
    this.N = new Float32Array(N); this.A = new Float32Array(A); this.I = new Uint32Array(I); this.n = n;
  };
  Ball3D.prototype.setSize = function (cssPx) { this.setPx(cssPx * DPR(this.cap)); };
  /* o'q (ax,ay,az) atrofida burchak (rad) — ekran koordinatalari: x o'ngga, y pastga, z bizga */
  Ball3D.prototype.rotate = function (ax, ay, az, ang) {
    var l = Math.hypot(ax, ay, az); if (!l || !ang) return;
    ax /= l; ay /= l; az /= l;
    var c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
    var M = [t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay,
             t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax,
             t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c];
    var R = this.R, o = new Array(9);
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) o[i * 3 + j] = M[i * 3] * R[j] + M[i * 3 + 1] * R[3 + j] + M[i * 3 + 2] * R[6 + j];
    this.R = o;
  };
  Ball3D.prototype.spin = function (w, dt) {   // w = [wx,wy,wz] rad/s
    var m = Math.hypot(w[0], w[1], w[2]); if (m > 1e-4) this.rotate(w[0], w[1], w[2], m * dt);
  };
  Ball3D.prototype.render = function () {
    if (!this.px) return;
    var R = this.R, cp = this.cp, ch = this.ch, i, j;
    for (i = 0; i < 12; i++) { var p = BALL.pent[i]; cp[i * 3] = R[0] * p[0] + R[1] * p[1] + R[2] * p[2]; cp[i * 3 + 1] = R[3] * p[0] + R[4] * p[1] + R[5] * p[2]; cp[i * 3 + 2] = R[6] * p[0] + R[7] * p[1] + R[8] * p[2]; }
    for (i = 0; i < 20; i++) { var h = BALL.hex[i]; ch[i * 3] = R[0] * h[0] + R[1] * h[1] + R[2] * h[2]; ch[i * 3 + 1] = R[3] * h[0] + R[4] * h[1] + R[5] * h[2]; ch[i * 3 + 2] = R[6] * h[0] + R[7] * h[1] + R[8] * h[2]; }
    var N = this.N, A = this.A, I = this.I, D = this.img.data, n = this.n;
    var lx = LIGHT.l[0], ly = LIGHT.l[1], lz = LIGHT.l[2], hx = LIGHT.h[0], hy = LIGHT.h[1], hz = LIGHT.h[2];
    var SEAM = 0.05 * (40 / Math.max(40, this.px)) + 0.018;
    D.fill(0);
    for (var k = 0; k < n; k++) {
      var nx = N[k * 3], ny = N[k * 3 + 1], nz = N[k * 3 + 2];
      var bp = -2, h1 = -2, h2 = -2, d;
      for (i = 0; i < 36; i += 3) { d = nx * cp[i] + ny * cp[i + 1] + nz * cp[i + 2]; if (d > bp) bp = d; }
      for (j = 0; j < 60; j += 3) { d = nx * ch[j] + ny * ch[j + 1] + nz * ch[j + 2]; if (d > h1) { h2 = h1; h1 = d; } else if (d > h2) h2 = d; }
      var dP = Math.acos(bp > 1 ? 1 : bp) / 0.443, dH1 = Math.acos(h1 > 1 ? 1 : h1) / 0.557, dH2 = Math.acos(h2 > 1 ? 1 : h2) / 0.557;
      var br, bg, bb, gap;
      if (dP < dH1) { br = 22; bg = 24; bb = 23; gap = dH1 - dP; }
      else { br = 240; bg = 241; bb = 236; gap = (dP < dH2 ? dP : dH2) - dH1; }
      if (gap < SEAM) {                          // tikuv chizig'i
        var t = gap / SEAM; t = t * t * (3 - 2 * t);
        br = 70 + (br - 70) * t; bg = 73 + (bg - 73) * t; bb = 70 + (bb - 70) * t;
      }
      var L = nx * lx + ny * ly + nz * lz; if (L < 0) L = 0;
      var s = nx * hx + ny * hy + nz * hz, sp = 0;
      if (s > 0) { var s2 = s * s, s4 = s2 * s2, s8 = s4 * s4, s16 = s8 * s8; sp = s16 * s16 * s8 * 0.62 + s8 * 0.06; }
      var rim = 0.62 + 0.38 * Math.sqrt(Math.sqrt(nz));
      var sh = (0.26 + 0.82 * L) * rim;
      var env = ny > 0 ? ny * ny * 0.16 : 0;         // pastdan maydon yashili aksi
      var o = I[k];
      var r = br * sh + 255 * sp + 30 * env * (br / 255), g = bg * sh + 255 * sp + 95 * env * (bg / 255), b = bb * sh + 255 * sp + 55 * env * (bb / 255);
      D[o] = r > 255 ? 255 : r; D[o + 1] = g > 255 ? 255 : g; D[o + 2] = b > 255 ? 255 : b; D[o + 3] = A[k] * 255;
    }
    this.ctx.putImageData(this.img, 0, 0);
  };
  /* DOM'ga qo'yiladigan to'p: <span class="fx-ball"><canvas></canvas></span> */
  function ballEl(css, cap) {
    var wrap = doc.createElement("span"); wrap.className = "fx-ball";
    var b = new Ball3D(cap); b.setSize(css); b.render();
    wrap.appendChild(b.cv); wrap.ball = b;
    return wrap;
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
    var wrap = doc.querySelector("#hdr>.wrap");   /* faqat saytning haqiqiy header'i */
    if (!wrap) return;
    var track = doc.createElement("div");
    track.className = "fx-track";
    track.innerHTML = '<span class="fx-track__fill"></span>';
    var el = ballEl(14, 3), ball = el.ball;
    track.appendChild(el);
    wrap.appendChild(track);
    var fill = track.firstChild, raf = 0, lastX = 0;
    function upd() {
      raf = 0;
      var max = Math.max(1, doc.documentElement.scrollHeight - innerHeight);
      var p = Math.min(1, Math.max(0, scrollY / max));
      var w = track.clientWidth - 14, x = p * w;
      track.classList.toggle("is-on", scrollY > 40);
      fill.style.width = (x + 7) + "px";
      el.style.transform = "translateX(" + x.toFixed(1) + "px)";
      if (!reduce && Math.abs(x - lastX) > 0.2) { ball.rotate(0.15, 0, 1, (x - lastX) / 7); ball.render(); }
      lastX = x;
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
    var el = ballEl(30, 2), ball = el.ball;
    btn.appendChild(el);
    doc.body.appendChild(btn);
    var raise = !!doc.querySelector(".sticky-vote");
    function upd() {
      var cookie = doc.querySelector(".cookie.is-in");
      btn.classList.toggle("is-on", scrollY > 900 && !cookie);
      btn.classList.toggle("is-raised", raise && innerWidth < 980);
    }
    addEventListener("scroll", upd, { passive: true });
    setInterval(upd, 1500);
    var spinning = 0;
    function spin(ms) {
      if (reduce) return;
      var st = performance.now(), prev = st;
      cancelAnimationFrame(spinning);
      (function f(now) {
        ball.spin([-14, 3, 2], (now - prev) / 1000); ball.render(); prev = now;
        if (now - st < ms) spinning = requestAnimationFrame(f);
      })(st);
    }
    btn.addEventListener("pointerenter", function () { spin(380); });
    btn.addEventListener("click", function () {
      btn.classList.add("is-kicked"); spin(600);
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { btn.classList.remove("is-kicked"); upd(); }, 900);
    });
    upd();
  }

  /* =========================================================
     HERO ICHIDAGI TO'P — 2D fizika + 3D aylanish
     Kompyuterda: rasmning o'ng pastida (hero tubida).
     Telefon/planshetda: rasm kartochkasining ustki qirrasida — ekranda ko'rinib turadi.
     ========================================================= */
  var Kick = null;
  function heroBall() {
    var hero = doc.querySelector(".hero");
    if (!hero) return null;

    var layer = doc.createElement("div");
    layer.className = "fx-play";
    var shadow = doc.createElement("div"); shadow.className = "fx-shadow";
    var el = doc.createElement("div");
    el.className = "fx-kick";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", T("fx.hint", "Toʻpni tepib koʻring"));
    layer.appendChild(shadow);
    layer.appendChild(el);
    var hint = doc.createElement("div");
    hint.className = "fx-hint";
    hint.innerHTML = '<i></i><span data-i18n="' + (finePointer ? "fx.hint" : "fx.hint.touch") + '">' +
      T(finePointer ? "fx.hint" : "fx.hint.touch", finePointer ? "Toʻpni tepib koʻring" : "Toʻpni barmoq bilan tepib koʻring") + '</span>';
    layer.appendChild(hint);
    hero.appendChild(layer);

    var W = 0, H = 0, R = 32, FL = 0;
    var bel = null, ball = null;
    var s = { x: 0, y: -80, vx: 0, vy: 0, w: [0, 0, 0], run: false, drag: false, touched: false, placed: false };
    var G = 2300, BOUNCE = 0.62, AIR = 0.9985, ROLL = 0.985;
    var last = 0, raf = 0, hintTimer = 0, hintShown = false;

    function offsetIn(node) {           // transformlarsiz, hero ichidagi joylashuv
      var x = 0, y = 0, n = node;
      while (n && n !== hero) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return n === hero ? { x: x, y: y, w: node.offsetWidth, h: node.offsetHeight } : null;
    }
    function measure() {
      W = layer.clientWidth; H = layer.clientHeight;
      var css = el.offsetWidth || 64;
      R = css / 2;
      if (!bel) { bel = ballEl(css, 2); ball = bel.ball; el.appendChild(bel); }
      else if (Math.abs(ball.px - css * DPR(2)) > 1) { ball.setSize(css); ball.render(); }
      FL = H - R - 2;                                // hero tubi — klublar qatori ustida
    }
    function restX() {
      var vis = hero.querySelector(".hero__visual"), v = vis && offsetIn(vis);
      if (v) return Math.min(W - R - 12, v.x + v.w - R - 14);
      return W - R - 22;
    }
    function floor() { return FL; }

    function draw(renderBall) {
      el.style.transform = "translate3d(" + (s.x - R).toFixed(1) + "px," + (s.y - R).toFixed(1) + "px,0)";
      if (renderBall) ball.render();
      var h = Math.max(0, floor() - s.y);
      var k = Math.max(0.2, 1 - h / 380);
      shadow.style.transform = "translate3d(" + (s.x - R).toFixed(1) + "px," + (FL + R - 7).toFixed(1) + "px,0) scale(" + k.toFixed(2) + "," + (0.6 + 0.4 * k).toFixed(2) + ")";
      shadow.style.opacity = (0.15 + 0.85 * k).toFixed(2);
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
          if (Math.abs(s.vy) > 120) {
            s.vy = -s.vy * BOUNCE;
            s.w[0] *= 0.55; s.w[1] *= 0.55; s.w[2] = s.w[2] * 0.4 + (s.vx / R) * 0.6;
          } else { s.vy = 0; }
          s.vx *= ROLL;
          if (s.vy === 0) { s.w[0] *= 0.85; s.w[1] *= 0.85; s.w[2] = s.vx / R; }
        } else {
          s.w[0] *= 0.995; s.w[1] *= 0.995; s.w[2] *= 0.995;
        }
        if (s.x < R) { s.x = R; s.vx = Math.abs(s.vx) * 0.7; s.w[2] *= -0.6; s.w[1] += 3; }
        if (s.x > W - R) { s.x = W - R; s.vx = -Math.abs(s.vx) * 0.7; s.w[2] *= -0.6; s.w[1] -= 3; }
        if (s.y < R && s.vy < 0) { s.y = R; s.vy = Math.abs(s.vy) * 0.5; }
        if (s.y >= fl && Math.abs(s.vx) < 6 && s.vy === 0) { s.vx = 0; s.w = [0, 0, 0]; s.run = false; }
      }
      if (!reduce) ball.spin(s.w, dt);
      draw(true);
      if (s.run || s.drag) raf = requestAnimationFrame(step);
    }
    function wake() { if (!raf) { last = 0; s.run = true; raf = requestAnimationFrame(step); } }

    function showHint() {
      if (s.touched || hintShown) return;
      hintShown = true;
      hint.classList.add("is-on"); draw(false);
      hintTimer = setTimeout(function () { hint.classList.remove("is-on"); }, 7000);
    }
    function touched() {
      if (s.touched) return;
      s.touched = true; clearTimeout(hintTimer); hint.classList.remove("is-on");
    }
    function kickSpin(vx, vy) {
      var r = function () { return (Math.random() - 0.5); };
      s.w = [vy / R * 0.35 + r() * 10, vx / R * 0.45 + r() * 10, vx / R * 0.5 + r() * 4];
    }

    var down = null;
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      touched();
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      var r = layer.getBoundingClientRect();
      down = { t: performance.now(), x: e.clientX, y: e.clientY, ox: s.x - (e.clientX - r.left), oy: s.y - (e.clientY - r.top), moved: false };
      s.drag = true; s.vx = s.vy = 0; wake();
      down.samples = [[down.t, s.x, s.y]];
    });
    el.addEventListener("pointermove", function (e) {
      if (!down) return;
      var r = layer.getBoundingClientRect();
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
      if (!down.moved) return;
      var nx = Math.max(R, Math.min(W - R, e.clientX - r.left + down.ox));
      var ny = Math.max(R, Math.min(floor(), e.clientY - r.top + down.oy));
      s.w = [(ny - s.y) / R * 20, (nx - s.x) / R * 20, 0];
      s.x = nx; s.y = ny;
      var now = performance.now();
      down.samples.push([now, s.x, s.y]);
      while (down.samples.length > 2 && now - down.samples[0][0] > 90) down.samples.shift();
    });
    function up(e) {
      if (!down) return;
      var d = down; down = null; s.drag = false;
      if (!d.moved) {
        var r = layer.getBoundingClientRect();
        var off = (s.x - (e.clientX - r.left)) / R;
        s.vx = off * 520 + (Math.random() - 0.5) * 260;
        s.vy = -(1050 + Math.random() * 350);
      } else {
        var a = d.samples[0], b = d.samples[d.samples.length - 1], dt = Math.max(16, b[0] - a[0]) / 1000;
        s.vx = Math.max(-2600, Math.min(2600, (b[1] - a[1]) / dt));
        s.vy = Math.max(-2600, Math.min(2600, (b[2] - a[2]) / dt));
      }
      kickSpin(s.vx, s.vy);
      wake();
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); touched(); s.vy = -1200; s.vx = (Math.random() - 0.5) * 900; kickSpin(s.vx, s.vy); wake(); }
    });

    if (finePointer) {
      var pm = null;
      hero.addEventListener("pointermove", function (e) {
        if (s.drag || !s.placed) return;
        var r = layer.getBoundingClientRect(), now = performance.now();
        var px = e.clientX - r.left, py = e.clientY - r.top;
        if (pm) {
          var dt = Math.max(8, now - pm.t) / 1000, pvx = (px - pm.x) / dt, pvy = (py - pm.y) / dt;
          var dx = s.x - px, dy = s.y - py, dist = Math.hypot(dx, dy), minD = R + 10;
          if (dist < minD && Math.hypot(pvx, pvy) > 250) {
            var nx = dx / (dist || 1), ny = dy / (dist || 1);
            s.x = px + nx * minD; s.y = Math.min(floor(), py + ny * minD);
            s.vx = pvx * 0.85 + nx * 240; s.vy = Math.min(pvy * 0.85 + ny * 240, -380);
            kickSpin(s.vx, s.vy);
            touched(); wake();
          }
        }
        pm = { t: now, x: px, y: py };
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { pm = null; });
    }

    /* O'lcham o'zgarishi: telefonda skroll paytida manzil satri yashirinib-chiqadi va "resize" keladi.
       To'p hech qachon boshlang'ich joyiga qaytarilmaydi — faqat chegaralar ichida ushlab turiladi
       va yangi "yer" balandligiga moslashtiriladi. */
    var lastW = 0;
    addEventListener("resize", function () {
      var oldFL = FL;
      measure();
      if (W === lastW && Math.abs(FL - oldFL) < 1) return;
      lastW = W;
      s.x = Math.max(R, Math.min(W - R, s.x));
      if (!s.placed) { draw(false); return; }
      if (!s.run && !s.drag) {
        if (!s.touched && !reduce) s.x = restX();
        s.y = floor();
        draw(false);
      } else if (s.y > floor()) { s.y = floor(); }
    });

    measure();
    lastW = W;
    el.style.visibility = "hidden"; shadow.style.opacity = 0;
    s.x = restX(); s.y = -R * 2;
    draw(false);

    return {
      layer: layer,
      size: function () { measure(); return R * 2; },
      /* (eski intro API) — ekran koordinatalarida (transformlarsiz) */
      target: function () {
        measure();
        var h = offsetIn(layer) || { x: 0, y: 0 }, hr = hero.getBoundingClientRect(), bt = doc.body.getBoundingClientRect().top + scrollY;
        void h; void bt;
        return { x: restX(), floor: floor(), heroTop: hero.offsetTop, heroLeft: hr.left };
      },
      /* intro to'pidan qabul qilish: ekrandagi joy, tezlik, aylanish matritsasi */
      enter: function (sx, sy, vx, vy, R3, w) {
        measure();
        var r = layer.getBoundingClientRect();
        s.x = Math.max(R, Math.min(W - R, sx - r.left)); s.y = sy - r.top;
        s.vx = vx; s.vy = vy; s.w = w ? w.slice() : [2.5, -1.5, -0.8];
        if (R3) ball.R = R3.slice();
        s.placed = true;
        el.style.visibility = ""; ball.render(); draw(false);
        wake();
        setTimeout(showHint, 1600);
      },
      drop: function (delay) {
        setTimeout(function () {
          measure();
          s.placed = true; el.style.visibility = "";
          s.x = restX(); s.y = -R * 2; s.vx = 0; s.vy = 0; s.w = [2.5, -1.5, -0.8];
          if (reduce) { s.y = floor(); draw(false); showHint(); return; }
          wake();
          setTimeout(showHint, 1500);
        }, delay || 0);
      }
    };
  }

  /* dizayn tizimi sahifasi uchun: 3D to'pni istalgan joyga qo'yish */
  window.UFU_FX = { ball: ballEl };

  /* ---------- ishga tushirish ---------- */
  function init() {
    glassLight();
    scrollBall();
    topButton();

    var hero = doc.querySelector(".hero");
    var title = hero && hero.querySelector(".hero__title");
    if (title) {
      Kick = heroBall();
      /* to'p o'ng burchakdan tushayotganda sarlavhadagi lime chiziqlar chiziladi */
      if (!reduce) {
        title.classList.add("fx-mark-off");
        void title.offsetWidth;
        setTimeout(function () { title.classList.remove("fx-mark-off"); }, 950);
      }
      if (Kick) Kick.drop(700);
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
