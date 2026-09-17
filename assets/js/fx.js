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
    var wrap = doc.querySelector(".hdr>.wrap");
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

    var pitch = doc.createElement("div");
    pitch.className = "hero__pitch";
    hero.insertBefore(pitch, hero.firstChild);

    var layer = doc.createElement("div");
    layer.className = "fx-play";
    var ground = doc.createElement("div"); ground.className = "fx-ground";
    layer.appendChild(ground);
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
      var vis = hero.querySelector(".hero__visual"), v = vis && offsetIn(vis);
      if (W < 1080 && v) FL = v.y - R - 1;          // rasm ustki qirrasi — "yer"
      else FL = H - R - 2;                           // hero tubi
      ground.style.top = (FL + R + 1) + "px";
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
      /* intro to'pi qayerga "tushishi" kerak — ekran koordinatalarida (transformlarsiz) */
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
          s.x = restX(); s.y = -R * 2; s.vx = reduce ? 0 : -40; s.vy = 0; s.w = [2.5, -1.5, -0.8];
          if (reduce) { s.y = floor(); draw(false); showHint(); return; }
          wake();
          setTimeout(showHint, 1500);
        }, delay || 0);
      }
    };
  }

  /* =========================================================
     INTRO — kamera tushayotgan 3D to'pga ergashadi:
     kechki osmon → projektor minoralari → tribunalar → sayt.
     Sahna saytning "tepasidagi davomi": oxirida sahna tubi saytning
     tepa qatori bilan bir xil rangda tugaydi va sayt pastdan ko'tariladi.
     ========================================================= */
  function intro(hero) {
    var W = innerWidth, H = innerHeight, small = W < 700;
    var DUR = 1800;                                   // umumiy davomiylik (ms)
    var CAM0 = 120, CAM1 = DUR;                       // kamera harakati oralig'i
    var SH = Math.round(H * (small ? 1.9 : 1.7));   // sahna balandligi (px)
    var body = doc.body;

    window.scrollTo(0, 0);
    html.classList.add("fx-intro-run");

    /* ---- qatlam tuvallari (fon xira bo'lgani uchun past aniqlikda) ---- */
    var LS = small ? 1 : 0.6;
    function layerCanvas(h) { var c = doc.createElement("canvas"); c.width = Math.round(W * LS); c.height = Math.round(h * LS); var x = c.getContext("2d"); x.scale(LS, LS); return { c: c, x: x, h: h }; }
    var rnd = (function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; })(20260917);

    /* 1) osmon va tuman — sekin (0.55) */
    var PF = 0.55, far = layerCanvas(SH * PF + H);
    (function () {
      var x = far.x, h = far.h;
      var g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#010302"); g.addColorStop(0.55, "#03100a"); g.addColorStop(1, "#0a2a1c");
      x.fillStyle = g; x.fillRect(0, 0, W, h);
      for (var i = 0; i < 9; i++) {
        var cx = rnd() * W, cy = h * (0.25 + rnd() * 0.7), r = Math.max(W, H) * (0.25 + rnd() * 0.35);
        var rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, "rgba(90,140,110," + (0.05 + rnd() * 0.05) + ")"); rg.addColorStop(1, "rgba(90,140,110,0)");
        x.fillStyle = rg; x.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      for (var s = 0; s < (small ? 60 : 140); s++) {
        x.fillStyle = "rgba(255,255,255," + (0.15 + rnd() * 0.45) + ")";
        x.beginPath(); x.arc(rnd() * W, rnd() * h * 0.45, 0.4 + rnd() * 0.9, 0, 7); x.fill();
      }
    })();

    /* 2) projektor minoralari, nurlar, tribunalar — asosiy (0.9) */
    var MF = 0.9, mid = layerCanvas(SH * MF + H);
    var lampsY = H * 0.95, standTop = mid.h - H * 1.05;
    (function () {
      var x = mid.x, h = mid.h, i, j;
      /* nur konuslari */
      x.globalCompositeOperation = "lighter";
      [[W * 0.06, 1], [W * 0.94, -1]].forEach(function (L) {
        var lx = L[0], dir = L[1];
        var cone = x.createLinearGradient(lx, lampsY, lx + dir * W * 0.5, lampsY + H * 1.3);
        cone.addColorStop(0, "rgba(225,255,215,.20)"); cone.addColorStop(0.5, "rgba(210,245,200,.06)"); cone.addColorStop(1, "rgba(210,245,200,0)");
        x.fillStyle = cone; x.beginPath();
        x.moveTo(lx - dir * 10, lampsY); x.lineTo(lx + dir * W * 0.15, lampsY + H * 1.5); x.lineTo(lx + dir * W * 0.95, lampsY + H * 1.2); x.lineTo(lx + dir * 40, lampsY - 6);
        x.closePath(); x.fill();
      });
      x.globalCompositeOperation = "source-over";
      /* minoralar (siluet) */
      [[W * 0.06, 1], [W * 0.94, -1]].forEach(function (L) {
        var lx = L[0], pw = Math.max(5, W * 0.006);
        x.fillStyle = "#020805"; x.fillRect(lx - pw / 2, lampsY + 26, pw, standTop - lampsY);
        var bw = Math.min(W * 0.2, 150), bh = bw * 0.45, bx = lx - bw / 2, by = lampsY - bh / 2;
        x.fillStyle = "#050d09"; x.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
        var cols = 6, rows = 3, cw = bw / cols, ch = bh / rows;
        for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
          x.fillStyle = "rgba(255,255,248,.96)";
          x.beginPath(); x.arc(bx + cw * (i + 0.5), by + ch * (j + 0.5), Math.min(cw, ch) * 0.34, 0, 7); x.fill();
        }
        x.globalCompositeOperation = "lighter";
        var bl = x.createRadialGradient(lx, lampsY, 0, lx, lampsY, bw * 2.4);
        bl.addColorStop(0, "rgba(240,255,230,.55)"); bl.addColorStop(0.25, "rgba(210,245,200,.18)"); bl.addColorStop(1, "rgba(210,245,200,0)");
        x.fillStyle = bl; x.fillRect(lx - bw * 2.4, lampsY - bw * 2.4, bw * 4.8, bw * 4.8);
        x.globalCompositeOperation = "source-over";
      });
      /* tribunalar: pog'onali, xira chiroqlar */
      var tg = x.createLinearGradient(0, standTop, 0, h);
      tg.addColorStop(0, "rgba(4,12,8,0)"); tg.addColorStop(0.12, "#06130c"); tg.addColorStop(1, "#0B2A1F");
      x.fillStyle = tg; x.fillRect(0, standTop, W, h - standTop);
      x.strokeStyle = "rgba(200,240,190,.10)"; x.lineWidth = 1;
      for (i = 0; i < 9; i++) { var yy = standTop + H * 0.12 + i * H * 0.075; x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); }
      x.globalCompositeOperation = "lighter";
      for (i = 0; i < (small ? 160 : 420); i++) {
        var py = standTop + H * 0.1 + rnd() * H * 0.72, px = rnd() * W, rr = 0.6 + rnd() * 1.8;
        var warm = rnd() < 0.8;
        x.fillStyle = (warm ? "rgba(255,238,205," : "rgba(200,240,60,") + (0.08 + rnd() * 0.3) + ")";
        x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill();
      }
      /* tribuna tomining qirrasi */
      var re = x.createLinearGradient(0, standTop + H * 0.08, 0, standTop + H * 0.12);
      re.addColorStop(0, "rgba(220,255,210,0)"); re.addColorStop(1, "rgba(220,255,210,.14)");
      x.fillStyle = re; x.fillRect(0, standTop + H * 0.08, W, H * 0.04);
      x.globalCompositeOperation = "source-over";
    })();

    /* 3) yaqin chang zarralari — fokusdan tashqarida, tez (1.35) */
    var NF = 1.35, dust = [];
    for (var d = 0; d < (small ? 16 : 26); d++) dust.push({ x: rnd() * W, y: rnd() * (SH * NF + H), r: 6 + rnd() * (small ? 22 : 34), a: 0.03 + rnd() * 0.08, lime: rnd() < 0.25 });

    /* ---- asosiy tuval ---- */
    var dpr = DPR(2);
    var ov = doc.createElement("div");
    ov.className = "fx-intro";
    ov.setAttribute("aria-hidden", "true");
    var cv = doc.createElement("canvas");
    cv.className = "fx-intro__cv";
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ov.appendChild(cv);
    var brand = doc.createElement("div");
    brand.className = "fx-intro__brand";
    brand.innerHTML = (window.BRAND_MARK || "") + '<span data-i18n="brand.full">' + T_("brand.full", "Oʻzbekiston futbolchilar uyushmasi") + '</span>';
    ov.appendChild(brand);
    var skip = doc.createElement("button");
    skip.type = "button"; skip.className = "fx-intro__skip";
    skip.innerHTML = '<span data-i18n="fx.skip">' + T_("fx.skip", "Oʻtkazib yuborish") + '</span><span aria-hidden="true">→</span>';
    ov.appendChild(skip);
    html.appendChild(ov);                            // body'dan tashqarida: body siljiganda sahna joyida qoladi
    var ctx = cv.getContext("2d");
    function T_(k, fb) { return T(k, fb); }

    /* ---- to'p va uning manzili (sayt ichida) ---- */
    var hero3 = Kick;
    var endSize = hero3.size();
    var tgt = hero3.target();
    var heroRect = hero.getBoundingClientRect();     // body hali siljimagan
    var endX = heroRect.left + tgt.x;
    var floorY = heroRect.top + tgt.floor;           // "yer" (to'p markazi) ekranda, kamera yetib kelganda
    var endY = Math.min(floorY - endSize * 2.2, H * 0.72);
    endY = Math.max(endY, H * 0.34);
    var startSize = endSize * (small ? 2.3 : 2.6);
    var ball = new Ball3D(2);
    ball.rotate(0.3, 1, 0.2, 0.8);
    var W_SPIN = [3.2, -2.2, 1.6];
    var x0 = small ? W * 0.58 : W * 0.56, midY = H * 0.42;

    body.style.willChange = "transform";
    body.style.transform = "translate3d(0," + SH + "px,0)";
    html.classList.remove("fx-intro");               // qora qopqoq endi kerak emas — sahna uni almashtiradi

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function ballAt(t) {                              // ekran koordinatalari va o'lcham
      var x, y, sz;
      var p = Math.min(1, t / DUR);
      x = x0 + (endX - x0) * ease(Math.max(0, (t - 350) / (DUR - 350)));
      sz = startSize + (endSize - startSize) * ease(p);
      if (t < 420) { var a = t / 420; y = -startSize + (midY + startSize) * a * a; }
      else if (t < DUR - 380) { var b = (t - 420) / (DUR - 800); y = midY + H * 0.05 * b; }
      else { var c = (t - (DUR - 380)) / 380; y = midY + H * 0.05 + (endY - midY - H * 0.05) * c * c; }
      return { x: x, y: y, s: sz };
    }

    var t0 = 0, raf = 0, done = false, hist = [];
    function frame(now) {
      if (!t0) t0 = now;
      var t = window.__fxT != null ? window.__fxT : now - t0;   /* __fxT — faqat avtomatik test uchun */
      if (t > DUR) t = DUR;
      var cp = ease(Math.max(0, Math.min(1, (t - CAM0) / (CAM1 - CAM0))));
      var cam = cp * SH;
      body.style.transform = "translate3d(0," + (SH - cam).toFixed(1) + "px,0)";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bottom = SH - cam;                          // sahna tubi ekranda (undan pasti — sayt)
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, Math.max(0, bottom)); ctx.clip();
      ctx.drawImage(far.c, 0, -cam * PF, W, far.h);
      ctx.drawImage(mid.c, 0, -cam * MF, W, mid.h);
      /* chang zarralari */
      ctx.globalCompositeOperation = "lighter";
      dust.forEach(function (q) {
        var y = q.y - cam * NF; if (y < -q.r || y > H + q.r) return;
        var g = ctx.createRadialGradient(q.x, y, 0, q.x, y, q.r);
        g.addColorStop(0, (q.lime ? "rgba(200,240,60," : "rgba(230,255,225,") + q.a + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(q.x - q.r, y - q.r, q.r * 2, q.r * 2);
      });
      ctx.globalCompositeOperation = "source-over";
      /* sahna tubi saytning tepa qatori bilan bir xil rangga o'tadi */
      var seam = ctx.createLinearGradient(0, bottom - H * 0.18, 0, bottom);
      seam.addColorStop(0, "rgba(11,42,31,0)"); seam.addColorStop(1, "rgba(11,42,31,1)");
      ctx.fillStyle = seam; ctx.fillRect(0, bottom - H * 0.18, W, H * 0.18);
      /* vinyetka */
      var vg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.5)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, bottom);
      ctx.restore();
      if (t < 160) { ctx.fillStyle = "rgba(1,4,3," + (1 - t / 160) + ")"; ctx.fillRect(0, 0, W, H); }

      /* to'p: harakat xiraligi + projektorlar yonidan o'tganda yorqinlik */
      var B = ballAt(t);
      if (!reduce) ball.spin(W_SPIN, 1 / 60);
      var want = B.s * dpr;
      if (!ball.px || Math.abs(want - ball.px) / ball.px > 0.1) ball.setPx(want);
      ball.render();
      hist.unshift(B); if (hist.length > 6) hist.pop();
      for (var i = hist.length - 1; i >= 1; i -= 2) {
        var q = hist[i];
        ctx.globalAlpha = 0.07 * (hist.length - i);
        ctx.drawImage(ball.cv, q.x - q.s / 2, q.y - q.s / 2 - (B.y - q.y) * 0.4, q.s, q.s);
      }
      ctx.globalAlpha = 1;
      var lampScreen = lampsY - cam * MF, near = Math.max(0, 1 - Math.abs(B.y - lampScreen) / (H * 0.6));
      if (near > 0.02) {
        ctx.globalCompositeOperation = "lighter";
        var gl = ctx.createRadialGradient(B.x - B.s * 0.15, B.y - B.s * 0.2, 0, B.x, B.y, B.s * 1.2);
        gl.addColorStop(0, "rgba(230,255,220," + (0.22 * near) + ")"); gl.addColorStop(1, "rgba(230,255,220,0)");
        ctx.fillStyle = gl; ctx.fillRect(B.x - B.s * 1.2, B.y - B.s * 1.2, B.s * 2.4, B.s * 2.4);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.drawImage(ball.cv, B.x - B.s / 2, B.y - B.s / 2, B.s, B.s);

      if (t >= DUR && window.__fxT == null) {
        var prev = ballAt(DUR - 16);
        var vy = (B.y - prev.y) / 0.016, vx = (B.x - prev.x) / 0.016;
        finish(false, B, vx, vy);
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function finish(skipped, B, vx, vy) {
      if (done) return; done = true;
      cancelAnimationFrame(raf);
      body.style.transform = ""; body.style.willChange = "";
      html.classList.remove("fx-intro", "fx-intro-run");
      ov.remove();
      if (skipped || !B) { if (Kick) Kick.drop(80); return; }
      Kick.enter(B.x, B.y, vx * 0.9, Math.min(vy, 2200), ball.R, [W_SPIN[0], W_SPIN[1], W_SPIN[2]]);
    }
    skip.addEventListener("click", function () { finish(true); });
    doc.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { doc.removeEventListener("keydown", esc); finish(true); } });
    brand.animate([{ opacity: 0, transform: "translate(-50%,-6px)" }, { opacity: 1, transform: "translate(-50%,0)", offset: 0.2 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }],
      { duration: DUR * 0.75, easing: "ease-out", fill: "forwards" });
    raf = requestAnimationFrame(frame);
    setTimeout(function () { finish(true); }, 5500);   // xavfsizlik
  }

  /* ---------- ishga tushirish ---------- */
  function init() {
    glassLight();
    scrollBall();
    topButton();

    var hero = doc.querySelector(".hero");
    if (hero && doc.querySelector(".hero__title")) Kick = heroBall();
    var wantIntro = html.classList.contains("fx-intro") && hero && Kick && !reduce;
    window.__fxIntro = true;
    try { sessionStorage.setItem("ufu-intro", "1"); } catch (e) {}
    if (wantIntro) {
      /* hero matni sayt ko'tarilib kelganda allaqachon joyida bo'lsin */
      hero.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-in"); });
      var go = function () { intro(hero); };
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go, go); else go();
    } else {
      html.classList.remove("fx-intro");
      if (Kick) Kick.drop(700);
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
