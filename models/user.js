const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
  username: { type: String, unique: true, required: true },
});

module.exports = mongoose.model("users", userSchema);