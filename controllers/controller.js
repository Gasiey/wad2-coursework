// Load required modules
const model = require('../models/db');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');

// Homepage - list all courses with optional organiser view
exports.landing_page = (req, res) => {
  model.getAllCourses((courses) => {
    let organiser = false;
    const token = req.cookies.jwt;

    if (token) {
      try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        organiser = true;
      } catch (err) {
        organiser = false;
      }
    }

    const formattedCourses = courses.map(c => ({
      ...c,
      dateTimeFormatted: moment(c.dateTime).format('D MMMM YYYY, h:mm A')
    }));

    res.render('index', { title: "Available Dance Courses", courses: formattedCourses, organiser });
  });
};

// View individual course details
exports.course_details = (req, res) => {
  const courseId = req.params.id;
  model.getCourseById(courseId, (course) => {
    let organiser = false;
    const token = req.cookies.jwt;

    if (token) {
      try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        organiser = true;
      } catch (err) {
        organiser = false;
      }
    }

    course.dateTimeFormatted = moment(course.dateTime).format('D MMMM YYYY, h:mm A');

    res.render('course-details', { title: "Course Details", course, organiser });
  });
};

// Show add course form
exports.add_course_page = (req, res) => {
  res.render('add-course', { title: "Add New Course" });
};

// Handle new course submission
exports.post_new_course = (req, res) => {
  const course = req.body;
  model.addCourse(course, () => res.redirect('/'));
};

// Show edit course form
exports.edit_course_page = (req, res) => {
  const courseId = req.params.id;
  model.getCourseById(courseId, (course) => {
    res.render('edit-course', { title: "Edit Course", course });
  });
};

// Handle course update
exports.post_edit_course = (req, res) => {
  const id = req.params.id;
  const updatedCourse = req.body;
  model.updateCourse(id, updatedCourse, () => res.redirect('/'));
};

// Show booking form for a course
exports.book_course_page = (req, res) => {
  const courseId = req.params.id;
  model.getCourseById(courseId, (course) => {
    res.render('book-course', { title: "Book Course", course });
  });
};

// Handle booking submission
exports.post_book_course = (req, res) => {
  const courseId = req.params.id;
  const booking = {
    courseId: courseId,
    studentName: req.body.studentName,
    studentEmail: req.body.studentEmail
  };
  model.addBooking(booking, () => {
    res.render('booking-confirmation', { title: "Booking Confirmed", booking });
  });
};

// Display all bookings (organiser only)
exports.bookings_list = (req, res) => {
  model.getAllBookings((bookings) => {
    model.getAllCourses((courses) => {
      const validCourseIds = courses.map(c => c._id);
      const filteredBookings = bookings.filter(b => validCourseIds.includes(b.courseId));
      const courseLookup = {};
      courses.forEach(course => courseLookup[course._id] = course.title);
      const enrichedBookings = filteredBookings.map(b => ({
        ...b,
        courseTitle: courseLookup[b.courseId] || "Unknown / Deleted Course"
      }));
      res.render('bookings', { title: "All Bookings", bookings: enrichedBookings });
    });
  });
};

// Show register page
exports.show_register_page = (req, res) => {
  res.render('register', { title: "Register" });
};

// Register a new organiser
exports.register_user = (req, res) => {
  const { username, password } = req.body;
  userModel.lookup(username, (err, user) => {
    if (user) {
      res.status(401).send("User already exists");
    } else {
      userModel.create(username, password);
      res.redirect('/login');
    }
  });
};

// Show login page
exports.show_login_page = (req, res) => {
  res.render('login', { title: "Login" });
};

// Handle login submission
exports.logged_in_landing = (req, res) => {
  const { username, password } = req.body;
  userModel.lookup(username, (err, user) => {
    if (!user) {
      return res.status(401).render("login", { title: "Login", error: "User not found" });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (!result) {
        return res.status(401).render("login", { title: "Login", error: "Incorrect password" });
      }
      const token = jwt.sign({ user: user.user }, process.env.ACCESS_TOKEN_SECRET);
      res.cookie("jwt", token);
      res.redirect("/");
    });
  });
};

// Log out user
exports.logout = (req, res) => {
  res.clearCookie("jwt").redirect('/login');
};

// Delete course and associated bookings
exports.delete_course = (req, res) => {
  const courseId = req.params.id;
  model.deleteCourse(courseId, () => {
    model.deleteBookingsByCourseId(courseId, (numRemoved) => {
      console.log(`Deleted ${numRemoved} bookings for course ${courseId}`);
      res.redirect('/');
    });
  });
};

// View participants for a course
exports.course_participants = (req, res) => {
  const courseId = req.params.id;
  model.getBookingsByCourse(courseId, (bookings) => {
    res.render('participants', { title: "Participant List", bookings });
  });
};

// Show list of organisers with self-deletion check
exports.manage_organisers = (req, res) => {
  userModel.listAll((users) => {
    let currentUser = null;
    const token = req.cookies.jwt;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        currentUser = payload.user;
      } catch (err) {
        currentUser = null;
      }
    }
    const filteredUsers = users.filter(u => u.user?.trim()).map(u => ({
      user: u.user,
      isSelf: u.user.trim().toLowerCase() === currentUser?.trim().toLowerCase()
    }));
    res.render('organisers', { title: "Manage Organisers", users: filteredUsers });
  });
};

// Delete an organiser unless it's the logged-in user
exports.delete_organiser = (req, res) => {
  const usernameToDelete = req.params.username;
  const token = req.cookies.jwt;
  let currentUser = null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      currentUser = payload.user;
    } catch (err) {
      return res.redirect('/login');
    }
  }

  if (usernameToDelete?.trim().toLowerCase() === currentUser?.trim().toLowerCase()) {
    return res.status(403).send("You cannot delete the currently logged-in organiser.");
  }

  userModel.remove(usernameToDelete, () => {
    res.redirect('/organisers');
  });
};

  
  
  
  
  
  