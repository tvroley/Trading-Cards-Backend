const { Router } = require("express");
const router = Router();
const bcrypt = require('bcrypt');

const userDAO = require('../daos/user');
const middleware = require('../middleware/authenticate');

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

router.post("/signup", async (req, res, next) => {
    if(req.body.hasOwnProperty('password') && req.body.password && req.body.password.trim().length !== 0 && 
      req.body.hasOwnProperty('username') && req.body.username && req.body.username.trim().length !== 0) {
        const textPassword = req.body.password;
        const username = req.body.username;
        const hash = await bcrypt.hash(textPassword, 2);
        try {
            const collection = await userDAO.createUser({username: username, password: hash});
            res.json(collection);
        } catch(err) {
            next(err);
        }
    } else {
      res.sendStatus(400);
    }
});

router.post("/login", async (req, res, next) => {
    if(req.body.hasOwnProperty('password') && req.body.password.trim().length !== 0 && 
      req.body.hasOwnProperty('username') && req.body.username && req.body.username.trim().length !== 0) {
      const textPassword = req.body.password;
      const username = req.body.username;
      let storedUser;
      await userDAO.getUser(username).then((user) => {storedUser = user}).catch((err) => {
        next(err);
      });
  
      if(!storedUser) {
          res.sendStatus(401);
      } else {
          bcrypt.compare(textPassword, storedUser.password).then((result) => {
                if(result) {
                    let token = jwt.sign({username: storedUser.username, _id: storedUser._id}, secret);
                    res.json({token: token});
                } else {
                    res.sendStatus(401);
                }
          }).catch((err) => {next(err)});
      }
    } else {
      res.sendStatus(400);
    }
});

router.post("/logout", async (req, res, next) => {
    if(req.headers.hasOwnProperty('authorization')) {
        req.headers.authorization = '';
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

router.use(middleware.isAuthenticated);

router.put("/password", async (req, res, next) => {
    if(req.body.hasOwnProperty('password') && req.body.password) {
        const textPassword = req.body.password;
        const user = req.user;
        const hash = await bcrypt.hash(textPassword, 1);
        try {
            await userDAO.updateUserPassword(user._id, hash);
            res.sendStatus(200);
        } catch(err) {
            next(err);
        }
    } else {
        if(!req.body.password || req.body.password.trim().length === 0) {
            res.sendStatus(400);
        } else {
            res.sendStatus(401);
        }
    }
});

module.exports = router;