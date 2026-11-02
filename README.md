# FAAIZ.DEV 2.0 — Premium Developer Portfolio

The personal portfolio of **Syed Faaiz Bin Shan E Ali** — student developer & aspiring web developer (Karachi, Pakistan). Built with **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no build step, no unnecessary dependencies.

- **Live:** https://faaiz-dev.vercel.app/
- **GitHub:** https://github.com/syedfaaizali333-creator
- **LinkedIn:** https://www.linkedin.com/in/syed-faaiz-bin-shan-e-ali-404792429/

All content is genuine: real projects, honest skills, no invented experience, metrics or certificates.

---

## Features

### Experience & design
- **Cinematic code-to-portrait intro** — one continuous sequence: navy terminal types out `INITIALIZING FAAIZ.DEV` → thousands of particles sampled from the real profile photograph converge while a scanline sweeps (the actual photo fades in beneath) → **COMPLETE COMPILE** → the portrait flies seamlessly into its exact hero position (FLIP handoff) as the homepage staggers in with an electric-blue glow. Plays once per browser session; skipped for reduced-motion visitors; graceful CSS-only fallback when canvas is unavailable.
- **Dark Navy × Electric Blue design system** — `#001A3D`, `#003B7A`, `#006EFF`, `#00CFFF`, `#FFFFFF`, `#D9E2EC`; exactly two accents and two font families (Manrope + DM Mono). Dark mode is the default.
- **Light/dark toggle** in the navbar of every page (persisted).
- **Basith.dev-style custom cursor** — precise dot + easing trailing ring, grows over interactive elements, fine-pointer devices only.
- Glassmorphism accents, scroll reveals, project filtering, back-to-top, custom favicon, Open-Graph/Twitter share cards, custom **404 page**.

### Developer features (all genuinely functional)
- **Live coding playground** (`playground.html`) — HTML/CSS/JS editors, live preview, Run/Reset/Copy, three starter templates, console with error capture. Visitor code runs in a **sandboxed iframe** (`allow-scripts`, no same-origin). Drafts persist locally. Ctrl/Cmd+Enter runs.
- **Interactive developer terminal** (home page) — `help`, `about`, `skills`, `projects`, `open <project>`, `github`, `resume`, `contact`, `socials`, `theme`, `whoami`, `clear`. Command history (↑/↓); every command performs its advertised action.
- **Live GitHub integration** (home page) — real public data from the GitHub API (profile stats + recent repositories with language, stars, forks, links). Loading/error/rate-limit states; 30-minute session cache; nothing hard-coded.
- **Faaiz AI assistant** (every page) — grounded strictly in published portfolio facts; **English + Roman Urdu**; typing indicator; suggested questions; draggable panel. Optional secure AI: set `AI_ENDPOINT` (see below) — keys never touch the frontend; falls back to the built-in knowledge base.
- **Contact form** — name, email, subject, message; validation; honest feedback only (no fake success). Stores to Supabase when configured, otherwise opens the visitor's email app.
- **Smart resume center** (`resume.html`) — profile summary, skills, selected projects, verified certificates; one-click Print/Save-as-PDF.

### Content
- 6 real projects with case studies (overview, problem, solution, role & contribution, technology, features, challenges & solutions, lessons learned).
- Skills organized honestly (Frontend / Backend & APIs / Databases / Design / Tools) with links to related work — no invented percentages.
- Verified milestones on the About page (W3Schools HTML certification — Mar 2024; CodingWise HTML course — Jun 2026).

---

## Project structure

```
FAAIZ.DEV/
├── index.html              # hero, about, projects, process, terminal, GitHub, contact
├── about.html              # journey + verified milestones timeline
├── skills.html             # skills toolkit with project links
├── projects.html           # filterable project archive
├── playground.html         # live coding playground
├── resume.html             # resume / print-to-PDF center
├── contact.html            # contact form + links
├── services.html, blog.html
├── 404.html                # custom not-found page
├── projects/*.html         # 6 case studies
├── css/style.css           # single organized stylesheet (design system + components)
├── js/
│   ├── config.js           # Supabase / email / AI endpoint configuration
│   ├── main.js             # intro engine, theme, cursor, nav, reveals, filters
│   ├── ai-assistant.js     # Faaiz AI (EN + Roman Urdu, secure hook, fallback)
│   ├── terminal.js         # developer terminal
│   ├── playground.js       # coding playground
│   ├── github.js           # GitHub API integration
│   └── contact.js          # contact form handling
├── api/assistant.js        # OPTIONAL Vercel serverless AI proxy (key stays server-side)
├── assets/faaiz-profile.png
├── supabase/schema.sql     # messages table (insert-only, RLS)
└── README.md
```

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
# or: npx serve .
```

Open http://localhost:8000. (Opening `index.html` directly via file:// works, but the intro photo sampling and some fetch features need a server.)

## Configuration (all optional)

Edit `js/config.js`:

| Key | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Store contact messages in Supabase. Run `supabase/schema.sql` in the Supabase SQL editor first. Publishable key only — protected by row-level security. |
| `CONTACT_EMAIL` | Fallback: form opens the visitor's email app. |
| `AI_ENDPOINT` | e.g. `/api/assistant` — enables real AI answers. |

### Enabling real AI answers (secure)

Deploy the included Vercel function `api/assistant.js` and set two environment variables in Vercel (Project → Settings → Environment Variables):

- `AI_API_KEY` — your OpenAI-compatible API key (**server-side only, never in frontend code**)
- `AI_MODEL` — optional (defaults to `gpt-4o-mini`)

Then set `AI_ENDPOINT: '/api/assistant'` in `js/config.js`. Without this, the assistant uses its built-in knowledge base — fully functional, just not LLM-powered. The site never exposes keys and never breaks if the AI service is down.

## Deploy to Vercel

1. Push this repository to GitHub (already at `syedfaaizali333-creator/Personal-profile-webiste`).
2. On [vercel.com](https://vercel.com) → **Add New Project** → import the repository.
3. Framework preset: **Other** (static). No build command; output directory: `./`.
4. Deploy — every push to `main` auto-deploys.
5. Optional: add the environment variables above to enable AI answers.

---

## Testing report

All checks below were executed with automated jsdom browser-simulation suites (43 + 10 + 9 + 15 assertions) plus static audits. Nothing is claimed as tested that wasn't.

**Verified working:**
- Intro: INITIALIZING → particle materialization from the real photo → scanline → COMPLETE COMPILE at 100% → curtain exit → FLIP handoff → hero glow; repeat visits and reduced-motion visitors skip it; zero console errors.
- Terminal: all 12 commands execute their advertised actions (help/about/skills/projects/open/github/resume/contact/socials/theme/whoami/clear); unknown commands produce helpful errors; ↑/↓ history works.
- Playground: templates load; Run builds the srcdoc; sandbox is `allow-scripts` only; console bridge captures `console.log` and runtime errors; tab switching, reset, template switching work.
- GitHub integration: renders real fixture data (stats, repo cards, fork badge, links); rate-limit path shows an honest error with a direct profile link.
- AI assistant: opens with greeting + 4 suggested questions; typing indicator appears and is removed; grounded English answers; Roman Urdu answers; graceful fallback for unknown input.
- Contact form: invalid email rejected with a clear message; unconfigured endpoint shows an honest "not connected" message (never fake success); subject field present on both forms.
- Theme: dark default; toggle flips and persists; legacy values fall back safely.
- Site-wide: favicon + OG/Twitter cards + assistant + Playground nav on all 14 routed pages; every internal link resolves; no API keys in client code; server function reads the key from the server environment only; no settings gear anywhere.

**Manual checks recommended after deploy:** real-device touch behaviour, Lighthouse pass, GitHub API on production IP, Supabase insert with real credentials.

## Known limitations

- **Real AI answers** require deploying `api/assistant.js` with your own `AI_API_KEY` (free tiers available). Without it, the assistant uses its built-in knowledge base.
- **Contact storage** requires a Supabase project + running `supabase/schema.sql`. Without it, the form uses the mailto fallback and says so honestly.
- **Resume PDF** is generated by the browser's print dialog (there is no pre-made PDF file in the repo — upload one to `assets/` and link it if you prefer).
- **GitHub API** unauthenticated requests are rate-limited per IP (60/hour); the section caches for 30 minutes and shows a friendly error otherwise.
- **Project screenshots** are stylized CSS previews, not real screenshots — replace them in `projects/*.html` when real captures are available.
- Vercel serves `404.html` automatically for unknown routes; other hosts may need the rule configured.
