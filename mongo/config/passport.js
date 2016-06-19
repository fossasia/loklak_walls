var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var mongoose = require('mongoose');
var User = mongoose.model('User');
var config = require('../../custom_configFile.json');

// Session Support for twitter
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function(req, email, password, done) {

    // asynchronous
    process.nextTick(function() {
      User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
              return done(err);

            // if no user is found, return the message
            if (!user)
              return done(null, false, {message: "Unable to log in"});

            if (!user.validPassword(password))
              return done(null, false, {message: "Unable to log in"});

            // all is well, return user
            else
              return done(null, user);
          });
    });

  }));

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true 
  },
  function(req, email, password, done) {

    process.nextTick(function() {

        User.findOne({'local.email': email}, function(err, existingUser) {

            if (err) return done(err);

            if (existingUser) 
              return done(null, false, { message: "User exists already" });

            if(req.user) {
              var user            = req.user;
              user.name           = email;
              user.apps           = {};
              user.isVerified     = false;
              user.local.email    = email;
              user.local.password = user.generateHash(password);
              user.apps
              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            } else {
                // create new user
                var newUser            = new User();
                newUser.apps           = {};
                newUser.isVerified     = false;
                newUser.name           = email;
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                newUser.save(function(err) {
                  if (err)
                    throw err;

                  return done(null, newUser);
                });
              }

            });
});

}));

// =========================================================================
// TWITTER =================================================================
// =========================================================================
passport.use(new TwitterStrategy({

  consumerKey     : config.twitterConsumerKey,
  consumerSecret  : config.twitterConsumerSecret,
  callbackURL     : config.twitterCallbackUrl,
  passReqToCallback : true 
  },

  function(req, token, tokenSecret, profile, done) {

    process.nextTick(function() {

        if (!req.user) {

          User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
            if (err)
              return done(err);

            if (user) {
                    console.log('link existing user')
                    if (!user.twitter.token) {
                      user.name                = profile.username;
                      user.apps                = {};
                      user.isVerified          = true;
                      user.twitter             = {}
                      user.twitter.token       = token;
                      user.twitter.username    = profile.username;
                      user.twitter.displayName = profile.displayName;

                      user.save(function(err) {
                        if (err)
                          throw err;
                        return done(null, user);
                      });
                    }

                    return done(null, user); // user found, return that user
                  } else {
                    console.log(' if there is no user, create them')
                    var newUser                 = new User();
                    newUser.apps                = {};
                    newUser.isVerified          = true;
                    newUser.name                = profile.username;
                    newUser.twitter             = {};
                    newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;
                    newUser.save(function(err) {
                      if (err)
                        throw err;
                      return done(null, newUser);
                    });
                  }
                });
      } else {
            // user already exists and is logged in, we have to link accounts
            var user                 = req.user; // pull the user out of the session
            user.twitter             = {};              
            user.twitter.id          = profile.id;
            user.twitter.token       = token;
            user.twitter.username    = profile.username;
            user.twitter.displayName = profile.displayName;

            user.save(function(err) {
              if (err)
                throw err;
              return done(null, user);
            });
      }
    });
}));