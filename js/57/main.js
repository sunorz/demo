'use strict';
/* Invite-code receipt — vanilla JS: language switch, copy buttons,
   and the coloured thread specks woven into the paper. */

/* Language: Chinese by default; switch to English when the browser
   language does not start with zh. Runs before the threads are drawn
   so their protected zones match the visible layout. */
(function () {
  var lng = navigator.language || 'zh';
  if (lng.indexOf('zh') === 0) return;
  var zh = document.getElementsByClassName('zh');
  for (var i = 0; i < zh.length; i++) zh[i].style.display = 'none';
  var en = document.getElementsByClassName('en');
  for (var j = 0; j < en.length; j++) en[j].style.display = 'block';
  document.title = 'Invite Code Receipt';
})();

/* Copy buttons: clipboard API with a textarea fallback; the icon
   swaps to a check for 1.5s. */
document.addEventListener('click', function (e) {
  var b = e.target.closest ? e.target.closest('.copybtn') : null;
  if (!b) return;
  var t = b.getAttribute('data-copy');
  function show() {
    b.classList.add('done');
    clearTimeout(b._ct);
    b._ct = setTimeout(function () { b.classList.remove('done'); }, 1500);
  }
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); show(); } catch (err) { /* noop */ }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(show).catch(fallback);
  } else {
    fallback();
  }
});

/* Coloured threads: 13 short curved specks scattered over the paper.
   Half sit behind the text, half in front; the front ones keep clear
   of the invite codes and the barcode. */
(function () {
  var COLORS = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#fb8c00', '#8e24aa', '#00acc1'];
  function draw() {
    var el = document.querySelector('.invite.receipt');
    if (!el) return;
    var olds = el.querySelectorAll('svg.threads');
    for (var i = 0; i < olds.length; i++) olds[i].remove();
    var W = el.clientWidth || 400, H = el.clientHeight || 640;
    var er = el.getBoundingClientRect(), prot = [];
    var nodes = el.querySelectorAll('.r-code,.r-barcode');
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0) prot.push({ x: r.left - er.left - 7, y: r.top - er.top - 7, w: r.width + 14, h: r.height + 14 });
    }
    var ns = 'http://www.w3.org/2000/svg';
    function mk() {
      var s = document.createElementNS(ns, 'svg');
      s.setAttribute('class', 'threads');
      s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      s.setAttribute('aria-hidden', 'true');
      return s;
    }
    var below = mk(), above = mk();
    function th() {
      var x = 8 + Math.random() * (W - 16), y = 8 + Math.random() * (H - 16),
        a = Math.random() * Math.PI * 2, l = 9 + Math.random() * 17,
        x2 = x + l * Math.cos(a), y2 = y + l * Math.sin(a), b = (Math.random() * 10 - 5);
      return { x: x, y: y, mx: (x + x2) / 2 - Math.sin(a) * b, my: (y + y2) / 2 + Math.cos(a) * b, x2: x2, y2: y2 };
    }
    function hit(t) {
      var x1 = Math.min(t.x, t.mx, t.x2) - 3, y1 = Math.min(t.y, t.my, t.y2) - 3,
        x2 = Math.max(t.x, t.mx, t.x2) + 3, y2 = Math.max(t.y, t.my, t.y2) + 3;
      for (var i = 0; i < prot.length; i++) {
        var p = prot[i];
        if (x1 < p.x + p.w && x2 > p.x && y1 < p.y + p.h && y2 > p.y) return true;
      }
      return false;
    }
    function put(svg, t) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', 'M' + t.x.toFixed(1) + ' ' + t.y.toFixed(1) + ' Q' + t.mx.toFixed(1) + ' ' + t.my.toFixed(1) + ' ' + t.x2.toFixed(1) + ' ' + t.y2.toFixed(1));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', COLORS[Math.floor(Math.random() * COLORS.length)]);
      p.setAttribute('stroke-width', '3.2');
      p.setAttribute('stroke-opacity', '0.9');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(p);
    }
    for (var i = 0; i < 13; i++) {
      var t = th();
      if (Math.random() < 0.5) {
        var ok = !hit(t), n = 0;
        while (!ok && n < 40) { t = th(); ok = !hit(t); n++; }
        if (ok) { put(above, t); continue; }
      }
      put(below, t);
    }
    el.insertBefore(below, el.firstChild);
    el.appendChild(above);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw);
  else draw();
})();
