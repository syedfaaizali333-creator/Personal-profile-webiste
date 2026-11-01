# FAAIZ.DEV — Reference-inspired portfolio

A responsive, multi-page portfolio built with HTML5, CSS3 and vanilla JavaScript. The visual direction is inspired by common modern developer-portfolio patterns: clear hero, about section, skills, project cards, case studies, credentials, resume and contact. The reference is used for structure/inspiration only; this website uses its own styling and Faaiz's development-related content.

## Pages
- `index.html` — Home, intro, capability summary, featured projects, skills, process, certificate highlight, contact form
- `about.html` — Developer profile and learning journey
- `skills.html` — Technology/toolkit categories
- `projects.html` — Filterable project archive
- `projects/*.html` — Individual case studies
- `resume.html` — Print/save as PDF resume
- `contact.html` — Contact form and developer links
- `services.html`, `blog.html` — Focus areas and notes placeholder

## Run locally
Open `index.html` in a browser for basic content. For the best results use a static server (for example VS Code Live Server) so all relative paths work consistently.

## Supabase (optional)
1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `js/config.js`.
3. The contact form inserts into `public.messages`. If Supabase is not configured, it opens the visitor's email application instead.
4. Never use a service-role/secret key in browser code.

## Content accuracy
- Case studies explain project goals, scope and learning; they do not invent client metrics, testimonials or production results.
- Project preview panels are decorative CSS previews, not actual screenshots of deployed projects.
- The W3Schools certificate includes the known verification URL. Other certificate entries are listed only from the available prior project context; upload the original certificate images/PDFs to show the documents.
- Education details and work experience dates are not fabricated.

## Notes
- No React, TypeScript, Lovable metadata, or Ctrl/Cmd+K command palette is included.
- Animations respect `prefers-reduced-motion` and are progressively enhanced; core page content is directly present in HTML.


## Recent interaction and visual updates
- Blue-only F. logo accent stays consistent during the loader and on the site.
- **Professional intro sequence:** the boot loader ships inside every page, so it is on screen from the very first paint. It plays once per browser session, animates an eased 0→100% progress with rotating status labels, shows a "✓ COMPLETE" badge at 100%, then lifts away like a curtain while the hero content staggers in. Skipped automatically for repeat visits in the same session and for visitors who prefer reduced motion.
- **Basith.dev-style custom cursor:** a precise dot locked to the pointer plus a trailing ring that follows with eased lag (rAF/lerp). The ring grows over links, buttons and form fields, compresses while pressed, and hides when the pointer leaves the window. Desktop/fine-pointer only — touch devices and reduced-motion users keep the native pointer.
- **Settings gear removed:** the floating appearance/settings button and its panel are gone; the theme still follows the system preference (or the previously saved choice).
- Home navigation is through the FAAIZ.DEV logo; the separate Home nav item is removed.
- Faaiz AI assistant has a draggable mascot/launcher and draggable panel header; quick prompt buttons are wired correctly.
- Case-study pages now include available assignment visuals: RAASTAGO and Aversion University screenshots, the iHub design board, and TravelNest/headphone design mockups. FAAIZ.DEV uses bespoke illustrative artwork because a screenshot of the live portfolio project was not in the available assets.
- About page includes the available developer workspace image.

## October 2026 creative portfolio upgrade

This version adds a hybrid developer + visual-design direction while preserving the existing multi-page HTML/CSS/Vanilla JavaScript structure.

### New features
- **Adaptive appearance settings**: Dark, Light and System theme options. The selected theme is saved in `localStorage` (`faaiz-theme`) and applied early to reduce theme flash.
- **Motion preferences**: Cinematic, Normal and Reduced motion settings are saved in the browser. The operating system's `prefers-reduced-motion` preference is also respected.
- **Assistant visibility**: visitors can hide or show the existing Faaiz AI portfolio guide; the choice is saved locally. The assistant still uses predefined portfolio answers, not a generative AI service.
- **Interactive portrait/code card**: click the home portrait to flip between the supplied profile photo and a source-code panel.

### Local run
Open `index.html` through a local static web server or your hosting preview. No build step is required. Contact form delivery still depends on configuring the existing Supabase or email settings in `js/config.js`.

### Validation note
The project was checked for JavaScript syntax, HTML parser errors, local asset/link references and ZIP integrity. Browser-based visual testing and real device testing are not claimed by this package build; please preview desktop and mobile layouts before publishing.

## Final cleanup notes
- The separate design-gallery page and its navigation links have been removed at the owner’s request.
- Project preview images and assistant-selected workspace imagery have been removed pending the owner’s chosen assets. The supplied profile portrait remains.
- The homepage portrait is clickable: it flips between the photo and the portfolio source-code panel.
- The welcome loader runs once per browser tab session; internal page navigation no longer triggers another full-screen loader.
- The headphone project is labelled “Headphone Website”.
