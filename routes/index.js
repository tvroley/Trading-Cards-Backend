const { Router } = require("express");
const router = Router();

const middleware = require("../middleware/authenticate");
const { handleError } = require("../middleware/errors");

router.use("/auth", require("./auth"));
router.use(middleware.isAuthenticated);
router.use("/cards", require("./cards"));
router.use("/collections", require("./collections"));
router.use(handleError);

module.exports = router;
