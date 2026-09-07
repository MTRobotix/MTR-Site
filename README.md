# MTRobotics site

Static Astro implementation of the MTRobotics handoff. It includes seven English routes plus seven `/vi` equivalents, persistent language switching, one active founder profile, quiet transitions, and localized form validation. The homepage adds a pointer-reactive wake field and a responsive 4/2/1 engineering register; mobile navigation nests Solutions in an accessible disclosure.

```sh
npm install
npm run dev
npm run astro -- check
npm run build
```

Design tokens live in `src/styles/tokens.css`; typed page copy lives in `src/data`. Full HD is the visual baseline, with supporting type, controls, gutters, and hero depth scaling for 2K displays. The header and favicon use the owner-directed red `MT` / paper `R` mark; the utility strip keeps only the language control.

Vietnamese pages self-host Barlow Vietnamese glyph subsets. Phone and email appear only on Request a demo. The demo form posts to a Vercel function, which validates each request and emails a plain-text report through Resend to `mtrobotix@gmail.com`; the site keeps no database copy.

For deployment, verify a sending domain in Resend and add `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in Vercel project settings. Use `.env.example` for local development, then redeploy after changing environment variables.
