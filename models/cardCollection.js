const mongoose = require("mongoose");

const cardCollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    required: true,
  },
  tradingCards: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "tradingCards" }],
    required: true,
  },
  readUsers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    required: true,
  },
  writeUsers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    required: true,
  },
});

cardCollectionSchema.index({title: 1, owner: 1}, {unique: true});

module.exports = mongoose.model("cardCollections", cardCollectionSchema);