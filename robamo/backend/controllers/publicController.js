const db = require('../config/database');

// ── SHOWCASE ──
const getShowcase = (req, res) => {
  const projects = db.prepare('SELECT * FROM showcase_projects ORDER BY is_featured DESC, id ASC').all();
  res.json({ success: true, projects });
};

// ── TESTIMONIALS ──
const getTestimonials = (req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY id ASC').all();
  res.json({ success: true, testimonials });
};

// ── BLOG ──
const getBlogPosts = (req, res) => {
  const posts = db.prepare('SELECT id, title, category, excerpt, read_time, emoji, bg_class, created_at FROM blog_posts WHERE published = 1 ORDER BY id DESC').all();
  res.json({ success: true, posts });
};

const getBlogById = (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ? AND published = 1').get(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
  res.json({ success: true, post });
};

// ── DOWNLOADS ──
const getDownloads = (req, res) => {
  const downloads = db.prepare('SELECT id, title, description, emoji, download_count FROM downloads WHERE is_active = 1').all();
  res.json({ success: true, downloads });
};

const trackDownload = (req, res) => {
  db.prepare('UPDATE downloads SET download_count = download_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Download tracked.' });
};

// ── ADMIN DASHBOARD STATS ──
const getAdminStats = (req, res) => {
  const stats = {
    registrations: db.prepare('SELECT COUNT(*) as cnt FROM registrations').get().cnt,
    demo_bookings: db.prepare('SELECT COUNT(*) as cnt FROM demo_bookings').get().cnt,
    school_partnerships: db.prepare('SELECT COUNT(*) as cnt FROM school_partnerships').get().cnt,
    contact_messages: db.prepare('SELECT COUNT(*) as cnt FROM contact_messages').get().cnt,
    unread_messages: db.prepare("SELECT COUNT(*) as cnt FROM contact_messages WHERE status = 'unread'").get().cnt,
    pending_registrations: db.prepare("SELECT COUNT(*) as cnt FROM registrations WHERE status = 'pending'").get().cnt,
    new_partnerships: db.prepare("SELECT COUNT(*) as cnt FROM school_partnerships WHERE status = 'new'").get().cnt,
    courses: db.prepare('SELECT COUNT(*) as cnt FROM courses WHERE is_active = 1').get().cnt,
    recent_registrations: db.prepare('SELECT student_name, course_name, city, created_at FROM registrations ORDER BY created_at DESC LIMIT 5').all(),
    recent_demos: db.prepare('SELECT name, phone, city, created_at FROM demo_bookings ORDER BY created_at DESC LIMIT 5').all(),
  };
  res.json({ success: true, stats });
};

// ── ADMIN: MANAGE SHOWCASE ──
const addShowcaseProject = (req, res) => {
  const { title, student_name, grade, city, category, description, emoji, bg_class } = req.body;
  if (!title || !student_name) return res.status(400).json({ success: false, message: 'Title and student name required.' });
  const result = db.prepare('INSERT INTO showcase_projects (title, student_name, grade, city, category, description, emoji, bg_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(title, student_name, grade, city, category, description, emoji || '🤖', bg_class || 'bg1');
  res.status(201).json({ success: true, message: 'Project added!', id: result.lastInsertRowid });
};

// ── ADMIN: MANAGE BLOG ──
const createBlogPost = (req, res) => {
  const { title, category, excerpt, content, read_time, emoji, bg_class } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Title required.' });
  const result = db.prepare('INSERT INTO blog_posts (title, category, excerpt, content, read_time, emoji, bg_class) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, category, excerpt, content, read_time || 5, emoji || '📝', bg_class || 'b1');
  res.status(201).json({ success: true, message: 'Blog post created!', id: result.lastInsertRowid });
};

// ── ADMIN: MANAGE TESTIMONIALS ──
const addTestimonial = (req, res) => {
  const { name, role, content, rating, avatar_letter } = req.body;
  if (!name || !content) return res.status(400).json({ success: false, message: 'Name and content required.' });
  const result = db.prepare('INSERT INTO testimonials (name, role, content, rating, avatar_letter) VALUES (?, ?, ?, ?, ?)').run(name, role, content, rating || 5, avatar_letter || name[0].toUpperCase());
  res.status(201).json({ success: true, message: 'Testimonial added!', id: result.lastInsertRowid });
};

module.exports = { getShowcase, getTestimonials, getBlogPosts, getBlogById, getDownloads, trackDownload, getAdminStats, addShowcaseProject, createBlogPost, addTestimonial };
