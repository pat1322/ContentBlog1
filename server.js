const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR    = process.env.DATA_DIR    || path.join(__dirname, 'data');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
const BLOG_FILE   = path.join(DATA_DIR, 'blog.json');

[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const DEFAULT_BLOG = {
  site: {
    title:         "Luan's Journal",
    tagline:       "thoughts, dreams, and everything in between.",
    heroTitle:     "just another chapter.",
    author:        "Luan",
    bio:           "Writing about growth, slow days, good food, and the little joys in between.",
    adminPassword: "admin123",
    quote: {
      text:        "Not everything needs to be optimized. Not every moment has to lead somewhere. Sometimes the most radical act is to simply pause.",
      attribution: "— Luan's Journal",
      image:       "/img/strip-7.jpg"
    },
    contributors:  [],

    // ── Everything below is editable in the admin panel. An empty string ("") or empty
    //    list means "removed / hidden"; a missing value falls back to these defaults.
    heroButton:    "Read more",
    nav: { home: "Home", about: "About", archive: "Archive", categories: "Categories", contact: "Contact" },
    slides: [
      { image: "/img/hero-1.jpg", title: "a quiet morning" },
      { image: "/img/hero-2.jpg", title: "the long way home" },
      { image: "/img/hero-3.jpg", title: "rainy day thoughts" }
    ],
    slideNote:     "new chapter soon",
    tiles: [
      { image: "/img/tile-blog.jpg",  title: "the blog", text: "personal thoughts, life updates, and more.", button: "Explore",    link: "#/archive" },
      { image: "/img/tile-story.jpg", title: "my story", text: "a little about me, my journey, and goals.",  button: "Learn more", link: "#/story" }
    ],
    latestHeading: "Latest posts",
    about: {
      image:  "/img/strip-5.jpg",
      line:   "i write to slow down, to remember, and to notice the small things.",
      button: "Read my story"
    },
    archive: { heading: "the archive." },
    story: {
      heading: "my story.",
      image:   "/img/tile-story.jpg",
      lead:    "",
      body:    "this journal is where i keep the small moments: the slow mornings, the half-finished thoughts, and the things that made a day feel like mine.",
      signoff: "— Luan",
      button:  "Read the journal"
    },
    strip: {
      caption: "little moments, lately",
      hint:    "hover to see them in colour",
      images:  ["/img/strip-1.jpg", "/img/strip-2.jpg", "/img/strip-3.jpg", "/img/strip-4.jpg",
                "/img/strip-5.jpg", "/img/strip-6.jpg", "/img/strip-7.jpg", "/img/strip-8.jpg"]
    },
    postPlaceholders: ["/img/strip-1.jpg", "/img/strip-2.jpg", "/img/strip-3.jpg", "/img/strip-4.jpg",
                       "/img/strip-5.jpg", "/img/strip-6.jpg", "/img/strip-7.jpg", "/img/strip-8.jpg"],
    footer: { line: "create, reflect, and bloom." },
    social: { instagram: "", pinterest: "", youtube: "", x: "" },
    splash: { enabled: true, showDate: true, button: "Open the journal", hint: "tap anywhere to open" }
  },
  posts: [
    {
      id:        "3",
      title:     "A little reflection",
      subtitle:  "On growth, overthinking, and finding peace in the chaos.",
      content:   "Some weeks feel like a whole chapter. This was one of them.\n\nI have been learning that growth is rarely loud. It looks like going to bed a little earlier, saying no without a long explanation, and letting a messy day just be a messy day.\n\n> Peace is not the absence of chaos. It is how gently you hold yourself inside it.\n\nSo this is me, writing it down, so I remember.",
      image:     null,
      date:      "2025-11-01",
      tags:      ["reflection", "growth"],
      published: true,
      featured:  true
    },
    {
      id:        "2",
      title:     "Days in my life",
      subtitle:  "Coffee-less days, good food, and busy schedules ♡",
      content:   "A small diary of an ordinary week: early alarms, a new café around the corner, and the dinner I keep thinking about.\n\nNothing extraordinary happened, and that is exactly why I wanted to keep it.",
      image:     null,
      date:      "2025-10-28",
      tags:      ["life", "diary"],
      published: true,
      featured:  false
    },
    {
      id:        "1",
      title:     "The Most Underrated Hobby That Everyone Should Try",
      subtitle:  "If hobbies are supposed to make me feel better, why do I feel like I'm wasting time the moment I enjoy them without purpose?",
      content:   "I notice it even in small things. When I draw without trying to be good at it. When I walk without tracking steps. When I listen to music without multitasking. There's always this quiet pressure in my head asking, \"Is this even worth it?\"\n\nWhile physical sports offer a sense of satisfaction and movement, placing the last piece of a puzzle on the other hand may not offer the thrill of trying to catch a ball nor paddling, but it brings its own blend of joy, satisfaction, and frustration all at once. I think one of the most underrated hobbies that one should actually go back to is doing things with no goal attached.\n\nIn a world that constantly pushes productivity, we forget that not everything needs to be optimized. Not every moment has to lead somewhere. Sometimes, the value of a hobby isn't in improvement, recognition, or output—but in how it lets you pause and simply exist.\n\nThere is something quietly powerful about doing things just because you want to. No pressure. No expectations. Just presence.\n\nSo, here's the real puzzle for me: maybe the most underrated hobby isn't something new at all—It's the one you truly love, the one that comforts you and brings out a version of yourself you never knew existed.\n\nAnd maybe, just maybe, that's already enough.",
      image:     null,
      date:      "2025-10-24",
      tags:      ["lifestyle", "mindfulness", "hobbies"],
      published: true,
      featured:  false
    }
  ]
};

if (!fs.existsSync(BLOG_FILE)) {
  fs.writeFileSync(BLOG_FILE, JSON.stringify(DEFAULT_BLOG, null, 2));
}

// One-time rename: existing installs still carry the old "Daily Dose" branding in blog.json.
(function migrateBranding() {
  try {
    const blog = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    let changed = false;
    if (blog.site.title === 'Daily Dose') { blog.site.title = DEFAULT_BLOG.site.title; changed = true; }
    if (blog.site.tagline === 'A daily dose of thoughts that matter') { blog.site.tagline = DEFAULT_BLOG.site.tagline; changed = true; }
    if (blog.site.quote && blog.site.quote.attribution === '— Daily Dose') { blog.site.quote.attribution = DEFAULT_BLOG.site.quote.attribution; changed = true; }
    if (changed) fs.writeFileSync(BLOG_FILE, JSON.stringify(blog, null, 2));
  } catch (e) { console.error('Branding migration skipped:', e.message); }
})();

// Fill in any setting that is missing (undefined/null) from the defaults, recursing into
// plain objects. Values that were deliberately cleared ("" or []) are kept as-is.
function withDefaults(value, defaults) {
  if (value === undefined || value === null) return structuredClone(defaults);
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  if (isObj(value) && isObj(defaults)) {
    const out = { ...value };
    for (const k of Object.keys(defaults)) out[k] = withDefaults(value[k], defaults[k]);
    return out;
  }
  return value;
}

function readBlog() {
  let blog;
  try { blog = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8')); }
  catch { blog = structuredClone(DEFAULT_BLOG); }
  blog.site  = withDefaults(blog.site, DEFAULT_BLOG.site);
  blog.posts = blog.posts || [];
  return blog;
}
function writeBlog(data) {
  fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    /image\/(jpeg|png|gif|webp)/.test(file.mimetype) ? cb(null, true) : cb(new Error('Images only'));
  }
});

app.use(express.json({ limit: '1mb' }));

// The home page gets the site title and splash setting baked in, so the browser tab shows
// the right title and a disabled splash never flashes before the data loads.
const INDEX_FILE = path.join(__dirname, 'public', 'index.html');
app.get(['/', '/index.html'], (_req, res) => {
  const site = readBlog().site;
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let html = fs.readFileSync(INDEX_FILE, 'utf8');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(site.title || "Luan's Journal")}</title>`);
  if (site.splash && site.splash.enabled === false) html = html.replace('<html lang="en">', '<html lang="en" data-splash="off">');
  res.type('html').send(html);
});

app.use(express.static(path.join(__dirname, 'public')));

// Friendly admin URL: /admin (and /admin/) serve the admin panel
app.get(['/admin', '/admin/'], (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.use('/uploads', express.static(UPLOADS_DIR));

function requireAuth(req, res, next) {
  if (req.headers['x-admin-token'] === readBlog().site.adminPassword) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Built-in defaults, so the admin panel can offer "Reset to default" for each image/text.
app.get('/api/admin/defaults', requireAuth, (_req, res) => {
  const { adminPassword, ...site } = DEFAULT_BLOG.site;
  res.json(site);
});

app.get('/api/blog', (_req, res) => {
  const blog = readBlog();
  const { adminPassword, ...site } = blog.site;
  res.json({ site, posts: blog.posts });
});
app.get('/api/posts', (_req, res) => res.json(readBlog().posts.filter(p => p.published)));

app.post('/api/auth', (req, res) => {
  req.body.password === readBlog().site.adminPassword
    ? res.json({ ok: true })
    : res.status(401).json({ error: 'Wrong password' });
});

app.put('/api/admin/site', requireAuth, (req, res) => {
  const blog = readBlog();
  blog.site  = { ...blog.site, ...req.body };
  writeBlog(blog);
  res.json({ ok: true });
});

app.get('/api/admin/posts', requireAuth, (_req, res) => res.json(readBlog().posts));

app.post('/api/admin/posts', requireAuth, (req, res) => {
  const blog = readBlog();
  const post = { id: Date.now().toString(), published: false, featured: false, date: new Date().toISOString().split('T')[0], ...req.body };
  blog.posts.unshift(post);
  writeBlog(blog);
  res.json(post);
});

app.put('/api/admin/posts/:id', requireAuth, (req, res) => {
  const blog = readBlog();
  const idx  = blog.posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  blog.posts[idx] = { ...blog.posts[idx], ...req.body };
  writeBlog(blog);
  res.json(blog.posts[idx]);
});

app.delete('/api/admin/posts/:id', requireAuth, (req, res) => {
  const blog = readBlog();
  blog.posts = blog.posts.filter(p => p.id !== req.params.id);
  writeBlog(blog);
  res.json({ ok: true });
});

app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => console.log(`✦ Luan's Journal → http://localhost:${PORT}`));
