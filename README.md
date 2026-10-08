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
