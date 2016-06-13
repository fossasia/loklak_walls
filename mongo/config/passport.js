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

// Twitter Strategy
passport.use(new TwitterStrategy({
  consumerKey     : config.twitterConsumerKey,
  consumerSecret  : config.twitterConsumerSecret,
  callbackURL     : config.twitterCallbackUrl,
}, function(token, tokenSecret, profile, done) {

  process.nextTick(function () {

    User.findOne({ name: profile.username }, function (err, user) {
      if (err) { return done(err); }
      // Register if user not found in database
      if (!user) {
        var user = new User();
        user.name = profile.username;
        user.isVerified = false;
        user.apps = { walls: [] };

        user.twitter = {}
        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.username = profile.username;
        user.twitter.displayName = profile.displayName;

        console.log('new user',user);

          // save our user into the database
          user.save(function(err) {
            if (err) throw err;
            return done(null, user);
          });
        }
      // If credentials are correct, return the user object
      return done(null, user);
    })

  })
}));


passport.use(new LocalStrategy({
  usernameField: 'email'
},
function(username, password, done) {
  User.findOne({ email: username }, function (err, user) {
    console.log(user);

    if (err) { return done(err); }
      // Return false if user not found in database, so route can create
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
}
));



    // process.nextTick(function() {
        // if (!req.user) {
        //     User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
        // 
        //         if (err) return done(err); // error connecting to the database
        //         if (user) {
        //             return done(null, user); // user found, return that user
        //         } else {
        //             // if there is no user, create them
        //             var newUser                 = new User();
        //             
        //             // set all of the user data that we need
        //             newUser.twitter.id          = profile.id;
        //             newUser.twitter.token       = token;
        //             newUser.twitter.username    = profile.username;
        //             newUser.twitter.displayName = profile.displayName;
        //             newUser.twitter.lastStatus  = profile._json.status.text;
        //             
        //             newUser.name                = profile.displayName;
        //             newUser.isVerified          = true;
        //             newUser.apps                = {};
        //             newUser.apps.walls          = [];
        //             console.log('new user',newUser);
        //             
        //             // save our user into the database
        //             newUser.save(function(err) {
        //                 if (err) throw err;
        //                 return done(null, newUser);
        //             });
        //         }
        //     });
        // } else {
        //     var user            = req.user; // pull the user out of the session
        //     
        //     // update the current users twiter credentials
        //     user.twitter.id          = profile.id;
        //     user.twitter.token       = token;
        //     user.twitter.username    = profile.username;
        //     user.twitter.displayName = profile.displayName;
        //     console.log('user',user);
        //     // save the user
        //     user.save(function(err) {
        //         if (err) throw err;
        //         return done(null, user);
        //     });
        // }
    // });



