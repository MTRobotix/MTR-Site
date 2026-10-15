# MTRobotix website

Company site for MTRobotix (https://www.mtrobotix.com): MetriQ vision inspection, AMR, robot arm. English and Vietnamese.

```sh
npm install
npm run dev          # http://localhost:4321
npx astro check
npm run build
```

| Change | File |
| - | - |
| All page copy (EN + VI) | `src/data/content.ts` |
| Nav labels, company contact details, routes | `src/data/i18n.ts` |
| Colours, spacing, fonts | `src/styles/tokens.css` |
| Old-URL redirects, sitemap | `astro.config.mjs` |

Design rules (colours, type, layout, motion, copy): `.claude/skills/mtrobotix-web/SKILL.md`. Company-wide rules: `~/MTR/AGENTS.md`.
Push to `main` → Vercel deploys.

## Contact form spam protection

The form posts to `/api/contact` (`src/pages/api/contact.ts`), a Vercel function. It checks every message on the server, so a bot that skips the page meets the same rules (`src/lib/spam.ts`):

| Check | Result |
| - | - |
| Hidden honeypot field filled, or sent faster than 3 s | Dropped quietly; the bot sees "sent" |
| Link in the name or company field | Dropped quietly |
| More than 2 links, or known spam phrases (SEO, backlinks, crypto, casino…) | Refused: "looks like spam" |
| Throwaway inbox (mailinator, yopmail…), or the email domain has no mail server in DNS (MX, then A/AAAA; null MX refused) | Refused: "can't receive mail" |
| More than 5 messages per IP in 10 minutes | Refused: "too many messages" (per server instance) |

If our own DNS fails, the domain check lets messages through rather than refuse a real customer. Messages that pass go to FormSubmit, which emails them to the inbox. If the function is down, the browser posts straight to FormSubmit with its captcha on, so no enquiry is lost.

Two optional upgrades, set in Vercel:

- **Cloudflare Turnstile** (free, invisible check): set `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, then redeploy. The widget appears and the server verifies it.
- **Vercel Firewall**: turn on Bot Protection, and add a rate-limit rule on `/api/contact` (for example 10 requests per minute per IP). This is the hard limit across all instances.
