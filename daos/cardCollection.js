const mongoose = require("mongoose");

const Card = require("../models/tradingCard");
const CardCollection = require("../models/cardCollection");
const User = require("../models/user");
const CollectionForCard = require("../models/collectionForCard");
const errors = require("../middleware/errors");

module.exports = {};

module.exports.createCardCollection = async (collectionTitle, userId) => {
  const cardCollectionObj = { title: collectionTitle, owner: userId };
  try {
    return await CardCollection.create(cardCollectionObj);
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      throw new errors.DuplicateKeyError(err.message);
    } else {
      throw err;
    }
  }
};

module.exports.addCardToCollection = async (
  collectionId,
  cardId,
  userId,
  roles,
) => {
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid card ID");
  }

  try {
    const cardCollection = await CardCollection.findOne({ _id: collectionId });
    if (!cardCollection) {
      throw new errors.BadDataError("did not find card collection");
    }
    if (cardCollection.owner.toString() === userId || roles.includes("admin")) {
      return await CollectionForCard.create({
        tradingCard: cardId,
        cardCollection: collectionId,
      });
    } else {
      throw new errors.BadDataError(
        "user does not have write permissions for this collection",
      );
    }
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      throw new errors.DuplicateKeyError(err.message);
    } else {
      throw err;
    }
  }
};

module.exports.updateCardCollectionTitle = async (
  collectionId,
  userId,
  userName,
  collectionTitle,
  roles,
) => {
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new errors.InvalidMongooseId("Invalid user ID");
  }

  try {
    const cardCollection = await CardCollection.findOne({ _id: collectionId });

    if (!cardCollection) {
      throw new errors.BadDataError("did not find card collection");
    }
    if (
      (cardCollection.owner.toString() === userId &&
        cardCollection.title !== userName) ||
      roles.includes("admin")
    ) {
      return await CardCollection.updateOne(
        { _id: collectionId },
        { $set: { title: collectionTitle } },
      );
    } else {
      throw new errors.BadDataError(
        "user does not have write permissions for this collection",
      );
    }
  } catch (err) {
    if (err.message.includes("validation failed")) {
      throw new errors.BadDataError(err.message);
    } else {
      throw err;
    }
  }
};

module.exports.getCardCollection = async (cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  return await CardCollection.findOne({ _id: cardCollectionId });
};

module.exports.getCardsInCollection = async (cardCollectionId, sortBy) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  const aggArray = [
    {
      $match: { cardCollection: new mongoose.Types.ObjectId(cardCollectionId) },
    },
    {
      $lookup: {
        from: "tradingcards",
        localField: "tradingCard",
        foreignField: "_id",
        as: "tradingCard",
      },
    },
    { $project: { tradingCard: { $first: "$tradingCard" }, _id: 0 } },
    {
      $project: {
        _id: "$tradingCard._id",
        year: "$tradingCard.year",
        brand: "$tradingCard.brand",
        cardNumber: "$tradingCard.cardNumber",
        cardSet: "$tradingCard.cardSet",
        subject: "$tradingCard.subject",
        variety: "$tradingCard.variety",
        gradingCompany: "$tradingCard.gradingCompany",
        grade: "$tradingCard.grade",
        certificationNumber: "$tradingCard.certificationNumber",
        frontCardImageLink: "$tradingCard.frontCardImageLink",
        backCardImageLink: "$tradingCard.backCardImageLink",
        sold: "$tradingCard.sold",
      },
    },
  ];

  if (sortBy === "cert") {
    aggArray.push({ $sort: { gradingCompany: 1, certificationNumber: 1 } });
  } else if (sortBy === "year") {
    aggArray.push({
      $sort: { year: 1, brand: 1, cardSet: 1, cardNumber: 1, _id: 1 },
    });
  } else if (sortBy === "subject") {
    aggArray.push({
      $sort: {
        subject: 1,
        year: 1,
        brand: 1,
        cardSet: 1,
        cardNumber: 1,
        _id: 1,
      },
    });
  } else if (sortBy === "brand") {
    aggArray.push({
      $sort: { brand: 1, year: 1, cardSet: 1, cardNumber: 1, _id: 1 },
    });
  } else if (sortBy === "cardSet") {
    aggArray.push({
      $sort: { cardSet: 1, year: 1, cardNumber: 1, brand: 1, _id: 1 },
    });
  } else if (sortBy === "sold") {
    aggArray.push({
      $sort: { sold: -1, year: 1, brand: 1, cardSet: 1, cardNumber: 1, _id: 1 },
    });
  }

  return await CollectionForCard.aggregate(aggArray);
};

module.exports.searchForCardInCollection = async (cardCollectionId, query) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  const aggArray = [
    {
      $match: {
        $text: { $search: query }
      }
    },
    {
      $sort: {
        score: { $meta: "textScore" }
      }
    },
    {
      $lookup: {
        from: "collectionforcards",
        localField: "_id",
        foreignField: "tradingCard",
        as: "collect",
      },
    },
    { $unwind: "$collect" },
    {
      $project: {
        collectionId: "$collect.cardCollection",
        subject: true,
        year: true,
        cardSet: true,
        brand: true,
        variety: true,
        certificationNumber: true,
        gradingCompany: true,
        cardNumber: true,
        score: { $meta: "textScore" },
      },
    },
    {
      $match: { collectionId: new mongoose.Types.ObjectId(cardCollectionId) },
    },
  ];

  return await Card.aggregate(aggArray);
};

module.exports.getCardCollectionsForUser = async (ownerName) => {
  const results = await User.aggregate([
    { $match: { username: ownerName } },
    {
      $lookup: {
        from: "cardcollections",
        localField: "_id",
        foreignField: "owner",
        as: "collections",
      },
    },
  ]);
  if (results && results[0]) {
    const cardCollections = results[0].collections;
    if (cardCollections) {
      return cardCollections;
    }
  }
};

module.exports.getCollectionByOwnerAndTitle = async (title, ownerName) => {
  const results = await User.aggregate([
    {
      $match: { username: ownerName },
    },
    {
      $lookup: {
        from: "cardcollections",
        localField: "_id",
        foreignField: "owner",
        as: "collection",
      },
    },
    { $unwind: "$collection" },
    {
      $project: {
        _id: "$collection._id",
        title: "$collection.title",
        owner: "$collection.owner",
        __v: "$collection.__v",
      },
    },
    {
      $match: { title: title },
    },
  ]);
  if (results && results[0] && Object.keys(results[0]).length > 0) {
    const cardCollection = results[0];
    return cardCollection;
  } else {
    throw new errors.BadDataError("did not find card collection");
  }
};

module.exports.removeCardCollection = async (cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  await CollectionForCard.deleteMany({ cardCollection: cardCollectionId });
  return await CardCollection.deleteOne({ _id: cardCollectionId });
};

module.exports.searchCollections = async (query) => {
  return await CardCollection.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .lean();
};
