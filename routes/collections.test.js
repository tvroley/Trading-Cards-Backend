const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");
const User = require("../models/user");
const UserDao = require("../models/user");
const CardCollectionDao = require("../models/cardCollection");
const CollectionForCard = require("../models/collectionForCard");

describe(`collections routes`, () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const user0 = {
    username: "user011",
    password: "123password",
    email: "user0@yahoo.com",
  };
  const user1 = {
    username: "user100",
    password: "456password",
    email: "user1@yahoo.com",
  };
  const uncle = {
    username: "uncle",
    password: "789password",
    email: "uncle@yahoo.com",
  };
  const grandpa = {
    username: "grandpa",
    password: "321password",
    email: "grandpa@yahoo.com",
  };
  const demo = {
    username: "demo",
    password: "demo",
    email: "demo@yahoo.com",
  };

  const cardDemo = {
    gradingCompany: "PSA",
    brand: "Fleer",
    cardSet: "2002 Ultra WNBA",
    subject: "Sue Bird",
    sold: false,
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/126428695/355819081.jpg",
    certificationNumber: "63741116DEMO",
    cardNumber: "101",
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/126428695/355823629.jpg",
    year: 2002,
    grade: "9",
    variety: "",
  };

  const card0Demo = {
    sold: false,
    backCardImageLink:
      "https://sgcimagprodstorage.blob.core.windows.net/mycollections/6313b7ee-6887-4e10-9a28-dc9fa2312278/h275/back/6313b7ee-6887-4e10-9a28-dc9fa2312278.jpg",
    subject: "Mickey Mantle",
    cardSet: "1956 Topps",
    cardNumber: "135",
    gradingCompany: "SGC",
    certificationNumber: "1174031DEMO",
    year: 1956,
    frontCardImageLink:
      "https://sgcimagprodstorage.blob.core.windows.net/mycollections/6313b7ee-6887-4e10-9a28-dc9fa2312278/h275/front/6313b7ee-6887-4e10-9a28-dc9fa2312278.jpg",
    brand: "Topps",
    grade: "2.5",
    variety: "",
  };

  const card = {
    gradingCompany: "PSA",
    brand: "Fleer",
    cardSet: "2002 Ultra WNBA",
    subject: "Sue Bird",
    sold: false,
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/126428695/355819081.jpg",
    certificationNumber: "63741116",
    cardNumber: "101",
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/126428695/355823629.jpg",
    year: 2002,
    grade: "9",
    variety: "",
  };

  const card0 = {
    sold: false,
    backCardImageLink:
      "https://sgcimagprodstorage.blob.core.windows.net/mycollections/6313b7ee-6887-4e10-9a28-dc9fa2312278/h275/back/6313b7ee-6887-4e10-9a28-dc9fa2312278.jpg",
    subject: "Mickey Mantle",
    cardSet: "1956 Topps",
    cardNumber: "135",
    gradingCompany: "SGC",
    certificationNumber: "1174031",
    year: 1956,
    frontCardImageLink:
      "https://sgcimagprodstorage.blob.core.windows.net/mycollections/6313b7ee-6887-4e10-9a28-dc9fa2312278/h275/front/6313b7ee-6887-4e10-9a28-dc9fa2312278.jpg",
    brand: "Topps",
    grade: "2.5",
    variety: "",
  };

  const card1 = {
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/132113359/9Lz9EJNkUU-0ut5gtBhkeg.jpg",
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/132113359/TyLJOT5i7ka5C-qOUAjc-w.jpg",
    subject: "Jim Brown",
    brand: "Topps",
    certificationNumber: "67733031",
    grade: "4",
    year: 1958,
    gradingCompany: "PSA",
    cardNumber: "62",
    cardSet: "1958 Topps",
    sold: true,
    variety: "",
  };

  const card2 = {
    cardNumber: 259,
    cardSet: "2013 Sports Illustrated For Kids",
    sold: false,
    frontCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383604/W4r5ptiR9Ey2vcShzL7pTw.jpg",
    backCardImageLink:
      "https://d1htnxwo4o0jhw.cloudfront.net/cert/144383604/MLPlP-vbY06UR8AKumJSMg.jpg",
    brand: "Sports Illustrated For Kids",
    gradingCompany: "PSA",
    certificationNumber: "78261080",
    grade: "9",
    year: 2013,
    subject: "Elena Delle Donne",
  };

  describe("before signup", () => {
    describe("PUT /collections", () => {
      it("should return 401 and not update a collection", async () => {
        const res = await request(server)
          .put("/collections/123")
          .send({ collectionTitle: "testCollection" });
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("DELETE /collections", () => {
      it("should return 401 and not delete a collection", async () => {
        const res = await request(server).delete("/collections/123").send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });

  describe("GET /collections by collection ID", () => {
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
    describe("invalid collection ID in the URL params", () => {
      it("should send status 400 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections/123`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("collection ID for a collection that doesn't exist in the URL params", () => {
      it("should send status 404 and not get a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const collections = await CardCollectionDao.find({
          title: "testCollection",
        }).lean();
        expect(collections.length).toEqual(0);
        const response = await request(server)
          .get(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(404);
      });
    });
    describe("collection ID for a collection the user owns in the URL params", () => {
      it("should send status 200 and get a collection", async () => {
        const response = await request(server)
          .get(`/collections/${user0MainCollection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(200);
        const collection = response.body.collection;
        expect(collection).toMatchObject(user0MainCollection);
      });
    });
    describe("collection ID for a collection another user owns in the URL params", () => {
      it("should send status 200 and get a collection", async () => {
        const response = await request(server)
          .get(`/collections/${user0MainCollection._id}`)
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(response.statusCode).toEqual(200);
        const collection = response.body.collection;
        expect(collection).toMatchObject(user0MainCollection);
      });
    });
  });

  describe("GET /collections all collections with owner names", () => {
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
    describe("getAll is true in URL query", () => {
      it("should send status 200 and get all collections", async () => {
        const responsePost1 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection1" });
        expect(responsePost1.statusCode).toEqual(200);
        const response = await request(server)
          .get(`/collections/`)
          .query({ getAll: "true" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(200);
        const collections = response.body.collections;
        expect(collections.length).toEqual(3);
        expect(collections[0].ownerName).toEqual("user011");
        expect(collections[0].title).toEqual("testCollection1");
        expect(collections[1].ownerName).toEqual("user011");
        expect(collections[1].title).toEqual("user011");
        expect(collections[2].ownerName).toEqual("user100");
        expect(collections[2].title).toEqual("user100");
      });
    });
    describe("getAll is false in URL query", () => {
      it("should send status 400 and get all collections", async () => {
        const responsePost1 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection1" });
        expect(responsePost1.statusCode).toEqual(200);
        const response = await request(server)
          .get(`/collections/`)
          .query({ getAll: "false" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe("GET /collections/search", () => {
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
    describe("empty search query in the request body", () => {
      it("should send status 400 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections/search`)
          .query({ search: "" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("search query with no matching search terms in the request body", () => {
      it("should send status 404 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections/search`)
          .query({ search: "banana" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(404);
      });
    });
    describe("single term search query in the request body that matches a collection", () => {
      it("should send status 200 and get a collection", async () => {
        const responsePost1 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "test collection 1" });
        expect(responsePost1.statusCode).toEqual(200);
        const collection = responsePost1.body.collection;
        const responsePost2 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "my cards" });
        expect(responsePost2.statusCode).toEqual(200);
        const responsePost3 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "your cards" });
        expect(responsePost3.statusCode).toEqual(200);
        const response = await request(server)
          .get(`/collections/search`)
          .query({ search: "test" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(200);
        const collectionId = response.body.collections[0]._id;
        const title = response.body.collections[0].title;
        const ownerName = response.body.collections[0].ownerName;
        expect(collectionId).toEqual(collection._id);
        expect(ownerName).toEqual(user0.username);
        expect(title).toEqual(collection.title);
      });
    });
    describe("multiple term search query in the request body that matches a collection", () => {
      it("should send status 200 and get a collection", async () => {
        const responsePost1 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "test collection 1" });
        expect(responsePost1.statusCode).toEqual(200);
        const collectionExpected = responsePost1.body.collection;
        const responsePost2 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "my cards" });
        expect(responsePost2.statusCode).toEqual(200);
        const responsePost3 = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "your cards" });
        expect(responsePost3.statusCode).toEqual(200);
        const response = await request(server)
          .get(`/collections/search`)
          .query({ search: "test collection" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(200);
        const collectionReceived = response.body.collections[0];
        expect(collectionExpected.title).toEqual(collectionReceived.title);
        expect(collectionExpected._id.toString()).toEqual(
          collectionReceived._id.toString(),
        );
        const ownerName = collectionReceived.ownerName;
        expect(ownerName).toEqual(user0.username);
      });
    });
  });

  describe("GET /collections by collection ID", () => {
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
    describe("username of current user in request body", () => {
      it("should send status 200 and get all collections for an owner", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections`)
          .query({ ownerName: user0.username })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const collections = responseGet.body.collections;
        expect(collections.length).toEqual(2);
        const owner = await UserDao.findOne({
          username: user0.username,
        }).lean();
        expect(collections[0].owner).toEqual(owner._id.toString());
        expect(collections[1].owner).toEqual(owner._id.toString());
      });
    });
    describe("username of another user in request body", () => {
      it("should send status 200 and get all collections for an owner", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections`)
          .query({ ownerName: user0.username })
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(responseGet.statusCode).toEqual(200);
      });
    });
    describe("username of a fake user in the request body", () => {
      it("should send status 404 and not get all collections for an owner", async () => {
        const responseGet = await request(server)
          .get(`/collections`)
          .query({ ownerName: "Nobody" })
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(responseGet.statusCode).toEqual(404);
      });
    });
    describe("empty username in the request body", () => {
      it("should send status 400 and not get all collections for an owner", async () => {
        const responseGet = await request(server)
          .get(`/collections`)
          .query({ ownerName: "" })
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(responseGet.statusCode).toEqual(400);
      });
    });
  });

  describe("GET /collections by owner and title", () => {
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
    describe("collection name for a collection that doesn't exist with a real user in the request body", () => {
      it("should send status 404 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections`)
          .query({ ownerName: user0.username, title: "nothing" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(404);
      });
    });
    describe("collection name with a fake user in the request body", () => {
      it("should send status 404 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections`)
          .query({ ownerName: "nobody", title: user0.username })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(404);
      });
    });
    describe("collection name with an empty username in the request body", () => {
      it("should send status 400 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections`)
          .query({ ownerName: "", title: user0.username })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("empty collection name with a username in the request body", () => {
      it("should send status 400 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections`)
          .query({ ownerName: user0.username, title: "" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("the main collection name for a user and the username owns in the request body", () => {
      it("should send status 200 and get a collection", async () => {
        const response = await request(server)
          .get(`/collections`)
          .query({ ownerName: user0.username, title: user0.username })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(200);
        const collection = response.body.collection;
        expect(collection).toMatchObject(user0MainCollection);
      });
    });
    describe("main collection title and username for another user in the request body", () => {
      it("should send status 200 and get a collection", async () => {
        const response = await request(server)
          .get(`/collections`)
          .query({ ownerName: user0.username, title: user0.username })
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(response.statusCode).toEqual(200);
        const collection = response.body.collection;
        expect(collection).toMatchObject(user0MainCollection);
      });
    });
  });

  describe("GET /collections get all cards in a collection", () => {
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
    describe("valid collection ID and verbose in the request body", () => {
      it("should send status 200 and cards sorted by year", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card0);
        expect(tradingCards[1]).toMatchObject(card1);
        expect(tradingCards[2]).toMatchObject(card);
      });
    });
    describe("valid collection ID and verbose in the request body and sortBy equals cert", () => {
      it("should send status 200 and cards sorted by grading company and cert number", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", sortBy: "cert" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card);
        expect(tradingCards[1]).toMatchObject(card1);
        expect(tradingCards[2]).toMatchObject(card0);
      });
    });
    describe("valid collection ID and verbose in the request body and sortBy equals year", () => {
      it("should send status 200 and cards sorted by year", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", sortBy: "year" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card0);
        expect(tradingCards[1]).toMatchObject(card1);
        expect(tradingCards[2]).toMatchObject(card);
      });
    });
    describe("valid collection ID and verbose in the request body and sortBy equals sold", () => {
      it("should send status 200 and cards sorted by sold status, sold status", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", sortBy: "sold", ascDesc: "DESC" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card1);
        expect(tradingCards[1]).toMatchObject(card0);
        expect(tradingCards[2]).toMatchObject(card);
      });
    });
    describe("valid collection ID and verbose in the request body and sortBy equals player", () => {
      it("should send status 200 and cards sorted by subject", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", sortBy: "subject" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card1);
        expect(tradingCards[1]).toMatchObject(card0);
        expect(tradingCards[2]).toMatchObject(card);
      });
    });
    describe("valid collection ID and verbose in the request body and sortBy equals brand", () => {
      it("should send status 200 and cards sorted by brand", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", sortBy: "brand" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card);
        expect(tradingCards[1]).toMatchObject(card0);
        expect(tradingCards[2]).toMatchObject(card1);
      });
    });
    describe("valid collection ID and verbose in the request body and sortBy equals cardSet", () => {
      it("should send status 200 and cards sorted by card set", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", sortBy: "cardSet" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]).toMatchObject(card0);
        expect(tradingCards[1]).toMatchObject(card1);
        expect(tradingCards[2]).toMatchObject(card);
      });
    });
    describe("valid collection ID and verbose equals false in the request body", () => {
      it("should send status 200 and collection object", async () => {
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
        const responseGet = await request(server)
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "false" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const collection = responseGet.body.collection;
        expect(collection.title).toEqual(user0.username);
      });
    });
    describe("collection ID for collection that doesn't exist and verbose in the request body", () => {
      it("should send status 200 and send empty trading cards array", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections/${collection._id}`)
          .query({ verbose: "true" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        expect(responseGet.body.tradingCards.length).toEqual(0);
      });
    });
    describe("collection ID for empty collection and verbose in the request body", () => {
      it("should send status 200 and send empty trading cards array", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseGet = await request(server)
          .get(`/collections/${collection._id}`)
          .query({ verbose: "true" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        expect(responseGet.body.tradingCards.length).toEqual(0);
      });
    });
    describe("invalid collection ID in the URL params", () => {
      it("should send status 404 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections/123`)
          .query({ verbose: "true" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe("GET /collections search for cards in a collection", () => {
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
    describe("valid collection ID and verbose in the request body and search is Mantle", () => {
      it("should send status 200 and Mickey Mantle card first in a card array", async () => {
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
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", search: "Mantle" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards[0]._id).toEqual(responsePost2.body.card._id);
        expect(tradingCards[0].subject).toEqual(
          responsePost2.body.card.subject,
        );
        expect(tradingCards[0].year).toEqual(responsePost2.body.card.year);
        expect(tradingCards[0].brand).toEqual(responsePost2.body.card.brand);
        expect(tradingCards[0].frontCardImageLink).toEqual(
          responsePost2.body.card.frontCardImageLink,
        );
      });
    });
    describe("valid collection ID and verbose in the request body and search is Donne", () => {
      it("should send status 200 and no cards", async () => {
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
        const responsePost4 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token1)
          .send(card2);
        expect(responsePost4.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections/${user0MainCollection._id}`)
          .query({ verbose: "true", search: "Donne" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const tradingCards = responseGet.body.tradingCards;
        expect(tradingCards.length).toEqual(0);
      });
    });
  });

  describe("GET /forcard get collections for card", () => {
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
    describe("valid card ID in the URL parameter", () => {
      it("should send status 200 and collection objects", async () => {
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const resPostCardToCollection = await request(server)
          .post(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePost1.body.card._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections/forcard/${responsePost1.body.card._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
      });
    });
  });

  describe("GET /collections count cards in a collection", () => {
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
    describe("valid collection ID and counts cards in the collection", () => {
      it("should send status 200 and return the number of cards in the collection", async () => {
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
          .get(`/collections/cardcount/${user0MainCollection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const count = responseGet.body.count;
        expect(count).toEqual(3);
      });
    });
    describe("collection ID for collection that doesn't exist", () => {
      it("should send status 404", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections/cardcount/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(404);
      });
    });
    describe("invalid collection ID in the URL params", () => {
      it("should send status 400 and not get a collection", async () => {
        const response = await request(server)
          .get(`/collections/cardcount/123`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe("GET /collections count collections for user", () => {
    let token0;
    let user0MainCollection;
    beforeEach(async () => {
      const result = await request(server).post("/auth/signup").send(user0);
      user0MainCollection = result.body.collection;
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
    });
    describe("valid login", () => {
      it("should send status 200 and return the number of collections for the user", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const responseGet = await request(server)
          .get(`/collections/collectionscount`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseGet.statusCode).toEqual(200);
        const count = responseGet.body.count;
        expect(count).toEqual(2);
      });
    });
  });

  describe("POST /collections create new collection", () => {
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
    describe("create a collection that already exist in the request body", () => {
      it("should send status 409 and not post a collection", async () => {
        const response = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "user011" });
        expect(response.statusCode).toEqual(409);
        const collections = await CardCollectionDao.find({
          title: "user011",
        }).lean();
        expect(collections.length).toEqual(1);
      });
    });
    describe("create a collection with an empty title in the request body", () => {
      it("should send status 400 and not post a collection", async () => {
        const response = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "" });
        expect(response.statusCode).toEqual(400);
        const collections = await CardCollectionDao.find({ title: "" }).lean();
        expect(collections.length).toEqual(0);
      });
    });
    describe("create a collection with a valid title in the request body", () => {
      it.each([
        "testCollection",
        "Seattle Mariners",
        "150 Pokemon",
        "1989 Topps Baseball",
      ])("should send code 200 and post a collection", async (title) => {
        const response = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: title });
        expect(response.statusCode).toEqual(200);
        const myCollection = await CardCollectionDao.findOne({
          title: title,
        }).lean();
        expect(response.body.collection._id).toEqual(
          myCollection._id.toString(),
        );
        expect(response.body.collection.owner).toEqual(
          myCollection.owner.toString(),
        );
      });
    });
  });

  describe("POST /collections add card to collection", () => {
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
    describe("add card to a collection in the request body", () => {
      it("should send status 200 and add a card to a collection", async () => {
        const resCollectionPost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(resCollectionPost.statusCode).toEqual(200);
        const responsePostCard = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePostCard.statusCode).toEqual(200);
        const resPostCardToCollection = await request(server)
          .post(`/collections/${resCollectionPost.body.collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePostCard.body.card._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(200);
        const collectionForCard = await CollectionForCard.findOne({
          cardCollection: resCollectionPost.body.collection._id,
        }).lean();
        expect(responsePostCard.body.card._id).toEqual(
          collectionForCard.tradingCard.toString(),
        );
      });
    });
    describe("add card to a collection that already has that card in the request body", () => {
      it("should send status 409 and not add a card to a collection", async () => {
        const resCollectionPost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(resCollectionPost.statusCode).toEqual(200);
        const responsePostCard = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePostCard.statusCode).toEqual(200);
        const resPostCardToCollection = await request(server)
          .post(`/collections/${resCollectionPost.body.collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePostCard.body.card._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(200);
        const resPostCardToCollectionDup = await request(server)
          .post(`/collections/${resCollectionPost.body.collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePostCard.body.card._id,
          });
        expect(resPostCardToCollectionDup.statusCode).toEqual(409);
        const collectionForCard = await CollectionForCard.find({
          cardCollection: resCollectionPost.body.collection._id,
        }).lean();
        expect(responsePostCard.body.card._id).toEqual(
          collectionForCard[0].tradingCard.toString(),
        );
        expect(collectionForCard.length).toEqual(1);
      });
    });
    describe("add card to a collection with empty card ID in the request body", () => {
      it("should send status 400 and not add a card to a collection", async () => {
        const resCollectionPost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(resCollectionPost.statusCode).toEqual(200);
        const resPostCardToCollectionDup = await request(server)
          .post(`/collections/${resCollectionPost.body.collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: "",
          });
        expect(resPostCardToCollectionDup.statusCode).toEqual(400);
        const collectionForCard = await CollectionForCard.find({
          cardCollection: resCollectionPost.body.collection._id,
        }).lean();
        expect(collectionForCard.length).toEqual(0);
      });
    });
    describe("add card to a collection with an invalid collection ID in the request body", () => {
      it("should send status 400 and not add a card to a collection", async () => {
        const responsePostCard = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePostCard.statusCode).toEqual(200);
        const resPostCardToCollection = await request(server)
          .post(`/collections/123`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePostCard.body.card._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(400);
        const collectionForCard = await CollectionForCard.find({
          tradingCard: responsePostCard.body.card._id,
        }).lean();
        expect(collectionForCard.length).toEqual(1);
      });
    });
    describe("add card to a collection with an invalid ID in the request body", () => {
      it("should send status 400 and not add a card to a collection", async () => {
        const resCollectionPost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(resCollectionPost.statusCode).toEqual(200);
        const resPostCardToCollectionDup = await request(server)
          .post(`/collections/${resCollectionPost.body.collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: "123",
          });
        expect(resPostCardToCollectionDup.statusCode).toEqual(400);
        const collectionForCard = await CollectionForCard.find({
          cardCollection: resCollectionPost.body.collection._id,
        }).lean();
        expect(collectionForCard.length).toEqual(0);
      });
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
    describe("update a collection with an invalid collection ID in the URL params", () => {
      it("should send status 400 and not update a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const responsePut = await request(server)
          .put(`/collections/123`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "updatedTitle" });
        expect(responsePut.statusCode).toEqual(400);
        const collections = await CardCollectionDao.find({
          title: "updatedTitle",
        }).lean();
        expect(collections.length).toEqual(0);
      });
    });
    describe("update a collection with a collection ID in the URL params for a collection that doesn't exist", () => {
      it("should send status 404 and not update a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const collections = await CardCollectionDao.find({
          title: "testCollection",
        }).lean();
        expect(collections.length).toEqual(0);
        const responsePut = await request(server)
          .put(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "updatedTitle" });
        expect(responsePut.statusCode).toEqual(404);
      });
    });
    describe("update a collection with a collection ID in the URL params for a collection that the user doesn't own", () => {
      it("should send status 401 and not update a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const responsePut = await request(server)
          .put(`/collections/${user0MainCollection._id}`)
          .set("Authorization", "Bearer " + token1)
          .send({ collectionTitle: "updatedTitle" });
        expect(responsePut.statusCode).toEqual(401);
        const collections = await CardCollectionDao.find({
          title: "updatedTitle",
        }).lean();
        expect(collections.length).toEqual(0);
      });
    });
    describe("update a collection with a collection ID in the URL params for a collection that the user owns", () => {
      it("should send status 200 and update a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collectionIdExpected = responsePost.body.collection._id;
        const responsePut = await request(server)
          .put(`/collections/${collectionIdExpected}`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "updatedTitle" });
        expect(responsePut.statusCode).toEqual(200);
        const collections = await CardCollectionDao.find({
          title: "updatedTitle",
        }).lean();
        expect(collections.length).toEqual(1);
        const collectionIdReceived = collections[0]._id.toString();
        expect(collectionIdReceived).toEqual(collectionIdExpected);
      });
    });
    describe("admin update a collection with a collection ID in the URL params for any collection", () => {
      it("should send status 200 and update a collection", async () => {
        const responsePost = await request(server)
          .post("/collections")
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collectionId = responsePost.body.collection._id;
        await UserDao.updateOne(
          { username: user1.username },
          { $set: { roles: ["admin"] } },
        );
        const respsonseLogin = await request(server)
          .post("/auth/login")
          .send(user1);
        const token2 = respsonseLogin.body.token;
        const responsePut = await request(server)
          .put(`/collections/${collectionId}`)
          .set("Authorization", "Bearer " + token2)
          .send({ collectionTitle: "updatedTitle" });
        expect(responsePut.statusCode).toEqual(200);
        expect(responsePut.body.modifiedCount).toEqual(1);
        const updateCollectionArray = await CardCollectionDao.find({
          title: "updatedTitle",
        }).lean();
        expect(updateCollectionArray.length).toEqual(1);
        const collectionIdReceived = updateCollectionArray[0]._id.toString();
        expect(collectionIdReceived).toEqual(collectionId);
      });
    });
  });

  describe("PUT /demo", () => {
    let token0;
    let token1;
    let token2;
    let token3;
    let token4;
    let user0MainCollection;
    beforeEach(async () => {
      const result = await request(server).post("/auth/signup").send(user0);
      user0MainCollection = result.body.collection;
      await User.updateOne(
        { username: "user011" },
        { $set: { roles: ["admin"] } },
      );
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
      await request(server).post("/auth/signup").send(uncle);
      const res2 = await request(server).post("/auth/login").send(uncle);
      token2 = res2.body.token;
      await request(server)
        .post("/cards")
        .set("Authorization", "Bearer " + token2)
        .send(card);
      await request(server).post("/auth/signup").send(grandpa);
      const res3 = await request(server).post("/auth/login").send(grandpa);
      token3 = res3.body.token;
      await request(server)
        .post("/cards")
        .set("Authorization", "Bearer " + token3)
        .send(card0);
      await request(server).post("/auth/signup").send(demo);
      const res4 = await request(server).post("/auth/login").send(demo);
      token4 = res4.body.token;
      await request(server)
        .post("/cards")
        .set("Authorization", "Bearer " + token4)
        .send(cardDemo);
      await request(server)
        .post("/cards")
        .set("Authorization", "Bearer " + token4)
        .send(card0Demo);
    });
    describe("run demo reset with admin user", () => {
      it("should send status 200", async () => {
        const responsePut = await request(server)
          .put(`/collections/demo`)
          .set("Authorization", "Bearer " + token0);
        expect(responsePut.statusCode).toEqual(200);
        expect(responsePut.body.resultCards.length).toEqual(2);
        expect(responsePut.body.resultCollectionEntries.length).toEqual(2);
      });
    });
    describe("run demo reset with user that is not admin", () => {
      it("should send status 401", async () => {
        const responsePut = await request(server)
          .put(`/collections/demo`)
          .set("Authorization", "Bearer " + token1);
        expect(responsePut.statusCode).toEqual(401);
      });
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
    describe("delete a collection with an invalid ID in the URL params", () => {
      it("should send code 400 and not delete a collection", async () => {
        const response = await request(server)
          .delete(`/collections/123`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("delete a collection with a collection ID in the URL params for a collection that doesn't exist", () => {
      it("should send status 404 and not delete a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const collections = await CardCollectionDao.find({
          title: "testCollection",
        }).lean();
        expect(collections.length).toEqual(0);
        const responseDelete2 = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete2.statusCode).toEqual(404);
      });
    });
    describe("delete a collection with a collection ID in the URL params for a main collection for a user", () => {
      it("should send status code 409 and not delete a collection", async () => {
        const response = await request(server)
          .delete(`/collections/${user0MainCollection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(409);
        const collections = await CardCollectionDao.find({
          title: user0.username,
        }).lean();
        expect(collections.length).toEqual(1);
      });
    });
    describe("delete a collection with a collection ID in the URL params for a collection that the user owns", () => {
      it("should send status 200 and delete a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const collections = await CardCollectionDao.find({
          title: "testCollection",
        }).lean();
        expect(collections.length).toEqual(0);
      });
    });
    describe("delete a collection with a collection ID in the URL params for a collection that the user doesn't own", () => {
      it("should not delete collection and send status code 401", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(responseDelete.statusCode).toEqual(401);
        const collections = await CardCollectionDao.find({
          title: "testCollection",
        }).lean();
        expect(collections.length).toEqual(1);
      });
    });
    describe("admin delete a collection with a collection ID in the URL params for any collection", () => {
      it("should delete collection and send status code 200", async () => {
        const responsePost = await request(server)
          .post("/collections")
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collectionId = responsePost.body.collection._id;
        await UserDao.updateOne(
          { username: user1.username },
          { $set: { roles: ["admin"] } },
        );
        const respsonseLogin = await request(server)
          .post("/auth/login")
          .send(user1);
        const token2 = respsonseLogin.body.token;
        const responseDelete = await request(server)
          .delete(`/collections/${collectionId}`)
          .set("Authorization", "Bearer " + token2)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        expect(responseDelete.body.deletedCount).toEqual(1);
        const deleteCollectionArray = await CardCollectionDao.find({
          _id: collectionId,
        }).lean();
        expect(deleteCollectionArray.length).toEqual(0);
      });
    });
  });

  describe("DELETE /collections/forcard remove card from collection", () => {
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
    describe("delete a collection with an invalid ID in the URL query", () => {
      it("should send code 400 and not delete a collection", async () => {
        const response = await request(server)
          .delete(`/collections/forcard/`)
          .query({ card: "123", collection: "123" })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(response.statusCode).toEqual(400);
      });
    });
    describe("remove a card from a collection with a collection ID in the URL params for a collection that doesn't exist", () => {
      it("should send status 404 and not delete a collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const responseDelete = await request(server)
          .delete(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const collections = await CardCollectionDao.find({
          title: "testCollection",
        }).lean();
        expect(collections.length).toEqual(0);
        const responseDelete2 = await request(server)
          .delete(`/collections/`)
          .query({
            card: responsePost1.body.card._id,
            collection: collection._id,
          })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete2.statusCode).toEqual(404);
      });
    });
    describe("remove a card from a collection with a collection ID in the URL query for a collection that the user owns", () => {
      it("should send status 200 and remove the card from the collection", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const resPostCardToCollection = await request(server)
          .post(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePost1.body.card._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(200);
        const responseDelete = await request(server)
          .delete(`/collections/forcard/`)
          .query({
            collection: collection._id,
            card: responsePost1.body.card._id,
          })
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        const collectionForCard = await CollectionForCard.find({
          cardCollection: collection._id,
          tradingCard: responsePost1.body.card._id,
        }).lean();
        expect(collectionForCard.length).toEqual(0);
      });
    });
    describe("remove a card from a collection with a collection ID in the URL params for a collection that the user doesn't own", () => {
      it("should not delete collection and send status code 401", async () => {
        const responsePost = await request(server)
          .post(`/collections`)
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collection = responsePost.body.collection;
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const myCard = responsePost1.body.card;
        const resPostCardToCollection = await request(server)
          .post(`/collections/${collection._id}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: myCard._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(200);
        const responseDelete = await request(server)
          .delete(`/collections/forcard/`)
          .query({ collection: collection._id, card: myCard._id })
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(responseDelete.statusCode).toEqual(401);
        const collectionForCard = await CollectionForCard.find({
          cardCollection: collection._id,
          tradingCard: responsePost1.body.card._id,
        }).lean();
        expect(collectionForCard.length).toEqual(1);
      });
    });
    describe("admin remove a card from a collection with a collection ID in the URL params for any collection", () => {
      it("should delete collection and send status code 200", async () => {
        const responsePost = await request(server)
          .post("/collections")
          .set("Authorization", "Bearer " + token0)
          .send({ collectionTitle: "testCollection" });
        expect(responsePost.statusCode).toEqual(200);
        const collectionId = responsePost.body.collection._id;
        const responsePost1 = await request(server)
          .post("/cards")
          .set("Authorization", "Bearer " + token0)
          .send(card);
        expect(responsePost1.statusCode).toEqual(200);
        const resPostCardToCollection = await request(server)
          .post(`/collections/${collectionId}`)
          .set("Authorization", "Bearer " + token0)
          .send({
            cardId: responsePost1.body.card._id,
          });
        expect(resPostCardToCollection.statusCode).toEqual(200);
        await UserDao.updateOne(
          { username: user1.username },
          { $set: { roles: ["admin"] } },
        );
        const respsonseLogin = await request(server)
          .post("/auth/login")
          .send(user1);
        const token2 = respsonseLogin.body.token;
        const responseDelete = await request(server)
          .delete(`/collections/forcard/`)
          .query({
            collection: collectionId,
            card: responsePost1.body.card._id,
          })
          .set("Authorization", "Bearer " + token2)
          .send();
        expect(responseDelete.statusCode).toEqual(200);
        expect(responseDelete.body.deletedCount).toEqual(1);
        const collectionForCard = await CollectionForCard.find({
          cardCollection: collectionId,
          tradingCard: responsePost1.body.card._id,
        }).lean();
        expect(collectionForCard.length).toEqual(0);
      });
    });
  });
});
