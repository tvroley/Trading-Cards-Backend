const { Router } = require("express");
const router = Router();

const cardsDAO = require('../daos/tradingCard');
const collectionDAO = require('../daos/cardCollection');
const userDAO = require('../daos/user');

router.post("/", async (req, res, next) => {
    if(req.body) {
        try {
            const card = await cardsDAO.createCard(req.body);
            const user = await userDAO.getUser(req.user.username);
            const mainCollection = await collectionDAO.getCollectionByOwnerAndTitle(req.user.username, user._id);
            await collectionDAO.addCardToCollection(mainCollection._id, card._id);
            res.json(card);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

router.put("/:id", async (req, res, next) => {
    const cardId = req.params.id;
    const card = req.body;
    if(cardId && card) {
        try {
            const updatedCard = await cardsDAO.updateCard(cardId, card);
            if(card) {
                res.json(updatedCard);
            } else {
                res.status(404).send("card not found");
            }
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

router.get("/", async (req, res, next) => {
    const cardId = req.params.id;
    const roles = req.user.roles;
    if(roles.includes(`admin`)) {
        try {
            const cards = await cardsDAO.getAllCards();
            if(cards) {
                res.json({cards: cards});
            } else {
                res.status(404).send("no cards not found");
            }
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(401);
    }
});

router.get("/:id", async (req, res, next) => {
    const cardId = req.params.id;
    if(cardId) {
        try {
            const card = await cardsDAO.getCard(cardId);
            if(card) {
                res.json({card: card});
            } else {
                res.status(404).send("card not found");
            }
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

router.delete("/:id", async (req, res, next) => {
    const cardId = req.params.id;
    try {
        const card = await cardsDAO.deleteCard(cardId);
        if(card) {
            res.json(card);
        } else {
            res.status(404).send("card not found");
        }
    } catch(err) {
        next(err);
    }
});

module.exports = router;