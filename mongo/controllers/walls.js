var mongoose = require('mongoose');
var User = mongoose.model('User');

// For individual wall page
module.exports.getWallById = function (req, res) {
    console.log(req.params);
    
    User
    .findById(req.params.user)
    .exec(function(err, user) {
        console.log(user);
        if(user===undefined) res.jsonp({});
        if(user.apps[req.params.app]) {
            for (i = 0; i < user.apps[req.params.app].length; i = i + 1) {
                if (user.apps[req.params.app][i].id === req.params.id) {
                    return res.jsonp(user.apps[req.params.app][i]);
                }
            }
            res.jsonp({});
        } else {
            res.jsonp({});
        }
    });
}

// For user wall dashboard
module.exports.getUserWalls = function (req, res) {
    
    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).jsonp([]);
    } else {
        User
        .findById(req.params.user)
        .exec(function(err, user) {
            console.log("user", user);
            if(!user.apps){
                user.apps = { map:[] };
            }
            if (user.apps && user.apps[req.params.app]) {
                res.jsonp(user.apps[req.params.app]);
            } else {
                res.jsonp([]);
            }

        }); 
    }
}

module.exports.createWall = function (req, res) {
    var newWall = req.body;
    console.log("newWall", newWall);
    newWall.id = Date.now();
    console.log("newWallid", newWall.id);

    if (!req.isAuthenticated()) {
        console.log("not Authenticated");
        res.status(401).json({
            "message" : "UnauthorizedError: private wall page"
        });
    } else {
        User
        .findById(req.params.user)
        .exec(function(err, user) {
            var appData = user.apps;
            if (!appData) {
                console.log("apps null");
                
                appData = {};
            }
            if (!appData[req.params.app]) {
                console.log("apps.walls null");
                
                appData[req.params.app] = [];
            }

            
            appData[req.params.app].push(newWall);
            console.log("user apps", user.apps);
            
            user.save(function(err) {
                if (err) {
                    console.log(err)
                } else {
                    res.json({ id: newWall.id });
                }
            });
            
        });
    }
}

module.exports.updateWall = function (req, res) {
    if (!req.isAuthenticated()) {
        res.status(401).json({
            "message" : "UnauthorizedError: private wall page"
        });
    } else {
        User
        .findById(req.params.user)
        .exec(function(err, user) {
            console.log(user.apps);   
            var appData = user.apps; 
            if (!appData[req.params.app]) {
                appData[req.params.app] = [];
            }
            var found = false;
            // for all walls
            for (i = 0; i < appData[req.params.app].length; i = i + 1) {
                if (appData[req.params.app][i].id === req.params.id) {
                    console.log("found wall");
                    console.log("req.body", req.body);
                    found = true;
                    // Assigning causes error, use splice
                    // appData[req.params.app][i] = req.body;
                    appData[req.params.app].splice(i, 1, req.body);                    
                    user.save(function(err) {
                        if (err) res.send(err);
                        else res.json({ id : req.body.id});
                    });
                }
            }
            if (found === false) {
                res.json({
                    status: "ERROR"
                });
            }
            
        });
    }
};

module.exports.deleteWall = function (req, res) {    
    if (!req.isAuthenticated()) {
        res.status(401).json({
            "message" : "UnauthorizedError: private wall page"
        });
    } else {
        User
        .findById(req.params.user)
        .exec(function(err, user) {
            console.log(user);
            var appData = user.apps; 
            if (!appData[req.params.app]) {
                appData[req.params.app] = [];
            }
            var found = false;
            for (i = 0; i < appData[req.params.app].length; i = i + 1) {
                if (appData[req.params.app][i].id === req.params.id) {
                    found = true;
                    appData[req.params.app].splice(i, 1);
                    user.save(function(err) {
                        if (err) res.send(err);
                        else res.json({ status : "DELETED"});
                    });
                }
            }
            if (found === false) {
                res.json({
                    status: "ERROR"
                });
            }
            
        });
    }
}
