const Datastore = require("gray-nedb");
const bcrypt = require('bcrypt');
const saltRounds = 10;

// This class manages organiser accounts (create, find, delete)
class UserDAO {
  constructor() {
    // Create and load the NeDB users database
    this.db = new Datastore({ filename: 'models/users.db', autoload: true });
  }

  // Create a new organiser account with hashed password
  create(username, password) {
    bcrypt.hash(password, saltRounds).then((hash) => {
      const entry = { user: username, password: hash };
      this.db.insert(entry, (err) => {
        if (err) console.log("Can't insert user:", username);
      });
    });
  }

  // Look up a user by username
  lookup(user, cb) {
    this.db.findOne({ user }, (err, entry) => {
      cb(err, entry);
    });
  }

  // Get a list of all organisers
  listAll(cb) {
    this.db.find({}, (err, docs) => {
      cb(docs);
    });
  }

  // Delete an organiser by username
  remove(username, cb) {
    this.db.remove({ user: username }, {}, (err, numRemoved) => {
      cb(numRemoved);
    });
  }
}

// Export an instance so we can use it across the app
module.exports = new UserDAO();
