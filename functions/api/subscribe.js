// Cloudflare Pages Function: POST /api/subscribe
// Saves an early-access sign-up to the WAITLIST KV namespace, one entry per
// email (signing up again just updates interests). Bind a KV namespace named
// WAITLIST to the Pages project for this to work; until then it answers 503
// and the form tells the visitor to try again.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = ['home', 'family', 'recovery'];

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honeypot: real visitors never see or fill the "company" field.
  if (data.company) return json({ ok: true });

  const email = String(data.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }
  if (!env.WAITLIST) return json({ ok: false, error: 'not_configured' }, 503);

  const interests = Array.isArray(data.interests)
    ? data.interests.filter((i) => INTERESTS.includes(i))
    : [];
  const source = ['hero', 'footer'].includes(data.source) ? data.source : 'other';

  const key = 'signup:' + email;
  const existing = await env.WAITLIST.get(key, 'json');
  const record = {
    email,
    interests: [...new Set([...(existing?.interests || []), ...interests])],
    source: existing?.source || source,
    signedUpAt: existing?.signedUpAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await env.WAITLIST.put(key, JSON.stringify(record), { metadata: { interests: record.interests } });
  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
