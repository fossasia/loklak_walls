var mongoose = require('mongoose');
var User = mongoose.model('User');

// Using $rootscope.root.currentUser instead of calling api
module.exports.profileRead = function(req, res) {

  if (!req.isAuthenticated()) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        res.status(200).json(user);
      });
  }

};
