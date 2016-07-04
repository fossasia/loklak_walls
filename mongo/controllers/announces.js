var mongoose = require('mongoose');
var Announce = mongoose.model('Announce');
var io = require(__dirname + '/../../gulp/tasks/server.js');

// /announces/:userWallId
// Get all announcement for dashboard
module.exports.getAllAnnouncesById = function(req,res){
    Announce
    .find({userWallId: req.params.userWallId})
    .limit(50)
    .sort({created_at: -1})
    .exec(function(err, announces){
        console.log('first', announces[0]);
        res.json({announces: announces});
    })
}

// /announces/:userWallId/:announceId
// for editing one announcement
module.exports.getAnnounceById = function (req, res) {
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        Announce
        .findById(req.params.announceId)
        .exec(function(err, announce) {
            console.log(announce);
            res.jsonp({announce: announce});
        });
    }
}

// Saves tweet array
// req.body has properties: .announce, .userWallId
module.exports.storeAnnounce = function (req, res) {

    var newAnnounce = new Announce(req.body.announce);
    newAnnounce.save(function(err,datum){
        if(err!==null){
            console.log("err", err);  
        } else{

            console.log("adding new tweet")
            // EMIT POST EVENT to add tweets with ._id
            io.emit("addNewTweets"+req.body.userWallId, datum);
        }
    })
    
    res.jsonp({message: "inserted"});
}

// Update approval status to it's opposite
// req.body has properties: .newAnnounce
module.exports.updateAnnounce = function (req, res) {
// set approval field to opposite
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        io.emit('replace', {
            _id:req.params.announceId, 
            announce: req.body.newAnnounce
        });
        console.log(req.body)

        Announce
        .findById(req.params.announceId)
        .exec(function(err, Announce) {
            console.log(Announce)
            Announce = req.body.newAnnounce;
            Announce.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    // EMIT TOGGLE EVENT
                    res.json({Announce: Announce});
                }
            });
        });

    }
}

// Remove all tweets matching the userwallId from store
module.exports.deleteAllAnnounce = function (req, res) { 
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        Announce
        .remove({userWallId: req.params.userWallId})
        .exec(function(err){
            console.log("err", err);
        });
    }
}

module.exports.deleteAnnounce = function (req, res) { 
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        Announce
        .findByIdAndRemove(req.params.announceId)
        .exec(function(err){
            console.log(err);
        });
    }
}
