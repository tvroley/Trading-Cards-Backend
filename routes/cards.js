const { Router } = require("express");
const router = Router();

const cardsDAO = require('../daos/tradingCard');

router.post("/", async (req, res, next) => {
    if(req.body) {
        try {
            const card = await cardsDAO.createCard(req.body);
            res.json(card);
        } catch(err) {
            next(err);
        }
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;