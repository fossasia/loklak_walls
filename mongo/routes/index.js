var express = require('express');
var router = express.Router();
var passport = require('passport');
var config = require('../../custom_configFile.json');

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlMailer = require('../controllers/email');
var ctrlWalls = require('../controllers/walls');
var ctrlTweetStore = require('../controllers/tweets');
var ctrlAnnounceStore = require('../controllers/announces');

// /api routes

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
	// console.log(req.user)
	if(req.user._id) res.json(req.user);
	else res.json({"message":"no user"})
});

// EMAIL CONFIRMATIONS =================
router.get('/send', ctrlMailer.send);
router.get('/verify/:id', ctrlMailer.verify);

// TWEET API ===========================
// :tweetId - ._id of tweet object
// :userId  - ._id of user object
// :wallId  - .apps.wall.id of wall options
router.get   ('/tweets/:userWallId', ctrlTweetStore.getAllTweetsById);
router.get   ('/tweets/:userId/:wallId', ctrlTweetStore.getApprovedTweetsById);
router.get   ('/tweets/:userId/:wallId/:tweetId', auth, ctrlTweetStore.getTweetById);
router.post  ('/tweets/:userId/:wallId', auth, ctrlTweetStore.storeTweet);
router.put   ('/tweets/:tweetId', auth, ctrlTweetStore.updateTweet);
router.delete('/tweets/:userWallId', auth, ctrlTweetStore.deleteTweet); // delete all tweets on wall delete

// ANNOUNCEMENT API ====================
router.get   ('/announces/current/:userWallId', ctrlAnnounceStore.getCurrentAnnounce);		 // for wallDisplay
router.get   ('/announces/:userWallId', ctrlAnnounceStore.getAllAnnouncesById);				 // for dashboard
router.get   ('/announces/:userWallId/:announceId', auth, ctrlAnnounceStore.getAnnounceById);// for edit
router.post  ('/announces/:userWallId', auth, ctrlAnnounceStore.storeAnnounce);				 // for save & edit
// router.put   ('/announces/:announceId', auth, ctrlAnnounceStore.updateAnnounce);			 // unused edit
router.delete('/announces/:userWallId', auth, ctrlAnnounceStore.deleteAllAnnounce);			 // for wall delete
router.delete('/announces/:userWallId/:announceId', auth, ctrlAnnounceStore.deleteAnnounce); // for one delete

// WALL API ============================
// :user - ._id of user
// :app  - "wall" or "stats"
// :id 	 - .id of wall object
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

