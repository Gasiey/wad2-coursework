const Datastore = require('gray-nedb');
const path = require('path');

// Set up NeDB for user accounts and load the file automatically
const userDB = new Datastore({
  filename: path.join(__dirname, 'users.db'),
  autoload: true
});

// If the user database is empty, insert a default admin user (for first-time setup)
userDB.count({}, (err, count) => {
  if (count === 0) {
    userDB.insert({
      username: 'admin',
      password: 'password123'
    });
  }
});

module.exports = { userDB };
