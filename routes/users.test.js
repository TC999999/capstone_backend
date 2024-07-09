"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
  u4Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /users", function () {
  test("works for admins", async function () {
    const res = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "fn1",
          lastName: "ln1",
          email: "testemail1@gmail.com",
          isAdmin: false,
          isFlagged: false,
        },
        {
          username: "u2",
          firstName: "fn2",
          lastName: "ln2",
          email: "testemail2@gmail.com",
          isAdmin: true,
          isFlagged: false,
        },
        {
          username: "u3",
          firstName: "fn3",
          lastName: "ln3",
          email: "testemail3@gmail.com",
          isAdmin: false,
          isFlagged: false,
        },
        {
          username: "u4",
          firstName: "fn4",
          lastName: "ln4",
          email: "testemail4@gmail.com",
          isAdmin: false,
          isFlagged: true,
        },
      ],
    });
  });

  test("fails for non admins", async function () {
    const res = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /users/:username", function () {
  test("works for same user", async function () {
    const res = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      user: {
        username: "u1",
        firstName: "fn1",
        lastName: "ln1",
        email: "testemail1@gmail.com",
        address: "100 address",
        zipCode: "11111",
        regionOrState: "state1",
        city: "city1",
        country: "country1",
        latitude: "10.99876",
        longitude: "-99.99981",
        isAdmin: false,
        isFlagged: false,
        items: [
          {
            itemID: 1,
            name: "i1",
            initialPrice: 100,
            imageURL: "test_url_1",
            condition: "great",
            description: "test item",
          },
          {
            itemID: 2,
            name: "i2",
            initialPrice: 100,
            imageURL: "test_url_2",
            condition: "great",
            description: "test item",
          },
        ],
        reviews: [],
        reports: [],
        pastPurchases: [
          {
            purchaseID: 1,
            itemName: "i4",
            sellerUser: "u3",
            imageURL: "test_url_4",
            price: 150,
            soldAt: expect.any(String),
            fromFlaggedUser: false,
          },
        ],
      },
    });
  });

  test("works for other users", async function () {
    const res = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.body).toEqual({
      user: {
        username: "u1",
        firstName: "fn1",
        lastName: "ln1",
        email: "testemail1@gmail.com",
        address: "100 address",
        zipCode: "11111",
        regionOrState: "state1",
        city: "city1",
        country: "country1",
        latitude: "10.99876",
        longitude: "-99.99981",
        isAdmin: false,
        isFlagged: false,
        items: [
          {
            itemID: 1,
            name: "i1",
            initialPrice: 100,
            imageURL: "test_url_1",
            condition: "great",
            description: "test item",
          },
          {
            itemID: 2,
            name: "i2",
            initialPrice: 100,
            imageURL: "test_url_2",
            condition: "great",
            description: "test item",
          },
        ],
        reviews: [],
        reports: [],
        pastPurchases: [
          {
            purchaseID: 1,
            itemName: "i4",
            sellerUser: "u3",
            imageURL: "test_url_4",
            price: 150,
            soldAt: expect.any(String),
            fromFlaggedUser: false,
          },
        ],
      },
    });
  });

  test("fails for a flagged user", async function () {
    const res = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails for a unauth user", async function () {
    const res = await request(app).get("/users/u1");
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /users/get/current", function () {
  test("works", async function () {
    const res = await request(app)
      .get("/users/get/current")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      user: {
        username: "u1",
        firstName: "fn1",
        lastName: "ln1",
        email: "testemail1@gmail.com",
        address: "100 address",
        zipCode: "11111",
        regionOrState: "state1",
        city: "city1",
        country: "country1",
        latitude: "10.99876",
        longitude: "-99.99981",
        isAdmin: false,
        isFlagged: false,
        items: [
          {
            itemID: 1,
            name: "i1",
            initialPrice: 100,
            imageURL: "test_url_1",
            condition: "great",
            description: "test item",
          },
          {
            itemID: 2,
            name: "i2",
            initialPrice: 100,
            imageURL: "test_url_2",
            condition: "great",
            description: "test item",
          },
        ],
        reviews: [],
        reports: [],
        pastPurchases: [
          {
            purchaseID: 1,
            itemName: "i4",
            sellerUser: "u3",
            imageURL: "test_url_4",
            price: 150,
            soldAt: expect.any(String),
            fromFlaggedUser: false,
          },
        ],
      },
    });
  });
});

describe("PATCH /users/:username", () => {
  test("works with same user", async function () {
    const res = await request(app)
      .patch("/users/u1")
      .send({ firstName: "new name" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      user: {
        username: "u1",
        firstName: "new name",
        lastName: "ln1",
        email: "testemail1@gmail.com",
        city: "city1",
        regionOrState: "state1",
        country: "country1",
        isFlagged: false,
        isAdmin: false,
      },
    });
  });

  test("fails with different users", async function () {
    const res = await request(app)
      .patch("/users/u1")
      .send({ firstName: "new name" })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("prevents making yourself an admin", async function () {
    const res = await request(app)
      .patch("/users/u1")
      .send({ isAdmin: true })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
});

describe("PATCH /users/:username/adminUpdate", () => {
  test("works with admin", async function () {
    const res = await request(app)
      .patch("/users/u1/adminUpdate")
      .send({ isFlagged: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({
      user: {
        username: "u1",
        firstName: "fn1",
        lastName: "ln1",
        email: "testemail1@gmail.com",
        city: "city1",
        regionOrState: "state1",
        country: "country1",
        isFlagged: true,
        isAdmin: false,
      },
    });
  });

  test("fails with non admin", async function () {
    const res = await request(app)
      .patch("/users/u1/adminUpdate")
      .send({ isAdmin: true })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /users/:username/reccomendedItems", function () {
  test("gets with same user", async function () {
    const res = await request(app)
      .get("/users/u1/reccomendedItems")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      reccomendedItems: [
        {
          id: 3,
          name: "i3",
          imageURL: "test_url_3",
          initialPrice: 100,
          sellerUser: "u2",
          condition: "great",
          description: "test item",
          location: {
            regionOrState: "state2",
            city: "city2",
            country: "country2",
            zipCode: "22222",
          },
        },
      ],
    });
  });

  test("gets with admin user", async function () {
    const res = await request(app)
      .get("/users/u1/reccomendedItems")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({
      reccomendedItems: [
        {
          id: 3,
          name: "i3",
          imageURL: "test_url_3",
          initialPrice: 100,
          sellerUser: "u2",
          condition: "great",
          description: "test item",
          location: {
            regionOrState: "state2",
            city: "city2",
            country: "country2",
            zipCode: "22222",
          },
        },
      ],
    });
  });

  test("fails with different user", async function () {
    const res = await request(app)
      .get("/users/u1/reccomendedItems")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /users/:username/itemsInLocation", function () {
  test("gets with same user", async function () {
    const res = await request(app)
      .get("/users/u1/itemsInLocation")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      itemsInLocation: [],
    });
  });

  test("gets with admin user", async function () {
    const res = await request(app)
      .get("/users/u1/itemsInLocation")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({
      itemsInLocation: [],
    });
  });

  test("fails with different user", async function () {
    const res = await request(app)
      .get("/users/u1/itemsInLocation")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("POST /users/items/sale", function () {
  test("sells item successfully to other user", async function () {
    const res = await request(app)
      .post("/users/items/sale")
      .send({
        itemID: 1,
        buyerUsername: "u2",
        finalPrice: 200,
        exchangeMethod: "pickup",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      purchase: { itemID: 1, username: "u2", message: "success" },
    });
  });

  test("fails when selling item to yourself", async function () {
    const res = await request(app)
      .post("/users/items/sale")
      .send({
        itemID: 1,
        buyerUsername: "u1",
        finalPrice: 200,
        exchangeMethod: "pickup",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails when selling item that doesn't belong to user", async function () {
    const res = await request(app)
      .post("/users/items/sale")
      .send({
        itemID: 1,
        buyerUsername: "u2",
        finalPrice: 200,
        exchangeMethod: "pickup",
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(400);
  });
});
