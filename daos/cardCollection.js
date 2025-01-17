const mongoose = require("mongoose");

const Card = require("../models/tradingCard");
const CardCollection = require("../models/cardCollection");
const User = require("../models/user");
const CollectionForCard = require("../models/collectionForCard");
const errors = require("../middleware/errors");
const tradingCard = require("../models/tradingCard");

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

module.exports.getAllCardCollections = async () => {
  const aggArray = [
    {
      $match: {},
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    { $project: { user: { $first: "$user" }, _id: 1, title: 1 } },
    {
      $project: {
        ownerName: "$user.username",
        _id: 1,
        title: 1,
      },
    },
    {
      $sort: { ownerName: 1, title: 1 },
    },
  ];

  return await CardCollection.aggregate(aggArray);
};

module.exports.getCardsInCollection = async (
  cardCollectionId,
  sortBy,
  ascDesc,
) => {
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

  let ascNumber = 1;
  if (ascDesc === "DESC") {
    ascNumber = -1;
  }

  if (sortBy === "cert") {
    aggArray.push({
      $sort: { gradingCompany: ascNumber, certificationNumber: ascNumber },
    });
  } else if (sortBy === "year") {
    aggArray.push({
      $sort: { year: ascNumber, brand: 1, cardSet: 1, cardNumber: 1, _id: 1 },
    });
  } else if (sortBy === "subject") {
    aggArray.push({
      $sort: {
        subject: ascNumber,
        year: 1,
        brand: 1,
        cardSet: 1,
        cardNumber: 1,
        _id: 1,
      },
    });
  } else if (sortBy === "brand") {
    aggArray.push({
      $sort: { brand: ascNumber, year: 1, cardSet: 1, cardNumber: 1, _id: 1 },
    });
  } else if (sortBy === "cardSet") {
    aggArray.push({
      $sort: { cardSet: ascNumber, year: 1, cardNumber: 1, brand: 1, _id: 1 },
    });
  } else if (sortBy === "sold") {
    aggArray.push({
      $sort: {
        sold: ascNumber,
        year: 1,
        brand: 1,
        cardSet: 1,
        cardNumber: 1,
        _id: 1,
      },
    });
  }

  return await CollectionForCard.aggregate(aggArray);
};

module.exports.countCardsInCollection = async (cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  return await CollectionForCard.countDocuments({
    cardCollection: new mongoose.Types.ObjectId(cardCollectionId),
  });
};

module.exports.countCollectionsForUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new errors.InvalidMongooseId("Invalid user ID");
  }

  return await CardCollection.countDocuments({
    owner: new mongoose.Types.ObjectId(userId),
  });
};

module.exports.getCollectionsForCard = async (cardId) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid card ID");
  }

  const aggArray = [
    {
      $match: { tradingCard: new mongoose.Types.ObjectId(cardId) },
    },
    {
      $lookup: {
        from: "cardcollections",
        localField: "cardCollection",
        foreignField: "_id",
        as: "collect",
      },
    },
    { $project: { collect: { $first: "$collect" } } },
    {
      $project: {
        _id: "$collect._id",
        title: "$collect.title",
        owner: "$collect.owner",
      },
    },
  ];

  return await CollectionForCard.aggregate(aggArray);
};

module.exports.searchForCardInCollection = async (cardCollectionId, query) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  const aggArray = [
    {
      $match: {
        $text: { $search: query },
      },
    },
    {
      $sort: {
        score: { $meta: "textScore" },
      },
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
        grade: true,
        frontCardImageLink: true,
        backCardImageLink: true,
        sold: true,
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

module.exports.removeCardFromCollection = async (cardId, cardCollectionId) => {
  if (!mongoose.Types.ObjectId.isValid(cardCollectionId)) {
    throw new errors.InvalidMongooseId("Invalid card collection ID");
  }

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new errors.InvalidMongooseId("Invalid card ID");
  }

  return await CollectionForCard.deleteOne({
    cardCollection: cardCollectionId,
    tradingCard: cardId,
  });
};

module.exports.searchCollections = async (query) => {
  const aggArray = [
    {
      $match: {
        $text: { $search: query },
      },
    },
    {
      $sort: {
        score: { $meta: "textScore" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        title: true,
        owner: true,
        _id: true,
        ownerName: "$user.username",
        score: { $meta: "textScore" },
      },
    },
  ];

  return await CardCollection.aggregate(aggArray);
};

module.exports.resetDemoCollection = async () => {
  try {
    const grandpaCollection = await module.exports.getCollectionByOwnerAndTitle(
      "grandpa",
      "grandpa",
    );
    const grandpaCollectionId = grandpaCollection._id;
    const uncleCollection = await module.exports.getCollectionByOwnerAndTitle(
      "uncle",
      "uncle",
    );
    const uncleCollectionId = uncleCollection._id;
    const demoCollection = await module.exports.getCollectionByOwnerAndTitle(
      "demo",
      "demo",
    );
    const demoCollectionId = demoCollection._id;
    const grandpaCards =
      await module.exports.getCardsInCollection(grandpaCollectionId);
    const uncleCards =
      await module.exports.getCardsInCollection(uncleCollectionId);
    const allDemoCards = [];
    await CollectionForCard.deleteMany({ cardCollection: demoCollectionId });
    await Card.deleteMany({ certificationNumber: /DEMO/ });
    grandpaCards.map((card) => {
      const demoCard = {
        year: card.year,
        brand: card.brand,
        cardSet: card.cardSet,
        subject: card.subject,
        gradingCompany: card.gradingCompany,
        grade: card.grade,
        certificationNumber: card.certificationNumber + "DEMO",
        frontCardImageLink: card.frontCardImageLink,
        backCardImageLink: card.backCardImageLink,
        sold: card.sold,
      };
      allDemoCards.push(demoCard);
    });
    uncleCards.map((card) => {
      const demoCard = {
        year: card.year,
        brand: card.brand,
        cardSet: card.cardSet,
        subject: card.subject,
        gradingCompany: card.gradingCompany,
        grade: card.grade,
        certificationNumber: card.certificationNumber + "DEMO",
        frontCardImageLink: card.frontCardImageLink,
        backCardImageLink: card.backCardImageLink,
        sold: card.sold,
      };
      allDemoCards.push(demoCard);
    });
    const resultCards = await Card.insertMany(allDemoCards);
    const collectionEntries = [];
    resultCards.map((card) => {
      const collectionEntry = {
        tradingCard: card._id,
        cardCollection: demoCollectionId,
      };
      collectionEntries.push(collectionEntry);
    });
    const resultCollectionEntries =
      await CollectionForCard.insertMany(collectionEntries);

    const result = {
      resultCards: resultCards,
      resultCollectionEntries: resultCollectionEntries,
    };
    return result;
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      throw new errors.DuplicateKeyError(err.message);
    } else {
      throw err;
    }
  }
};

module.exports.removeDemoCollection = async () => {
  try {
    const demoCollection = await module.exports.getCollectionByOwnerAndTitle(
      "demo",
      "demo",
    );
    let result;
    if (demoCollection) {
      const demoCollectionId = demoCollection._id;
      result = await CollectionForCard.deleteMany({
        cardCollection: demoCollectionId,
      });
      await Card.deleteMany({ certificationNumber: /DEMO/ });
    }

    return result;
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      throw new errors.DuplicateKeyError(err.message);
    } else {
      throw err;
    }
  }
};

module.exports.findCollectionForCardWithNoCard = async () => {
  const collectForCards = await CollectionForCard.find();
  const ghosts = [];
  collectForCards.map(async (collectForCard) => {
    const card = await Card.find({ _id: collectForCard.tradingCard });
    if (!card.hasOwnProperty("year")) {
      ghosts.push(collectForCard.tradingCard);
    }
  });

  return ghosts;
};

module.exports.deleteAllCardsAndCollectionsForUser = async (userId) => {
  const userCollections = await CardCollection.find({ owner: userId });
  let collectionsForCards;
  userCollections.map(async (userCollection) => {
    collectionsForCards = await CollectionForCard.find({
      cardCollection: userCollection._id,
    });
    collectionsForCards.map(async (userCollectionForCard) => {
      const card = userCollectionForCard.tradingCard;
      await tradingCard.deleteOne({ _id: card });
      await CollectionForCard.deleteOne({ _id: userCollectionForCard._id });
    });
    await CardCollection.deleteOne({ _id: userCollection._id });
  });

  return true;
};
