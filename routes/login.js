const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

//Registration route
router.get('/register', (req, res) => {
  res.render('login/register'); // Render the registration form
});
  
router.post('/register', async (req, res) => {
  try {
    //Process the registration form data and create a new user
    const { username, email, password } = req.body;
    //Create a new user using the User model and save it to the database
    const user = new User({ username, email, password });
    await user.save();
    res.redirect('/login'); //Redirect user to the login page after successful registration
    } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
    }
  });

//Login route
router.get('/login', (req, res) => {
  res.render('login/login'); // Render the login form
});
  
//Login route
//Passport will handle the post request for the login route 
router.post('/login', passport.authenticate('local', {
  successRedirect: '/exams',
  failureRedirect: '/login',
}));

//Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {}); //Provide an empty callback function
  res.redirect('/');
});

module.exports = router