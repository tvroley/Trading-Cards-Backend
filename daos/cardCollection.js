const mongoose = require('mongoose');

const CardCollection = require('../models/cardCollection');
const User = require('../models/user');
const CollectionForCard = require('../models/collectionForCard');
const errors = require('../middleware/errors');

module.exports = {};

module.exports.createCardCollection = async (collectionTitle, userId) => {
    const cardCollectionObj = {title: collectionTitle, owner: userId};
    try{
      return await CardCollection.create(cardCollectionObj);
    } catch(err) {
      if (err.message.includes('validation failed')) {
        throw new errors.BadDataError(err.message);
      } else if (err.message.includes('duplicate key')) {
        throw new errors.DuplicateKeyError(err.message);
      } else {
        throw err;
      }
    }
}

module.exports.addCardToCollection = async (collectionId, cardId, userId, roles) => {
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid card ID");
  }
  
  try {
    const cardCollection = await CardCollection.findOne({_id: collectionId});
    if(!cardCollection) {
      throw new errors.BadDataError('did not find card collection');
    }
    if(cardCollection.owner.toString() === userId || roles.includes('admin')) {
      return await CollectionForCard.create({tradingCard: cardId, cardCollection: collectionId});
    } else {
      throw new errors.BadDataError('user does not have write permissions for this collection');
    }
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

module.exports.updateCardCollectionTitle = async (collectionId, userId, userName, collectionTitle) => {
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new errors.InvalidMongooseId("Invalid user ID");
  }
  
  try {
    const cardCollection = await CardCollection.findOne({_id: collectionId});

    if(!cardCollection) {
      throw new errors.BadDataError('did not find card collection');
    }
    if(cardCollection.owner.toString() === userId && cardCollection.title !== userName) {
      return await CardCollection.updateOne({_id: collectionId}, {$set: {title: collectionTitle}});
    } else {
      throw new errors.BadDataError('user does not have write permissions for this collection');
    }
  } catch(err) {
    if (err.message.includes('validation failed')) {
      throw new errors.BadDataError(err.message);
    } else {
      throw err;
    }
  }
}

module.exports.getCardCollection = async (cardCollectionId) => {
    if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
        throw new errors.InvalidMongooseId("Invalid card collection ID");
    }

    return await CardCollection.findOne({_id: cardCollectionId});
}

module.exports.getCardCollectionsForUser = async (ownerName, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new errors.InvalidMongooseId("Invalid user ID");
  }

  try {
    const ownerUser = await User.findOne({username: ownerName});
    if(!ownerUser) {
      throw new errors.BadDataError('could not find collection owner');
    }
    const cardCollections = await CardCollection.find({owner: ownerUser._id});

    return cardCollections;
  } catch(err) {
    if (err.message.includes('validation failed')) {
      throw new errors.BadDataError(err.message);
    } else {
      throw err;
    }
  }
}

module.exports.getCollectionByOwnerAndTitle = async (title, ownerName) => {
  try {
    const user = await User.findOne({username: ownerName});
    if(!user) {
      throw new errors.BadDataError('did not find owner');
    }
    const cardCollection = await CardCollection.findOne({title: title, owner: user._id});

    if(cardCollection) {
      return cardCollection;
    } else {
      throw new errors.BadDataError('did not find card collection');
    }
  } catch(err) {
    throw err;
  }
}

module.exports.removeCardCollection = async (cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
      throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  await CollectionForCard.deleteMany({cardCollection: cardCollectionId});
  return await CardCollection.deleteOne({_id: cardCollectionId});
}