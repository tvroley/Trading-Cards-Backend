const { Router } = require("express");
const router = Router();
const errors = require('../middleware/errors');

const collectionDAO = require('../daos/cardCollection');

router.get("/", async (req, res, next) => {
    const owner = req.body.owner;
    const title = req.body.title;
    
    if(owner && title) {
        try {
            const collection = await collectionDAO.getCollectionByOwnerAndTitle(title, owner);
            res.json(collection);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);        
    }
});

router.get("/:id", async (req, res, next) => {
    const collectionId = req.params.id;
    
    try {
        const collection = await collectionDAO.getCardCollection(collectionId);
        res.json(collection);
    } catch(err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    const title = req.body.collectionTitle;
    const userId = req.user._id;
    if(title && userId) {
        try {
            const collection = await collectionDAO.createCardCollection(title, userId);
            res.json(collection);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

router.post("/:id", async (req, res, next) => {
    const collectionId = req.params.id;
    const cardId = req.body.cardId;

    if(cardId && collectionId) {
        try {
            const collection = await collectionDAO.addCardToCollection(collectionId, cardId);
            res.json(collection);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

router.delete("/:id", async (req, res, next) => {
    const collectionId = req.params.id;

    if(collectionId) {
        try {
            const collection = await collectionDAO.getCardCollection(collectionId);
            const roles = req.user.roles;
            const userId = req.user._id;
            
            if(collection) {
                if(userId === collection.owner || roles.includes('admin')) {
                    const collection = await collectionDAO.removeCardCollection(collectionId);
                    res.json(collection);
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.status(404).send("collection not found");
            }
        } catch(err) {
            if(err instanceof errors.InvalidMongooseId) {
                res.status(404).send(err.message);
            } else {
                next(err);
            }
        }
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;