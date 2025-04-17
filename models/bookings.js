// Use nedb and path to set up our local database
const Datastore = require('gray-nedb');
const path = require('path');

// Set up the bookings database and load it from the file
const bookingDB = new Datastore({
  filename: path.join(__dirname, 'bookings.db'),
  autoload: true
});

// Export the database so other files can use it
module.exports = { bookingDB };
