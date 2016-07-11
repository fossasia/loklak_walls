var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../custom_configFile.json');

// Added fields: 
// - userWallId for querying
// - approval for filtering

var TweetSchema = new Schema({
  userWallId: { type: String, required: true, index: true },
  approval: Boolean,
  timestamp: String,
  created_at: String,
  screen_name: String,
  text: String,
  link: String,
  id_str: String,
  source_type: String,
  provider_type: String,
  retweet_count: Number,
  favourites_count: Number,
  images: [String],
  images_count: Number,
  audio: [String ],
  audio_count: Number,
  videos: [String ],
  videos_count: Number,
  place_name: String,
  place_id: String,
  place_context: String,
  hosts: [String ],
  hosts_count: Number,
  links: [String ],
  links_count: Number,
  location_mark: [Number],
  location_point: [Number],
  location_radius: Number,
  location_source: String, 
  mentions: [String ],
  mentions_count: Number,
  hashtags: [String],
  hashtags_count: Number,
  classifier_language: String,
  classifier_language_probability: Number,
  without_l_len: Number,
  without_lu_len: Number,
  without_luh_len: Number,
  user: {
    appearance_first: String,
    profile_image_url_https: String,
    screen_name: String,
    user_id: String,
    name: String,
    appearance_latest: String,
  }

});
mongoose.model('Tweet', TweetSchema);

