const { Router } = require("express");
const router = Router();
const errors = require("../middleware/errors");
const middleware = require("../middleware/authenticate");
const collectionDAO = require("../daos/cardCollection");

router.get("/", async (req, res, next) => {
  const ownerName = req.query.ownerName;
  const title = req.query.title;
  const getAll = req.query.getAll;

  if(getAll === "true") {
    const collections = await collectionDAO.getAllCardCollections();
    res.json({ collections: collections });
  } else if (String(ownerName).trim().length === 0) {
    res.status(400).send("empty collection owner name");
  } else if (String(title).trim().length === 0) {
    res.status(400).send("empty collection title name");
  } else if (ownerName && title) {
    try {
      const collection = await collectionDAO.getCollectionByOwnerAndTitle(
        title,
        ownerName,
      );
      if (collection) {
        res.json({ collection: collection });
      } else {
        res.status(404).send("could not find collection");
      }
    } catch (err) {
      if (err.message.includes("did not find")) {
        res.status(404).send(err.message);
      } else {
        next(err);
      }
    }
  } else if (ownerName && !title) {
    try {
      const collections =
        await collectionDAO.getCardCollectionsForUser(ownerName);
      if (collections && collections.length > 0) {
        res.json({ collections: collections });
      } else {
        res.status(404).send("could not find any collections for user");
      }
    } catch (err) {
      if (err.message.includes("could not find")) {
        res.status(404).send(err.message);
      } else {
        next(err);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

router.get("/search", async (req, res, next) => {
  const search = req.query.search;
  if (search.trim().length !== 0) {
    try {
      const results = await collectionDAO.searchCollections(search);
      if (results && results.length !== 0) {
        res.json({ collections: results });
      } else {
        res.status(404).send("no collections found");
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send("empty search query");
  }
});

router.get("/forcard/:id", async (req, res, next) => {
  const cardId = req.params.id;

  try {
    if (cardId) {
      const collections = await collectionDAO.getCollectionsForCard(cardId);
      if (collections) {
        res.json({ collections: collections });
      }
    }
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const collectionId = req.params.id;
  const verbose = req.query.verbose;
  const sortBy = req.query.sortBy;
  const query = req.query.search;

  try {
    if (collectionId && verbose === "true" && query) {
      const tradingCards = await collectionDAO.searchForCardInCollection(
        collectionId,
        query,
      );
      if (tradingCards) {
        res.json({ tradingCards: tradingCards });
      }
    } else if (collectionId && verbose === "true") {
      let tradingCards;
      if (!sortBy) {
        tradingCards = await collectionDAO.getCardsInCollection(
          collectionId,
          "year",
        );
      } else {
        tradingCards = await collectionDAO.getCardsInCollection(
          collectionId,
          sortBy,
        );
      }
      if (tradingCards) {
        res.json({ tradingCards: tradingCards });
      }
    } else if (collectionId) {
      const collection = await collectionDAO.getCardCollection(collectionId);
      if (collection) {
        res.json({ collection: collection });
      } else {
        res.status(404).send(`collection not found`);
      }
    }
  } catch (err) {
    next(err);
  }
});

router.use(middleware.isAuthenticated);

router.post("/", async (req, res, next) => {
  const title = req.body.collectionTitle;
  const userId = req.user._id;

  if (title && userId) {
    try {
      const collection = await collectionDAO.createCardCollection(
        title,
        userId,
      );
      res.json({ collection: collection });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send("missing data in request body");
  }
});

router.post("/:id", async (req, res, next) => {
  const collectionId = req.params.id;
  const cardId = req.body.cardId;
  const userId = req.user._id;
  const roles = req.user.roles;

  if (cardId && collectionId) {
    try {
      const collectionForCard = await collectionDAO.addCardToCollection(
        collectionId,
        cardId,
        userId,
        roles,
      );
      res.json({ collectionForCard: collectionForCard });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send("collection ID or card ID");
  }
});

router.put("/:id", async (req, res, next) => {
  const collectionId = req.params.id;
  const collectionTitle = req.body.collectionTitle;
  const userId = req.user._id;
  const username = req.user.username;
  const roles = req.user.roles;

  if (collectionId) {
    try {
      const result = await collectionDAO.updateCardCollectionTitle(
        collectionId,
        userId,
        username,
        collectionTitle,
        roles,
      );
      res.json(result);
    } catch (err) {
      if (err.message.includes(`write permission`)) {
        res.status(401).send(err.message);
      } else if (err.message.includes(`did not find`)) {
        res.status(404).send(err.message);
      } else {
        next(err);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

router.delete("/forcard/", async (req, res, next) => {
  const collectionId = req.query.collection;
  const cardId = req.query.card;
  const roles = req.user.roles;
  const userId = req.user._id;
  const username = req.user.username;

  if (collectionId && cardId) {
    try {
      const collection = await collectionDAO.getCardCollection(collectionId);

      if (collection) {
        if (
          roles.includes("admin") ||
          (userId === collection.owner.toString() &&
            collection.title !== username)
        ) {
          const result =
            await collectionDAO.removeCardFromCollection(cardId, collectionId);
          res.json(result);
        } else {
          if (collection.title === username) {
            res.sendStatus(409);
          } else {
            res.status(401).send(`no permission to delete collection`);
          }
        }
      } else {
        res.status(404).send("collection not found");
      }
    } catch (err) {
      if (err instanceof errors.InvalidMongooseId) {
        res.status(400).send(err.message);
      } else {
        next(err);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

router.delete("/:id", async (req, res, next) => {
  const collectionId = req.params.id;

  if (collectionId) {
    try {
      const collection = await collectionDAO.getCardCollection(collectionId);
      const roles = req.user.roles;
      const userId = req.user._id;
      const username = req.user.username;

      if (collection) {
        if (
          roles.includes("admin") ||
          (userId === collection.owner.toString() &&
            collection.title !== username)
        ) {
          const collection =
            await collectionDAO.removeCardCollection(collectionId);
          res.json(collection);
        } else {
          if (collection.title === username) {
            res.sendStatus(409);
          } else {
            res.status(401).send(`no permission to delete collection`);
          }
        }
      } else {
        res.status(404).send("collection not found");
      }
    } catch (err) {
      if (err instanceof errors.InvalidMongooseId) {
        res.status(400).send(err.message);
      } else {
        next(err);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
