const { Router } = require("express");
const router = Router();

const collectionDAO = require('../daos/cardCollection');

router.post("/", async (req, res, next) => {
    if(req.body) {
        try {
            const collection = await collectionDAO.createCardCollection(req.body);
            res.json(collection);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;