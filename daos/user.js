const mongoose = require("mongoose");

const User = require("../models/user");
const errors = require("../middleware/errors");
const CardCollection = require("../models/cardCollection");

module.exports = {};

module.exports.createUser = async (userObj) => {
  try {
    const user = await User.create(userObj);
    const userCollection = {
      title: user.username,
      owner: [user._id],
    };
    const collection = await CardCollection.create(userCollection);
    const result = { user: user, collection: collection };
    return result;
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      throw new errors.DuplicateKeyError(err.message);
    } else if (err.message.includes("validation failed")) {
      throw new errors.BadDataError(err.message);
    } else {
      throw err;
    }
  }
};

module.exports.getUser = async (username) => {
  let storedUser;
  await User.findOne({ username: username })
    .lean()
    .then((docs) => {
      storedUser = docs;
    })
    .catch((err) => {
      throw err;
    });

  return storedUser;
};

module.exports.getAllUsers = async () => {
  const allUserNames = [];
  await User.find()
    .lean()
    .then((docs) => {
      docs.map((doc) => {
        allUserNames.push(doc.username);
      });
    })
    .catch((err) => {
      throw err;
    });

  return allUserNames;
};

module.exports.getUserByEmail = async (email) => {
  let storedUser;
  await User.findOne({ email: email })
    .lean()
    .then((docs) => {
      storedUser = docs;
    })
    .catch((err) => {
      throw err;
    });

  return storedUser;
};

module.exports.updateUserPassword = async (userId, password) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new errors.InvalidMongooseId("Invalid user ID");
  }
  await User.updateOne({ _id: userId }, { $set: { password: password } });

  return true;
};

module.exports.deleteUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new errors.InvalidMongooseId("Invalid user ID");
  }
  const result = await User.deleteOne({ _id: userId });

  return result;
};
