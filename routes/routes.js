const express = require('express');
const controller = require('../controllers/controller');
const auth = require('../auth/auth');

const router = express.Router();

// ====================
// Public Routes (No login required)
// ====================

// Homepage showing list of courses
router.get('/', controller.landing_page);

// View course details
router.get('/courses/:id', controller.course_details);

// Book a course (view form and submit)
router.get('/book-course/:id', controller.book_course_page);
router.post('/book-course/:id', controller.post_book_course);

// ====================
// Organiser Routes (Login required)
// ====================

// Add a new course
router.get('/add-course', auth.verify, controller.add_course_page);
router.post('/add-course', auth.verify, controller.post_new_course);

// Edit an existing course
router.get('/edit-course/:id', auth.verify, controller.edit_course_page);
router.post('/edit-course/:id', auth.verify, controller.post_edit_course);

// View and delete courses
router.get('/bookings', auth.verify, controller.bookings_list);
router.get('/delete-course/:id', auth.verify, controller.delete_course);

// View course participant list
router.get('/participants/:id', auth.verify, controller.course_participants);

// Manage organiser accounts
router.get('/organisers', auth.verify, controller.manage_organisers);
router.post('/organisers/delete/:username', auth.verify, controller.delete_organiser);

// ====================
// Authentication Routes
// ====================

// Register and login
router.get('/register', controller.show_register_page);
router.post('/register', controller.register_user);
router.get('/login', controller.show_login_page);
router.post('/login', auth.login, controller.logged_in_landing);

// Logout
router.get('/logout', controller.logout);

module.exports = router;
