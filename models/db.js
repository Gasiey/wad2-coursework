const nedb = require('gray-nedb');

// Set up two NeDB collections: one for courses, one for bookings
const courses = new nedb({ filename: 'models/courses.db', autoload: true });
const bookings = new nedb({ filename: 'models/bookings.db', autoload: true });

// Seed the courses database with sample data (runs only once)
courses.count({}, (err, count) => {
  if (count === 0) {
    courses.insert([
      {
        title: 'Beginner Salsa',
        description: 'Introductory salsa course for beginners.',
        duration: '6 weeks',
        price: '£50'
      },
      {
        title: 'Freestyle',
        description: 'Learn to express yourself through your body',
        duration: '6 weeks',
        price: '£50'
      }
    ]);
  }
});

// Export database functions
module.exports = {
  // Courses
  getAllCourses: (cb) => {
    courses.find({}, (err, docs) => {
      cb(docs);
    });
  },

  addCourse: (course, cb) => {
    courses.insert(course, (err, newDoc) => {
      cb(newDoc);
    });
  },

  getCourseById: (id, cb) => {
    courses.findOne({ _id: id }, (err, doc) => {
      cb(doc);
    });
  },

  updateCourse: (id, course, cb) => {
    courses.update({ _id: id }, { $set: course }, {}, (err, numUpdated) => {
      cb(numUpdated);
    });
  },

  deleteCourse: (id, cb) => {
    courses.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) {
        cb(err);
        return;
      }

      // When a course is deleted, delete its bookings too
      bookings.remove({ courseId: id }, { multi: true }, (err2, numBookingsRemoved) => {
        console.log(`Deleted ${numBookingsRemoved} bookings for course ID: ${id}`);
        cb(null, numRemoved);
      });
    });
  },

  // Bookings
  getAllBookings: (cb) => {
    bookings.find({}, (err, docs) => {
      cb(docs);
    });
  },

  addBooking: (booking, cb) => {
    bookings.insert(booking, (err, newDoc) => {
      cb(newDoc);
    });
  },

  getBookingsByCourse: (courseId, cb) => {
    bookings.find({ courseId: courseId }, (err, docs) => {
      cb(docs);
    });
  },

  deleteBookingsByCourseId: (courseId, cb) => {
    bookings.remove({ courseId: courseId }, { multi: true }, (err, numRemoved) => {
      if (err) console.log("Error deleting bookings:", err);
      cb(numRemoved);
    });
  }
};



