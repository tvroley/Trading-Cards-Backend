const { Router } = require("express");
const router = Router();
const errors = require('../middleware/errors');

const collectionDAO = require('../daos/cardCollection');

router.get("/", async (req, res, next) => {
    const ownerName = req.body.ownerName;
    const title = req.body.title;
    const userId = req.user._id;
    const roles = req.user.roles;
    
    if(ownerName && title) {
        try {
            const collection = await collectionDAO.getCollectionByOwnerAndTitle(title, ownerName);
            if(collection) {
                if(collection.owner.toString() === userId || roles.includes('admin')) {
                    res.json({collection: collection});
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.status(404).send("could not find collection");
            }
        } catch(err) {
            next(err);
        }
    } else if(ownerName) {
        try {
            const collections = await collectionDAO.getCardCollectionsForUser(ownerName, userId);
            if(collections && collections.length > 0) {
                if (collections[0].owner.toString() === userId || roles.includes('admin')) {
                    res.json({collections: collections});
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.status(404).send("could not find any collections for user");
            }
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);        
    }
});

router.get("/:id", async (req, res, next) => {
    const collectionId = req.params.id;
    const userId = req.user._id;
    const roles = req.user.roles;
    
    try {
        const collection = await collectionDAO.getCardCollection(collectionId);
        if(collection) {
            if(collection.owner.toString() === userId || roles.includes('admin')) {
                res.json({collection: collection});
            } else {
                res.status(401).send(`not authorized to view collection`);    
            }
        } else {
            res.status(404).send(`collection not found`);
        }
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
            res.json({collection: collection});
        } catch(err) {
            next(err);
        }
    } else {
        res.status(400).send('missing collection title');
    }
});

router.post("/:id", async (req, res, next) => {
    const collectionId = req.params.id;
    const cardId = req.body.cardId;
    const userId = req.user._id;
    const roles = req.user.roles;

    if(cardId && collectionId) {
        try {
            await collectionDAO.addCardToCollection(collectionId, cardId, userId, roles);
            res.sendStatus(200);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

router.put("/:id", async (req, res, next) => {
    const collectionId = req.params.id;
    const collectionTitle = req.body.collectionTitle;
    const userId = req.user._id;
    const username = req.user.username;

    if(collectionId) {
        try {
            const result = await collectionDAO.updateCardCollectionTitle(collectionId, userId, username, collectionTitle);
            res.json(result);
        } catch(err) {
            if(err.message.includes(`write permission`)) {
                res.status(401).send(err.message);
            } else if(err.message.includes(`did not find`)) {
                res.status(404).send(err.message);
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

    if(collectionId) {
        try {
            const collection = await collectionDAO.getCardCollection(collectionId);
            const roles = req.user.roles;
            const userId = req.user._id;
            const username = req.user.username;
            
            if(collection) {
                if(roles.includes('admin') || (userId === collection.owner.toString() && collection.title !== username)) {
                    const collection = await collectionDAO.removeCardCollection(collectionId);
                    res.json(collection);
                } else {
                    if(collection.title === username) {
                        res.sendStatus(409);
                    } else {
                        res.status(401).send(`no permission to delete collection`);
                    }
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