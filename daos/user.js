const mongoose = require('mongoose');

const User = require('../models/user');
const errors = require('../middleware/errors');

module.exports = {};

module.exports.createUser = async (userObj) => {
    await User.create(userObj).catch((err) => {
      if (err.message.includes('duplicate key')) {
        throw new errors.DuplicateKeyError(err.message);
      } else if (err.message.includes('validation failed')) {
        throw new errors.BadDataError(err.message);
      } else {
        throw err;
      }
    });
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

module.exports.updateUserPassword = async (userId, password) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new errors.InvalidMongooseId("Invalid user ID");
    }
    const newObj = {_id: userId, password: password};
    await User.updateOne({ _id: userId }, newObj);
    
    return true;
}