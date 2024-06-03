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
      const mainCollection = await collectionDAO.getCollectionByOwnerAndTitle(
        req.user.username,
        req.user.username,
      );
      await collectionDAO.addCardToCollection(
        mainCollection._id,
        card._id,
        userId,
      );
      res.json({ card: card });
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
      if (card) {
        if (result.modifiedCount === 0) {
          res.status(404).send("card not found");
        } else {
          res.json(result);
        }
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
  const cardId = req.params.id;
  const roles = req.user.roles;
  if (roles.includes(`admin`)) {
    try {
      const cards = await cardsDAO.getAllCards();
      if (cards) {
        res.json({ cards: cards });
      } else {
        res.status(404).send("no cards not found");
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.sendStatus(401);
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
