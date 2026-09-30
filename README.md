# MTRobotix website

Company site for MTRobotix (https://www.mtrobotix.com): MTR-Q vision inspection, AMR, robot arm. English and Vietnamese.

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

Rules: `~/MTR/AGENTS.md` and `~/MTR/.agents/skills/mtrobotics-web/SKILL.md`.
Push to `main` → Vercel deploys.
