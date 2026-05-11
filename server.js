const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Persistent paths (set via Railway env vars pointing at mounted volume) ──
const DATA_DIR    = process.env.DATA_DIR    || path.join(__dirname, 'data');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
const BLOG_FILE   = path.join(DATA_DIR, 'blog.json');

// Ensure directories exist on every start
[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Default blog content ──────────────────────────────────────────────────
const DEFAULT_BLOG = {
  site: {
    title:    "Pause & Exist",
    tagline:  "A space for thoughts that don't need to go anywhere",
    author:   "Anonymous",
    bio:      "Writing about life, hobbies, and the art of simply being.",
    adminPassword: "admin123"
  },
  posts: [
    {
      id:        "1",
      title:     "The Most Underrated Hobby That Everyone Should Try",
      subtitle:  "If hobbies are supposed to make me feel better, why do I feel like I'm wasting time the moment I enjoy them without purpose?",
      content:   "I notice it even in small things. When I draw without trying to be good at it. When I walk without tracking steps. When I listen to music without multitasking. There's always this quiet pressure in my head asking, \"Is this even worth it?\"\n\nWhile physical sports offer a sense of satisfaction and movement, placing the last piece of a puzzle on the other hand may not offer the thrill of trying to catch a ball nor paddling, but it brings its own blend of joy, satisfaction, and frustration all at once. I think one of the most underrated hobbies that one should actually go back to is doing things with no goal attached.\n\nIn a world that constantly pushes productivity, we forget that not everything needs to be optimized. Not every moment has to lead somewhere. Sometimes, the value of a hobby isn't in improvement, recognition, or output—but in how it lets you pause and simply exist.\n\nThere is something quietly powerful about doing things just because you want to. No pressure. No expectations. Just presence.\n\nSo, here's the real puzzle for me: maybe the most underrated hobby isn't something new at all—It's the one you truly love, the one that comforts you and brings out a version of yourself you never knew existed.\n\nAnd maybe, just maybe, that's already enough.",
      image:     null,
      date:      "2025-01-15",
      tags:      ["lifestyle", "mindfulness", "hobbies"],
      published: true,
      featured:  true
    }
  ]
};

// Init blog.json if missing
if (!fs.existsSync(BLOG_FILE)) {
  fs.writeFileSync(BLOG_FILE, JSON.stringify(DEFAULT_BLOG, null, 2));
}

function readBlog() {
  try { return JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8')); }
  catch { return DEFAULT_BLOG; }
}

function writeBlog(data) {
  fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
}

// ── Multer (image uploads → volume) ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req,  file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/image\/(jpeg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// ── Auth middleware (simple password) ────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  const blog  = readBlog();
  if (token === blog.site.adminPassword) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Public API ────────────────────────────────────────────────────────────
app.get('/api/blog', (_req, res) => {
  const blog = readBlog();
  // Don't expose admin password publicly
  const safe = { ...blog, site: { ...blog.site, adminPassword: undefined } };
  res.json(safe);
});

app.get('/api/posts', (_req, res) => {
  res.json(readBlog().posts.filter(p => p.published));
});

// ── Admin API (protected) ─────────────────────────────────────────────────
app.post('/api/auth', (req, res) => {
  const blog = readBlog();
  if (req.body.password === blog.site.adminPassword) res.json({ ok: true });
  else res.status(401).json({ error: 'Wrong password' });
});

app.put('/api/admin/site', requireAuth, (req, res) => {
  const blog  = readBlog();
  blog.site   = { ...blog.site, ...req.body };
  writeBlog(blog);
  res.json({ ok: true });
});

app.get('/api/admin/posts', requireAuth, (_req, res) => {
  res.json(readBlog().posts);
});

app.post('/api/admin/posts', requireAuth, (req, res) => {
  const blog = readBlog();
  const post = {
    id:        Date.now().toString(),
    title:     req.body.title     || 'Untitled',
    subtitle:  req.body.subtitle  || '',
    content:   req.body.content   || '',
    image:     req.body.image     || null,
    date:      req.body.date      || new Date().toISOString().split('T')[0],
    tags:      req.body.tags      || [],
    published: req.body.published !== undefined ? req.body.published : false,
    featured:  req.body.featured  || false
  };
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
  const blog  = readBlog();
  blog.posts  = blog.posts.filter(p => p.id !== req.params.id);
  writeBlog(blog);
  res.json({ ok: true });
});

app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`✦ Blog running → http://localhost:${PORT}`)
);
