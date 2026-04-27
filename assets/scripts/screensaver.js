/**
 * Four-corner pink/purple blend + wavy star line across the screen.
 */
(function () {
  "use strict";

  var el = document.getElementById("candy");
  if (!el || !el.getContext) {
    return;
  }

  var ctx = el.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) {
    return;
  }

  var w = 0;
  var h = 0;
  var dpr = 1;
  var t0 = 0;
  var SPARKLE = 28;

  function hash11(n) {
    var x = Math.sin(n * 127.1 + 19.2) * 43758.5453;
    return x - Math.floor(x);
  }

  /** Corners: multi-stop radials + edge-mid accents so more hues blend across the frame. */
  function drawBackground() {
    var g;
    var m;
    var me;
    m = Math.max(w, h) * 1.1;
    me = Math.max(w, h) * 0.58;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#0a0612";
    ctx.fillRect(0, 0, w, h);

    function corner(cx, cy, s0, s1, s2, s3, s4) {
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, m);
      g.addColorStop(0, s0);
      g.addColorStop(0.18, s1);
      g.addColorStop(0.38, s2);
      g.addColorStop(0.58, s3);
      g.addColorStop(0.82, s4);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function edge(cx, cy, s0, s1, s2) {
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, me);
      g.addColorStop(0, s0);
      g.addColorStop(0.45, s1);
      g.addColorStop(1, s2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.globalCompositeOperation = "screen";
    corner(
      0,
      0,
      "rgba(255, 130, 200, 0.5)",
      "rgba(255, 160, 140, 0.22)",
      "rgba(240, 90, 170, 0.16)",
      "rgba(160, 50, 110, 0.08)",
      "rgba(60, 20, 55, 0.04)"
    );
    corner(
      w,
      0,
      "rgba(200, 170, 255, 0.48)",
      "rgba(130, 210, 255, 0.2)",
      "rgba(120, 100, 240, 0.15)",
      "rgba(70, 60, 180, 0.08)",
      "rgba(30, 25, 80, 0.04)"
    );
    corner(
      0,
      h,
      "rgba(110, 140, 255, 0.44)",
      "rgba(80, 200, 220, 0.18)",
      "rgba(90, 100, 230, 0.14)",
      "rgba(50, 45, 140, 0.07)",
      "rgba(20, 22, 65, 0.04)"
    );
    corner(
      w,
      h,
      "rgba(255, 60, 170, 0.48)",
      "rgba(255, 120, 150, 0.2)",
      "rgba(220, 50, 150, 0.15)",
      "rgba(140, 40, 100, 0.08)",
      "rgba(70, 20, 55, 0.04)"
    );

    edge(w * 0.5, 0, "rgba(80, 220, 255, 0.14)", "rgba(50, 100, 160, 0.06)", "rgba(0,0,0,0)");
    edge(w * 0.5, h, "rgba(200, 80, 180, 0.12)", "rgba(90, 40, 90, 0.05)", "rgba(0,0,0,0)");
    edge(0, h * 0.5, "rgba(255, 150, 210, 0.12)", "rgba(120, 50, 100, 0.05)", "rgba(0,0,0,0)");
    edge(w, h * 0.5, "rgba(180, 130, 255, 0.12)", "rgba(80, 50, 140, 0.05)", "rgba(0,0,0,0)");

    ctx.globalCompositeOperation = "soft-light";
    g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(50, 25, 70, 0.35)");
    g.addColorStop(0.5, "rgba(20, 12, 35, 0.2)");
    g.addColorStop(1, "rgba(55, 30, 85, 0.38)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    g = ctx.createLinearGradient(w, 0, 0, h);
    g.addColorStop(0, "rgba(90, 50, 120, 0.18)");
    g.addColorStop(0.5, "rgba(15, 20, 50, 0.1)");
    g.addColorStop(1, "rgba(70, 40, 100, 0.16)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "source-over";
  }

  /** ~2 long wavelengths across the width (k = 4π/w); one slower swell, no extra ripples. */
  function waveY(x, t) {
    var u;
    var k;
    u = x - t * 32;
    k = (4 * Math.PI) / Math.max(w, 1);
    return (
      h * 0.44 +
      h * 0.058 * Math.sin(u * k + t * 1.05) +
      h * 0.034 * Math.sin(u * k * 0.5 - t * 0.48)
    );
  }

  function trailPos(p, t) {
    var x;
    x = p * w;
    return { x: x, y: waveY(x, t) };
  }

  function trailFrame(p, t) {
    var x0;
    var x1;
    var y0;
    var y1;
    var dx;
    var dy;
    var L;
    x0 = p * w;
    x1 = x0 + Math.max(2, w * 0.002);
    y0 = waveY(x0, t);
    y1 = waveY(x1, t);
    dx = x1 - x0;
    dy = y1 - y0;
    L = Math.hypot(dx, dy) || 0.0001;
    return { x: x0, y: y0, tx: dx / L, ty: dy / L };
  }

  function drawStarPath(x, y, outer, inner, rot) {
    var i;
    var ang;
    var rr;
    ctx.beginPath();
    for (i = 0; i < 8; i += 1) {
      ang = rot - Math.PI * 0.5 + (i * Math.PI) / 4;
      rr = i % 2 === 0 ? outer : inner;
      if (i === 0) {
        ctx.moveTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
      } else {
        ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawWavyStarLine(t) {
    var m2;
    var i;
    var n;
    var p;
    var tr;
    var girth;
    var off;
    var sx;
    var sy;
    var outer;
    var inner;
    var rot;
    var a;
    var base;
    var d;
    m2 = Math.min(w, h);
    n = 152;
    base = m2 * 0.0112;
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    for (i = 0; i < n; i += 1) {
      p = (i + 0.5) / n;
      tr = trailFrame(p, t);
      girth = m2 * (0.036 + 0.014 * Math.sin(p * Math.PI * 2));
      off = (hash11(i + 2) - 0.5) * 2.1 * girth;
      sx = tr.x - tr.ty * off + (hash11(i) - 0.5) * girth * 0.45;
      sy = tr.y + tr.tx * off + (hash11(i + 5) - 0.5) * girth * 0.4;
      a = 0.42 + 0.45 * hash11(i * 1.4);
      if (a > 0.92) {
        a = 0.92;
      }
      rot = t * 0.4 + p * 10 + hash11(i * 9) * 1.8;
      outer = base * (0.85 + 0.35 * hash11(i * 0.3));
      inner = outer * 0.38;
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(sx, sy, outer * 2.65, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255, 255, 255, " + a + ")";
      drawStarPath(sx, sy, outer, inner, rot);
    }
    d = 210;
    for (i = 0; i < d; i += 1) {
      p = i / (d - 1);
      tr = trailFrame(p, t);
      girth = m2 * 0.023;
      off = (hash11(200 + i) - 0.5) * 1.8 * girth;
      sx = tr.x - tr.ty * off;
      sy = tr.y + tr.tx * off;
      a = (0.12 + 0.2 * hash11(i * 0.5)) * 0.65;
      ctx.beginPath();
      ctx.arc(sx, sy, m2 * (0.014 + 0.03 * hash11(i * 0.2)), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, " + a + ")";
      ctx.fill();
    }
    ctx.beginPath();
    d = 360;
    for (i = 0; i <= d; i += 1) {
      p = i / d;
      tr = trailFrame(p, t);
      if (i === 0) {
        ctx.moveTo(tr.x, tr.y);
      } else {
        ctx.lineTo(tr.x, tr.y);
      }
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = m2 * 0.056;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  function drawSparkles(t) {
    var i;
    var s;
    var x;
    var y;
    var a;
    var r;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (i = 0; i < SPARKLE; i += 1) {
      s = i * 1.77;
      x = w * (0.05 + 0.9 * (0.5 + 0.5 * Math.sin(s * 2.1 + t * 0.15)));
      y = h * (0.05 + 0.9 * (0.5 + 0.5 * Math.sin(s * 1.3 + t * 0.12 + 1)));
      a = 0.12 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2.5 + s));
      r = 1.1 + (i % 4) * 0.35;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 240, 255, " + a + ")";
      ctx.fill();
    }
    ctx.restore();
  }

  function drawVignette() {
    var g = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      Math.min(w, h) * 0.18,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.72
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.55, "rgba(0, 0, 0, 0.04)");
    g.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(ts) {
    var t;
    if (t0 === 0) {
      t0 = ts;
    }
    t = (ts - t0) * 0.001;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBackground();
    drawWavyStarLine(t);
    drawSparkles(t);
    drawVignette();
    requestAnimationFrame(frame);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    el.width = Math.floor(w * dpr);
    el.height = Math.floor(h * dpr);
    el.style.width = w + "px";
    el.style.height = h + "px";
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(frame);
})();
