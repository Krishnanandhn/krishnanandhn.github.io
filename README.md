# Krishnanandh N / Unity AR Portfolio

A responsive React + TypeScript portfolio for Unity AR/XR and native mobile integration roles. The app lives in `site/`; source recordings and the source resume remain outside it in `Assets/`.

## Run locally

Requires Node.js 22.12+ (Node.js 24 LTS recommended) and npm.

```sh
cd site
npm ci
npm run dev
```

Open the URL Vite prints, normally http://127.0.0.1:5173. Vite chooses the next available port if needed.

```sh
npm run lint
npm run build
npm run verify:public
npx playwright install chromium
npm test
```

The browser suite uses the production build on port 4173 and an isolated Formspree test server on port 5175. Those ports must be free. It covers desktop, tablet, and mobile layouts; theme persistence; WCAG A/AA automated checks; 3D canvas pixels and interaction; filters; timeline; videos; clipboard; downloads; and mocked form delivery. Screenshots, traces, and the HTML report appear in `site/test-results/` and `site/playwright-report/`. Tests never send real email. Chromium mobile emulation is not a substitute for testing on a physical iPhone or Android device.

## Edit content

- `site/src/data.ts`: profile, links, projects, skills, and experience.
- `site/src/Portfolio.tsx`: page composition, navigation, filters, timeline, and video dialog.
- `site/src/SpatialScene.tsx`: lazy-loaded Three.js scene.
- `site/src/ContactForm.tsx`: contact form and transport states.
- `site/src/globals.css`: theme tokens, self-hosted fonts, and shared controls.
- `site/src/portfolio.css`: responsive layout and component styles.

The default theme is dark. Visitor preference is stored locally. Reduced-motion preferences are respected. The hero uses the supplied portrait on a shallow curved Three.js surface with pointer/touch tilt, subtle idle motion, and pause/reset controls. This is a photo-based 3D effect, not a fully modeled or rigged avatar. Loading and unsupported-WebGL states show the same portrait as a regular image. Personal games are explicitly AI-assisted; commercial product identity is withheld under NDA. A separate photography portfolio is intentionally omitted until images are available. No unsupported performance metrics or invented project milestone dates are published.

## Public media and privacy

`site/public/media/` contains the production-ready MP4s, WebP posters, and an unchanged copy of the original resume PDF. At the owner's request, the downloadable resume **includes the mobile number**. The webpage itself does not display the number. Original assets remain unchanged.

To regenerate public assets locally, install FFmpeg first, keep the supplied `Assets/` folder beside `site/`, and run:

```sh
cd site
npm run prepare:assets
npm run build
npm run verify:public
```

To replace only the downloadable resume without re-encoding videos, run `npm run prepare:assets -- --resume-only`.

The public hero cutout is `site/public/media/portrait.png`, generated from `Assets/Hero/portrait.png`. To replace it, run this from `site/` on macOS with Xcode command-line tools installed:

```sh
swift scripts/prepare-portrait.swift ../Assets/Hero/portrait.png public/media/portrait.png
```

This uses Apple Vision's on-device person segmentation and does not upload the photo. The source photo stays unchanged. Keep a replacement photo at the same 617 by 669 dimensions, or update the portrait geometry and image dimensions in the scene, fallback, and browser test.

The generated media is included in the repository so cloud builds do **not** need FFmpeg or access to private source files. Never deploy the entire workspace as a static folder. Publish only `site/dist/`. The root `.gitignore` excludes original assets, the source Markdown resume, environment files, and generated reports. If starting a new repository, review the staged files before the first push; ignore rules do not remove files already tracked.

The recordings remain real Unity prototype captures, including editor chrome. Both are served as H.264 MP4 with fast-start metadata; audio was omitted. The recordings are approximately 0.6 MB and 15.1 MB and are loaded only when a visitor opens a gameplay dialog.

## Enable direct contact-form delivery

Without configuration, the form validates input and opens the visitor's email application with a prefilled draft. It never claims to have delivered a message. The email link and copy-email button remain available.

1. Create a free account at https://formspree.io and add a form linked to `krishnanandhn33@gmail.com`.
2. Verify the destination email and copy the endpoint, for example `https://formspree.io/f/abcdefgh`.
3. Locally, create `site/.env.local` using `site/.env.example` and set `VITE_FORMSPREE_ENDPOINT` to that endpoint.
4. On Vercel or Netlify, set the same environment variable in project settings and redeploy. Vite injects it at build time.
5. Submit a real test message after deployment and verify inbox delivery. Review Formspree's current free-plan submission limits and spam controls.

The form includes required fields, email validation, length limits, a honeypot, a request timeout, and pending/success/error feedback. The endpoint is a public form identifier, not a secret. Do not put credentials in any `VITE_` variable. Submission content goes to Formspree only after that integration is configured; fonts and media are self-hosted and no analytics are added.

## Deploy for free on GitHub Pages

The included `.github/workflows/deploy.yml` deploys this portfolio to <https://krishnanandhn.github.io/AI_Portfolio/> when changes are pushed to `main`. It uses Node.js 24, installs locked dependencies, runs lint, builds the app with `VITE_BASE_PATH=/AI_Portfolio/`, verifies public assets, and publishes only `site/dist/`. The deployment actions are pinned to specific commits.

1. Publish the entire workspace to the **public AI_Portfolio repository** under the **Krishnanandhn** account. Keep `site/` inside the repository root, and include `.github/workflows/deploy.yml`, `site/package-lock.json`, and `site/public/media/`.
2. Do not publish `Assets/`, local environment files, or `node_modules/`. The existing ignore rules exclude these untracked files. The prepared public resume intentionally includes the mobile number.
3. In the repository's **Settings > Pages > Build and deployment**, set **Source** to **GitHub Actions**. Do not select deployment from a branch or the `docs` folder.
4. Push to `main`, then open the **Actions** tab and watch **Deploy portfolio to GitHub Pages**. If the first run happened before Pages was enabled, rerun it or use **Run workflow**.
5. After the deployment succeeds, open <https://krishnanandhn.github.io/AI_Portfolio/> and test the portrait, gameplay videos, resume, and contact action. Future pushes to `main` automatically redeploy. GitHub may take a few minutes to publish changes.

If the live site shows this README instead of the portfolio, Pages is publishing the source branch rather than the built app. In [repository Pages settings](https://github.com/Krishnanandhn/AI_Portfolio/settings/pages), change **Source** from **Deploy from a branch** to **GitHub Actions**, then rerun the deployment workflow. Do not copy the source HTML into the repository root or remove the README.

Vite reads `VITE_BASE_PATH`, and all public media URLs derive from Vite's base. The workflow sets `/AI_Portfolio/`; local development and Vercel/Netlify builds still default to `/`. If the repository name changes, update the workflow's base path. If the default branch is not `main`, update its branch trigger to match.

To verify the GitHub Pages layout locally, run from `site/`:

```sh
VITE_BASE_PATH=/AI_Portfolio/ npm run build
VITE_BASE_PATH=/AI_Portfolio/ npm test -- --grep 'responsive content|both gameplay|copy contact|portrait photo'
```

For optional direct form delivery, add a repository **Actions variable** named `VITE_FORMSPREE_ENDPOINT` under **Settings > Secrets and variables > Actions > Variables**, then rerun the deployment. Leave it unset to keep the email-draft fallback. No personal access token or other deployment secret is required; the workflow uses GitHub's built-in token and Pages permissions.

GitHub Pages and standard GitHub-hosted Actions runners are free for public repositories within GitHub's usage limits. The provided `github.io` address includes HTTPS; a purchased custom domain is optional. This is static hosting, so no backend is deployed. Vercel and Netlify response-header settings do not apply to GitHub Pages.

## Deploy for free on Vercel

1. Push the project to a GitHub repository, including `site/public/media/` and `site/package-lock.json`, but not `Assets/` or the source Markdown resume. The public resume PDF intentionally includes the mobile number.
2. In https://vercel.com/new, import that repository.
3. Set **Root Directory** to `site` and **Framework Preset** to Vite.
4. Confirm **Install Command** `npm ci`, **Build Command** `npm run build`, and **Output Directory** `dist`.
5. Optionally add `VITE_FORMSPREE_ENDPOINT` in Environment Variables.
6. Deploy. Vercel provides a free `*.vercel.app` address and HTTPS; eligible personal projects can use its Hobby plan.
7. Check the resume download, both videos, and contact flow at the deployed URL. Future pushes trigger rebuilds.

`site/vercel.json` supplies build settings and security headers. Nothing needs to be changed for hash navigation; there are no client-side routes requiring a rewrite.

## Deploy for free on Netlify

1. Push the same repository to GitHub.
2. At https://app.netlify.com, choose **Add new project** and import the repository.
3. Keep the root `netlify.toml` settings: **Base directory** `site`, **Build command** `npm run build`, **Publish directory** `dist` (relative to `site`).
4. Optionally set `VITE_FORMSPREE_ENDPOINT` in the site's environment variables.
5. Deploy to receive a free `*.netlify.app` address with HTTPS. Review current free-plan bandwidth/credit limits, especially if video traffic grows.
6. Verify media, resume, and contact behavior at the deployed URL.

For a manual Netlify deployment, run `npm run build` in `site/` and upload **only** `site/dist/` to Netlify Drop. Build environment variables must already be set before building. Git-integrated builds apply the included hosting headers.

## Before launch

1. Review the anonymized commercial description against your NDA.
2. Check the original downloadable resume, its included mobile number, and the contact email.
3. Configure and verify Formspree if direct delivery is needed.
4. Once a public domain is chosen, add the final canonical URL and Open Graph URL in `site/index.html`; no guessed deployment address is hardcoded.
5. Test on a physical phone and check plan limits with your chosen hosting provider.

The 3D renderer is split into its own optional bundle. Three.js is comparatively large, so Vite may emit a chunk-size advisory for that lazy-loaded bundle. The main page does not wait for the renderer to display its content.