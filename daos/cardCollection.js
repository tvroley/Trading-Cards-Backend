const mongoose = require('mongoose');

const CardCollection = require('../models/cardCollection');
const errors = require('../middleware/errors');

module.exports = {};

module.exports.createCardCollection = async (cardCollectionObj) => {
    try{
      return await CardCollection.create(cardCollectionObj);
    } catch(err) {
      if (err.message.includes('validation failed')) {
        throw new errors.BadDataError(err.message);
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
      return await CardCollection.updateOne({_id: collectionId}, cardCollection);
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
        throw new errors.InvalidMongooseId("Invalid trading card ID");
    }

    return await CardCollection.findOne({_id: cardCollectionId});
}

module.exports.getCollectionByOwnerAndTitle = async (title, owner) => {
    return await CardCollection.findOne({title: title, owner: owner});
}