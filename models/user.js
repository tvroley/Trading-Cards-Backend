const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  roles: { type: [String], required: true },
});

userSchema.index({
  username: "text",
});

module.exports = mongoose.model("users", userSchema);
