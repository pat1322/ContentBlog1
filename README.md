# Pause & Exist — Blog

A warm, editorial blog with admin panel. Built with Node.js + Express. Data persists via Railway Volume.

---

## Local Development

```bash
npm install
npm start
# → http://localhost:3000
```

Default admin password: `admin123` (change immediately in Admin → Site Settings)

---

## Deploy to GitHub + Railway

### Step 1 — Push to GitHub

```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Authorize Railway to access your GitHub, then select your repo
4. Railway will detect Node.js and start the first deploy automatically

---

### Step 3 — Add a Volume (for persistent data & uploads)

1. In your Railway project, click on your **service** (the deployed app)
2. Go to the **Volumes** tab → click **Add Volume**
3. Set **Mount Path** to: `/app/persistent`
4. Click **Add** — Railway will remount with the volume attached

---

### Step 4 — Set Environment Variables

In your Railway service, go to **Variables** tab and add:

| Variable      | Value                      |
|---------------|----------------------------|
| `DATA_DIR`    | `/app/persistent/data`     |
| `UPLOADS_DIR` | `/app/persistent/uploads`  |

> These point `blog.json` and uploaded images to the mounted volume so they survive redeploys.

---

### Step 5 — Set a Custom Domain (optional)

In your Railway service → **Settings → Networking → Generate Domain**
Or add your own domain under **Custom Domain**.

---

### Step 6 — Change Admin Password

1. Visit `https://your-domain.railway.app/admin.html`
2. Log in with default password: `admin123`
3. Go to **Site Settings → Admin Password** → set a strong password
4. Save — done!

---

## File Structure

```
blog/
├── server.js          # Express server + API
├── package.json
├── public/
│   ├── index.html     # Blog frontend (splash + articles)
│   └── admin.html     # Admin panel
├── data/              # Created at runtime on volume
│   └── blog.json      # All blog content
└── uploads/           # Created at runtime on volume
    └── *.jpg/png/...  # Uploaded images
```

## API Reference

| Method | Path                    | Auth | Description            |
|--------|-------------------------|------|------------------------|
| GET    | /api/blog               | No   | Full blog data         |
| GET    | /api/posts              | No   | Published posts only   |
| POST   | /api/auth               | No   | Login check            |
| PUT    | /api/admin/site         | Yes  | Update site settings   |
| GET    | /api/admin/posts        | Yes  | All posts (incl. draft)|
| POST   | /api/admin/posts        | Yes  | Create post            |
| PUT    | /api/admin/posts/:id    | Yes  | Update post            |
| DELETE | /api/admin/posts/:id    | Yes  | Delete post            |
| POST   | /api/admin/upload       | Yes  | Upload image           |

Auth header: `x-admin-token: YOUR_PASSWORD`
