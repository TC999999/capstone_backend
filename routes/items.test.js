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

describe("GET /items", function () {
  test("gets all items no query", async function () {
    let res = await request(app)
      .get("/items")
      .query({})
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      items: [
        {
          id: 3,
          name: "i3",
          imageURL: "test_url_3",
          initialPrice: 100,
          condition: "great",
          description: "test item",
          sellerUser: "u2",
          types: [
            { id: 1, name: "electronics" },
            { id: 3, name: "books" },
          ],
          location: {
            city: "city2",
            regionOrState: "state2",
            country: "country2",
            zipCode: "22222",
          },
        },
        {
          id: 2,
          name: "i2",
          imageURL: "test_url_2",
          initialPrice: 100,
          condition: "great",
          description: "test item",
          sellerUser: "u1",
          types: [
            { id: 1, name: "electronics" },
            { id: 2, name: "movies" },
          ],
          location: {
            city: "city1",
            regionOrState: "state1",
            country: "country1",
            zipCode: "11111",
          },
        },
        {
          id: 1,
          name: "i1",
          imageURL: "test_url_1",
          initialPrice: 100,
          condition: "great",
          description: "test item",
          sellerUser: "u1",
          types: [{ id: 1, name: "electronics" }],
          location: {
            city: "city1",
            regionOrState: "state1",
            country: "country1",
            zipCode: "11111",
          },
        },
      ],
    });
  });

  test("gets all items with query", async function () {
    let res = await request(app)
      .get("/items")
      .query({ name: "i3" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      items: [
        {
          id: 3,
          name: "i3",
          imageURL: "test_url_3",
          initialPrice: 100,
          condition: "great",
          description: "test item",
          sellerUser: "u2",
          types: [
            { id: 1, name: "electronics" },
            { id: 3, name: "books" },
          ],
          location: {
            city: "city2",
            regionOrState: "state2",
            country: "country2",
            zipCode: "22222",
          },
        },
      ],
    });
  });

  test("gets empty array when no items match query", async function () {
    let res = await request(app)
      .get("/items")
      .query({ maxPrice: 50 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      items: [],
    });
  });

  test("fails when user is flagged", async function () {
    let res = await request(app)
      .get("/items")
      .query({})
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails when user is unauth", async function () {
    let res = await request(app).get("/items").query({});
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /items/:id", function () {
  test("gets item with id", async function () {
    let res = await request(app)
      .get("/items/1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(res.body).toEqual({
      item: {
        id: 1,
        name: "i1",
        imageURL: "test_url_1",
        initialPrice: 100,
        condition: "great",
        description: "test item",
        sellerUser: "u1",
        isSold: false,
        types: [{ id: 1, name: "electronics" }],
        location: {
          city: "city1",
          address: "100 address",
          latitude: "10.99876",
          longitude: "-99.99981",
          regionOrState: "state1",
          country: "country1",
          zipCode: "11111",
        },
      },
    });
  });

  test("fails when user is unauth", async function () {
    let res = await request(app).get("/items/1").query({});
    expect(res.statusCode).toEqual(401);
  });

  test("fails when user is flagged", async function () {
    let res = await request(app)
      .get("/items/1")
      .query({})
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("PATCH /items/:id/edit/:username", function () {
  test("updates item when correct user", async function () {
    let res = await request(app)
      .patch("/items/1/edit/u1")
      .send({ name: "new item name" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      item: {
        id: 1,
        name: "new item name",
        imageURL: "test_url_1",
        initialPrice: 100,
        condition: "great",
        description: "test item",
      },
    });
  });

  test("updates item when admin", async function () {
    let res = await request(app)
      .patch("/items/1/edit/u1")
      .send({ name: "new item name" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({
      item: {
        id: 1,
        name: "new item name",
        imageURL: "test_url_1",
        initialPrice: 100,
        condition: "great",
        description: "test item",
      },
    });
  });

  test("fails when other user", async function () {
    let res = await request(app)
      .patch("/items/1/edit/u1")
      .send({ name: "new item name" })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails when other user", async function () {
    let res = await request(app)
      .patch("/items/1/edit/u3")
      .send({ name: "new item name" })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails when there's a bad parameter", async function () {
    let res = await request(app)
      .patch("/items/1/edit/u1")
      .send({ non_existent_field: "bad field" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
});

describe("POST /types/new", function () {
  test("works with admin", async function () {
    let res = await request(app)
      .post("/items/types/new")
      .send({ typeName: "newType" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({ newType: { name: "newType" } });
  });

  test("fails with already existing types", async function () {
    let res = await request(app)
      .post("/items/types/new")
      .send({ typeName: "books" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails with non admin users", async function () {
    let res = await request(app)
      .post("/items/types/new")
      .send({ typeName: "newTyoe" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });
});
