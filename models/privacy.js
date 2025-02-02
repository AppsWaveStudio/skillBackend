const mongoose = require('mongoose');

const PrivacySchema = new mongoose.Schema({
  privacy: String,
  information: String,
  personal: String,
  security: String,
  choices: String,
  dataretention: String,
  childrenprivacy: String,
  changestothisprivacypolicy: String,
  contantus: String // Note: "contantus" is a typo in your database, should be "contactus"
});

module.exports = mongoose.model('Privacy', PrivacySchema, 'privacy');
