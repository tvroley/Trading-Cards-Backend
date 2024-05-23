const mongoose = require('mongoose');

const CardCollection = require('../models/cardCollection');
const User = require('../models/user');
const errors = require('../middleware/errors');

module.exports = {};

module.exports.createCardCollection = async (collectionTitle, userId) => {
    const cardCollectionObj = {title: collectionTitle, owner: userId, tradingCards: [],
      readUsers: [userId], writeUsers: [userId]
    };
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

module.exports.addCardToCollection = async (collectionId, cardId) => {
  try{
    const cardCollection = await CardCollection.findOne({_id: collectionId});
    const cards = cardCollection.tradingCards;
    if(!cards.includes(cardId)) {
      cards.push(cardId);
      cardCollection.tradingCards = cards;
      await CardCollection.updateOne({_id: collectionId}, cardCollection);
    } else {
      throw new errors.BadDataError(`card is already in collection`);
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

module.exports.getCardCollectionsForUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  return await CardCollection.find({owner: userId});
}

module.exports.getCollectionByOwnerAndTitle = async (title, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new errors.InvalidMongooseId("Invalid owner ID");
  }

  return await CardCollection.findOne({title: title, owner: ownerId});
}

module.exports.removeCardCollection = async (cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
      throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  return await CardCollection.deleteOne({_id: cardCollectionId});
}