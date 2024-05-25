const mongoose = require("mongoose");

const collectionForCardSchema = new mongoose.Schema({
  tradingCard: {
    type: mongoose.Schema.Types.ObjectId, ref: "tradingCards", required: true, index: true
  },
  cardCollection: {
    type: mongoose.Schema.Types.ObjectId, ref: "cardCollection", required: true, index: true
  }
});

collectionForCardSchema.index({tradingCard: 1, cardCollection: 1}, {unique: true});

module.exports = mongoose.model("collectionForCard", collectionForCardSchema);