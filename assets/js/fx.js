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

    var W = 0, H = 0, R = 32;
    var bel = null, ball = null;
    var s = { x: 0, y: -80, vx: 0, vy: 0, w: [0, 0, 0], run: false, drag: false, touched: false };
    var G = 2300, BOUNCE = 0.62, AIR = 0.9985, ROLL = 0.985;
    var last = 0, raf = 0, hintTimer = 0, hintShown = false;

    function measure() {
      W = layer.clientWidth; H = layer.clientHeight;
      var css = el.offsetWidth || 64;
      R = css / 2;
      if (!bel) { bel = ballEl(css, 2); ball = bel.ball; el.appendChild(bel); }
      else if (Math.abs(ball.px - css * DPR(2)) > 1) { ball.setSize(css); ball.render(); }
    }
    function restX() {
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

    function draw(renderBall) {
      el.style.transform = "translate3d(" + (s.x - R).toFixed(1) + "px," + (s.y - R).toFixed(1) + "px,0)";
      if (renderBall) ball.render();
      var h = Math.max(0, floor() - s.y);
      var k = Math.max(0.2, 1 - h / 380);
      shadow.style.transform = "translate3d(" + (s.x - R).toFixed(1) + "px," + (H - 9) + "px,0) scale(" + k.toFixed(2) + "," + (0.6 + 0.4 * k).toFixed(2) + ")";
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
            /* yerga urilganda aylanish dumalashga moslashadi (ishqalanish) */
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
            kickSpin(s.vx, s.vy);
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
      if (!s.run) { s.x = restX(); s.y = floor(); draw(false); }
    });

    measure();
    s.x = restX(); s.y = -R * 2;
    draw(false);

    return {
      drop: function (delay) {
        setTimeout(function () {
          measure();
          s.x = restX(); s.y = -R * 2; s.vx = reduce ? 0 : -40; s.vy = 0; s.w = [2.5, -1.5, -0.8];
          if (reduce) { s.y = floor(); draw(false); showHint(); return; }
          wake();
          setTimeout(showHint, 1500);
        }, delay || 0);
      }
    };
  }

  /* =========================================================
     Sarlavha so'zlari zarba nuqtasidan uchib keladi
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
    if (title) { title.classList.add("fx-mark-off"); setTimeout(function () { title.classList.remove("fx-mark-off"); }, 250 + words.length * 30 + 650); }
    all.forEach(function (n, i) {
      var r = n.getBoundingClientRect();
      var ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      var far = n.classList.contains("fx-w") ? 0.85 : 0.3;
      n.style.setProperty("--dx", ((cx - ex) * far).toFixed(0) + "px");
      n.style.setProperty("--dy", ((cy - ey) * far).toFixed(0) + "px");
      n.style.setProperty("--rot", ((Math.random() - 0.5) * 30).toFixed(0) + "deg");
      var dl = n.classList.contains("fx-w") ? 0.02 + i * 0.03 : 0.2 + (rest.indexOf(n) + 1) * 0.07 + words.length * 0.015;
      n.style.setProperty("--dl", dl.toFixed(2) + "s");
      n.classList.add("fx-fly");
    });
    void hero.offsetWidth;
    requestAnimationFrame(function () {
      all.forEach(function (n) { n.classList.add("fx-land"); n.classList.remove("fx-fly"); });
      setTimeout(function () {
        all.forEach(function (n) { n.classList.remove("fx-land"); ["--dx", "--dy", "--rot", "--dl"].forEach(function (p) { n.style.removeProperty(p); }); });
      }, 2200);
    });
  }

  /* =========================================================
     INTRO — penalti: kechki stadion, to'p darvozaga, to'r silkinadi
     Dunyo birliklari metrda. Kamera to'p orqasida, darvozaga qaraydi.
     ========================================================= */
  function intro(hero) {
    var W = innerWidth, H = innerHeight, small = W < 700, dpr = DPR(small ? 2 : 1.75);
    var ov = doc.createElement("div");
    ov.className = "fx-intro";
    ov.setAttribute("aria-hidden", "true");
    var cv = doc.createElement("canvas");
    cv.className = "fx-intro__cv";
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ov.appendChild(cv);
    var brand = doc.createElement("div");
    brand.className = "fx-intro__brand";
    brand.innerHTML = (window.BRAND_MARK || "") + '<span data-i18n="brand.full">' + T("brand.full", "Oʻzbekiston futbolchilar uyushmasi") + '</span>';
    ov.appendChild(brand);
    var skip = doc.createElement("button");
    skip.type = "button"; skip.className = "fx-intro__skip";
    skip.innerHTML = '<span data-i18n="fx.skip">' + T("fx.skip", "Oʻtkazib yuborish") + '</span><span aria-hidden="true">→</span>';
    ov.appendChild(skip);
    doc.body.appendChild(ov);
    var ctx = cv.getContext("2d");

    /* ---- kamera ---- */
    var z0 = 1.15, BD = 0.22, GW = 3.66, GH = 2.44, Zg = 11 + z0, DEP = 2.0;
    var S0 = small ? Math.min(W * 0.27, 108) : Math.min(H * 0.22, W * 0.14, 200);
    var f = S0 * z0 / BD;
    var hy = H * (small ? 0.46 : 0.5);
    var ballBottom = H * (small ? 0.83 : 0.88);
    var hc = (ballBottom - hy) * z0 / f;
    function P(X, Y, Z) { return [W / 2 + f * X / Z, hy + f * (hc - Y) / Z]; }

    /* ---- statik fon (bir marta chiziladi) ---- */
    var bg = doc.createElement("canvas"); bg.width = cv.width; bg.height = cv.height;
    var b = bg.getContext("2d"); b.scale(dpr, dpr);
    (function paintBackground() {
      var far = P(0, 0, 60)[1];
      var sky = b.createLinearGradient(0, 0, 0, far);
      sky.addColorStop(0, "#010403"); sky.addColorStop(1, "#08180f");
      b.fillStyle = sky; b.fillRect(0, 0, W, far + 2);
      /* tribunalar va chiroqlar */
      var standTop = far - H * 0.2;
      var st = b.createLinearGradient(0, standTop, 0, far);
      st.addColorStop(0, "rgba(10,24,16,0)"); st.addColorStop(1, "rgba(12,30,20,.95)");
      b.fillStyle = st; b.fillRect(0, standTop, W, far - standTop);
      for (var i = 0; i < (small ? 90 : 220); i++) {
        var x = Math.random() * W, y = standTop + Math.pow(Math.random(), 0.7) * (far - standTop - 6);
        var rr = 0.5 + Math.random() * 1.4, a = 0.08 + Math.random() * 0.35;
        b.fillStyle = Math.random() < 0.18 ? "rgba(200,240,60," + a + ")" : "rgba(255,244,220," + a + ")";
        b.beginPath(); b.arc(x, y, rr, 0, 7); b.fill();
      }
      /* projektorlar */
      b.globalCompositeOperation = "lighter";
      [[W * 0.1, -H * 0.02], [W * 0.9, -H * 0.02]].forEach(function (L) {
        var g = b.createRadialGradient(L[0], L[1], 0, L[0], L[1], Math.max(W, H) * 0.75);
        g.addColorStop(0, "rgba(235,255,225,.30)"); g.addColorStop(0.18, "rgba(200,240,190,.10)"); g.addColorStop(1, "rgba(0,0,0,0)");
        b.fillStyle = g; b.fillRect(0, 0, W, H);
        var cone = b.createLinearGradient(L[0], L[1], W / 2, H * 0.7);
        cone.addColorStop(0, "rgba(230,255,220,.09)"); cone.addColorStop(1, "rgba(230,255,220,0)");
        b.fillStyle = cone; b.beginPath(); b.moveTo(L[0], L[1]); b.lineTo(W * 0.3, H); b.lineTo(W * 0.7, H); b.closePath(); b.fill();
        b.fillStyle = "rgba(255,255,245,.9)"; b.beginPath(); b.arc(L[0], L[1] + H * 0.035, small ? 3 : 4, 0, 7); b.fill();
      });
      b.globalCompositeOperation = "source-over";
      /* LED reklama paneli darvoza ortida */
      var zl = Zg + 9, t1 = P(0, 1.0, zl)[1], t0 = P(0, 0, zl)[1];
      var led = b.createLinearGradient(0, t1, 0, t0);
      led.addColorStop(0, "#0c2a1b"); led.addColorStop(1, "#06140d");
      b.fillStyle = led; b.fillRect(0, t1, W, t0 - t1);
      b.fillStyle = "rgba(200,240,60,.45)"; b.fillRect(0, t1, W, Math.max(1, (t0 - t1) * 0.05));
      b.font = "700 " + Math.max(7, (t0 - t1) * 0.46).toFixed(1) + "px Manrope, Inter, sans-serif";
      b.textBaseline = "middle"; b.fillStyle = "rgba(220,255,140,.34)";
      var label = "UFU  ·  " + T("brand.full", "Oʻzbekiston futbolchilar uyushmasi").toUpperCase() + "  ·  FIFPRO  ·  ";
      var lw = b.measureText(label).width, lx = -((W / 2) % lw);
      for (; lx < W; lx += lw) b.fillText(label, lx, (t1 + t0) / 2 + 1);
      /* maysa */
      var g0 = t0;
      var grass = b.createLinearGradient(0, g0, 0, H);
      grass.addColorStop(0, "#0d321d"); grass.addColorStop(0.35, "#155a31"); grass.addColorStop(1, "#1b6b3a");
      b.fillStyle = grass; b.fillRect(0, g0, W, H - g0);
      /* o'rilgan maysa chiziqlari (chuqurlik bo'yicha) */
      for (var z = 0.55, k = 0; z < zl; z += 1.9, k++) {
        if (k % 2) continue;
        var ya = Math.max(g0, P(0, 0, z + 1.9)[1]), yb = Math.min(H, P(0, 0, z)[1]);
        b.fillStyle = "rgba(255,255,255,.035)"; b.fillRect(0, ya, W, yb - ya);
      }
      /* projektor dog'i darvoza atrofida */
      b.globalCompositeOperation = "lighter";
      var gp = P(0, 0, Zg);
      var pool = b.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], W * 0.55);
      pool.addColorStop(0, "rgba(160,220,150,.14)"); pool.addColorStop(1, "rgba(0,0,0,0)");
      b.fillStyle = pool; b.fillRect(0, g0, W, H - g0);
      b.globalCompositeOperation = "source-over";
      /* chiziqlar (perspektivada qalinligi to'g'ri) */
      function gline(x1, z1, x2, z2) {
        var dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz), ox = -dz / l * 0.06, oz = dx / l * 0.06;
        z1 = Math.max(0.45, z1); z2 = Math.max(0.45, z2);
        var a = P(x1 + ox, 0, z1 + oz), c = P(x2 + ox, 0, z2 + oz), d = P(x2 - ox, 0, z2 - oz), e = P(x1 - ox, 0, z1 - oz);
        b.beginPath(); b.moveTo(a[0], a[1]); b.lineTo(c[0], c[1]); b.lineTo(d[0], d[1]); b.lineTo(e[0], e[1]); b.closePath(); b.fill();
      }
      b.fillStyle = "rgba(236,246,232,.62)";
      gline(-34, Zg, 34, Zg);
      gline(-9.16, Zg, -9.16, Zg - 5.5); gline(9.16, Zg, 9.16, Zg - 5.5); gline(-9.16, Zg - 5.5, 9.16, Zg - 5.5);
      gline(-20.16, Zg, -20.16, 0.5); gline(20.16, Zg, 20.16, 0.5);
      /* darvoza soyasi */
      var s1 = P(-GW, 0, Zg), s2 = P(GW, 0, Zg), s3 = P(GW * 1.05, 0, Zg + DEP + 0.6), s4 = P(-GW * 1.05, 0, Zg + DEP + 0.6);
      b.fillStyle = "rgba(0,0,0,.22)"; b.beginPath(); b.moveTo(s1[0], s1[1]); b.lineTo(s2[0], s2[1]); b.lineTo(s3[0], s3[1]); b.lineTo(s4[0], s4[1]); b.closePath(); b.fill();
      /* vinyetka */
      var vg = b.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.25, W / 2, H * 0.55, Math.max(W, H) * 0.8);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)");
      b.fillStyle = vg; b.fillRect(0, 0, W, H);
    })();

    /* ---- to'r va darvoza (har kadrda: to'r silkinadi) ---- */
    var hitU = 0.72, hitV = 0.3, TOPD = 0.8;
    function netPt(u, v, amp) {          // orqa to'r: u -1..1, v 0(tepa)..1(past)
      var g = amp ? amp * Math.exp(-((u - hitU) * (u - hitU)) / 0.16 - ((v - hitV) * (v - hitV)) / 0.2) : 0;
      return P(u * GW + g * (u - hitU) * GW * 0.22, GH * (1 - v) + g * (hitV - v) * GH * 0.3, Zg + TOPD + (DEP - TOPD) * v + g * 1.2);
    }
    function topPt(u, w, amp) {          // tepa to'r: w 0(ustun)..1(orqa)
      var g = amp ? amp * w * Math.exp(-((u - hitU) * (u - hitU)) / 0.16 - (hitV * hitV) / 0.2) : 0;
      return P(u * GW + g * (u - hitU) * GW * 0.15, GH + g * 0.12, Zg + TOPD * w + g * w);
    }
    function sidePt(side, s, v) {        // yon to'r
      return P(side * GW, GH * (1 - v), Zg + s * (TOPD + (DEP - TOPD) * v));
    }
    function drawNet(amp) {
      ctx.lineWidth = Math.max(0.6, f * 0.012 / Zg);
      ctx.strokeStyle = "rgba(235,245,232," + (0.3 + 0.28 * Math.min(1, Math.abs(amp))).toFixed(2) + ")";
      var cols = small ? 16 : 22, rows = 8, i, j, p;
      ctx.beginPath();
      for (j = 0; j <= rows; j++) { for (i = 0; i <= cols; i++) { p = netPt(-1 + 2 * i / cols, j / rows, amp); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } }
      for (i = 0; i <= cols; i++) { for (j = 0; j <= rows; j++) { p = netPt(-1 + 2 * i / cols, j / rows, amp); if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } }
      for (j = 0; j <= 3; j++) { for (i = 0; i <= cols; i++) { p = topPt(-1 + 2 * i / cols, j / 3, amp); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } }
      for (i = 0; i <= cols; i++) { for (j = 0; j <= 3; j++) { p = topPt(-1 + 2 * i / cols, j / 3, amp); if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } }
      [-1, 1].forEach(function (sd) {
        for (j = 0; j <= rows; j++) { for (i = 0; i <= 4; i++) { p = sidePt(sd, i / 4, j / rows); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } }
        for (i = 0; i <= 4; i++) { for (j = 0; j <= rows; j++) { p = sidePt(sd, i / 4, j / rows); if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } }
      });
      ctx.stroke();
      /* orqa tayanch ramka */
      ctx.strokeStyle = "rgba(160,170,165,.55)"; ctx.lineWidth = Math.max(1, f * 0.05 / (Zg + DEP));
      ctx.beginPath();
      [-1, 1].forEach(function (sd) {
        var a = P(sd * GW, GH, Zg + TOPD), c = P(sd * GW, 0, Zg + DEP);
        ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]);
      });
      var c1 = P(-GW, 0, Zg + DEP), c2 = P(GW, 0, Zg + DEP); ctx.moveTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]);
      ctx.stroke();
    }
    function drawFrame() {
      var th = f * 0.12 / Zg;
      var a = P(-GW, 0, Zg), bb = P(-GW, GH, Zg), c = P(GW, GH, Zg), d = P(GW, 0, Zg);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = th + 2;
      ctx.beginPath(); ctx.moveTo(a[0] + 1.5, a[1]); ctx.lineTo(bb[0] + 1.5, bb[1] + 1.5); ctx.lineTo(c[0] + 1.5, c[1] + 1.5); ctx.lineTo(d[0] + 1.5, d[1]); ctx.stroke();
      var gr = ctx.createLinearGradient(bb[0], bb[1] - th, bb[0], bb[1] + th);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#cfd8d2");
      ctx.strokeStyle = gr; ctx.lineWidth = th;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bb[0], bb[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = Math.max(0.6, th * 0.28);
      ctx.beginPath(); ctx.moveTo(a[0] - th * 0.2, a[1]); ctx.lineTo(bb[0] - th * 0.2, bb[1] - th * 0.2); ctx.lineTo(c[0], c[1] - th * 0.2); ctx.stroke();
    }

    /* ---- to'p ---- */
    var ball = new Ball3D(small ? 2 : 1.75);
    var Xt = hitU * GW, Yt = GH * (1 - hitV), Zt = Zg + TOPD + (DEP - TOPD) * hitV;
    var st = { X: 0, Y: BD / 2, Z: z0 };
    var W0 = [-9, 16, 7];
    function drawBall(behindFrame) {
      var p = P(st.X, st.Y, st.Z), size = f * BD / st.Z;
      /* soya */
      var gp = P(st.X, 0, st.Z), sa = Math.max(0, 0.5 * (1 - st.Y / 2.6));
      if (sa > 0.01) {
        ctx.save(); ctx.translate(gp[0], gp[1]); ctx.scale(1, 0.28);
        var sg = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.62);
        sg.addColorStop(0, "rgba(0,0,0," + sa + ")"); sg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, size * 0.62, 0, 7); ctx.fill(); ctx.restore();
      }
      var want = size * dpr;
      if (!ball.px || Math.abs(want - ball.px) / ball.px > 0.12) ball.setPx(Math.min(want, small ? 240 : 300));
      ball.render();
      ctx.drawImage(ball.cv, p[0] - size / 2, p[1] - size / 2, size, size);
      void behindFrame;
      return p;
    }

    /* ---- chaqnoqlar (tribunada fotoaparatlar) ---- */
    var flashes = [];
    function addFlashes(t) {
      var far = P(0, 0, 60)[1];
      for (var i = 0; i < (small ? 10 : 18); i++) { var fx = Math.random() * W; if (Math.abs(fx - W / 2) < f * GW / Zg * 1.1) fx = fx < W / 2 ? fx - f * GW / Zg * 1.2 : fx + f * GW / Zg * 1.2; flashes.push({ x: fx, y: far - 8 - Math.random() * H * 0.16, t: t + Math.random() * 380, r: 0.8 + Math.random() * 1.4 }); }
    }
    var grass = [];

    /* ---- vaqt jadvali (ms) ---- */
    var KICK = 230, FLY = 560, HIT = KICK + FLY, REVEAL = HIT + 230, END = REVEAL + 380;
    var t0 = performance.now(), raf = 0, done = false, hitScreen = null, revealed = false;
    var hdr = doc.querySelector(".hdr");
    if (hdr) hdr.classList.add("fx-drop");

    function frame(now) {
      var t = window.__fxT != null ? window.__fxT : now - t0;   /* __fxT — faqat avtomatik test uchun */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* kamera: yengil yaqinlashish + zarbada silkinish */
      var push = 1 + Math.min(1, t / (HIT + 300)) * 0.05;
      var shx = 0, shy = 0;
      if (t > KICK && t < KICK + 90) { shx = (Math.random() - 0.5) * 5; shy = (Math.random() - 0.5) * 4; }
      if (t > HIT && t < HIT + 120) { shx = (Math.random() - 0.5) * 3; shy = (Math.random() - 0.5) * 2; }
      var gc = P(0, GH * 0.5, Zg);
      ctx.translate(gc[0] + shx, gc[1] + shy); ctx.scale(push, push); ctx.translate(-gc[0], -gc[1]);
      ctx.drawImage(bg, 0, 0, W, H);

      /* to'p holati */
      var amp = 0, behind = false;
      if (t < KICK) {
        st.X = 0; st.Z = z0; st.Y = BD / 2;
        var sq = t > KICK - 60 ? 1 - (t - (KICK - 60)) / 60 * 0.08 : 1; void sq;
      } else if (t < HIT) {
        var p = (t - KICK) / FLY, e = 1 - Math.pow(1 - p, 1.35);
        st.Z = z0 + (Zt - z0) * e;
        st.X = Xt * (0.3 * e + 0.7 * e * e);
        st.Y = BD / 2 + (Yt - BD / 2) * Math.pow(e, 0.85) + 0.32 * Math.sin(Math.PI * e);
        ball.spin(W0, 1 / 60);
        if (!grass.length) for (var g = 0; g < 12; g++) grass.push({ x: (Math.random() - 0.5) * 0.2, y: 0.01, z: z0 + 0.02 + Math.random() * 0.12, vx: (Math.random() - 0.5) * 1.2, vy: 0.6 + Math.random() * 1.4, vz: 0.2 + Math.random() * 1.2, a: Math.random() * 3 });
      } else {
        var tau = (t - HIT) / 1000;
        amp = 1.25 * (1 - Math.exp(-tau * 30)) * Math.exp(-tau * 3.6) * Math.cos(tau * 12);
        st.Z = Zt + 0.3 * Math.min(1, tau * 6) - 0.12 * Math.min(1, tau * 2);
        st.X = Xt - 0.2 * Math.min(1, tau * 3);
        st.Y = Math.max(BD / 2, Yt - 0.5 * 9.8 * tau * tau * 1.6);
        ball.spin([W0[0] * 0.3, W0[1] * 0.3, W0[2] * 0.3], 1 / 60);
        if (!hitScreen) { hitScreen = P(Xt, Yt, Zt + 0.3); addFlashes(t); }
      }
      behind = st.Z > Zg;
      drawNet(amp);
      if (behind) { drawBall(true); drawFrame(); } else { drawFrame(); drawBall(false); }

      /* zarbada uchgan maysa zarralari */
      if (grass.length && t < KICK + 320) {
        var dt = (t - KICK) / 1000;
        ctx.fillStyle = "rgba(110,175,100," + (0.8 * (1 - (t - KICK) / 320)).toFixed(2) + ")";
        grass.forEach(function (q) {
          var y = q.y + q.vy * dt - 4.9 * dt * dt; if (y < 0) return;
          var s = P(q.x + q.vx * dt, y, q.z + q.vz * dt);
          var gw = Math.max(0.8, f * 0.0035 / q.z), gh = Math.max(1.2, f * 0.011 / q.z); ctx.save(); ctx.translate(s[0], s[1]); ctx.rotate(q.a + dt * 9); ctx.fillRect(-gw / 2, -gh / 2, gw, gh); ctx.restore();
        });
      }
      /* chaqnoqlar */
      if (flashes.length) {
        ctx.globalCompositeOperation = "lighter";
        flashes.forEach(function (q) {
          var k = (t - q.t) / 120; if (k < 0 || k > 1) return;
          var a = (1 - k) * 0.85, rg = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 5);
          rg.addColorStop(0, "rgba(255,255,255," + a + ")"); rg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = rg; ctx.fillRect(q.x - q.r * 5, q.y - q.r * 5, q.r * 10, q.r * 10);
        });
        if (hitScreen && t < HIT + 260) {
          var fk = 1 - (t - HIT) / 260, fr = ctx.createRadialGradient(hitScreen[0], hitScreen[1], 0, hitScreen[0], hitScreen[1], Math.max(W, H) * 0.5);
          fr.addColorStop(0, "rgba(230,255,190," + (0.32 * fk) + ")"); fr.addColorStop(1, "rgba(230,255,190,0)");
          ctx.fillStyle = fr; ctx.fillRect(0, 0, W, H);
        }
        ctx.globalCompositeOperation = "source-over";
      }
      /* chiroqlar yonishi */
      if (t < 200) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = "rgba(1,4,3," + (1 - t / 200) + ")"; ctx.fillRect(0, 0, W, H); }

      if (t >= REVEAL && !revealed) {
        revealed = true;
        var hs = hitScreen || [W / 2, H * 0.4];
        ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: END - REVEAL, easing: "ease-in", fill: "forwards" });
        burst(hero, hs[0], hs[1], false);
        if (hdr) { hdr.classList.add("fx-drop--in"); }
      }
      if (t >= END) { finish(false); return; }
      raf = requestAnimationFrame(frame);
    }

    function finish(skipped) {
      if (done) return; done = true;
      cancelAnimationFrame(raf);
      html.classList.remove("fx-intro");
      if (hdr) { hdr.classList.add("fx-drop--in"); setTimeout(function () { hdr.classList.remove("fx-drop", "fx-drop--in"); }, 1000); }
      if (skipped) burst(hero, 0, 0, true);
      ov.remove();
      if (Kick) Kick.drop(skipped ? 80 : 350);
    }
    skip.addEventListener("click", function () { finish(true); });
    doc.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { doc.removeEventListener("keydown", esc); finish(true); } });
    brand.animate([{ opacity: 0, transform: "translate(-50%,-6px)" }, { opacity: 1, transform: "translate(-50%,0)", offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
      { duration: HIT + 150, easing: "ease-out", fill: "forwards" });
    raf = requestAnimationFrame(frame);
    setTimeout(function () { finish(true); }, 5000);   // xavfsizlik
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
      [".eyebrow", ".hero__title", ".lead", ".hero__cta", ".hero__trust", ".hero__visual"].forEach(function (q) {
        var n = hero.querySelector(q); if (n) n.classList.add("fx-pre");
      });
      var go = function () { intro(hero); };
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go, go); else go();
    } else {
      html.classList.remove("fx-intro");
      if (Kick) Kick.drop(700);
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
