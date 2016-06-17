var mongoose = require('mongoose');
var Tweet = mongoose.model('Tweet');


// Get all tweets, for approval
module.exports.getAllTweetsById = function(req,res){
    Tweet
    .find({userWallId: req.params.userWallId})
    // .sort({created_at: -1})
    .exec(function(err, tweetArr){
        console.log('first', tweetArr[0]);
        res.json({tweetArr: tweetArr});
    })
}

// Accepts a userId & wallId, queries the combined id for efficiency
// Returns a approved tweet array for a wall
module.exports.getApprovedTweetsById = function (req, res) {
    var userWallId = req.params.userId + req.params.wallId;
    Tweet
    .find({userWallId: userWallId, approval: true} )
    .limit(50)
    .exec(function(err, tweetArr) {
        console.log('first', tweetArr[0]);
        res.json({statuses: tweetArr});
    });
}

// Gets a specific tweet by its ._id
module.exports.getTweetById = function (req, res) {
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        Tweet
        .findById(req.params.tweetId)
        .exec(function(err, tweet) {
            console.log(tweet);
            res.jsonp({tweet: tweet});
        });
    }
}

// Saves tweet array
module.exports.storeTweet = function (req, res) {
// pre-added userwallid & approval false field on client when checked walloptions for moderation
// req.body contains an array of tweets
    req.body.forEach(function(tweet){
        var newTweet = new Tweet(tweet);
        newTweet.save(function(err,datum){
            if(err!==null){
                console.log("err", err);  
            } else{
                console.log("datum", datum)
            }
        });
    })
    res.jsonp({message: "inserted "+req.body.length});
}

// Update approval status to it's opposite
module.exports.updateTweet = function (req, res) {
// set approval field to opposite
console.log("update")
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        console.log("req.params", req.params);
        console.log("req.params", req.body);
        Tweet
        .findById(req.params.tweetId)
        .exec(function(err, tweet) {
            
            tweet.approval = !tweet.approval;
            tweet.save(function(err) {
                if (err) res.send(err);
                else res.json({tweet: tweet});
            });
        });
    }
}

// Remove from store
module.exports.deleteTweet = function (req, res) { 
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        Tweet
        .remove({userWallId: req.params.userWallId})
        .exec(function(err){
            console.log("err", err);
        });
    }
}
