const { Router } = require("express");
const router = Router();
const bcrypt = require("bcrypt");
const errors = require("../middleware/errors");

const userDAO = require("../daos/user");
const middleware = require("../middleware/authenticate");

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

router.post("/signup", async (req, res, next) => {
  if (
    req.body.password &&
    req.body.password.trim().length !== 0 &&
    req.body.username &&
    req.body.username.trim().length !== 0
  ) {
    const textPassword = req.body.password;
    const username = req.body.username;
    const hash = await bcrypt.hash(textPassword, 2);
    try {
      const result = await userDAO.createUser({
        username: username,
        password: hash,
        roles: ["user"],
      });
      res.json(result);
    } catch (err) {
      if (err instanceof errors.DuplicateKeyError) {
        res.status(409).send("username already used");
      } else {
        next(err);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

router.post("/login", async (req, res, next) => {
  if (
    req.body.password &&
    req.body.password.trim().length !== 0 &&
    req.body.username &&
    req.body.username.trim().length !== 0
  ) {
    const textPassword = req.body.password;
    const username = req.body.username;
    let storedUser;
    await userDAO
      .getUser(username)
      .then((user) => {
        storedUser = user;
      })
      .catch((err) => {
        next(err);
      });

    if (!storedUser) {
      res.status(401).send(`could not find user`);
    } else {
      bcrypt
        .compare(textPassword, storedUser.password)
        .then((result) => {
          if (result) {
            let token = jwt.sign(
              {
                username: storedUser.username,
                _id: storedUser._id,
                roles: storedUser.roles,
              },
              secret,
            );
            res.json({ token: token });
          } else {
            res.status(401).send(`invalid password`);
          }
        })
        .catch((err) => {
          next(err);
        });
    }
  } else {
    res.sendStatus(400);
  }
});

router.post("/logout", async (req, res, next) => {
  if (req.headers.authorization) {
    req.headers.authorization = "";
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.use(middleware.isAuthenticated);

router.put("/password", async (req, res, next) => {
  if (req.body.password || req.body.password.trim().length !== 0) {
    const textPassword = req.body.password;
    const user = req.user;
    const hashPassword = await bcrypt.hash(textPassword, 2);
    try {
      await userDAO.updateUserPassword(
        user._id,
        user.username,
        hashPassword,
        user.roles,
      );
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
