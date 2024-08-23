const { Router } = require("express");
const router = Router();

const cardsDAO = require("../daos/tradingCard");
const collectionDAO = require("../daos/cardCollection");
const errors = require("../middleware/errors");

router.post("/", async (req, res, next) => {
  const userId = req.user._id;
  if (req.body) {
    try {
      const card = await cardsDAO.createCard(req.body);
      if (!card) {
        res.status(400).send(`no card created`);
      } else {
        const mainCollection = await collectionDAO.getCollectionByOwnerAndTitle(
          req.user.username,
          req.user.username,
        );
        if (!mainCollection) {
          res.status(400).send(`could not find base collection for user`);
        } else {
          const collectionForCard = await collectionDAO.addCardToCollection(
            mainCollection._id,
            card._id,
            userId,
          );
          if (!collectionForCard) {
            res.status(400).send(`could not add new card to base collection`);
          } else {
            res.json({ card: card });
          }
        }
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send(`no request body`);
  }
});

router.put("/:id", async (req, res, next) => {
  const cardId = req.params.id;
  const card = req.body;
  const userId = req.user._id;
  const roles = req.user.roles;

  if (cardId && card && Object.keys(card).length !== 0) {
    try {
      const result = await cardsDAO.updateCard(cardId, card, userId, roles);
      if (result) {
        if (result.modifiedCount === 0) {
          res.status(404).send("card not found");
        } else {
          res.json(result);
        }
      } else {
        res.status(404).send("card not found");
      }
    } catch (err) {
      if (err.message.includes(`write permission`)) {
        res.status(401).send(err.message);
      } else {
        next(err);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const cards = await cardsDAO.getAllCards();
    if (cards) {
      res.json({ cards: cards });
    } else {
      res.status(404).send("no cards found");
    }
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  const search = req.query.search;
  if (search.trim().length !== 0) {
    try {
      const results = await cardsDAO.search(search);
      if (results && results.length !== 0) {
        res.json({ cards: results });
      } else {
        res.status(404).send("no cards found");
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send("empty search query");
  }
});

router.get("/:id", async (req, res, next) => {
  const cardId = req.params.id;
  const userId = req.user._id;

  if (cardId) {
    try {
      const card = await cardsDAO.getCard(cardId, userId);

      if (card) {
        res.json({ card: card });
      } else {
        res.status(404).send("card not found");
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.sendStatus(400);
  }
});

router.delete("/:id", async (req, res, next) => {
  const cardId = req.params.id;
  const userId = req.user._id;
  const roles = req.user.roles;

  try {
    const result = await cardsDAO.deleteCard(cardId, userId, roles);
    if (result) {
      if (result.deletedCount === 0) {
        res.status(404).send("card not found");
      } else {
        res.json(result);
      }
    } else {
      res.status(404).send("card not found");
    }
  } catch (err) {
    if (err.message.includes("permission")) {
      res.status(401).send(err.message);
    } else {
      next(err);
    }
  }
});

module.exports = router;
