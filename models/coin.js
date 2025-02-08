const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  coin: { type: Number, required: true, default: 0 }
});

const Coin = mongoose.model('coins', coinSchema);
module.exports = Coin;
