var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../custom_configFile.json');

var AnnouceSchema = new Schema({
  userWallId: { type: String, required: true, index: true },
  header: String,
  subheader: String,
  startDateTime: Date,
  duration: Number,
  logo: {},
  cronJobId: String,
  current: Boolean,
  faIconClassName: String
});
mongoose.model('Announce', AnnouceSchema);

