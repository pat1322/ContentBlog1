# Luan's Journal — Blog

> A personal, editorial blog with admin panel. Built with Node.js + Express.
> Data and uploads persist via a Railway Volume across all redeploys.

---

## Overview

**Luan's Journal** is a lightweight, full-stack personal blog with:

- A burgundy-on-paper editorial design (see `luan1.jpg` reference) mixed with a photo-led layout
- Photos printed as a wine "risograph" duotone that blooms into full colour on hover
- Hero photo slider showing the three latest (featured first) posts
- Journal-cover splash screen, blog / my story entry tiles, latest posts list, photo strip
- Archive with search and tag filters, and a "my story" page
- Admin panel for managing all content and images — no database required
- Image uploads stored on a persistent volume

---

## Project Structure

```
luans-journal/
├── server.js              # Express server + REST API
├── package.json
├── public/
│   ├── index.html         # Blog frontend (home, archive, story, post)
│   ├── admin.html         # Admin panel
│   └── img/               # Placeholder photography (AI-generated via Pollinations)
└── data/                  # Created at runtime (do not commit)
    └── blog.json          # All blog content
```

> **Uploads** are saved to an `uploads/` folder (also created at runtime). Both `data/` and `uploads/` are excluded from Git and should be pointed to your Railway Volume via environment variables.

---

## Design

### Colour palette

| Variable      | Hex       | Use                              |
|---------------|-----------|----------------------------------|
| `--paper`     | `#F3EEEA` | Page background                  |
| `--paper-2`   | `#EBE3DE` | Image wells, hover fills         |
| `--wine`      | `#7A1838` | Text, rules, buttons, photo ink  |
| `--wine-deep` | `#5A0F28` | Article body text, button hover  |
| `--rose`      | `#D9BCC4` | Soft accents                     |

### Typography

| Role               | Font        |
|--------------------|-------------|
| Display & reading  | Albert Sans |
| Labels, meta, nav  | DM Mono     |

### Placeholder photos

Any post without a cover image gets a photo from `public/img/strip-*.jpg`. Upload a cover in the admin panel and it replaces the placeholder (shown in full colour on the post page).

---

## Features

### Blog Frontend (`public/index.html`)
- **Routes** — `#/` home, `#/archive`, `#/story`, `#/post/<id>` (shareable links)
- **Home** — hero headline (`site.heroTitle`), photo slider, two entry tiles, latest posts, about band, photo strip
- **Single post** — date column, large title, cover photo, lede paragraph, `> ` lines become pull quotes, tags, quote band, contributors, author, keep reading
- **Reading progress bar**, reduced-motion support, responsive down to phone width

### Admin Panel (`public/admin.html`)
Protected by password (default: `admin123`). Session persists via `sessionStorage`.

**Posts tab**
- Create, edit, delete posts
- Fields: title, subtitle, content (paragraph-separated), date, tags, cover image, published toggle, featured toggle
- Drag-and-drop or click-to-upload cover image

**Site Settings tab**
- Edit blog title, tagline, author name, author bio
- Change admin password (with confirm field; signs you out after saving)

**Homepage tab**
- Every text on the home page: menu labels, headline, button labels, tile titles/descriptions, about quote, archive heading, strip captions, footer line
- Every image: hero slides, picture tiles, about photo, photo strip, placeholder photos for posts without a cover
- Each image can be uploaded/replaced, removed (the section hides cleanly), or reset to the original; photo lists can be reordered
- Social links (an empty link hides its icon)

**My Story tab**
- Page heading, photo, intro, story text, sign-off, button label

**Splash Screen tab**
- Turn the journal cover on/off, show/hide the date, button text, hint text

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
cd luans-journal

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
git commit -m "Initial commit — Luan's Journal blog"

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
  "title":         "Luan's Journal",
  "tagline":       "thoughts, dreams, and everything in between.",
  "author":        "The Editor",
  "bio":           "Writing about life and the art of simply being.",
  "adminPassword": "newpassword123",
  "quote": {
    "text":        "Not everything needs to be optimized.",
    "attribution": "— Luan's Journal",
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
