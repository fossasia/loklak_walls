var express = require('express');
var router = express.Router();
var passport = require('passport');
var config = require('../../custom_configFile.json');

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlMailer = require('../controllers/email');
var ctrlWalls = require('../controllers/walls');

// AUTH ================================
router.post('/register', function(req,res,next){
	passport.authenticate('local-signup',function(err, user, info){
		if (err) { return next(err); }
		if (!user) { console.log("info", info);
		 	res.json(info); 
		}
		req.login(user, function(err) {
			if (err) { return next(err); }
			res.json(user);
		})
	})(req, res);
});
router.post('/login', function(req,res,next){
	passport.authenticate('local-login',function(err, user, info){
		req.login(user, function(err) {
			if (err) { return next(err); }
			if(!user) res.json(info);
			res.json(user);
		})
	})(req, res);
});
router.get('/login/twitter', passport.authenticate('twitter'));
router.get('/login/twitter/callback', 
	passport.authenticate('twitter', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

// UNLINKING ACCOUNTS ==================
router.get('/unlink/twitter', function(req, res) {
	var user           = req.user;
	user.twitter.token = undefined;
	user.save(function(err) {
		res.redirect('/profile');
	});
});

// LOGOUT ==============================
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// USER ================================
router.get('/currentuser', auth, function(req,res){
	console.log(req.user)
	if(req.user._id) res.json(req.user);
	else res.json({"message":"no user"})
});

// EMAIL CONFIRMATIONS =================
router.get('/send', ctrlMailer.send);
router.get('/verify', ctrlMailer.verify);

// WALL API ============================
router.get   ('/:user/:app', auth, ctrlWalls.getUserWalls);
router.get   ('/:user/:app/:id', ctrlWalls.getWallById);
router.post  ('/:user/:app', auth, ctrlWalls.createWall);
router.put   ('/:user/:app/:id', auth, ctrlWalls.updateWall);
router.delete('/:user/:app/:id', auth, ctrlWalls.deleteWall);


function auth(req, res, next) {
	console.log("auth", req.isAuthenticated())
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

module.exports = router;

