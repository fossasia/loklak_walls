var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../custom_configFile.json');
var bcrypt   = require('bcrypt-nodejs');

var UserSchema = new Schema({
  name: { type: String, required: true },
  local: {
    email   : String,
    password: String
  },
  isVerified: { type: Boolean, required: true },
  twitter: {
    id           : String,
    token        : String,
    displayName  : String,
    username     : String
  },
  apps: {
    wall: [{
      profanity: Boolean,
      images: Boolean,
      videos: Boolean,
      headerColour: String,
      headerForeColour: String,
      headerPosition: String,
      layoutStyle: Number,
      showStatistics: Boolean,
      showLoklakLogo: Boolean,
      showEventName: Boolean,
      all: [String],
      any: [String],
      none: [String],
      eventName: String,
      moderation: Boolean,
      sinceDate: Date,
      mainHashtagText: String,
      mainHashtag: String,
      id: String
    }]
  },

});

// generating a hash
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

mongoose.model('User', UserSchema);