const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const { adminLogin, userRegister, userLogin, getProfile, schoolRegister, schoolLogin } = require('../controllers/authController');
const { getAllCourses, getCourseById, getCourseModules, createCourse, updateCourse, deleteCourse, addModule, addLesson } = require('../controllers/courseController');
const { submitRegistration, getAllRegistrations, updateRegistrationStatus, bookDemo, getAllDemoBookings, submitPartnership, getAllPartnerships, submitContact, getAllMessages } = require('../controllers/formController');
const { getShowcase, getTestimonials, getBlogPosts, getBlogById, getDownloads, trackDownload, getAdminStats, addShowcaseProject, createBlogPost, addTestimonial } = require('../controllers/publicController');

// AUTH
router.post('/auth/admin/login', adminLogin);
router.post('/auth/register', userRegister);
router.post('/auth/login', userLogin);
router.get('/auth/profile', authMiddleware, getProfile);
router.post('/auth/school/register', schoolRegister);
router.post('/auth/school/login', schoolLogin);

// SCHOOL MIDDLEWARE
const schoolMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'school') {
      return res.status(403).json({ success: false, message: 'School access required.' });
    }
    next();
  });
};

// SCHOOL PANEL ROUTES
router.get('/school/students', schoolMiddleware, (req, res) => {
  const db = require('../config/database');
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.user.id);
  const students = db.prepare(`
    SELECT r.id, r.student_name, r.email, r.phone, r.grade, r.course_name, r.status, r.created_at
    FROM registrations r
    WHERE LOWER(r.school_name) = LOWER(?)
    ORDER BY r.created_at DESC
  `).all(school.name);
  res.json({ success: true, students, school: { name: school.name, city: school.city } });
});

router.get('/school/demos', schoolMiddleware, (req, res) => {
  const db = require('../config/database');
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.user.id);
  const demos = db.prepare(`
    SELECT * FROM demo_bookings WHERE LOWER(school_name) = LOWER(?) ORDER BY created_at DESC
  `).all(school.name);
  res.json({ success: true, demos });
});

// ADMIN SCHOOL MANAGEMENT
router.get('/admin/schools', adminMiddleware, (req, res) => {
  const db = require('../config/database');
  const schools = db.prepare('SELECT id, name, email, city, phone, is_approved, created_at FROM schools ORDER BY created_at DESC').all();
  res.json({ success: true, schools });
});

router.put('/admin/schools/:id', adminMiddleware, (req, res) => {
  const db = require('../config/database');
  const { is_approved } = req.body;
  db.prepare('UPDATE schools SET is_approved = ? WHERE id = ?').run(is_approved ? 1 : 0, req.params.id);
  res.json({ success: true, message: is_approved ? 'School approved!' : 'School rejected.' });
});

// COURSES (public)
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);
router.get('/courses/:id/modules', getCourseModules);

// COURSES (admin)
router.post('/courses', adminMiddleware, createCourse);
router.put('/courses/:id', adminMiddleware, updateCourse);
router.delete('/courses/:id', adminMiddleware, deleteCourse);
router.post('/courses/:id/modules', adminMiddleware, addModule);
router.post('/courses/:id/lessons', adminMiddleware, addLesson);

// FORMS (public)
router.post('/register', submitRegistration);
router.post('/demo', bookDemo);
router.post('/partnership', submitPartnership);
router.post('/contact', submitContact);

// PUBLIC DATA
router.get('/showcase', getShowcase);
router.get('/testimonials', getTestimonials);
router.get('/blog', getBlogPosts);
router.get('/blog/:id', getBlogById);
router.get('/downloads', getDownloads);
router.post('/downloads/:id/track', trackDownload);

// ADMIN
router.get('/admin/stats', adminMiddleware, getAdminStats);
router.get('/admin/registrations', adminMiddleware, getAllRegistrations);
router.put('/admin/registrations/:id', adminMiddleware, updateRegistrationStatus);
router.get('/admin/demos', adminMiddleware, getAllDemoBookings);
router.get('/admin/partnerships', adminMiddleware, getAllPartnerships);
router.get('/admin/messages', adminMiddleware, getAllMessages);
router.post('/admin/showcase', adminMiddleware, addShowcaseProject);
router.post('/admin/blog', adminMiddleware, createBlogPost);
router.post('/admin/testimonials', adminMiddleware, addTestimonial);
router.get('/', (req,res)=>{
res.json({
success:true,
message:'ROBAMO API Working'
});
});
// HEALTH
router.get('/health', (req, res) => res.json({ success: true, message: 'ROBAMO API running 🚀', timestamp: new Date().toISOString() }));
// Google OAuth routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/?error=google_failed' }),
  (req, res) => {
    const { user, token } = req.user;
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id, name: user.name, email: user.email, role: user.role
    }));
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
    res.redirect(`${frontendURL}/?token=${token}&user=${userData}`);
  }
);
// CERTIFICATES
router.post('/admin/certificates', adminMiddleware, (req, res) => {
  const db = require('../config/database');
  const { student_name, student_email, course_name, school_name, grade } = req.body;
  if (!student_name || !course_name) return res.status(400).json({ success: false, message: 'Student name aur course name required.' });
  const cert_id = 'ROBAMO-' + Date.now() + '-' + Math.random().toString(36).substr(2,5).toUpperCase();
  db.prepare('INSERT INTO certificates (cert_id, student_name, student_email, course_name, school_name, grade) VALUES (?,?,?,?,?,?)').run(cert_id, student_name, student_email || null, course_name, school_name || null, grade || null);
  res.json({ success: true, message: 'Certificate issued!', cert_id });
});

router.get('/admin/certificates', adminMiddleware, (req, res) => {
  const db = require('../config/database');
  const certs = db.prepare('SELECT * FROM certificates ORDER BY issued_at DESC').all();
  res.json({ success: true, certificates: certs });
});

router.get('/certificate/:cert_id', (req, res) => {
  const db = require('../config/database');
  const cert = db.prepare('SELECT * FROM certificates WHERE cert_id = ?').get(req.params.cert_id);
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
  res.json({ success: true, certificate: cert });
});
module.exports = router;
