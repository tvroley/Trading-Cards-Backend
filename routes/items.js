const { Router } = require("express");
const router = Router();

const itemDAO = require('../daos/item');

router.post("/", async (req, res, next) => {
    const { name } = req.body;
    const item = await itemDAO.create(name);
    res.json(item);
});


router.get("/", async (req, res, next) => {
    const items = await itemDAO.getAll();
    if (items) {
        res.json(items);
    } else {
        res.sendStatus(404);
    }
})

router.get("/:id", async (req, res, next) => {
    const itemId = req.params.id;
    const item = await itemDAO.getById(itemId);
    if (item) {
        res.json(item);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;