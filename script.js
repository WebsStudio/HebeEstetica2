(function () {
  'use strict';
  var WA = '34691240470';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Menú móvil */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
  });

  /* Enlace activo según sección */
  var links = $$('.menu a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var secs = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + en.target.id;
            a.classList.toggle('is-current', on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { so.observe(s); });

    /* Revelado al hacer scroll (escalonado entre hermanos) */
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target, sib = $$('.reveal', el.parentElement).filter(function (n) { return n.parentElement === el.parentElement; });
          el.style.setProperty('--d', Math.min(Math.max(sib.indexOf(el), 0), 5) * 0.09 + 's');
          el.classList.add('in'); ro.unobserve(el);
          setTimeout(function () { el.style.removeProperty('--d'); }, 1400);
        }
      });
    }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { ro.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* Cabecera con fondo al desplazar */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Luz que sigue al cursor + brillo en tarjetas (solo con ratón y sin reducción de movimiento) */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !calm) {
    var spot = $('#spot'), px = 0, py = 0, raf = 0;
    document.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0; spot.style.transform = 'translate(' + px + 'px,' + py + 'px)'; spot.classList.add('on');
      });
      var g = e.target.closest && e.target.closest('.glass');
      if (g) {
        var r = g.getBoundingClientRect();
        g.style.setProperty('--x', (e.clientX - r.left) + 'px');
        g.style.setProperty('--y', (e.clientY - r.top) + 'px');
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { spot.classList.remove('on'); });
  }

  /* Filtros de tratamientos */
  var chips = $$('.chip'), items = $$('#treat-grid .treat');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      items.forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-cat') === f); });
    });
  });

  /* Imágenes originales no disponibles */
  function imgFallback(img) {
    var holder = img.parentElement;
    img.style.visibility = 'hidden';
    holder.classList.add('img-missing');
    if (!holder.querySelector('.img-fallback-note')) {
      var n = document.createElement('span');
      n.className = 'img-fallback-note';
      n.textContent = 'Imagen original pendiente de cargar o sustituir';
      holder.appendChild(n);
    }
  }
  $$('img').forEach(function (img) {
    img.addEventListener('error', function () { imgFallback(img); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) imgFallback(img);
  });

  /* Lightbox */
  var lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  var shots = $$('.shot-btn'), cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    var im = $('img', shots[cur]);
    lbImg.src = im.currentSrc || im.src;
    lbImg.alt = im.alt;
    var p = shots[cur].parentElement.querySelector('p');
    lbCap.textContent = p ? p.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  shots.forEach(function (b, i) {
    b.addEventListener('click', function () {
      lastFocus = b; show(i);
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    });
  });
  $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
  $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  function closeDialog(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.closest('.lb-close')) closeDialog(lb);
  });
  lb.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });

  /* Datos legales */
  var ld = $('#legal-dialog'), lo = $('#legal-open');
  lo.addEventListener('click', function () { if (ld.showModal) ld.showModal(); else ld.setAttribute('open', ''); });
  ld.addEventListener('click', function (e) {
    if (e.target === ld || e.target.closest('.lb-close')) closeDialog(ld);
  });
  ld.addEventListener('close', function () { lo.focus(); });

  /* Formulario → WhatsApp (sin servidor) */
  var form = $('#wa-form'), prev = $('#wa-preview'), status = $('#wa-status');
  var fName = $('#f-name'), fTopic = $('#f-topic'), fPhone = $('#f-phone'), fMsg = $('#f-msg');

  function buildMessage() {
    var name = fName.value.trim(), topic = fTopic.value, phone = fPhone.value.trim(), msg = fMsg.value.trim();
    var t = 'Hola, soy ' + (name || '…') + '. Quiero ' + (topic || '…') + '.';
    if (msg) t += ' ' + msg + (/[.!?…]$/.test(msg) ? '' : '.');
    if (phone) t += ' Mi teléfono: ' + phone + '.';
    return t;
  }
  function refresh() { prev.textContent = buildMessage(); }
  [fName, fTopic, fPhone, fMsg].forEach(function (el) { el.addEventListener('input', refresh); el.addEventListener('change', refresh); });
  refresh();

  function setErr(input, errId, bad) {
    var err = $('#' + errId);
    err.hidden = !bad;
    input.closest('.field').classList.toggle('invalid', bad);
    input.setAttribute('aria-invalid', String(bad));
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okName = fName.value.trim().length >= 2;
    var okTopic = !!fTopic.value;
    var okPhone = fPhone.value.trim() === '' || /^\+?[0-9 ()\-.]{6,20}$/.test(fPhone.value.trim());
    setErr(fName, 'e-name', !okName);
    setErr(fTopic, 'e-topic', !okTopic);
    setErr(fPhone, 'e-phone', !okPhone);
    if (!okName) { fName.focus(); return; }
    if (!okTopic) { fTopic.focus(); return; }
    if (!okPhone) { fPhone.focus(); return; }
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildMessage());
    var w = window.open(url, '_blank', 'noopener');
    status.hidden = false;
    status.textContent = w
      ? 'Se ha abierto WhatsApp con tu mensaje. Revísalo y pulsa enviar.'
      : 'Tu navegador ha bloqueado la ventana. Abre WhatsApp desde este enlace: ' + url;
  });
})();
