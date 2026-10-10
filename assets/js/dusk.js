// Scroll-driven sunset between the light Home/Family half and the dark
// Recovery half. While the dusk section scrolls past, its stage stays pinned
// and progress p (0 to 1) moves the sky, sun, skyline, stars and copy from
// day to night. Skipped for reduced motion: the CSS still gradient remains.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var section = document.querySelector('.dusk');
  var stage = section && section.querySelector('.dusk-stage');
  if (!stage) return;

  document.documentElement.classList.add('dusk-live');

  // Stars: fixed pseudo-random positions so every visit looks the same.
  var stars = stage.querySelector('.dusk-stars');
  var seed = 7;
  function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for (var i = 0; i < 70; i++) {
    var s = document.createElement('i');
    s.style.left = (rand() * 100).toFixed(2) + '%';
    s.style.top = (rand() * 100).toFixed(2) + '%';
    s.style.opacity = (0.35 + rand() * 0.65).toFixed(2);
    stars.appendChild(s);
  }

  // Color keyframes along p.
  var keys = [
    { p: 0,    top: '#F2EDE3', bottom: '#F8E9CC', land: '#E3D6BE', core: '#FFF6DC', edge: '#FFD98A' },
    { p: 0.35, top: '#EEC58F', bottom: '#F6CF93', land: '#C9A27E', core: '#FFE2A6', edge: '#F7A35C' },
    { p: 0.6,  top: '#6B4A45', bottom: '#D07A4A', land: '#4A342C', core: '#F8A060', edge: '#C8452C' },
    { p: 0.8,  top: '#2A2230', bottom: '#5A3A32', land: '#141310', core: '#C8452C', edge: '#7A2A1E' },
    { p: 1,    top: '#121311', bottom: '#121311', land: '#121311', core: '#7A2A1E', edge: '#3B1A14' }
  ];

  function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b);
    return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')';
  }
  function at(p, name) {
    for (var i = 1; i < keys.length; i++) {
      if (p <= keys[i].p) {
        var a = keys[i - 1], b = keys[i];
        return mix(a[name], b[name], (p - a.p) / (b.p - a.p));
      }
    }
    return mix(keys[keys.length - 1][name], keys[keys.length - 1][name], 0);
  }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ramp(p, from, to) { return clamp((p - from) / (to - from)); }

  // The menu bar goes dark with the sky and stays dark through Recovery,
  // until the green "opening soon" band reaches it.
  var opening = document.querySelector('.opening');
  var root = document.documentElement;

  var ticking = false;
  function draw() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span) : 0;
    var st = stage.style;
    st.setProperty('--sky-top', at(p, 'top'));
    st.setProperty('--sky-bottom', at(p, 'bottom'));
    st.setProperty('--land', at(p, 'land'));
    st.setProperty('--sun-core', at(p, 'core'));
    st.setProperty('--sun-edge', at(p, 'edge'));
    st.setProperty('--sun-glow', 'rgba(255, 190, 120, ' + (0.5 * (1 - ramp(p, 0.55, 0.8))).toFixed(3) + ')');
    st.setProperty('--sun-y', (14 + 78 * ramp(p, 0, 0.78)).toFixed(2) + 'vh');
    st.setProperty('--stars', ramp(p, 0.6, 0.88).toFixed(3));
    st.setProperty('--l1', ramp(p, 0.08, 0.24).toFixed(3));
    st.setProperty('--l2', ramp(p, 0.55, 0.7).toFixed(3));
    st.setProperty('--line-ink', mix('#2B2B28', '#EEECE5', ramp(p, 0.42, 0.58)));
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
