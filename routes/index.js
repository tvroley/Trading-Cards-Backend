const { Router } = require("express");
const router = Router();

router.use("/auth", require('./auth'));
router.use("/cards", require('./cards'));

module.exports = router;