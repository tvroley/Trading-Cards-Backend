const mongoose = require('mongoose');

const User = require('../models/user');
const errors = require('../middleware/errors');
const CardCollection = require('../models/cardCollection');

module.exports = {};

module.exports.createUser = async (userObj) => {
  try {
    const user = await User.create(userObj);
    const userCollection = {title: user.username, owner: [user._id], tradingCards: [],
      readUsers: [user._id], writeUsers: [user._id]
    };
    const collection = await CardCollection.create(userCollection);
    return user;
  } catch(err) {
    if (err.message.includes('duplicate key')) {
      throw new errors.DuplicateKeyError(err.message);
    } else if (err.message.includes('validation failed')) {
      throw new errors.BadDataError(err.message);
    } else {
      throw err;
    }
  }
      
}

module.exports.getUser = async (username) => {
    let storedUser;
    await User.findOne({ username: username }).lean().then(
        (docs) => {
            storedUser = docs;
        }).catch((err) => {
            if (err.message.includes('validation failed')) {
                throw new errors.BadDataError(err.message);
            }
            throw err;        
        }
    );

    return storedUser;
}

module.exports.updateUserPassword = async (userId, username, password, roles) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new errors.InvalidMongooseId("Invalid user ID");
    }
    const myUser = {_id: userId, password: password, username: username, roles: roles};
    await User.updateOne({ _id: userId }, myUser);
    
    return true;
}