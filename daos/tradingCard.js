const mongoose = require("mongoose");

const Card = require("../models/tradingCard");
const CardCollection = require("../models/cardCollection");
const CollectionForCard = require("../models/collectionForCard");
const errors = require("../middleware/errors");

module.exports = {};

module.exports.createCard = async (cardObj) => {
  try {
    return await Card.create(cardObj);
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

module.exports.getCard = async (cardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid trading card ID");
  }

  return await Card.findOne({ _id: cardId });
};

module.exports.getAllCards = async () => {
  return await Card.find();
};

module.exports.getCardByCert = async (company, cert) => {
  return await Card.findOne({
    gradingCompany: company,
    certificationNumber: cert,
  });
};

module.exports.updateCard = async (cardId, cardObj, userId, roles) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid trading card ID");
  }

  if (roles.includes("admin")) {
    return await Card.updateOne({ _id: cardId }, cardObj);
  } else {
    const results = await CollectionForCard.aggregate([
      { $match: { tradingCard: new mongoose.Types.ObjectId(cardId) } },
      {
        $lookup: {
          from: "cardcollections",
          localField: "cardCollection",
          foreignField: "_id",
          as: "collection",
        },
      },
      { $project: { collection: { $first: "$collection" }, _id: 0 } },
      {
        $project: {
          _id: "$collection._id",
          owner: "$collection.owner",
          title: "$collection.title",
        },
      },
    ]);

    if (results && results[0] && results[0].owner) {
      const owner = results[0].owner;
      if (owner.toString() === userId) {
        return await Card.updateOne({ _id: cardId }, cardObj);
      } else {
        throw new errors.BadDataError(
          "user does not have write permissions for card",
        );
      }
    }
  }
};

module.exports.deleteCard = async (cardId, userId, roles) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid trading card ID");
  }

  if (roles.includes("admin")) {
    await CollectionForCard.deleteMany({ tradingCard: cardId });
    return await Card.deleteOne({ _id: cardId });
  } else {
    const results = await CollectionForCard.aggregate([
      { $match: { tradingCard: new mongoose.Types.ObjectId(cardId) } },
      {
        $lookup: {
          from: "cardcollections",
          localField: "cardCollection",
          foreignField: "_id",
          as: "collection",
        },
      },
      { $project: { collection: { $first: "$collection" }, _id: 0 } },
      {
        $project: {
          _id: "$collection._id",
          owner: "$collection.owner",
          title: "$collection.title",
        },
      },
    ]);
    if (results && results[0] && results[0].owner) {
      const owner = results[0].owner;
      if (owner.toString() === userId) {
        await CollectionForCard.deleteMany({ tradingCard: cardId });
        return await Card.deleteOne({ _id: cardId });
      } else {
        throw new errors.BadDataError(
          "user does not have write permissions for card",
        );
      }
    }
  }
};

module.exports.search = async (query) => {
  return await Card.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .lean();
};
