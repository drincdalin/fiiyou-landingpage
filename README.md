# fiiyou.online (landing page)

The public landing page for fiiyou: **the internet belongs to you.**

This is a separate project from the app. The app lives at https://app.fiiyou.online (repo: https://github.com/drincdalin/fiiyou.online). This one is plain HTML, CSS and a little JavaScript. No framework, no build step, no dependencies.

## Files
- `index.html`: the page, including all SEO tags (title, description, canonical, Open Graph, Twitter card, JSON-LD)
- `styles.css`, `main.js`: black and white with two charcoal bands, five type sizes (display, h2, lead, body, small), hairlines instead of cards. `main.js` handles the mobile menu, donation details and the contributors list.
- `config.js`: **the file to edit for donations** (Ko-fi URL, IBAN, name on the account)
- `404.html`, `robots.txt`, `sitemap.xml`, `vercel.json`
- `assets/`: favicons and the share image (`og-image.png`, 1200x630)
- `fonts/`: Ubuntu Sans and its licence. Keep the licence next to the font.

## Run it locally
Any static server works:

    npx serve .

Open the address it prints. Opening `index.html` straight from disk works too. (`404.html` uses absolute paths on purpose, because a host serves it from any URL.)

## Deploy (Vercel)
1. New Project, import this repository. Framework preset: **Other**. Leave build command and output directory empty (the root is the site).
2. Settings, Domains: add `fiiyou.online` (and `www.fiiyou.online` redirecting to it if you want).
3. The app is a different Vercel project with the domain `app.fiiyou.online`.

`vercel.json` sets the security headers, including a Content-Security-Policy. If you add a new third party (a script, a font host, an API), allow it there or the browser will block it.

## Donations
Open `config.js`. Ko-fi defaults to `https://ko-fi.com/fiiyou`, change it if your page is different. The IBAN is already in; add `holder` (the name on the account) so people can fill in the beneficiary field. `bic` and `reference` are optional. The IBAN is checked with the standard mod 97 test before it is shown, so a typo hides the block instead of publishing a wrong number. With no IBAN the page says "Bank details coming soon".

## Scrolling
Scrolling is native (`scroll-behavior: smooth` in CSS, off for reduced motion).

## The contributors list
`main.js` asks GitHub's public API for the contributors of `drincdalin/fiiyou.online`, sorts them by commits and shows them. Bots are skipped, and so is anyone in the `HIDDEN` set at the top of that section (same list the app uses). GitHub allows 60 anonymous requests per hour per IP, so the answer is cached for 10 minutes in `sessionStorage`. If GitHub is unreachable the page shows a link to the contributors page instead.

To list a different repo, change `REPO` in `main.js`.

## Editing copy
Keep it plain and human. Short sentences, no buzzwords, no em dashes.

