// Sign-up forms, "notify me" buttons, the sticky phone button and the
// scroll animations (fade-ins, staggered reveals, photo drift and zoom).
// Animations only run when the visitor hasn't asked for reduced motion.
(function () {
  var root = document.documentElement;
  var motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Sign-up forms ----------
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.querySelectorAll('[data-signup]').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      if (!EMAIL.test(email)) {
        show('Please enter a valid email address.', 'error');
        form.email.focus();
        return;
      }
      var interests = [].slice.call(form.querySelectorAll('input[name="interest"]:checked'))
        .map(function (b) { return b.value; });

      button.disabled = true;
      show('Adding you to the list…', '');
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          interests: interests,
          source: form.getAttribute('data-source'),
          company: form.company ? form.company.value : ''
        })
      }).then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        form.classList.add('done');
        show("You're on the list. We'll email you the moment the shop opens.", 'ok');
        form.email.value = '';
      }).catch(function () {
        show("Sorry, we couldn't add you just now. Please try again in a moment.", 'error');
      }).then(function () {
        button.disabled = false;
      });
    });

    function show(text, kind) {
      msg.textContent = text;
      msg.className = 'form-msg' + (kind ? ' is-' + kind : '');
    }
  });

  // "Notify me when X opens": tick that interest on the bottom form, then
  // focus its email box once the scroll there has finished.
  var footerForm = document.querySelector('[data-source="footer"]');
  document.querySelectorAll('[data-interest]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!footerForm) return;
      var box = footerForm.querySelector('input[value="' + link.getAttribute('data-interest') + '"]');
      if (box) box.checked = true;
      setTimeout(function () { footerForm.email.focus({ preventScroll: true }); }, motion ? 700 : 0);
    });
  });

  // ---------- Sticky "Get early access" button (phones) ----------
  // Shown once the hero sign-up has scrolled away, hidden again while the
  // bottom sign-up is on screen.
  var sticky = document.querySelector('.sticky-cta');
  var heroForm = document.querySelector('[data-source="hero"]');
  var opening = document.querySelector('#opening');
  if (sticky && heroForm && opening && 'IntersectionObserver' in window) {
    var heroVisible = true, openingVisible = false;
    var update = function () { sticky.classList.toggle('is-on', !heroVisible && !openingVisible); };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; update(); }).observe(heroForm);
    new IntersectionObserver(function (es) { openingVisible = es[0].isIntersecting; update(); }).observe(opening);
  }

  if (!motion || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');

  // ---------- Fade-ins and staggered reveals ----------
  var groups = [
    // [selector, children revealed one after another]
    ['.pillars-inner', 'span'],
    ['.pains', 'li'],
    ['.items', 'li'],
    ['.themes', '.theme'],
    ['.mosaic', 'img'],
    ['.promises', 'div'],
    ['.faq-list', 'details'],
    ['.together', 'figure'],
    ['.quiet-grid', 'figure'],
    ['.quiet-head', '*']
  ];
  var singles = [
    '.feeling h2', '.relief', '.collection figure', '.copy .eyebrow', '.copy h2', '.copy > p',
    '.notify', '.recovery-intro > p:first-child', '.recovery-cta', '.family-team img',
    '.family-team h3', '.family-team p', '.quote-inner', '.story .eyebrow', '.story h2',
    '.story-lede', '.faq h2', '.opening h2', '.opening-inner > p', '.signup-full', '.quiet-close'
  ];
  var targets = [];
  groups.forEach(function (g) {
    document.querySelectorAll(g[0]).forEach(function (parent) {
      parent.querySelectorAll(':scope > ' + g[1]).forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.setProperty('--d', (i * 90) + 'ms');
        targets.push(el);
      });
    });
  });
  singles.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (!el.classList.contains('reveal')) { el.classList.add('reveal'); targets.push(el); }
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });

  // ---------- Hero entrance ----------
  requestAnimationFrame(function () { root.classList.add('loaded'); });

  // ---------- Photo drift (parallax) and slow zoom ----------
  var drift = [].slice.call(document.querySelectorAll('.hero-img img, .collection .tall img'));
  var zoom = document.querySelector('.recovery-hero img');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    drift.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      // -1 when the photo's centre is at the bottom of the screen, +1 at the top
      var t = ((vh / 2) - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      img.style.transform = 'translate3d(0,' + (t * 28).toFixed(1) + 'px,0) scale(1.08)';
    });
    if (zoom) {
      var z = zoom.parentNode.getBoundingClientRect();
      if (z.bottom > 0 && z.top < vh) {
        var q = Math.max(0, Math.min(1, (vh - z.top) / (vh + z.height)));
        zoom.style.transform = 'scale(' + (1.14 - 0.14 * q).toFixed(4) + ')';
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();
