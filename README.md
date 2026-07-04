# 🐸 ModularToadAudio

**Creative Audio for Independent Artists & Developers**

A Windows 98 / pixel-art-inspired static website for the ModularToadAudio audio engineering business. Hosted for free on Neocities (1 GB free storage) — no server or build step required.

---

## 📄 Pages

| File | Page |
|---|---|
| `index.html` | Home — hero, services overview, portfolio preview, testimonials |
| `services.html` | Services — mixing, mastering, podcast editing, loudness, stems |
| `portfolio.html` | Portfolio — embedded YouTube videos |
| `pricing.html` | Pricing — $120 standard / $60 new-customer discount |
| `about.html` | About — company story, mission, values |
| `contact.html` | Contact — form with file attachment |

---

## 🚀 Neocities Setup

### Option A — Manual upload (simplest)

1. Go to [neocities.org](https://neocities.org) and create a free account.
2. From your Neocities dashboard click **Edit Site**.
3. Drag-and-drop (or use **Upload** button) all files from this repository:
   - `index.html`, `services.html`, `portfolio.html`, `pricing.html`, `about.html`, `contact.html`
   - `css/style.css`
   - `js/main.js`
4. Your site will be live at:
   ```
   https://YOUR-USERNAME.neocities.org
   ```

> **Storage:** The free Neocities tier includes **1 GB** of space — more than enough for this site.

### Option B — Auto-deploy from GitHub (recommended)

Every push to `main` auto-deploys to Neocities via the included GitHub Actions workflow.

1. Create a free [Neocities](https://neocities.org) account.
2. Get your API key: **Settings → API Key** → copy the token.
3. In this GitHub repository go to **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `NEOCITIES_API_TOKEN`
   - Value: your Neocities API key
4. Push any change to `main` — the workflow at `.github/workflows/deploy-neocities.yml` will upload all site files automatically.

---

## 📧 Contact Form Setup (Formspree — free)

The contact form needs a free Formspree account to deliver emails.

1. Go to [formspree.io](https://formspree.io) and sign up for free.
2. Click **New Form**, set the notification email to `ModularToadAudio@protonmail.com`.
3. Copy your form ID (e.g. `abcdefgh`).
4. Open `contact.html` and replace `FORMSPREE_FORM_ID_HERE` with your actual ID:
   ```html
   action="https://formspree.io/f/abcdefgh"
   ```
5. Save and push — the form will now deliver emails including file attachments (up to 25 MB).

> **Large files (>25 MB):** The contact form already prompts clients to share a Google Drive / WeTransfer link in their message.

---

## 🎬 Adding Portfolio Videos

1. Open `portfolio.html`.
2. Find a `<div class="portfolio-item window">` block.
3. Get your YouTube video ID from the URL:
   ```
   https://www.youtube.com/watch?v=VIDEO_ID_HERE
                                     ^^^^^^^^^^^^
   ```
4. Uncomment the `<iframe>` block inside that item and replace `VIDEO_ID_HERE`:
   ```html
   <iframe
     src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
     title="Your track title"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
     allowfullscreen
     loading="lazy">
   </iframe>
   ```
5. Delete or comment out the `<div class="portfolio-placeholder">` above it.
6. Update the `data-category` attribute on the parent `<div>` to match the filter:
   `mixing`, `mastering`, or `podcast`.

---

## 🗂️ File Structure

```
ModularToadAudio/
├── index.html          Home page
├── services.html       Services page
├── portfolio.html      Portfolio page
├── pricing.html        Pricing page
├── about.html          About page
├── contact.html        Contact page
├── css/
│   └── style.css       All styles (Win98 design system)
├── js/
│   └── main.js         Interactivity (clock, nav, start menu, sounds)
├── .github/
│   └── workflows/
│       └── deploy-neocities.yml   Auto-deploy to Neocities on push
└── README.md           This file
```

---

## 🎨 Customisation

All design tokens live as CSS custom properties at the top of `css/style.css`.
Change brand colors, fonts or layout by editing the `:root { }` block.

---

*Built with pure HTML, CSS and vanilla JavaScript. No frameworks, no build step.*
