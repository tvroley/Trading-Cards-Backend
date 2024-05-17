const mongoose = require('mongoose');

const Card = require('../models/tradingCard');
const errors = require('../middleware/errors');

module.exports = {};

module.exports.createCard = async (cardObj) => {
    try{
      return await Card.create(cardObj);
    } catch(err) {
      if (err.message.includes('validation failed')) {
        throw new errors.BadDataError(err.message);
      } else {
        throw err;
      }
    }
}

module.exports.getCard = async (cardId) => {
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        throw new errors.InvalidMongooseId("Invalid trading card ID");
    }

    return await Card.findOne({_id: cardId});
}

module.exports.getCardByCert = async (company, cert) => {
    return await Card.findOne({gradingCompany: company, certificationNumber: cert});
}

module.exports.updateItem = async (cardId, cardObj) => {
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        throw new errors.InvalidMongooseId("Invalid trading card ID");
    }
    const myObj = {_id: cardId, year: cardObj.year, brand: cardObj.brand, cardNumber: cardObj.cardNumber, 
        cardSet: cardObj.cardSet, subject: cardObj.subject, variety: cardObj.variety,
        gradingCompany: cardObj.gradingCompany, grade: cardObj.grade, certificationNumber: cardObj.certificationNumber,
        frontCardImageLink: cardObj.frontCardImageLink, backCardImageLink: cardObj.backCardImageLink,
        sold: cardObj.sold 
    };
    
    return await Item.updateOne({ _id: cardId }, myObj);
}