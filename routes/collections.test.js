const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const CardsDao = require('../models/tradingCard');
const UserDao = require('../models/user');
const CardCollectionDao = require('../models/cardCollection');

describe(`cards routes`, () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    const user0 = {
        username: "user011",
        password: "123password",
    };
    const user1 = {
        username: "user100",
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

    const card0 = {
        "sold": false,
        "backCardImageLink": "https://sgcimagprodstorage.blob.core.windows.net/mycollections/6313b7ee-6887-4e10-9a28-dc9fa2312278/h275/back/6313b7ee-6887-4e10-9a28-dc9fa2312278.jpg",
        "subject": "Mickey Mantle",
        "cardSet": "1956 Topps",
        "cardNumber": 135,
        "gradingCompany": "SGC",
        "certificationNumber": "1174031",
        "year": 1956,
        "frontCardImageLink": "https://sgcimagprodstorage.blob.core.windows.net/mycollections/6313b7ee-6887-4e10-9a28-dc9fa2312278/h275/front/6313b7ee-6887-4e10-9a28-dc9fa2312278.jpg",
        "brand": "Topps",
        "grade": "2.5",
        "variety": ""
    }

    describe("GET /collections", () => {
        let token0;
        let token1;
        let user0MainCollection;
        beforeEach(async () => {
            const result = await request(server).post("/auth/signup").send(user0);
            user0MainCollection = result.body.collection;
            const res0 = await request(server).post("/auth/login").send(user0);
            token0 = res0.body.token;
            await request(server).post("/auth/signup").send(user1);
            const res1 = await request(server).post("/auth/login").send(user1);
            token1 = res1.body.token;
        });
        it("should not get a collection using an invalid collection ID in the URL params", async () => {
            const response = await request(server).get(`/collections/123`)
            .set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(400);
        });
        it("should not get a collection for a user that doesn't have read permission", async () => {
            const response = await request(server).get(`/collections/${user0MainCollection._id}`)
            .set("Authorization", "Bearer " + token1).send();
            expect(response.statusCode).toEqual(401);
        });
        it("should get a collection using the ID in the URL params", async () => {
            const response = await request(server).get(`/collections/${user0MainCollection._id}`)
            .set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(200);
            const collection = response.body.collection;
            expect(collection).toMatchObject(user0MainCollection);
        });
        it("should get all collections for an owner", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const responseGet = await request(server).get(`/collections`)
            .set("Authorization", "Bearer " + token0).send({'ownerName': user0.username});
            expect(responseGet.statusCode).toEqual(200);
            const collections = responseGet.body.collections;
            expect(collections.length).toEqual(2);
            const owner = await UserDao.findOne({username: user0.username}).lean();
            expect(collections[0].owner).toEqual(owner._id.toString());
            expect(collections[1].owner).toEqual(owner._id.toString());
        });
        it("should not get all collections for an owner the user doesn't have permission for", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const responseGet = await request(server).get(`/collections`)
            .set("Authorization", "Bearer " + token1).send({'ownerName': user0.username});
            expect(responseGet.statusCode).toEqual(200);
            const collections = responseGet.body.collections;
            expect(collections.length).toEqual(0);
        });
    });

    describe("POST /collections", () => {
        let token0;
        let token1;
        let user0MainCollection;
        beforeEach(async () => {
            const result = await request(server).post("/auth/signup").send(user0);
            user0MainCollection = result.body.collection;
            const res0 = await request(server).post("/auth/login").send(user0);
            token0 = res0.body.token;
            await request(server).post("/auth/signup").send(user1);
            const res1 = await request(server).post("/auth/login").send(user1);
            token1 = res1.body.token;
        });
        it("should not create a collection that already exist", async () => {
            const response = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "user011"});
            expect(response.statusCode).toEqual(409);
            const collections = await CardCollectionDao.find({title: "user011"}).lean();
            expect(collections.length).toEqual(1);
        });
        it("should not create a collection with an empty name", async () => {
            const response = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": ""});
            expect(response.statusCode).toEqual(400);
            const collections = await CardCollectionDao.find({title: ""}).lean();
            expect(collections.length).toEqual(0);
        });
        it("should create a collection", async () => {
            const response = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(response.statusCode).toEqual(200);
            const myCollection = await CardCollectionDao.findOne({title: "testCollection"}).lean();
            expect(response.body.collection._id).toEqual(myCollection._id.toString());
            expect(response.body.collection.owner).toEqual(myCollection.owner.toString());
        });
    });

    describe("PUT /collections", () => {
        let token0;
        let token1;
        let user0MainCollection;
        beforeEach(async () => {
            const result = await request(server).post("/auth/signup").send(user0);
            user0MainCollection = result.body.collection;
            const res0 = await request(server).post("/auth/login").send(user0);
            token0 = res0.body.token;
            await request(server).post("/auth/signup").send(user1);
            const res1 = await request(server).post("/auth/login").send(user1);
            token1 = res1.body.token;
        });
        it("should not update a collection title with an invalid collection ID", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const responsePut = await request(server).put(`/collections/123`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "updatedTitle"});
            expect(responsePut.statusCode).toEqual(400);
            const collections = await CardCollectionDao.find({title: "updatedTitle"}).lean();
            expect(collections.length).toEqual(0);
        });
        it("should not update a collection title when the user doesn't have permission", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const responsePut = await request(server).put(`/collections/${user0MainCollection._id}`).set("Authorization", "Bearer " + token1)
            .send({"collectionTitle": "updatedTitle"});
            expect(responsePut.statusCode).toEqual(401);
            const collections = await CardCollectionDao.find({title: "updatedTitle"}).lean();
            expect(collections.length).toEqual(0);
        });
        it("should update a collection title", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const collectinIdExpected = responsePost.body.collection._id;
            const responsePut = await request(server).put(`/collections/${collectinIdExpected}`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "updatedTitle"});
            expect(responsePut.statusCode).toEqual(200);
            const collections = await CardCollectionDao.find({title: "updatedTitle"}).lean();
            expect(collections.length).toEqual(1);
            const collectinIdReceived = collections[0]._id.toString();
            expect(collectinIdReceived).toEqual(collectinIdExpected);
        });
    });

    describe("DELETE /collections", () => {
        let token0;
        let token1;
        let user0MainCollection;
        beforeEach(async () => {
            const result = await request(server).post("/auth/signup").send(user0);
            user0MainCollection = result.body.collection;
            const res0 = await request(server).post("/auth/login").send(user0);
            token0 = res0.body.token;
            await request(server).post("/auth/signup").send(user1);
            const res1 = await request(server).post("/auth/login").send(user1);
            token1 = res1.body.token;
        });
        it("should send code 404 for deleting a collection that doesn't exist", async () => {
            const response = await request(server).delete(`/collections/123`).set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(404);
        });
        it("should send code 409 for deleting a main collection for a user", async () => {
            const response = await request(server).delete(`/collections/${user0MainCollection._id}`).set("Authorization", "Bearer " + token0).send();
            expect(response.statusCode).toEqual(409);
            const collections = await CardCollectionDao.find({title: user0.username}).lean();
            expect(collections.length).toEqual(1);
        });
        it("should delete a collection that the user owns", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const collection = responsePost.body.collection;
            const responseDelete = await request(server).delete(`/collections/${collection._id}`)
            .set("Authorization", "Bearer " + token0).send();
            expect(responseDelete.statusCode).toEqual(200);
            const collections = await CardCollectionDao.find({title: "testCollection"}).lean();
            expect(collections.length).toEqual(0);
        });
        it("should not delete a collection that the user doesn't own and send code 401", async () => {
            const responsePost = await request(server).post(`/collections`).set("Authorization", "Bearer " + token0)
            .send({"collectionTitle": "testCollection"});
            expect(responsePost.statusCode).toEqual(200);
            const collection = responsePost.body.collection;
            const responseDelete = await request(server).delete(`/collections/${collection._id}`)
            .set("Authorization", "Bearer " + token1).send();
            expect(responseDelete.statusCode).toEqual(401);
            const collections = await CardCollectionDao.find({title: "testCollection"}).lean();
            expect(collections.length).toEqual(1);
        });
    });
});
