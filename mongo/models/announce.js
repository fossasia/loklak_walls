var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../custom_configFile.json');

var AnnouceSchema = new Schema({
  userWallId: { type: String, required: true, index: true },
  header: String,
  subHeader: String,
  text: String,
});
mongoose.model('Announce', AnnouceSchema);

