# The Lattice — website

Landing page for The Lattice, a national community for senior women leaders.

Static HTML/CSS/JS. No build step. Pushing to `main` on GitHub auto-deploys to Netlify.

## Where to change what

| I want to change… | Open this file |
|---|---|
| Any words on the page | `index.html` |
| A brand colour or font | `css/brand-tokens.css` |
| Layout, spacing, section styling | `css/styles.css` |
| The portrait photo | drop the file in `images/`, then update the `<img src>` in `index.html` |
| Form behaviour / validation | `js/main.js` |

## Publish a change

```bash
cd ~/Documents/"The Lattice"/lattice-network-website
git add .
git commit -m "Describe what changed"
git push origin main
```

Netlify rebuilds within about 30 seconds.

## Brand rules this build holds to

Source of truth: `~/Documents/The Lattice/Website/design_handoff_lattice_site/`
(`The Lattice - Brand Bible.dc.html` and its `README.md`).

- **Colour budget** — ink navy 45–55%, mist grey + white 30–40%, cobalt 8–12%,
  iris 3–5%, citron 1–2%.
- **Citron is the CTA colour, on dark grounds only.** This is a deliberate
  divergence from the brand bible, which still says citron is "never a button".
  The bible is to be amended; until it is, this build wins and the divergence is
  documented here and in `css/styles.css`.
  - Citron buttons appear **only on navy sections** (hero, For Organizations).
    On white, citron is 1.5:1 against the page and fails WCAG 1.4.11 for the
    button's own edge — light-ground CTAs stay cobalt.
  - Citron always carries **navy text, never white** (10.9:1 vs 1.5:1).
  - Nothing else on the page is citron. Decorative nodes are iris, so citron
    means "action" and only that. Do not reintroduce citron accents.
  - To revert to cobalt CTAs, delete `data-cta="citron"` from the `<body>` tag.
- **One italic accent word per headline**, and only one. Cobalt on light grounds,
  iris on navy (cobalt on navy fails contrast). This is the page's signature —
  breaking it is what made the first draft feel generic.
- **The `keynote` class** sits above the bible's section-heading scale, used for the
  three headings that carry the argument. Remove the class to return a heading to
  standard size.
- **Two navy sections maximum, never adjacent** — the hero and For Organizations.
  The footer is navy but is not a content section.
- **Type** — Newsreader for headlines and pull lines, Inter for everything else.
  DM Sans is not used anywhere. Sentence case except small labels, nav and wordmark.
- **Wordmark** — Inter Semibold, uppercase, 0.12em tracking.
- No cream, beige, seafoam, terracotta or mid-grey section fills.

## Forms

The email capture uses Netlify Forms (`data-netlify="true"`). Submissions appear in
the Netlify dashboard under **Forms**, and can be set to email you. The form only
works on the deployed site, not when opening `index.html` locally.
