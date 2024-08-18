const mongoose = require("mongoose");

const tradingCardSchema = new mongoose.Schema({
  year: { type: Number, required: true, index: true },
  brand: { type: String, required: true },
  cardNumber: { type: String, required: false },
  cardSet: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  variety: { type: String, required: false },
  gradingCompany: { type: String, required: true },
  grade: { type: String, required: true },
  certificationNumber: { type: String, required: true },
  frontCardImageLink: { type: String, required: false },
  backCardImageLink: { type: String, required: false },
  sold: { type: Boolean, required: true },
});

tradingCardSchema.index(
  { gradingCompany: 1, certificationNumber: 1 },
  { unique: true },
);

tradingCardSchema.index({
  subject: "text",
  year: "text",
  cardSet: "text",
  brand: "text",
  variety: "text",
  certificationNumber: "text",
  gradingCompany: "text",
  cardNumber: "text",
});

module.exports = mongoose.model("tradingCards", tradingCardSchema);
