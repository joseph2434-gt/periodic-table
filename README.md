# CSS Research Questionnaire

Online questionnaire and statistics dashboard for the study
**"The Level of Challenges in Developing Computer Systems Servicing (CSS) Skills Among Grade 11 – Kyanite ALS Learners"**
(Alternative Learning School, Vigan City, SY 2026–2027).

| File | Purpose |
|---|---|
| `index.html` | The questionnaire (respondents fill this in; still prints cleanly on A4) |
| `stats.html` | Statistics dashboard (researchers only, protected by an admin key) |
| `config.js` | Where you paste your Google Apps Script URL |
| `apps-script/Code.gs` | Backend that stores responses in a Google Sheet |
| `questions.js` | Item list used by the dashboard |

GitHub Pages only hosts static files, so responses are stored in a free **Google Sheet** through a small Apps Script.

## Setup (about 10 minutes)

### 1. Publish the site on GitHub Pages
1. Create a new GitHub repository and upload all these files (or `git push` them).
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root → Save.**
3. After a minute the site is at `https://<your-username>.github.io/<repo-name>/`.

### 2. Create the Google Sheet backend
1. Create a new Google Sheet (name it e.g. *CSS Responses*).
2. **Extensions → Apps Script**. Delete the sample code and paste in `apps-script/Code.gs`. Save.
3. **Project Settings (gear icon) → Script properties → Add script property**:
   name `ADMIN_KEY`, value = a secret passphrase of your choice. This is the password for the stats page.
   *(Do not write the key in the code or commit it to GitHub.)*
4. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when asked, then copy the **Web app URL** (ends in `/exec`).

### 3. Connect the questionnaire
Open `config.js`, paste the URL between the quotes, commit and push:

```js
window.APP_CONFIG = { ENDPOINT: "https://script.google.com/macros/s/XXXX/exec" };
```

Submit one test response from `index.html`; a row should appear in the `Responses` tab of the sheet
(you can delete test rows afterwards).

### 4. See the statistics
Open `stats.html`, type your admin key and press **Load live responses**. You get:

- number of respondents and demographic breakdown
- mean, standard deviation and verbal interpretation for every item and category
- Part II (availability) and Part III (challenges) charts, plus the top challenges and least available resources
- filter by age, sex, employment or prior experience
- all open-ended comments
- CSV download and Print / Save as PDF

Interpretation scale (4-point): 3.25–4.00 · 2.50–3.24 · 1.75–2.49 · 1.00–1.74.

You can also export the sheet (**File → Download → CSV**) and open it in the dashboard with **Open CSV file**,
or press **Sample data** to preview the dashboard with fake data.

## Notes
- If you edit `Code.gs` later: **Deploy → Manage deployments → Edit → New version**, otherwise the old code stays live.
- Responses are anonymous (no names are collected online). Anyone with the site link can submit, but only someone with the admin key can read results.
- Each browser also keeps a local backup copy of what was submitted on it ("This browser's responses" in the dashboard).
- The printed signature block still appears when you print `index.html`.
