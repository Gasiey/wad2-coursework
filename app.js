// Core modules and dependencies
const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Loads .env file variables

const router = require('./routes/routes'); // All app routes

const app = express();

// Set up Mustache view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Middleware to handle form data and static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Needed for JWT auth

// Use main routes
app.use('/', router);

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
