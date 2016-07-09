var mongoose = require('mongoose');
var Announce = mongoose.model('Announce');
var io = require(__dirname + '/../../gulp/tasks/server.js');
var CronJob = require('cron').CronJob;
var shortid = require('shortid')

// Get all announcement for dashboard
// /announces/:userWallId

module.exports.getAllAnnouncesById = function(req,res){
    Announce
    .find({userWallId: req.params.userWallId})
    .limit(50)
    .sort({created_at: -1})
    .exec(function(err, announces){
        // console.log('first', announces[0]);
        res.json({announces: announces});
    })
}

// for editing one announcement
// /announces/:userWallId/:announceId

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

// Saves announce array
// /announces/:userWallId

var cronJobMap = {};
module.exports.storeAnnounce = function (req, res) {

    var announcement = req.body;    
    var newAnnounceId = shortid.generate();
    cronJobMap[newAnnounceId] = new CronJob(new Date(announcement.startDateTime), function(){
        console.log('started');
    },null,true);
    announcement.cronJobId = newAnnounceId;
    announcement.userWallId = req.params.userWallId;
    console.log(cronJobMap)

    var newAnnounce = new Announce(announcement);
    newAnnounce.save(function(err,datum){
        if(err!==null){
            console.log("err", err);  
        } else{
            console.log("adding new announcement", datum);
            // EMIT POST EVENT to add tweets with ._id
            io.emit("addNewAnnounce" + datum.userWallId, datum);
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
