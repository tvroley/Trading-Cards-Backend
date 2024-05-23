const { Router } = require("express");
const router = Router();
const errors = require('./errors');
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

module.exports = {};

module.exports.isAuthenticated = async (req, res, next) => {
    if(req.headers.authorization && req.headers.authorization.indexOf('Bearer ') === 0) {
      const tokenHeader = req.headers.authorization;
      const token = tokenHeader.split(' ')[1];
      if(!token || token.trim().length === 0) {
        res.status(401).send("empty token");
      }
      try {
        const decoded = jwt.verify(token, secret);
        if(decoded) {
            req.user = decoded;
            next();
        } else {
          res.status(401).send("invalid token");
        }
      } catch(err) {
        res.status(401).send(err.message); 
      }
    } else {
      res.status(401).send("invalid Authorization header");
    }
}