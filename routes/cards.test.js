const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const Cards = require('../models/tradingCard');

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
        "gradingCompany": "PSA",
        "brand": "Fleer",
        "cardSet": "2002 Ultra WNBA",
        "subject": "Sue Bird",
        "sold": false,
        "backCardImageLink": "https://d1htnxwo4o0jhw.cloudfront.net/cert/126428695/355819081.jpg",
        "certificationNumber": "63741116",
        "cardNumber": "101",
        "frontCardImageLink": "https://d1htnxwo4o0jhw.cloudfront.net/cert/126428695/355823629.jpg",
        "year": 2002,
        "grade": "9",
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
        it("should get a card", async () => {
            const myCard = await Cards.create(card);
            const response = await request(server).get(`/cards/${myCard._id}`).set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(200);
            expect(myCard._id.toString()).toEqual(response.body.card._id);
            expect(myCard.certificationNumber.toString()).toEqual(response.body.card.certificationNumber);
        });
        it("should send 400 status for invalid card ID", async () => {
            const myCard = await Cards.create(card);
            const response = await request(server).get(`/cards/123`).set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(400);
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
        it("should store a card", async () => {
            const response = await request(server).post("/cards").set("Authorization", "Bearer " + token0).send(card);
            expect(response.statusCode).toEqual(200);
            const savedCards = await Cards.find().lean();
            expect(savedCards.length).toEqual(1);
            expect(savedCards[0]).toMatchObject(card);
        });
    });
});

