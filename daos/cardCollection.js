const mongoose = require("mongoose");

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
  } else if (sortBy === "player") {
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

module.exports.getCardCollectionsForUser = async (ownerName) => {
  try {
    const ownerUser = await User.findOne({ username: ownerName });
    if (!ownerUser) {
      throw new errors.BadDataError("could not find collection owner");
    }
    const cardCollections = await CardCollection.find({ owner: ownerUser._id });

    return cardCollections;
  } catch (err) {
    throw err;
  }
};

module.exports.getCollectionByOwnerAndTitle = async (title, ownerName) => {
  try {
    const user = await User.findOne({ username: ownerName });
    if (!user) {
      throw new errors.BadDataError("did not find owner");
    }
    const cardCollection = await CardCollection.findOne({
      title: title,
      owner: user._id,
    });

    if (cardCollection) {
      return cardCollection;
    } else {
      throw new errors.BadDataError("did not find card collection");
    }
  } catch (err) {
    throw err;
  }
};

module.exports.removeCardCollection = async (cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  await CollectionForCard.deleteMany({ cardCollection: cardCollectionId });
  return await CardCollection.deleteOne({ _id: cardCollectionId });
};
