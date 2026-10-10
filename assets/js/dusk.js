// Scroll-driven fade between the light Home/Family half and the dark
// Recovery half. While the dusk section scrolls past, its stage stays pinned
// and progress p (0 to 1) fades the background from cream to night and brings
// in the two lines of copy. Skipped for reduced motion: the CSS still
// gradient remains.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var section = document.querySelector('.dusk');
  var stage = section && section.querySelector('.dusk-stage');
  if (!stage) return;

  var root = document.documentElement;
  root.classList.add('dusk-live');

  // Background colour along p: cream, a warm stone midpoint so the fade never
  // turns a flat grey, then night (the Recovery section's colour).
  var keys = [
    { p: 0,    c: '#F2EDE3' },
    { p: 0.4,  c: '#CFC8BA' },
    { p: 0.75, c: '#4A4741' },
    { p: 1,    c: '#121311' }
  ];

  function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b);
    return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')';
  }
  function at(p) {
    for (var i = 1; i < keys.length; i++) {
      if (p <= keys[i].p) return mix(keys[i - 1].c, keys[i].c, (p - keys[i - 1].p) / (keys[i].p - keys[i - 1].p));
    }
    return keys[keys.length - 1].c;
  }
  // Relative luminance (WCAG) of an 'rgb(r,g,b)' string.
  function lum(rgb) {
    var c = rgb.match(/\d+/g).map(function (v) {
      v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ramp(p, from, to) { return clamp((p - from) / (to - from)); }

  // The menu bar goes dark with the page and stays dark through Recovery,
  // until the green "opening soon" band reaches it.
  var opening = document.querySelector('.opening');

  var ticking = false;
  function draw() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span) : 0;
    var st = stage.style;
    var sky = at(p);
    st.setProperty('--sky', sky);
    st.setProperty('--l1', ramp(p, 0.05, 0.3).toFixed(3));
    st.setProperty('--l2', ramp(p, 0.5, 0.72).toFixed(3));
    // Dark text on a light background, light text once it's dark. It swaps
    // in one step (a gradual blend would pass through mid-grey just as the
    // background does) at luminance 0.2, where both inks read equally well.
    st.setProperty('--line-ink', lum(sky) > 0.2 ? '#2B2B28' : '#EEECE5');
    var dark = p >= 0.6 && (!opening || opening.getBoundingClientRect().top > 68);
    root.classList.toggle('nav-dark', dark);
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(draw); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  draw();
})();
