How to run the site:

Make sure Node.js is installed.

Download or clone the project files.

Open the terminal in the project folder.

Run npm install to install dependencies.

Create a .env file and add this line: ACCESS_TOKEN_SECRET=yourSecretHere

Start the server by running node app.js.

Open a browser and go to http://localhost:3000

Features that have been implemented:

Regular users:

View a list of all dance courses

View course details including date, time, location, duration, and price

Book a course with name and email

Booking confirmation page

Organisers (logged in):

Login and logout

Add new courses

Edit existing courses

Delete existing courses

View all bookings

View participants of a specific course

Add and delete organisers

Cannot delete yourself (self-deletion is blocked)

Shows “Unknown / Deleted Course” if the course linked to a booking no longer exists

Prevents empty usernames from showing in organiser list

Validation on booking form (name and email required)