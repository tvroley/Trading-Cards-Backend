const request = require("supertest");
var jwt = require("jsonwebtoken");
const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");

describe("/auth", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const user0 = {
    username: "user0",
    password: "123password",
    email: "user0@yahoo.com",
  };
  const user1 = {
    username: "user1",
    password: "456password",
    email: "user1@yahoo.com",
  };
  const user2 = {
    username: "user2",
    password: "789password",
    email: "user2@yahoo.com",
  };

  describe("before signup", () => {
    describe("POST /", () => {
      it("should return 401", async () => {
        const res = await request(server).post("/auth/login").send(user0);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("PUT /password", () => {
      it("should return 401", async () => {
        const res = await request(server).put("/auth/password").send(user0);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("POST /logout", () => {
      it("should return 404", async () => {
        const res = await request(server).post("/auth/logout").send();
        expect(res.statusCode).toEqual(404);
      });
    });
  });

  describe("signup ", () => {
    describe("POST /signup", () => {
      it("should return 400 without a password", async () => {
        const res = await request(server).post("/auth/signup").send({
          username: user0.username,
        });
        expect(res.statusCode).toEqual(400);
      });
      it("should return 400 with empty password", async () => {
        const res = await request(server).post("/auth/signup").send({
          username: user1.username,
          password: "",
        });
        expect(res.statusCode).toEqual(400);
      });
      it("should return 200 and collection with the title of the username with a password in the request body", async () => {
        const res = await request(server).post("/auth/signup").send(user1);
        expect(res.statusCode).toEqual(200);
        expect(res.body.collection.title).toEqual(user1.username);
      });
      it("should return 409 Conflict with a repeat signup", async () => {
        let res = await request(server).post("/auth/signup").send(user0);
        expect(res.statusCode).toEqual(200);
        res = await request(server).post("/auth/signup").send(user0);
        expect(res.statusCode).toEqual(409);
      });
      it("should not store raw password", async () => {
        await request(server).post("/auth/signup").send(user0);
        const users = await User.find().lean();
        users.forEach((user) => {
          expect(Object.values(user).includes(user0.password)).toBe(false);
        });
      });
    });
  });
  describe.each([user0, user1])("User %#", (user) => {
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      await request(server).post("/auth/signup").send(user1);
    });

    describe("POST /", () => {
      it("should return 400 when password isn't provided", async () => {
        const res = await request(server).post("/auth/login").send({
          username: user.username,
        });
        expect(res.statusCode).toEqual(400);
      });
      it("should return 401 when password doesn't match", async () => {
        const res = await request(server).post("/auth/login").send({
          username: user.username,
          password: "123",
        });
        expect(res.statusCode).toEqual(401);
      });
      it("should return 200 and a token when password matches", async () => {
        const res = await request(server).post("/auth/login").send(user);
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.token).toEqual("string");
      });
      it("should not store token on user", async () => {
        const res = await request(server).post("/auth/login").send(user);
        const token = res.body.token;
        const users = await User.find().lean();
        users.forEach((user) => {
          expect(Object.values(user)).not.toContain(token);
        });
      });
      it("should return a JWT with user username, _id, and roles inside, but not password", async () => {
        const res = await request(server).post("/auth/login").send(user);
        const token = res.body.token;
        const decodedToken = jwt.decode(token);
        expect(decodedToken.username).toEqual(user.username);
        expect(decodedToken.roles).toEqual(["user"]);
        expect(decodedToken._id).toMatch(
          /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
        ); // mongo _id regex
        expect(decodedToken.password).toBeUndefined();
      });
    });
  });
  describe("After both users login", () => {
    let token0;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      await request(server).post("/auth/signup").send(user2);
    });

    describe("PUT /password", () => {
      it("should reject bogus token", async () => {
        const res = await request(server)
          .put("/auth/password")
          .set("Authorization", "Bearer BAD")
          .send({ password: "123" });
        expect(res.statusCode).toEqual(401);
      });
      it("should reject empty password", async () => {
        const res = await request(server)
          .put("/auth/password")
          .set("Authorization", "Bearer " + token0)
          .send({ password: "" });
        expect(res.statusCode).toEqual(400);
      });
      it.each([user0, user1, user2])(
        "should change password for user",
        async (user) => {
          const res0 = await request(server).post("/auth/login").send(user);
          const token = res0.body.token;
          const res = await request(server)
            .put("/auth/password")
            .set("Authorization", "Bearer " + token)
            .send({ password: "123" });
          expect(res.statusCode).toEqual(200);
          let loginRes0 = await request(server).post("/auth/login").send(user);
          expect(loginRes0.statusCode).toEqual(401);
          loginRes0 = await request(server).post("/auth/login").send({
            username: user.username,
            password: "123",
          });
          expect(loginRes0.statusCode).toEqual(200);
        },
      );
    });

    describe("GET /encrypt", () => {
      it("should encrypt and decrypt", async () => {
        const res = await request(server)
          .get("/auth/encrypt")
          .query({ password: "test" })
          .send();
        expect(res.statusCode).toEqual(200);
        const coded = res.body.encrypted;
        const res1 = await request(server)
          .get("/auth/encrypt")
          .query({
            password: encodeURIComponent(res.body.encrypted),
            option: "reverse",
          })
          .send();
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.reversed).toEqual("test");
      });
    });
  });
});
