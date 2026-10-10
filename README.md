# Thrive Reserve

Static site for thrivereserve.co, built to deploy on Cloudflare Pages from this
repo. No build step: Pages serves `index.html` and `assets/` as they are
(build command empty, output directory `/`).

```
index.html
assets/css/thrive.css
assets/js/dusk.js           scroll-driven sunset between the light and dark halves
assets/js/site.js           sign-up forms, sticky phone button, scroll animations
functions/api/subscribe.js  saves early-access sign-ups (Cloudflare Pages Function)
assets/favicon.svg          the sage leaf from the logo
assets/photos/              each photo at 1400px and 760px wide (webp)
```

The page opens light and sunny (Home and Family), then a sunset plays as you
scroll: the section pins, the sun sinks behind a skyline, the sky goes from
cream to gold to night and the menu bar turns dark. Recovery (sport, wellness
and fitness) follows in the dark. With reduced motion turned on, or without
JavaScript, the sunset is a still gradient band instead.

Everything else animates gently on scroll too: the hero eases in on load,
sections fade up as they arrive, lists and cards appear one after another,
the large light photos drift slightly and the Recovery photo slowly zooms out.
All of it switches off for visitors who ask their device for reduced motion.

## Early-access sign-ups

The hero and the green section at the bottom each have an email form; the
bottom one also asks which collections (Home, Family, Recovery) someone wants.
"Notify me" buttons in each collection jump to it with that one ticked, and on
phones a "Get early access" button stays pinned to the bottom of the screen.

Forms post to `/api/subscribe`, which stores each sign-up in Cloudflare KV.
One-time setup in the Cloudflare dashboard:

1. Storage & Databases, KV: create a namespace, e.g. `thrive-waitlist`.
2. Workers & Pages, the Thrive Reserve project, Settings, Bindings: add a
   KV namespace binding with variable name `WAITLIST`, pointing at it.
3. Redeploy (or push any change).

Sign-ups then show up in that namespace, one key per email
(`signup:name@example.com`) with interests and sign-up date. Until the binding
exists, the form tells visitors it couldn't add them, so set it up before
sending people to the site.

Preview locally: `python3 -m http.server` in this folder, then open
http://localhost:8000.

## Still placeholder
- The shop isn't open: no prices or cart yet. The early-access list is the
  only thing to sign up for.
- No reviews or customer counts. Add real ones once there are sales.
- Shipping and returns terms are left out until confirmed with suppliers.
- Photos are AI-generated. Ones with fake logos or text were cropped or left out.
