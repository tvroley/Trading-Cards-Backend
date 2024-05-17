const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");

module.exports = {};

module.exports.handleError = async (err, req, res, next) => {
  if(err instanceof BadDataError) {
    res.status(404).send(err.message);
  } else if(err instanceof InvalidMongooseId) {
    res.status(400).send(err.message);
  } else if(err instanceof DuplicateKeyError) {
    res.status(409).send(err.message);
  } else {
    res.status(500).send(err.message);
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;
class DuplicateKeyError extends Error {};
module.exports.DuplicateKeyError = DuplicateKeyError;
class InvalidMongooseId extends Error {};
module.exports.InvalidMongooseId = InvalidMongooseId;