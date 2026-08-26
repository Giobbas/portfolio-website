/* Giovanna Basilico — portfolio
   JavaScript minimo: menu, navigazione attiva, animazioni allo scroll.
   Tutto si disattiva con prefers-reduced-motion. */
(function () {
  'use strict';

  /* Su schermi piccoli: nessuna parallasse e nessuna animazione di entrata.
     Restano i contatori e la barra della timeline. */
  var small = window.matchMedia('(max-width: 900px)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || small;

  /* ---------- Menu mobile e pannello "Tutte le sezioni" ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var indexToggle = document.getElementById('index-toggle');
  var sectionIndex = document.getElementById('section-index');

  function togglePanel(panel, button, labelWhenOpen, labelWhenClosed) {
    if (!panel) return;
    var open = panel.hasAttribute('hidden');
    if (open) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
    if (button) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (labelWhenOpen) button.textContent = open ? labelWhenOpen : labelWhenClosed;
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      togglePanel(mobileNav, navToggle, 'Chiudi', 'Menu');
    });
  }
  if (indexToggle) {
    indexToggle.addEventListener('click', function () {
      togglePanel(sectionIndex, indexToggle);
    });
  }
  [mobileNav, sectionIndex].forEach(function (panel) {
    if (!panel) return;
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        panel.setAttribute('hidden', '');
        if (panel === mobileNav && navToggle) {
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.textContent = 'Menu';
        }
        if (panel === sectionIndex && indexToggle) indexToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- Voce di menu attiva, header compatto, torna su ---------- */
  var headerInner = document.getElementById('header-inner');
  var toTop = document.getElementById('to-top');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav-links a[href^="#"]'));
  var targets = navLinks.map(function (a) {
    return { link: a, el: document.querySelector(a.getAttribute('href')) };
  }).filter(function (t) { return t.el; });

  function spy() {
    if (headerInner) headerInner.style.height = window.scrollY > 40 ? '56px' : '66px';
    if (toTop) {
      var show = window.scrollY > 700;
      toTop.style.opacity = show ? '1' : '0';
      toTop.style.pointerEvents = show ? 'auto' : 'none';
    }
    var active = null;
    targets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top - 120 <= 0) active = t.link;
    });
    targets.forEach(function (t) {
      var on = t.link === active;
      t.link.style.color = on ? '#17506b' : '#1b1e24';
      t.link.style.fontWeight = on ? '600' : '500';
      t.link.style.borderBottomColor = on ? '#17506b' : 'transparent';
    });
  }

  /* ---------- Timeline esperienza: barra e marker ---------- */
  var progress = document.getElementById('timeline-progress');

  function timeline() {
    if (!progress || !progress.parentElement) return;
    var wrap = progress.parentElement;
    var r = wrap.getBoundingClientRect();
    var anchor = window.innerHeight * 0.62;
    var ratio = Math.max(0, Math.min(1, (anchor - r.top) / Math.max(1, r.height)));
    progress.style.height = (ratio * 100) + '%';
    var reached = r.top + r.height * ratio;
    Array.prototype.forEach.call(wrap.querySelectorAll('[data-marker]'), function (m) {
      var on = m.getBoundingClientRect().top <= reached + 8;
      m.style.borderColor = on ? '#17506b' : '#dfe6e9';
      var dot = m.querySelector('[data-dot]');
      if (dot) {
        dot.style.background = on ? '#17506b' : '#dfe6e9';
        dot.style.transform = on ? 'scale(1.15)' : 'scale(1)';
      }
    });
  }

  /* ---------- Parallasse leggera ---------- */
  var parallax = reduced ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
    el.style.willChange = 'transform';
    return { el: el, f: parseFloat(el.getAttribute('data-parallax')) || 0.04 };
  });

  function moveParallax() {
    var vh = window.innerHeight;
    parallax.forEach(function (p) {
      var r = p.el.getBoundingClientRect();
      var off = (r.top + r.height / 2 - vh / 2) * -p.f;
      p.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }

  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      spy();
      timeline();
      moveParallax();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  spy();
  timeline();
  moveParallax();

  /* ---------- Contatori dei numeri chiave ---------- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var counters = document.querySelectorAll('[data-count]');
    var run = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 900;
      var t0 = performance.now();
      var tick = function (now) {
        var k = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    var ioCount = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        ioCount.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { ioCount.observe(el); });
  }

  /* ---------- Comparsa progressiva dei blocchi ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var steps = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    steps.forEach(function (el) {
      var d = parseInt(el.getAttribute('data-delay') || '0', 10);
      var rest = el.getAttribute('data-rest-transform') || '';
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px) ' + rest;
      el.style.transition = 'opacity .4s ease ' + d + 'ms, transform .42s cubic-bezier(.34,1.35,.64,1) ' + d + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1';
        e.target.style.transform = e.target.getAttribute('data-rest-transform') || 'none';
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    steps.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Entrata della hero ---------- */
  if (!reduced) {
    var loaders = Array.prototype.slice.call(document.querySelectorAll('[data-load]'));
    loaders.forEach(function (el) {
      var d = parseInt(el.getAttribute('data-delay') || '0', 10);
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity .5s ease ' + d + 'ms, transform .5s cubic-bezier(.22,1,.36,1) ' + d + 'ms';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        loaders.forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      });
    });
  }

  /* ---------- Card "Oltre il lavoro": hover a livelli ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-interest]'), function (card) {
    var circle = card.querySelector('span');
    var rest = card.getAttribute('data-rest-transform') || '';
    function enter() {
      card.style.transform = 'rotate(0deg) translateY(-6px) scale(1.03)';
      card.style.borderColor = '#8a6a2f';
      card.style.background = '#fffefb';
      card.style.boxShadow = '0 12px 26px rgba(138,106,47,.18)';
      if (circle) {
        circle.style.background = 'rgba(138,106,47,.22)';
        circle.style.color = '#6b4f1a';
      }
    }
    function leave() {
      card.style.transform = rest;
      card.style.borderColor = '#ece3d1';
      card.style.background = '#fffdf7';
      card.style.boxShadow = 'none';
      if (circle) {
        circle.style.background = 'rgba(138,106,47,.12)';
        circle.style.color = 'inherit';
      }
    }
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mouseleave', leave);
    card.addEventListener('focusin', enter);
    card.addEventListener('focusout', leave);
  });
})();
