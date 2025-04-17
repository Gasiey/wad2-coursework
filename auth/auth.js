const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Handles user login by verifying credentials and generating a JWT token
exports.login = (req, res, next) => {
  const { username, password } = req.body;

  // Look up the user in the database
  userModel.lookup(username, (err, user) => {
    if (err || !user) {
      // If no user found, re-render login with error
      return res.status(401).render("login", {
        title: "Login",
        error: "User not found"
      });
    }

    // Compare provided password with stored hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // If password matches, sign and send JWT token in cookie
        const payload = { user: username };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        res.cookie("jwt", accessToken);
        next(); // Proceed to next middleware or protected route
      } else {
        // If password is incorrect, re-render login with error
        return res.status(403).render("login", {
          title: "Login",
          error: "Incorrect password"
        });
      }
    });
  });
};

// Middleware to verify JWT token for protected routes
exports.verify = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(403).send("Not logged in");

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    next(); // Token is valid, proceed
  } catch {
    res.status(401).send("Invalid token");
  }
};
