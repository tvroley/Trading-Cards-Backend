const { Router } = require("express");
const cors = require("cors");
const router = Router();

const middleware = require("../middleware/authenticate");
const { handleError } = require("../middleware/errors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://my-cards-2e97d.web.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg =
        "The CORS policy for this site does not " +
        "allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

router.use(cors(corsOptions));

router.use("/auth", require("./auth"));
router.use(middleware.isAuthenticated);
router.use("/cards", require("./cards"));
router.use("/collections", require("./collections"));
router.use(handleError);

module.exports = router;
