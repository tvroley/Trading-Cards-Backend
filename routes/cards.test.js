const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");
const Cards = require("../models/tradingCard");
const User = require("../models/user");
const { search } = require("./auth");
const collectionForCard = require("../models/collectionForCard");

describe(`cards routes`, () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const user0 = {
    username: "user01",
    password: "123password",
  };
  const user1 = {
    username: "user10",
    password: "456password",
  };

  const card = {
    certificationNumber: "78261079",
    sold: false,
    grade: "9",
    subject: "Mariano Rivera",
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/mObd2K1wxkWOuMB96W2XNw.jpg",
    gradingCompany: "PSA",
    cardSet: "1992 Bowman",
    cardNumber: "302",
    year: 1992,
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/ATcQDQWFv06Dsq_CHPayHA.jpg",
    brand: "Bowman",
    variety: "",
  };

  const updatedCard = {
    certificationNumber: "78261079",
    sold: true,
    grade: "9",
    subject: "Mariano Rivera",
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/mObd2K1wxkWOuMB96W2XNw.jpg",
    gradingCompany: "PSA",
    cardSet: "1992 Bowman",
    cardNumber: "302",
    year: 1992,
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/ATcQDQWFv06Dsq_CHPayHA.jpg",
    brand: "Bowman",
    variety: "",
  };

  const card0 = {
    cardNumber: "30",
    certificationNumber: "8812288",
    frontCardImageLink:
      "https://sgcimagprodstorage.blob.core.windows.net/mycollections/aa187650-58c8-439d-b5f9-7ba8457af61a/h275/front/aa187650-58c8-439d-b5f9-7ba8457af61a.jpg",
    cardSet: "1956 Topps",
    backCardImageLink:
      "https://sgcimagprodstorage.blob.core.windows.net/mycollections/aa187650-58c8-439d-b5f9-7ba8457af61a/h275/back/aa187650-58c8-439d-b5f9-7ba8457af61a.jpg",
    brand: "Topps",
    subject: "Jackie Robinson",
    gradingCompany: "SGC",
    sold: false,
    year: 1956,
    grade: "1",
    variety: "",
  };

  const card1 = {
    year: 2014,
    subject: "Sue Bird",
    cardSet: "2014 Rittenhouse WNBA",
    brand: "Rittenhouse",
    gradingCompany: "PSA",
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/139034792/KjyGQGqrj0uvOEw4QUusnA.jpg",
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/139034792/ApJITJO_RU-CDAMS70u-YQ.jpg",
    grade: "8",
    cardNumber: "82",
    certificationNumber: "73536889",
    sold: false,
    variety: "",
  };

  describe("before signup", () => {
    describe("GET /cards", () => {
      it("should send status code 401 and not get a card", async () => {
        const response = await request(server).get(`/cards/123`).send();
        expect(response.statusCode).toEqual(401);
      });
    });

    describe("PUT /cards", () => {
      it("should return 401 and not update a card", async () => {
        const res = await request(server).put("/cards/123").send(updatedCard);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("DELETE /cards", () => {
      it("should return 401 and not delete a card", async () => {
        const res = await request(server).delete("/cards/123").send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });

  describe("GET /cards", () => {
    let token0;
    let token1;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
    });
    describe("invalid card ID in URL param", () => {
      it("should send 400 status and not get a card", async () => {
        const response = await request(server)
          .get(`/cards/123`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("valid card ID in URL param", () => {
      it("should get a card and send 200 status", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responseGet = await request(server)
          .get(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        expect(responseGet.body.card).toEqual(responsePost.body.card);
      });
    });
    describe("card that doesn't exist in URL param", () => {
      it("should send 404 status and not get a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responseDelete = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(404);
      });
    });
  });

  describe("GET /cards/search", () => {
    let token0;
    let token1;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
    });
    describe("valid single word search query", () => {
      it("should send 200 status and return results with most relevant card first", async () => {
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const responsePost2 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card0);
        expect(responsePost2.statusCode).toEqual(200);
        const responsePost3 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card1);
        expect(responsePost3.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/cards/search`)
          .set("Authorization", "Bearer " + token0)
          .send({ search: `Sue` });
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.cards;
        expect(tradingCards[0]).toMatchObject(card1);
      });
    });
    describe("valid multiple word search query", () => {
      it("should send 200 status and return results with most relevant card first", async () => {
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const responsePost2 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card0);
        expect(responsePost2.statusCode).toEqual(200);
        const responsePost3 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card1);
        expect(responsePost3.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/cards/search`)
          .set("Authorization", "Bearer " + token0)
          .send({ search: `2002 Sue Bird` });
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.cards;
        expect(tradingCards[0]).toMatchObject(card1);
      });
    });
    describe("empty search query in request body", () => {
      it("should send 400 status", async () => {
        const responseGet = await request(server)
          .get(`/cards/search`)
          .set("Authorization", "Bearer " + token0)
          .send({ search: `   ` });
        expect(responseGet.statusCode).toEqual(400);
      });
    });
  });

  describe("PUT /cards", () => {
    let token0;
    let token1;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
    });
    describe("update a card with an invalid ID in the URL params", () => {
      it("should send 400 status and not update a card", async () => {
        const responsePut = await request(server)
          .put(`/cards/123`)
          .set("Authorization", "Bearer " + token1)
          .send(updatedCard);
        expect(responsePut.statusCode).toEqual(400);
      });
    });
    describe("update a card with a card ID for a card that doesn't exist in the URL params", () => {
      it("should send 400 status and not update a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responseDelete = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const responsePut = await request(server)
          .put(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send(updatedCard);
        expect(responsePut.statusCode).toEqual(404);
      });
    });
    describe("update a card with an empty card object in the request body", () => {
      it("should send status 400 and not update a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responsePut = await request(server)
          .put(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send({});
        expect(responsePut.statusCode).toEqual(400);
      });
    });
    describe("update a card that the user doesn't own", () => {
      it("should send status 400 and not update a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responsePut = await request(server)
          .put(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token1)
          .send(updatedCard);
        expect(responsePut.statusCode).toEqual(401);
      });
    });
    describe("update a card that the user owns", () => {
      it("should send status 200 and update a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responsePut = await request(server)
          .put(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send(updatedCard);
        expect(responsePut.statusCode).toEqual(200);
        expect(responsePut.body.modifiedCount).toEqual(1);
        const soldCard = await Cards.findOne({
          certificationNumber: "78261079",
        }).lean();
        expect(soldCard.sold).toBeTruthy();
      });
    });
    describe("admin updates any card", () => {
      it("should send status 200 and update a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        await User.updateOne(
          { username: "user10" },
          { $set: { roles: ["admin"] } },
        );
        const respsonseLogin = await request(server)
          .post("/auth/login")
          .send(user1);
        const token2 = respsonseLogin.body.token;
        const responseUpdate = await request(server)
          .put(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token2)
          .send(updatedCard);
        expect(responseUpdate.statusCode).toEqual(200);
        expect(responseUpdate.body.modifiedCount).toEqual(1);
        const updatedCardResult = await Cards.findOne({
          certificationNumber: "78261079",
        }).lean();
        expect(updatedCardResult.sold).toBeTruthy();
      });
    });
  });

  describe("POST /cards", () => {
    let token0;
    let token1;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
    });
    describe("empty card object in request body", () => {
      it("should send status 400 and not post a card", async () => {
        const response = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send({});
        expect(response.statusCode).toEqual(400);
        const savedCards = await Cards.find().lean();
        expect(savedCards.length).toEqual(0);
      });
    });
    describe("card object with missing fields in request body", () => {
      it("should send status 400 and not post a card", async () => {
        const response = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send({
            player: "Randy Johnson",
            year: 1999,
          });
        expect(response.statusCode).toEqual(400);
        const savedCards = await Cards.find().lean();
        expect(savedCards.length).toEqual(0);
      });
    });
    describe("card object with all fields in request body", () => {
      it("should send status 200 post a card", async () => {
        const response = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(response.statusCode).toEqual(200);
        const savedCards = await Cards.find().lean();
        expect(savedCards.length).toEqual(1);
        expect(savedCards[0]).toMatchObject(card);
      });
    });
  });

  describe("DELETE /cards", () => {
    let token0;
    let token1;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
    });
    describe("invalid card ID in URL params", () => {
      it("should send status 400 and not delete a card", async () => {
        const responseDelete = await request(server)
          .delete(`/cards/123`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(400);
      });
    });
    describe("card ID in URL params for card user doesn't own", () => {
      it("should send status 401 and not delete a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responseDelete = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(responseDelete.statusCode).toEqual(401);
        const deleteCardArray = await Cards.find({
          certificationNumber: "78261079",
        }).lean();
        expect(deleteCardArray.length).toEqual(1);
      });
    });
    describe("card ID for a card that doesn't exist in URL params", () => {
      it("should send 404 and not delete a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responseDelete = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        expect(responseDelete.body.deletedCount).toEqual(1);
        const deleteCardArray = await Cards.find({
          certificationNumber: "78261079",
        }).lean();
        expect(deleteCardArray.length).toEqual(0);
        const responseDelete2 = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete2.statusCode).toEqual(404);
      });
    });
    describe("card ID for a card the user owns in URL params", () => {
      it("should send status code 200 and delete a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        const responseDelete = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        expect(responseDelete.body.deletedCount).toEqual(1);
        const deleteCardArray = await Cards.find({
          certificationNumber: "78261079",
        }).lean();
        expect(deleteCardArray.length).toEqual(0);
        const deletedCollections = await collectionForCard
          .find({
            tradingCard: cardId,
          })
          .lean();
        expect(deletedCollections.length).toEqual(0);
      });
    });
    describe("card ID for a card the admin user doesn't own in URL params", () => {
      it("should send status 200 and delete a card", async () => {
        const responsePost = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost.statusCode).toEqual(200);
        const cardId = responsePost.body.card._id;
        await User.updateOne(
          { username: "user10" },
          { $set: { roles: ["admin"] } },
        );
        const respsonseLogin = await request(server)
          .post("/auth/login")
          .send(user1);
        const token2 = respsonseLogin.body.token;
        const responseDelete = await request(server)
          .delete(`/cards/${cardId}`)
          .set("Authorization", "Bearer " + token2)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        expect(responseDelete.body.deletedCount).toEqual(1);
        const deleteCardArray = await Cards.find({
          certificationNumber: "78261079",
        }).lean();
        expect(deleteCardArray.length).toEqual(0);
      });
    });
  });
});
