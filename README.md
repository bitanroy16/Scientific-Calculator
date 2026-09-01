# Advanced fx-991MS Matrix Workspace — Static Build

This is a **fully static, hosting-ready** version of the scientific calculator.
It runs entirely in the browser — there is no Python/Flask backend, no API
server, and no build step.

## What changed from the original repo

The original project used a Flask backend (`app.py` + `engines.py`) to do all
the math, and `index.html` used Jinja2 template tags
(`{{ url_for('static', filename='...') }}`) that only resolve when served by
Flask. That combination breaks on any static host (GitHub Pages, Netlify,
Vercel, S3/CloudFront, etc.), since there's no server to render templates or
answer the `/api/991ms/calculate` endpoint.

This build fixes that:

- **`index.html`** — plain relative asset paths (`style.css`, `script.js`)
  instead of Flask's `url_for`.
- **`script.js`** — every calculation mode (COMP, CMPLX, BASE-N, EQN, MATRIX,
  VECTOR) has been ported from `engines.py` to run client-side using
  [math.js](https://mathjs.org/) (loaded from a CDN). There is no
  `fetch()` call to `127.0.0.1:5000` or anywhere else.
- **`style.css`** — unchanged.

The old `app.py`, `engines.py`, and the AI-assistant hook (`ai_engine`,
referenced but not shipped in the original repo) are no longer needed and are
not part of this build.

## Files

```
index.html    Markup + CDN reference to math.js + script.js
script.js     All UI logic and calculation engines (client-side only)
style.css     Styling (unchanged from the original)
```

## Run locally

No build tools or install step needed. Either:

- Double-click `index.html` to open it directly in a browser, or
- Serve the folder with any static file server, e.g.:
  ```bash
  npx serve .
  # or
  python3 -m http.server 8080
  ```

## Deploy

Because this is a static site, you can drop these three files onto any static
host:

- **GitHub Pages**: push this folder to a repo and enable Pages on the branch/
  folder.
- **Netlify / Vercel**: drag-and-drop the folder (or connect the repo) — no
  build command or output directory needed.
- **S3 / Cloudflare Pages / any CDN**: upload the three files as-is.

No environment variables, server processes, or API keys are required.

## Notes

- Requires internet access on first load to fetch math.js from the CDN
  (`https://cdnjs.cloudflare.com/ajax/libs/mathjs/...`). If you need a fully
  offline build, download `math.min.js` and reference it locally instead of
  the CDN URL in `index.html`.

  https://calculator-7f2s.onrender.com/
  
