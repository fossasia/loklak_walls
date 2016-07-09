var mongoose = require('mongoose');
var Announce = mongoose.model('Announce');
var io = require(__dirname + '/../../gulp/tasks/server.js');
var CronJob = require('cron').CronJob;
var shortid = require('shortid')

// Get current announcement for wall display
// announces/current/:userWallId
module.exports.getCurrentAnnounce = function(req, res){
    Announce
    .find({
        userWallId: req.params.userWallId,
        current: true
    })
    .exec(function(err, announce){
        console.log(announce)
        res.json({announce:announce})
    })
}

// Get all announcement for dashboard
// /announces/:userWallId

module.exports.getAllAnnouncesById = function(req,res){
    Announce
    .find({userWallId: req.params.userWallId})
    .sort({startDateTime: 1})
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
            // console.log(announce);
            res.jsonp({announce: announce});
        });
    }
}

// Saves announce array
// /announces/:userWallId

var cronJobMap = {};
module.exports.storeAnnounce = function (req, res) {
    var userWallId = req.params.userWallId;
    var announcement = req.body;

    if(announcement._id){
        // update
        Announce
        .findByIdAndUpdate(announcement._id, {$set: announcement})
        .exec(function(err, Announce) {
            if(err){
                console.log(err);
            }
            if(cronJobMap[announcement.cronJobId]){
                cronJobMap[announcement.cronJobId] = new CronJob(new Date(announcement.startDateTime), function(){
                    Announce.findOneAndUpdate({userWallId: userWallId, current: true}, { $set: {current: false}}, {new: true},
                    function(err, announce){
                        // Update wall displays w/ the most recent announcement
                        Announce.findOneAndUpdate({_id:datum._id}, 
                            {$set: {current: true}}, {new: true},function(err, doc){console.log(err);});
                        io.emit("putCurrentAnnounce" + userWallId, datum);
                    })
                },null,true);
            }

            res.json({Announce: Announce});
        });

    } else {
        // insert
        var newAnnounceId = shortid.generate();
        
        announcement.cronJobId = newAnnounceId;
        announcement.userWallId = req.params.userWallId;
        announcement.current = false;

        var newAnnounce = new Announce(announcement);
        newAnnounce.save(function(err,datum){
            if(err !== null){
                console.log("err", err);  
            } else{
                console.log("adding new announcement", datum);
                // EMIT POST EVENT to add tweets with ._id
                io.emit("addNewAnnounce" + userWallId, datum);

                // Add cron job to trigger announcement at given date
                cronJobMap[newAnnounceId] = new CronJob(new Date(announcement.startDateTime), function(){
                    // console.log('switching previous to false')
                    Announce.findOneAndUpdate({userWallId: userWallId, current: true}, { $set: {current: false}}, {new: true},
                    function(err, announce){
                        // Update wall displays w/ the most recent announcement
                        Announce.findOneAndUpdate({_id:datum._id}, 
                            {$set: {current: true}}, {new: true},function(err, doc){console.log(err);});
                        io.emit("putCurrentAnnounce" + userWallId, datum);
                    })
                },null,true);
            }
        })
        
        res.jsonp({message: "inserted"});
    }
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
        .find({userWallId: req.params.userWallId})
        .exec(function(err, announces){
            announces.forEach(function(announce){
                delete cronJobMap[announce.cronJobId];
            })
        })

        Announce
        .remove({userWallId: req.params.userWallId})
        .exec(function(err){
            console.log("err", err);
            res.json({message: "deleted"})
        });
    }
}

module.exports.deleteAnnounce = function (req, res) { 
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        Announce
        .findById(req.params.announceId, function(err, announce){
            if(err){
                console.log("error:", err);
            } else {
                delete cronJobMap[announce.cronJobId];
                announce.remove();
                res.json({message: "deleted"})
            }
        });
    }
}
