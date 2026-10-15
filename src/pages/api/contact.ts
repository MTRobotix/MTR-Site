// Contact form endpoint. Runs the spam checks, then hands the message to FormSubmit, which emails it.
// The browser posts JSON (src/components/ContactForm.astro); without JavaScript the form posts here
// directly and gets redirected back to the contact page with the result.
import type { APIRoute } from 'astro';
import { COMPANY, SITE_URL } from '../../data/i18n';
import { contact } from '../../data/content';
import { checkContent, domainTakesMail, parseInput, rateLimited, turnstileOk, type Verdict } from '../../lib/spam';

export const prerender = false;

const RELAY = `https://formsubmit.co/ajax/${COMPANY.email}`;

function clientIp(request: Request): string {
  const h = request.headers;
  return (h.get('x-vercel-forwarded-for') ?? h.get('x-real-ip') ?? h.get('x-forwarded-for') ?? '').split(',')[0].trim();
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) return (await request.json()) as Record<string, unknown>;
    if (type.includes('form')) return Object.fromEntries(await request.formData());
  } catch {
    return null;
  }
  return null;
}

/** FormSubmit emails the message to the inbox. Only messages that passed every check get this far. */
async function relay(body: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(RELAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: SITE_URL, Referer: `${SITE_URL}/contact/` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: unknown };
    return res.ok && String(data.success) === 'true';
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
  const raw = await readBody(request);
  const back = (state: string) => {
    const locale = raw?.locale === 'vi' ? 'vi' : 'en';
    return new URL(`${locale === 'vi' ? '/vi' : ''}/contact/?${state}#contact-form`, SITE_URL).href;
  };
  const answer = (status: number, v: Verdict | { ok: false; reason: 'relay' }) =>
    isJson
      ? Response.json(v.ok || ('silent' in v && v.silent) ? { ok: true } : { ok: false, reason: v.reason }, { status: v.ok || ('silent' in v && v.silent) ? 200 : status })
      : Response.redirect(back(v.ok || ('silent' in v && v.silent) ? 'sent=1' : `error=${v.reason}`), 303);

  if (!raw) return answer(400, { ok: false, reason: 'invalid' });
  const ip = clientIp(request);
  if (rateLimited(ip)) return answer(429, { ok: false, reason: 'rate' });

  const input = parseInput(raw);
  const content = checkContent(input);
  if (!content.ok) return answer(400, content);
  if (!(await turnstileOk(String(raw['cf-turnstile-response'] ?? ''), ip))) return answer(400, { ok: false, reason: 'spam' });
  if (!(await domainTakesMail(input.email.split('@')[1]))) return answer(400, { ok: false, reason: 'email' });

  const locale = raw.locale === 'vi' ? 'vi' : 'en';
  const sent = await relay({
    name: input.name,
    company: input.company,
    email: input.email,
    message: input.message,
    _replyto: input.email,
    _subject: contact[locale].formSubject,
    _template: 'table',
    _captcha: 'false',
  });
  return sent ? answer(200, { ok: true }) : answer(502, { ok: false, reason: 'relay' });
};
