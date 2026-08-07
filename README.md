# The Lattice — website

Landing page for The Lattice, a national community for senior women leaders.
Built to the **v3 design direction** (August 2026).

Static HTML/CSS/JS. No build step, no dependencies. Pushing to `main` on GitHub
auto-deploys to Netlify.

## Where to change what

| I want to change… | Open this file |
|---|---|
| Any words on the page | `index.html` |
| A brand colour, font or spacing step | `css/brand-tokens.css` |
| Layout, section styling, responsive rules | `css/styles.css` |
| Form behaviour / validation / success message | `js/main.js` |
| Cookie banner, GA4 measurement ID | `js/analytics.js` |
| Headers, caching, publish directory | `netlify.toml` |

## Publish a change

```bash
cd ~/Documents/"The Lattice"/lattice-network-website
git add .
git commit -m "Describe what changed"
git push origin main
```

Netlify rebuilds within about 30 seconds.

To preview locally before pushing:

```bash
cd ~/Documents/"The Lattice"/lattice-network-website && python3 -m http.server 8899
```

Then open http://127.0.0.1:8899. The form will not submit locally — Netlify
Forms only works on the deployed site.

## Still outstanding before launch

1. **GA4 measurement ID** in `js/analytics.js` (currently a placeholder, so
   Accept stores the choice but loads nothing).
2. **Social share image.** There is a favicon and Open Graph title/description,
   but no `og:image`.
3. Confirm `hello@thelattice.ca` is monitored, and that Netlify → Forms is
   receiving `early-access` submissions.

## Brand rules this build holds to

Source of truth: `~/Documents/The Lattice/Website/design_handoff_lattice_v3/`
(`README.md`, `reference/lattice-landing-v3-standalone.html`, and
`reference/The Lattice - Brand Bible.dc.html`).

- **Colour budget** — ink navy 45–55%, mist grey + white 30–40%, cobalt 8–12%,
  iris 3–5%, citron 2–4%.
- **The citron rule.** Citron means "act here". It carries primary CTAs on ink
  navy grounds only, always with navy text, and does no decorative work — no
  dots, underlines or markers. On a light ground it is 1.5:1 against white and
  fails WCAG 1.4.11 for the button's own edge, so light-ground CTAs are cobalt.
  Citron appears exactly three times on the page: the header Express Interest
  button, the hero Get Early Access button, and the form submit. (The cookie
  banner's Accept is a fourth, but it sits on its own navy bar and reads as
  chrome, not page content.) Adding another is a brand decision, not a build one.
- **Two families only** — Newsreader for display (hero, section headlines, pull
  quotes, founder names), Inter for everything else including the wordmark.
  DM Sans was a third family in the previous build. It is gone; do not
  reintroduce it.
- **Italic carries emphasis, never colour.**
- **Structure** — panels and section blocks are square. Cards were removed from
  this direction deliberately. Section headings sit above a 2px navy rule;
  columns are divided by 1px hairlines, never by a border around a box. 5px
  radius on controls only.
- **Grounds alternate** — navy · white · grey · white · navy · white · grey ·
  navy · white. No two adjacent sections share a ground.
- **Column dividers must disappear when columns stack.** The hero, the two
  pillars and the three offer columns carry `data-stack`; the `max-width: 900px`
  rule in `css/styles.css` zeroes their inline borders and padding with
  `!important`. Without it the vertical rules survive the stack and draw lines
  pointing at nothing.
- **No scroll animation** in this direction. If any is added, gate it behind
  `prefers-reduced-motion`.
- Sentence case by default; uppercase only for eyebrows, small labels and the
  wordmark. No cream, beige, gradients, blobs or network globes.

## Copy divergences from the v3 prototype

Two deliberate departures, both carried over from the live site:

- **"Inaugural" peer circles, not "founding."** The prototype says "a founding
  peer circle" and "Founding peer circles launch September 2026". The live copy
  was corrected to "inaugural" and that correction stands. "Join the Founding
  Community" and "the founding cohort" are untouched — those describe the
  founding *members*, not the circles.
- **The cookie banner and the "Cookie settings" footer link** are not in the v3
  design, which predates them. They are kept: no analytics script loads before
  an explicit Accept, and removing that would be a privacy regression, not a
  design decision.

## Forms

The email capture uses Netlify Forms (`data-netlify="true"`, `name="early-access"`,
honeypot on `bot-field`). `js/main.js` posts it over `fetch` so the visitor stays
on the page and the panel swaps to a confirmation; if the fetch fails it hands
the submission back to the browser rather than losing it.

Submissions appear in the Netlify dashboard under **Forms** and can be set to
email you. Form detection must be enabled under Site configuration → Forms.
