const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const { adminLogin, userRegister, userLogin, getProfile } = require('../controllers/authController');
const { getAllCourses, getCourseById, getCourseModules, createCourse, updateCourse, deleteCourse, addModule, addLesson } = require('../controllers/courseController');
const { submitRegistration, getAllRegistrations, updateRegistrationStatus, bookDemo, getAllDemoBookings, submitPartnership, getAllPartnerships, submitContact, getAllMessages } = require('../controllers/formController');
const { getShowcase, getTestimonials, getBlogPosts, getBlogById, getDownloads, trackDownload, getAdminStats, addShowcaseProject, createBlogPost, addTestimonial } = require('../controllers/publicController');

// AUTH
router.post('/auth/admin/login', adminLogin);
router.post('/auth/register', userRegister);
router.post('/auth/login', userLogin);
router.get('/auth/profile', authMiddleware, getProfile);

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
module.exports = router;
