var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var config = require('../../custom_configFile.json');

var auth = jwt({
  secret: config.jwtsecret,
  userProperty: 'payload'
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlMailer = require('../controllers/email');
var ctrlWalls = require('../controllers/walls');

// AUTH before API routes so will not override

// AUTH - Email
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
// AUTH - Twitter
router.get('/login/twitter', passport.authenticate('twitter'));
router.get('/login/twitter/callback', passport.authenticate('twitter', {
        successRedirect : '/',
        failureRedirect : '/'
    })
);

// WALL API
router.get   ('/:user/:app/:id', ctrlWalls.getWallById);
router.get   ('/:user/:app', auth, ctrlWalls.getUserWalls);
router.post  ('/:user/:app', auth, ctrlWalls.createWall);
router.put   ('/:user/:app/:id', auth, ctrlWalls.updateWall);
router.delete('/:user/:app/:id', auth, ctrlWalls.deleteWall);



// // LINKING ACCOUNTS
// router.post('/connect/local', passport.authenticate('local', {
//      successRedirect : '/wall', // redirect to the secure profile section
//      failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
//      failureFlash : true // allow flash messages
//  }));
//  
//  // send to twitter to do the authentication
//  // then handle the callback after twitter has authorized the user
//  router.get('/connect/twitter', passport.authorize('twitter-authz', { failureRedirect: '/account' }));
//  router.get('/connect/twitter/callback', passport.authorize('twitter-authz', { failureRedirect: '/account' }),
//  function(req, res) { // Successful authentication, redirect home.
//    res.redirect('/');
// });


// EMAIL CONFIRMATIONS
router.get('/send', ctrlMailer.send);
router.get('/verify', ctrlMailer.verify);

module.exports = router;
