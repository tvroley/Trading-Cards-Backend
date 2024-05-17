const { Router } = require("express");
const router = Router();

router.use("/auth", require('./auth'));
router.use("/cards", require('./cards'));
router.use("/collections", require('./collections'));

module.exports = router;