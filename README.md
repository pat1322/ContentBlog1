# Daily Dose — Blog

> A warm, editorial blog with admin panel. Built with Node.js + Express.
> Data and uploads persist via a Railway Volume across all redeploys.

---

## Overview

**Daily Dose** is a lightweight, full-stack blog platform with:

- A beautiful splash screen with an interactive puzzle icon
- Editorial-style article layout (Sunset Terra color palette)
- Quote block section below every article
- Contributors section with avatar support
- Admin panel for managing all content — no database required
- Image uploads stored on a persistent volume
- Password-protected admin with session storage

---

## Project Structure

```
daily-dose-blog/
├── server.js              # Express server + REST API
├── package.json           # Dependencies
├── .gitignore
├── README.md
├── public/
│   ├── index.html         # Blog frontend (splash, articles, quote, contributors)
│   └── admin.html         # Admin panel (posts, settings, contributors, quote)
└── data/                  # Created automatically at runtime (do not commit)
    └── blog.json          # All blog content stored here
```

> **Uploads** are saved to an `uploads/` folder (also created at runtime). Both `data/` and `uploads/` are excluded from Git and should be pointed to your Railway Volume via environment variables.

---

## Design

### Color Palette — Sunset Terra

| Variable       | Hex       | Use                          |
|----------------|-----------|------------------------------|
| `--cream`      | `#F9EEE2` | Main background              |
| `--cream-2`    | `#FBE0D2` | Cards, secondary backgrounds |
| `--blush`      | `#FFCBBC` | Highlight, pull quote border |
| `--terra`      | `#DDB398` | Primary accent, links, tags  |
| `--peach`      | `#F8C5AD` | Warm accent, meta dots       |
| `--brown`      | `#3D2317` | Primary text, nav, footer    |
| `--brown-mid`  | `#6B4030` | Medium text                  |
| `--brown-soft` | `#A07868` | Muted/placeholder text       |

### Typography

| Role     | Font                  |
|----------|-----------------------|
| Display  | Cormorant Garamond    |
| Body     | Lora                  |
| UI / Nav | Jost                  |

---

## Features

### Blog Frontend (`public/index.html`)
- **Splash screen** — two dark panels slide in from top/bottom; animated puzzle icon (4 interlocking pieces per Sunset Terra palette); click puzzle to scatter/reassemble pieces; auto-populated from API
- **Reading progress bar** — thin amber gradient line at top of viewport
- **Home/list view** — shows all published posts with date, title, subtitle, and thumbnail
- **Single post view** — hero with large editorial title, reading time, drop cap on first letter, pull quote on penultimate paragraph, puzzle icon divider mid-article
- **Quote block** — two-column card (quote text + attribution on left, image on right); fully editable from admin
- **Contributors section** — avatar circles in Sunset Terra colors, name + role; hidden if empty
- **Author card** — pulls from site settings
- **More posts grid** — shown on dark background when other published posts exist
- **Footer** — `Daily Dose © All Rights Reserved 2026`
- **Scroll reveal animations** — staggered fade-up on all sections
- **Responsive** — mobile-friendly layout

### Admin Panel (`public/admin.html`)
Protected by password (default: `admin123`). Session persists via `sessionStorage`.

**Posts tab**
- Create, edit, delete posts
- Fields: title, subtitle, content (paragraph-separated), date, tags, cover image, published toggle, featured toggle
- Drag-and-drop or click-to-upload cover image

**Site Settings tab**
- Edit blog title, tagline, author name, author bio
- Change admin password (with confirm field; signs you out after saving)

**Contributors tab**
- Add/remove contributors with name, role, and optional avatar image
- Click avatar circle to upload a photo
- Changes saved separately with "Save Contributors"

**Quote Block tab**
- Edit quote text, attribution line
- Upload a side image for the quote card

---

## Local Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup

```bash
# Clone or unzip the project
cd daily-dose-blog

# Install dependencies
npm install

# Start the server
npm start
# → http://localhost:3000
```

Default admin password: **`admin123`**

> Change it immediately: Admin → Site Settings → New Password → Save Settings

---

## Deploy to GitHub + Railway

### Step 1 — Push to GitHub

```bash
# Inside your project folder:
git init
git add .
git commit -m "Initial commit — Daily Dose blog"

# Create a new repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Authorize Railway and select your repository
4. Railway detects Node.js and starts the first deploy automatically

---

### Step 3 — Add a Volume (persistent storage)

This is required so your blog content and uploaded images survive redeploys.

1. In your Railway project, click on the **service** (your deployed app)
2. Go to the **Volumes** tab → click **Add Volume**
3. Set **Mount Path** to: `/app/persistent`
4. Click **Add** — Railway will redeploy with the volume attached

---

### Step 4 — Set Environment Variables

In your Railway service → **Variables** tab, add:

| Variable       | Value                       | Purpose                        |
|----------------|-----------------------------|--------------------------------|
| `DATA_DIR`     | `/app/persistent/data`      | Where `blog.json` is stored    |
| `UPLOADS_DIR`  | `/app/persistent/uploads`   | Where image uploads are stored |

Railway automatically sets `PORT` — the app reads it with `process.env.PORT`.

---

### Step 5 — Add a Custom Domain (optional)

In your Railway service → **Settings → Networking**:
- Click **Generate Domain** for a free `*.up.railway.app` URL, or
- Click **Custom Domain** to use your own domain

---

### Step 6 — Secure Your Admin

1. Visit `https://your-domain/admin.html`
2. Log in with the default password: `admin123`
3. Go to **Site Settings → Change Admin Password**
4. Enter and confirm a strong new password → **Save Settings**
5. You'll be signed out — log back in with the new password

---

## API Reference

All admin routes require the header: `x-admin-token: YOUR_PASSWORD`

| Method   | Path                      | Auth | Description                     |
|----------|---------------------------|------|---------------------------------|
| `GET`    | `/api/blog`               | No   | Full blog data (no password)    |
| `GET`    | `/api/posts`              | No   | Published posts only            |
| `POST`   | `/api/auth`               | No   | Validate password → `{ok:true}` |
| `PUT`    | `/api/admin/site`         | Yes  | Update site settings            |
| `GET`    | `/api/admin/posts`        | Yes  | All posts including drafts      |
| `POST`   | `/api/admin/posts`        | Yes  | Create a new post               |
| `PUT`    | `/api/admin/posts/:id`    | Yes  | Update a post by ID             |
| `DELETE` | `/api/admin/posts/:id`    | Yes  | Delete a post by ID             |
| `POST`   | `/api/admin/upload`       | Yes  | Upload an image → `{url}`       |

### Site settings object (PUT `/api/admin/site`)

```json
{
  "title":         "Daily Dose",
  "tagline":       "A daily dose of thoughts that matter",
  "author":        "The Editor",
  "bio":           "Writing about life and the art of simply being.",
  "adminPassword": "newpassword123",
  "quote": {
    "text":        "Not everything needs to be optimized.",
    "attribution": "— Daily Dose",
    "image":       "/uploads/quote-image.jpg"
  },
  "contributors": [
    { "name": "Jane Doe",   "role": "Writer",    "avatar": "/uploads/jane.jpg" },
    { "name": "John Smith", "role": "Editor",    "avatar": null }
  ]
}
```

### Post object

```json
{
  "id":        "1737000000000",
  "title":     "Post Title",
  "subtitle":  "A short teaser line",
  "content":   "First paragraph.\n\nSecond paragraph.",
  "image":     "/uploads/cover.jpg",
  "date":      "2025-01-15",
  "tags":      ["lifestyle", "mindfulness"],
  "published": true,
  "featured":  false
}
```

> **Content formatting:** Separate paragraphs with a blank line (`\n\n`). The second-to-last paragraph (if short) is automatically styled as a pull quote.

---

## Troubleshooting

**Images not persisting after redeploy**
→ Make sure `UPLOADS_DIR` points to the volume mount path, not the app directory.

**Blog data resets after redeploy**
→ Make sure `DATA_DIR` points to the volume mount path and the volume is properly attached.

**Can't log into admin**
→ If you forgot your password: in Railway, go to your service → open a shell and run:
```bash
node -e "
const fs=require('fs');
const f=process.env.DATA_DIR+'/blog.json';
const d=JSON.parse(fs.readFileSync(f));
d.site.adminPassword='admin123';
fs.writeFileSync(f,JSON.stringify(d,null,2));
console.log('Password reset to admin123');
"
```

**Port issues locally**
→ The server reads `process.env.PORT` and defaults to `3000`. Set a different port with `PORT=4000 npm start`.

---

## License

MIT — free to use, modify, and deploy.
