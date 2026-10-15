// Spam checks for the contact form. Every check runs on the server (src/pages/api/contact.ts),
// so a bot that skips the page and posts straight to the endpoint meets the same rules.
import { promises as dns } from 'node:dns';

export type ContactInput = {
  name: string;
  company: string;
  email: string;
  message: string;
  /** Honeypot: hidden from people, filled by bots. */
  honey: string;
  /** Milliseconds between the form showing and the send, measured in the browser. Null without JavaScript. */
  elapsed: number | null;
};

/** `silent`: looks like a bot; answer "sent" so it learns nothing, and drop the message. */
export type Verdict = { ok: true } | { ok: false; reason: 'invalid' | 'email' | 'spam' | 'rate'; silent?: boolean };

const LIMITS = { name: 100, company: 120, email: 254, message: 5000 };
const MIN_MESSAGE = 10;
/** People need longer than this to fill in four fields; scripts do not. */
const MIN_FILL_MS = 3000;
const MAX_LINKS = 2;

// Phrases that only show up in unsolicited sales and scam mail, never in an inspection enquiry. Matched as whole
// words. Kept short on purpose: greetings like "Dear Sir/Madam" or "WhatsApp me" also come from real buyers.
const SPAM_PHRASES = [
  'seo services?', 'backlinks?', 'guest posts?', 'link building', 'rank your website', 'first page of google',
  'crypto(currency)?', 'bitcoin', 'forex', 'casino', 'sports betting', 'viagra', 'cialis', 'payday loans?',
  'web design services', 'increase your (website )?traffic', 'buy (instagram |tiktok )?followers',
];
const SPAM = new RegExp(`\\b(?:${SPAM_PHRASES.join('|')})\\b`, 'i');

// Throwaway inboxes. Not exhaustive: the mail-server check below catches made-up domains.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com', '10minutemail.com', '10minutemail.net',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmailo.com', 'tempr.email', 'throwawaymail.com', 'yopmail.com',
  'yopmail.fr', 'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'trashmail.com',
  'trashmail.de', 'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'spamgourmet.com', 'mailcatch.com',
  'moakt.com', 'tmail.ws', 'tmpmail.org', 'tmpmail.net', 'burnermail.io', 'inboxkitten.com', 'mail.tm', 'mailpoof.com',
  'discard.email', 'spambox.us', 'jetable.org', 'trbvm.com', 'byom.de', 'emltmp.com', 'dropmail.me',
]);

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@([a-z0-9-]+\.)+[a-z]{2,}$/i;
const URL_SOURCE = String.raw`\b(?:https?://|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|ru|cn|xyz|top|info|biz|online|site|shop)/\S*`;
const hasLink = (s: string) => new RegExp(URL_SOURCE, 'i').test(s);
const countLinks = (s: string) => s.match(new RegExp(URL_SOURCE, 'gi'))?.length ?? 0;

export function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max + 1) : '';
}

export function parseInput(raw: Record<string, unknown>): ContactInput {
  const elapsed = Number(raw.elapsed);
  return {
    name: clean(raw.name, LIMITS.name),
    company: clean(raw.company, LIMITS.company),
    email: clean(raw.email, LIMITS.email).toLowerCase(),
    message: clean(raw.message, LIMITS.message),
    honey: clean(raw._honey, 200),
    elapsed: Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null,
  };
}

/** The checks that need no network: shape, honeypot, timing, links, phrases, throwaway domains. */
export function checkContent(c: ContactInput): Verdict {
  if (c.honey) return { ok: false, reason: 'spam', silent: true };
  if (c.elapsed !== null && c.elapsed < MIN_FILL_MS) return { ok: false, reason: 'spam', silent: true };
  if (!c.name || !c.email || c.message.length < MIN_MESSAGE) return { ok: false, reason: 'invalid' };
  if (c.name.length > LIMITS.name || c.company.length > LIMITS.company || c.message.length > LIMITS.message) return { ok: false, reason: 'invalid' };
  if (!EMAIL.test(c.email) || c.email.length > LIMITS.email) return { ok: false, reason: 'email' };
  if (DISPOSABLE.has(c.email.split('@')[1])) return { ok: false, reason: 'email' };
  // Links in the name or company field are always a bot.
  if (hasLink(c.name) || hasLink(c.company)) return { ok: false, reason: 'spam', silent: true };
  const links = countLinks(c.message);
  if (links > MAX_LINKS) return { ok: false, reason: 'spam' };
  // Without JavaScript there is no timing, so hold those messages to a stricter rule: no links at all.
  if (c.elapsed === null && links > 0) return { ok: false, reason: 'spam' };
  if (SPAM.test(`${c.name} ${c.company} ${c.message}`)) return { ok: false, reason: 'spam' };
  return { ok: true };
}

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);

const NO_RECORD = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN', 'ENONAME']);

/**
 * DNS check on the sender's domain: can it receive mail at all? Looks up MX records, then A/AAAA (a domain
 * without MX still takes mail on its address). A domain that does not exist, or publishes a "null MX"
 * (RFC 7505: no mail accepted), cannot be a real reply address. DNS trouble on our side lets the message through.
 */
export async function domainTakesMail(domain: string, resolver: Pick<typeof dns, 'resolveMx' | 'resolve4' | 'resolve6'> = dns): Promise<boolean> {
  const code = (e: unknown) => (e as { code?: string }).code ?? '';
  try {
    const mx = await withTimeout(resolver.resolveMx(domain), 2500);
    if (mx.length === 1 && (mx[0].exchange === '' || mx[0].exchange === '.')) return false;
    if (mx.length) return true;
  } catch (e) {
    if (!NO_RECORD.has(code(e))) return true;
  }
  for (const lookup of [(d: string) => resolver.resolve4(d), (d: string) => resolver.resolve6(d)]) {
    try {
      if ((await withTimeout(lookup(domain), 2500)).length) return true;
    } catch (e) {
      if (!NO_RECORD.has(code(e))) return true;
    }
  }
  // Before refusing, make sure our own DNS works: if a domain that certainly takes mail does not resolve
  // either, the fault is ours, and a real customer must not pay for it.
  return !(await dnsWorks(resolver));
}

const CONTROL_DOMAIN = 'gmail.com';

/** Asked fresh each time: it only runs when a message is about to be refused, which is rare. */
async function dnsWorks(resolver: Pick<typeof dns, 'resolveMx'>): Promise<boolean> {
  try {
    return (await withTimeout(resolver.resolveMx(CONTROL_DOMAIN), 2500)).length > 0;
  } catch {
    return false;
  }
}

// Per-IP limit. Each server instance keeps its own count, so treat it as a brake on bursts;
// a Vercel Firewall rate-limit rule is the hard limit (see README).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, now = Date.now()): boolean {
  if (!ip) return false;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

/** Cloudflare Turnstile, when TURNSTILE_SECRET_KEY is set. Without the key the check is skipped. */
export async function turnstileOk(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    return (await res.json()).success === true;
  } catch {
    return false;
  }
}
