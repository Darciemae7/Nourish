# Nourish v0.2 — zero-cost offline-first prototype

This version removes paid AI services and API keys. It is a static Progressive Web App (PWA) designed to run locally and be hosted free on static hosting such as GitHub Pages.

## Included
- Written meal diary
- Ingredient matching against a small bundled starter food table
- Editable gram quantities before confirmation
- Nutrient calculations from per-100g food values
- Daily macro, fibre, vitamin and mineral summary
- Calories hidden until deliberately revealed
- Local browser storage, JSON export/import
- Offline service worker shell

## Important accuracy note
The bundled `foods.json` is a deliberately small starter dataset with approximate illustrative values. It is not the complete UK CoFID dataset and is not suitable for clinical decisions. It covers only selected foods and a subset of micronutrients. Unknown foods are not counted in totals. The app should not be used to diagnose deficiencies or replace dietetic/medical care.

The next data task is to import the official UK Composition of Foods Integrated Dataset (CoFID) and preserve source, food identifiers, nutrient units, edible portion and preparation state. Check the current UK government licence and attribution requirements before redistributing its data.

## Run locally
- Install Node.js.
- Run `npm install`
- Run `npm run start`
- Open the local Vite address shown in the terminal.

## Free hosting
This is a static site. Build with `npm run build`, then publish the `dist` directory to GitHub Pages or another free static host. Use HTTPS to install it as a PWA on Android.

## Storage
Entries are saved in the current browser's local storage only. There is no account, cloud sync, encryption layer or backup service in this prototype. Use Export diary backup regularly. Clearing browser data can erase entries.

## Not included yet
- Automatic AI food recognition
- Reliable image-based portion estimation
- Complete CoFID nutrient database
- Secure multi-device account and sync
- Medical interpretation or deficiency diagnosis

These features should be added only with clear uncertainty labels and privacy safeguards.

## GitHub Pages deployment (free)
1. Create a GitHub repository named `nourish`.
2. Upload the contents of this project to the repository root (including the hidden `.github` folder).
3. In the repository, open Settings → Pages and set the build/deployment source to **GitHub Actions**.
4. Push/commit to the `main` branch. The included workflow builds and deploys the app.
5. When deployment completes, open the Pages URL on Android Chrome and choose **Install app** or **Add to Home screen**.

GitHub's free plan supports Pages for public repositories. A public repo means the app's source code and bundled generic food dataset are publicly viewable; your diary entries remain in your own browser storage and are not committed to the repository.
