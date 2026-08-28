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
      togglePanel(mobileNav, navToggle);
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
        }
        if (panel === sectionIndex && indexToggle) indexToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- Voce di menu attiva, header compatto, torna su ---------- */
  var headerInner = document.getElementById('header-inner');
  var toTop = document.getElementById('to-top');
  var chips = document.getElementById('section-chips');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav-links a[href^="#"], #section-chips a[data-chip]'));
  var targets = navLinks.map(function (a) {
    return { link: a, el: document.querySelector(a.getAttribute('href')) };
  }).filter(function (t) { return t.el; });

  /* Elenco COMPLETO delle sezioni, preso dal pannello "Tutte le sezioni".
     Serve a sapere sempre dove siamo: la barra conosce solo 4 delle 9
     sezioni, e senza questo elenco scorrendo le altre 5 restava acceso
     il posto sbagliato. */
  var tutteLeSezioni = Array.prototype.slice.call(document.querySelectorAll('#section-index a[href^="#"]'))
    .map(function (a) { return { href: a.getAttribute('href'), el: document.querySelector(a.getAttribute('href')), link: a }; })
    .filter(function (t) { return t.el; });
  /* Ogni gruppo del pannello e' una macrovoce; la prima sezione del gruppo
     e' quella a cui punta la voce nella barra. */
  var mappaMacro = {};
  Array.prototype.slice.call(document.querySelectorAll('#section-index a[href^="#"]')).forEach(function (a) {
    var gruppo = a.parentElement;
    var primi = gruppo.querySelector('a[href^="#"]');
    if (primi) mappaMacro[a.getAttribute('href')] = primi.getAttribute('href');
  });

  function spy() {
    if (headerInner) headerInner.style.height = window.scrollY > 40 ? '56px' : '66px';
    if (toTop) {
      var show = window.scrollY > 700;
      toTop.style.opacity = show ? '1' : '0';
      toTop.style.pointerEvents = show ? 'auto' : 'none';
    }
    /* Sezione corrente cercata fra TUTTE le sezioni, non solo fra quelle
       della barra: e' quella piu' in basso che ha superato la soglia. */
    var correnteHref = null, migliore = -Infinity;
    var elenco = tutteLeSezioni.length ? tutteLeSezioni : targets.map(function (t) { return { href: t.link.getAttribute('href'), el: t.el }; });
    elenco.forEach(function (s) {
      var top = s.el.getBoundingClientRect().top;
      if (top - 120 <= 0 && top > migliore) { migliore = top; correnteHref = s.href; }
    });
    /* L'ultima sezione e' piu' corta del viewport: la sua cima non arriva
       mai a 120px dall'alto, quindi da sola non si attiverebbe mai.
       A fondo pagina la attiviamo comunque. */
    if (elenco.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      var piuInBasso = -Infinity;
      elenco.forEach(function (s) {
        var top = s.el.getBoundingClientRect().top + window.scrollY;
        if (top > piuInBasso) { piuInBasso = top; correnteHref = s.href; }
      });
    }
    /* Dalla sezione corrente alla macrovoce che la contiene. La mappa e'
       ricavata dai gruppi del pannello: ogni gruppo e' una macrovoce, e la
       voce nella barra punta alla prima sezione del gruppo. Cosi' stando in
       Progetti si accende "Il mio lavoro", e ogni sezione ha sempre una
       voce corrispondente: il ripiego sul pulsante non serve piu'. */
    var attivoHref = correnteHref ? (mappaMacro[correnteHref] || correnteHref) : null;
    /* e dentro il pannello segniamo comunque la voce corrente */
    tutteLeSezioni.forEach(function (s) {
      var on = s.href === correnteHref;
      /* ripristino esplicito: azzerare con '' toglieva l'inline e il link
         ricadeva sulla regola globale a{color}, diventando petrolio come
         l'etichetta del gruppo e annullando la gerarchia */
      s.link.style.color = on ? '#185c68' : '#1b1e24';
    });
    targets.forEach(function (t) {
      /* confronto per href: cosi barra e chip della stessa sezione si
         accendono insieme, invece di escludersi a vicenda */
      var on = t.link.getAttribute('href') === attivoHref;
      if (t.link.hasAttribute('data-chip')) {
        t.link.style.background = on ? '#185c68' : '#fbfaf8';
        t.link.style.borderColor = on ? '#185c68' : '#dfe6e9';
        t.link.style.color = on ? '#fbfaf8' : '#1b1e24';
        t.link.style.fontWeight = on ? '600' : '500';
        if (on) {
          var strip = t.link.parentElement;
          if (strip.scrollWidth > strip.clientWidth + 4) strip.scrollTo({ left: t.link.offsetLeft - 20, behavior: 'smooth' });
        }
        return;
      }
      t.link.style.color = on ? '#185c68' : '#1b1e24';
      t.link.style.fontWeight = on ? '600' : '500';
      t.link.style.borderBottomColor = on ? '#185c68' : 'transparent';
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
      m.style.borderColor = on ? '#185c68' : '#dfe6e9';
      var dot = m.querySelector('[data-dot]');
      if (dot) {
        dot.style.background = on ? '#185c68' : '#dfe6e9';
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
      t.style.borderColor = on ? '#185c68' : '#e5e3de';
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
      d.style.background = k === i ? '#185c68' : '#d3d8dc';
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

  /* Accordion delle macrovoci nel menu mobile. Generalizzato su data-acc:
     prima era legato al solo "Tutte le sezioni", ora le macrovoci sono due
     e potrebbero diventare di piu'. */
  Array.prototype.slice.call(document.querySelectorAll('[data-acc]')).forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute('data-acc'));
    if (!box) return;
    btn.addEventListener('click', function () {
      var apri = box.hasAttribute('hidden');
      if (apri) { box.removeAttribute('hidden'); } else { box.setAttribute('hidden', ''); }
      btn.setAttribute('aria-expanded', apri ? 'true' : 'false');
      var freccia = btn.querySelector('span');
      if (freccia) freccia.textContent = apri ? '▴' : '▾';
    });
  });

  /* Carosello dei settori su mobile: frecce e pallini */
  var cliGrid = document.getElementById('clienti-grid');
  if (cliGrid) {
    var cliCards = function () { return Array.prototype.slice.call(cliGrid.children); };
    var syncCliDots = function () {
      var cs = cliCards();
      if (!cs.length) return;
      var i = Math.round(cliGrid.scrollLeft / (cs[0].offsetWidth + 14));
      document.querySelectorAll('[data-cli-dot]').forEach(function (d, k) {
        d.style.background = k === i ? '#185c68' : '#d3d8dc';
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


/* ---------- Digitazione dei titoli di sezione ----------
   Stessa logica dell'h1, ma innescata quando il titolo entra in vista.
   I titoli vengono svuotati SUBITO, non al momento dell'incrocio:
   altrimenti si vedrebbe il titolo intero cancellarsi e riscriversi.
   E' lo stesso schema che il sito usa gia' per data-reveal.
   L'inizializzazione aspetta il caricamento dei font, perche' l'altezza
   riservata va misurata sul carattere definitivo, non sul ripiego. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  function avvia() {
    var titoli = Array.prototype.slice.call(document.querySelectorAll('[data-digita]'));
    if (!titoli.length) return;

    var dati = titoli.map(function (el) {
      var testo = el.textContent.trim();
      el.setAttribute('aria-label', testo);
      el.style.minHeight = Math.ceil(el.getBoundingClientRect().height) + 'px';
      var inner = document.createElement('span');
      inner.setAttribute('aria-hidden', 'true');
      el.textContent = '';
      el.appendChild(inner);
      return { el: el, inner: inner, testo: testo };
    });

    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (!v.isIntersecting) return;
        io.unobserve(v.target);
        var d = dati.filter(function (x) { return x.el === v.target; })[0];
        if (!d) return;
        d.el.classList.add('digita');
        var i = 0;
        (function passo() {
          i++;
          d.inner.textContent = d.testo.slice(0, i);
          if (i < d.testo.length) { setTimeout(passo, 22); }
          else { d.el.classList.remove('digita'); d.el.style.minHeight = ''; }
        })();
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.35 });

    dati.forEach(function (d) { io.observe(d.el); });
  }

  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(avvia); }
  else { avvia(); }
})();

/* ---------- "Torna su" e logo: fino in cima davvero ----------
   Puntavano a #top, cioe' al <main>, che nel flusso comincia dopo
   l'header sticky: il browser si fermava a 66px e l'header copriva
   la testa della foto. Qui portiamo a zero. L'href resta come
   ripiego se questo script non parte. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#top"]');
    if (!a) return;
    e.preventDefault();
    var dolce = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: dolce ? 'smooth' : 'auto' });
    var main = document.getElementById('top');
    if (main) main.focus({ preventScroll: true });
  });
})();

/* ---------- Strato dietro il menu mobile ----------
   Osserviamo l'attributo hidden di #mobile-nav invece di agganciarci
   al pulsante: il menu si chiude anche cliccando una voce o dai chip,
   e cosi' lo strato resta sincronizzato su ogni percorso. */
(function () {
  'use strict';
  var scrim = document.getElementById('menu-scrim');
  var nav = document.getElementById('mobile-nav');
  var toTop = document.getElementById('to-top');
  if (!scrim || !nav) return;

  function sincronizza() {
    var aperto = !nav.hasAttribute('hidden');
    if (aperto) {
      scrim.removeAttribute('hidden');
      /* forza un reflow prima di aggiungere la classe, altrimenti la
         transizione non parte: l'elemento e' appena uscito da hidden */
      void scrim.offsetWidth;
      scrim.classList.add('visibile');
      if (toTop) toTop.style.visibility = 'hidden';
      /* i chip sono mostrati da una regola con !important: per coprirla
         serve impostare la proprieta' con la stessa priorita' */
      if (chips) chips.style.setProperty('display', 'none', 'important');
    } else {
      scrim.classList.remove('visibile');
      if (toTop) toTop.style.visibility = '';
      if (chips) chips.style.removeProperty('display');
      var chiudi = function () { if (!scrim.classList.contains('visibile')) scrim.setAttribute('hidden', ''); };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) chiudi();
      else setTimeout(chiudi, 240);
    }
  }

  new MutationObserver(sincronizza).observe(nav, { attributes: true, attributeFilter: ['hidden'] });

  /* toccare lo strato chiude il menu */
  scrim.addEventListener('click', function () {
    var t = document.getElementById('nav-toggle');
    if (t && !nav.hasAttribute('hidden')) t.click();
  });
})();
