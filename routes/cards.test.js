const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const Cards = require('../models/tradingCard');
const User = require('../models/user');

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
        "certificationNumber": "78261079",
        "sold": false,
        "grade": "9",
        "subject": "Mariano Rivera",
        "frontCardImageLink": "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/mObd2K1wxkWOuMB96W2XNw.jpg",
        "gradingCompany": "PSA",
        "cardSet": "1992 Bowman",
        "cardNumber": "302",
        "year": 1992,
        "backCardImageLink": "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/ATcQDQWFv06Dsq_CHPayHA.jpg",
        "brand": "Bowman",
        "variety": ""
    }

    const updatedCard = {
        "certificationNumber": "78261079",
        "sold": true,
        "grade": "9",
        "subject": "Mariano Rivera",
        "frontCardImageLink": "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/mObd2K1wxkWOuMB96W2XNw.jpg",
        "gradingCompany": "PSA",
        "cardSet": "1992 Bowman",
        "cardNumber": "302",
        "year": 1992,
        "backCardImageLink": "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383603/ATcQDQWFv06Dsq_CHPayHA.jpg",
        "brand": "Bowman",
        "variety": ""
    }

    const card0 = {
      "cardNumber": "30",
      "certificationNumber": "8812288",
      "frontCardImageLink": "https://sgcimagprodstorage.blob.core.windows.net/mycollections/aa187650-58c8-439d-b5f9-7ba8457af61a/h275/front/aa187650-58c8-439d-b5f9-7ba8457af61a.jpg",
      "cardSet": "1956 Topps",
      "backCardImageLink": "https://sgcimagprodstorage.blob.core.windows.net/mycollections/aa187650-58c8-439d-b5f9-7ba8457af61a/h275/back/aa187650-58c8-439d-b5f9-7ba8457af61a.jpg",
      "brand": "Topps",
      "subject": "Jackie Robinson",
      "gradingCompany": "SGC",
      "sold": false,
      "year": 1956,
      "grade": "1",
      "variety": ""
    }

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
        it("should send 400 status for invalid card ID", async () => {
            const response = await request(server).get(`/cards/123`).set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(400);
        });
        it("should get a card", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responseGet = await request(server).get(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseGet.statusCode).toEqual(200);
            expect(responseGet.body.card).toEqual(responsePost.body.card);
        });
        it("should not get a card that doesn't exist", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responseDelete = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseDelete.statusCode).toEqual(200);
            const responseGet = await request(server).get(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseGet.statusCode).toEqual(404);
        });
        it("should not get a card that user doesn't have read permissions for", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const responseGet = await request(server).get(`/cards/${responsePost.body.card._id}`)
            .set("Authorization", "Bearer " + token1).send();
            expect(responseGet.statusCode).toEqual(401);
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
        it("should not update a card with an invalid ID", async () => {
            const responsePut = await request(server).put(`/cards/123`).set("Authorization", "Bearer " + token1)
            .send(updatedCard);
            expect(responsePut.statusCode).toEqual(400);
        });
        it("should not update a card that doesn't exist", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responseDelete = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseDelete.statusCode).toEqual(200);
            const responsePut = await request(server).put(`/cards/${cardId}`).set("Authorization", "Bearer " + token0)
            .send(updatedCard);
            expect(responsePut.statusCode).toEqual(404);
        });
        it("should not update a card with an empty card object", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responsePut = await request(server).put(`/cards/${cardId}`).set("Authorization", "Bearer " + token0)
            .send({});
            expect(responsePut.statusCode).toEqual(400);
        });
        it("should not update a card the user doesn't have permission for", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responsePut = await request(server).put(`/cards/${cardId}`).set("Authorization", "Bearer " + token1)
            .send(updatedCard);
            expect(responsePut.statusCode).toEqual(401);
        });
        it("should update a card", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responsePut = await request(server).put(`/cards/${cardId}`).set("Authorization", "Bearer " + token0)
            .send(updatedCard);
            expect(responsePut.statusCode).toEqual(200);
            expect(responsePut.body.modifiedCount).toEqual(1);
            const soldCard = await Cards.findOne({certificationNumber: "78261079"}).lean();
            expect(soldCard.sold).toBeTruthy();
        });
        it("admin should update any card", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            await User.updateOne({username: "user10"}, {$set: {"roles": ['admin']}});
            const respsonseLogin = await request(server).post("/auth/login").send(user1);
            const token2 = respsonseLogin.body.token;
            const responseUpdate = await request(server).put(`/cards/${cardId}`).set("Authorization", "Bearer " + token2)
            .send(updatedCard);
            expect(responseUpdate.statusCode).toEqual(200);
            expect(responseUpdate.body.modifiedCount).toEqual(1);
            const updatedCardResult = await Cards.findOne({certificationNumber: "78261079"}).lean();
            expect(updatedCardResult.sold).toBeTruthy();
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
        it("should not store an empty card object", async () => {
            const response = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send({});
            expect(response.statusCode).toEqual(400);
            const savedCards = await Cards.find().lean();
            expect(savedCards.length).toEqual(0);
        });
        it("should not store a card object with missing fields", async () => {
            const response = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send({
                player: 'Randy Johnson', year: 1999
            });
            expect(response.statusCode).toEqual(400);
            const savedCards = await Cards.find().lean();
            expect(savedCards.length).toEqual(0);
        });
        it("should store a card", async () => {
            const response = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(response.statusCode).toEqual(200);
            const savedCards = await Cards.find().lean();
            expect(savedCards.length).toEqual(1);
            expect(savedCards[0]).toMatchObject(card);
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
        it("should not delete a card with an invalid ID", async () => {
            const responseDelete = await request(server).delete(`/cards/123`).set("Authorization", "Bearer " + token0).send();
            expect(responseDelete.statusCode).toEqual(400);
        });
        it("should not delete a card when user doesn't have permission", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responseDelete = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token1).send();
            expect(responseDelete.statusCode).toEqual(401);
            const deleteCardArray = await Cards.find({certificationNumber: "78261079"}).lean();
            expect(deleteCardArray.length).toEqual(1);
        });
        it("should not delete a card that doesn't exist", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responseDelete = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseDelete.statusCode).toEqual(200);
            expect(responseDelete.body.deletedCount).toEqual(1);
            const deleteCardArray = await Cards.find({certificationNumber: "78261079"}).lean();
            expect(deleteCardArray.length).toEqual(0);
            const responseDelete2 = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseDelete2.statusCode).toEqual(404);
        });
        it("should delete a card", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            const responseDelete = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token0).send();
            expect(responseDelete.statusCode).toEqual(200);
            expect(responseDelete.body.deletedCount).toEqual(1);
            const deleteCardArray = await Cards.find({certificationNumber: "78261079"}).lean();
            expect(deleteCardArray.length).toEqual(0);
        });
        it("admin should delete any card", async () => {
            const responsePost = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(responsePost.statusCode).toEqual(200);
            const cardId = responsePost.body.card._id;
            await User.updateOne({username: "user10"}, {$set: {"roles": ['admin']}});
            const respsonseLogin = await request(server).post("/auth/login").send(user1);
            const token2 = respsonseLogin.body.token;
            const responseDelete = await request(server).delete(`/cards/${cardId}`).set("Authorization", "Bearer " + token2).send();
            expect(responseDelete.statusCode).toEqual(200);
            expect(responseDelete.body.deletedCount).toEqual(1);
            const deleteCardArray = await Cards.find({certificationNumber: "78261079"}).lean();
            expect(deleteCardArray.length).toEqual(0);
        });
    });
});

