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
      togglePanel(mobileNav, navToggle, '\u2715', 'Menu');
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
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav-links a[href^="#"], #section-chips a[data-chip]'));
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
      if (t.link.hasAttribute('data-chip')) {
        t.link.style.background = on ? '#17506b' : '#fbfaf8';
        t.link.style.borderColor = on ? '#17506b' : '#dfe6e9';
        t.link.style.color = on ? '#fbfaf8' : '#1b1e24';
        t.link.style.fontWeight = on ? '600' : '500';
        if (on) {
          var strip = t.link.parentElement;
          if (strip.scrollWidth > strip.clientWidth + 4) strip.scrollTo({ left: t.link.offsetLeft - 20, behavior: 'smooth' });
        }
        return;
      }
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
    if (window.innerWidth <= 900 || window.matchMedia('(hover: none)').matches) {
      parallax.forEach(function (p) { p.el.style.transform = ''; });
      return;
    }
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

  /* ---------- Selettore dei progetti (loghi cliente) ---------- */
  var projTabs = Array.prototype.slice.call(document.querySelectorAll('[data-proj-tab]'));
  var projPanels = Array.prototype.slice.call(document.querySelectorAll('[data-proj-panel]'));
  var projIndex = 0;
  projTabs.forEach(function (t, k) { t.setAttribute('tabindex', k === projIndex ? '0' : '-1'); });
  /* le frecce si spengono ai capi della sequenza */
  function syncProjArrows() {
    var a = document.querySelector('[data-proj-move="-1"]');
    var b = document.querySelector('[data-proj-move="1"]');
    if (a) a.disabled = projIndex === 0;
    if (b) b.disabled = projIndex === projTabs.length - 1;
  }
  syncProjArrows();
  function selectProject(i) {
    projTabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      /* roving tabindex: nel tab sequence entra solo la tab attiva,
         alle altre si arriva con le frecce (pattern ARIA per i tablist) */
      t.setAttribute('tabindex', on ? '0' : '-1');
      t.style.borderColor = on ? '#17506b' : '#e5e3de';
      var img = t.querySelector('img');
      if (img) { img.style.filter = on ? 'none' : 'grayscale(1)'; img.style.opacity = on ? '1' : '.5'; }
      var label = t.querySelectorAll('span')[1];
      if (label) label.style.color = on ? '#1b1e24' : '#5f656c';
    });
    projPanels.forEach(function (p, k) {
      if (k === i) { p.removeAttribute('hidden'); p.style.display = ''; p.style.opacity = '1'; p.style.transform = 'none'; }
      else { p.setAttribute('hidden', ''); p.style.display = 'none'; }
    });
    document.querySelectorAll('[data-proj-dot]').forEach(function (d, k) {
      d.style.background = k === i ? '#17506b' : '#d3d8dc';
      d.style.transform = k === i ? 'scale(1.25)' : 'none';
    });
    var strip = projTabs[0] && projTabs[0].parentElement;
    if (strip && strip.scrollWidth > strip.clientWidth + 4) {
      var t = projTabs[i];
      strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
    }
    projIndex = i;
    syncProjArrows();
  }
  /* delegazione sul documento: nessun listener perso, tap affidabile su iOS */
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest('[data-proj-tab]');
    if (t) { selectProject(projTabs.indexOf(t)); return; }
    var m = e.target.closest('[data-proj-move]');
    if (!m) return;
    var next = projIndex + Number(m.getAttribute('data-proj-move'));
    if (next < 0 || next > projTabs.length - 1) return;
    selectProject(next);
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('[data-proj-tab]');
    if (!t) return;
    var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    var n = (projTabs.indexOf(t) + d + projTabs.length) % projTabs.length;
    selectProject(n);
    projTabs[n].focus();
  });

  /* ---------- Contatori dei numeri chiave ---------- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var counters = document.querySelectorAll('[data-count]');
    var run = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
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

  /* Accordion "Tutte le sezioni" nel menu mobile */
  var moreToggle = document.getElementById('more-toggle');
  var moreBox = document.getElementById('more-sections');
  if (moreToggle && moreBox) {
    moreToggle.addEventListener('click', function () {
      var open = moreBox.hasAttribute('hidden');
      if (open) { moreBox.removeAttribute('hidden'); } else { moreBox.setAttribute('hidden', ''); }
      moreToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreToggle.querySelector('span').textContent = open ? '\u25b4' : '\u25be';
    });
  }

  /* Carosello dei settori su mobile: frecce e pallini */
  var cliGrid = document.getElementById('clienti-grid');
  if (cliGrid) {
    var cliCards = function () { return Array.prototype.slice.call(cliGrid.children); };
    var syncCliDots = function () {
      var cs = cliCards();
      if (!cs.length) return;
      var i = Math.round(cliGrid.scrollLeft / (cs[0].offsetWidth + 14));
      document.querySelectorAll('[data-cli-dot]').forEach(function (d, k) {
        d.style.background = k === i ? '#17506b' : '#d3d8dc';
        d.style.transform = k === i ? 'scale(1.3)' : 'none';
      });
    };
    /* le frecce si spengono ai due estremi dello scorrimento */
    var syncCliArrows = function () {
      var max = cliGrid.scrollWidth - cliGrid.clientWidth;
      var a = document.querySelector('[data-cli-move="-1"]');
      var b = document.querySelector('[data-cli-move="1"]');
      if (a) a.disabled = cliGrid.scrollLeft <= 2;
      if (b) b.disabled = cliGrid.scrollLeft >= max - 2;
    };
    var syncCli = function () { syncCliDots(); syncCliArrows(); };
    cliGrid.addEventListener('scroll', syncCli, { passive: true });
    window.addEventListener('resize', syncCliArrows);
    syncCliArrows();
    document.addEventListener('click', function (e) {
      var m = e.target.closest && e.target.closest('[data-cli-move]');
      if (!m) return;
      var cs = cliCards();
      if (!cs.length) return;
      cliGrid.scrollBy({ left: Number(m.getAttribute('data-cli-move')) * (cs[0].offsetWidth + 14), behavior: 'smooth' });
    });
  }

  /* Etichetta "Tutte le sezioni" nella barra mobile: apre il menu al secondo livello */
  document.addEventListener('click', function (e) {
    var m = e.target.closest && e.target.closest('[data-chips-more]');
    if (!m) return;
    e.preventDefault();
    var nav = document.getElementById('mobile-nav');
    var more = document.getElementById('more-sections');
    var toggle = document.getElementById('nav-toggle');
    if (nav && nav.hasAttribute('hidden') && toggle) toggle.click();
    if (more && more.hasAttribute('hidden')) {
      var mt = document.getElementById('more-toggle');
      if (mt) mt.click();
    }
  });

/* ---------- Frase rotante fra "Cosa faccio" e "Progetti" ----------
   Il markup contiene gia' la lista completa: se questo script non parte
   resta una frase leggibile, come per i contatori.
   Con prefers-reduced-motion non si anima nulla: un testo che si
   riscrive in ciclo e' fra le animazioni piu' problematiche per chi ha
   disturbi vestibolari o difficolta' di lettura. */
(function () {
  'use strict';
  var rot = document.getElementById('ambiti-rotanti');
  if (!rot) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var parole = (rot.getAttribute('data-parole') || '').split('|').filter(Boolean);
  if (parole.length < 2) return;

  /* la lista intera resta agli screen reader; il testo che cambia
     di continuo viene tolto dall'albero di accessibilita' */
  var sr = document.createElement('span');
  sr.textContent = parole.join(', ');
  sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
  rot.parentNode.insertBefore(sr, rot);
  rot.setAttribute('aria-hidden', 'true');
  rot.classList.add('attivo');
  rot.textContent = '';

  var idx = 0, pos = 0, cancella = false;
  function passo() {
    var p = parole[idx];
    pos += cancella ? -1 : 1;
    rot.textContent = p.slice(0, pos);
    var attesa = cancella ? 38 : 72;
    if (!cancella && pos >= p.length) { cancella = true; attesa = 1700; }
    else if (cancella && pos <= 0) { cancella = false; idx = (idx + 1) % parole.length; attesa = 300; }
    setTimeout(passo, attesa);
  }
  setTimeout(passo, 700);
})();
