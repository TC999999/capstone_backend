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

describe("GET /messages/conversation/item/:itemID/users/:userOne/and/:userTwo", function () {
  test("works for correct users", async function () {
    const res = await request(app)
      .get("/messages/conversation/item/4/users/u3/and/u1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      conversation: [
        {
          id: 2,
          from_username: "u3",
          to_username: "u1",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(String),
        },
        {
          id: 1,
          from_username: "u1",
          to_username: "u3",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(String),
        },
      ],
    });
  });

  test("works for other correct user", async function () {
    const res = await request(app)
      .get("/messages/conversation/item/4/users/u3/and/u1")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.body).toEqual({
      conversation: [
        {
          id: 2,
          from_username: "u3",
          to_username: "u1",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(String),
        },
        {
          id: 1,
          from_username: "u1",
          to_username: "u3",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(String),
        },
      ],
    });
  });

  test("fails for incorrect users", async function () {
    const res = await request(app)
      .get("/messages/conversation/item/4/users/u3/and/u1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /messages/users/:userOne/and/:userTwo", function () {
  test("works for admins", async function () {
    const res = await request(app)
      .get("/messages/users/u3/and/u1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({
      messages: [
        {
          id: 2,
          from_username: "u3",
          to_username: "u1",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(String),
        },
        {
          id: 1,
          from_username: "u1",
          to_username: "u3",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(String),
        },
      ],
    });
  });

  test("fails for non admins", async function () {
    const res = await request(app)
      .get("/messages/users/u3/and/u1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /messages/id", function () {
  test("works for correct users", async function () {
    const res = await request(app)
      .get("/messages/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      from_user: {
        username: "u1",
        first_name: "fn1",
        last_name: "ln1",
        email: "testemail1@gmail.com",
      },
      to_user: {
        username: "u3",
        first_name: "fn3",
        last_name: "ln3",
        email: "testemail3@gmail.com",
      },
      item: {
        name: "i4",
        asking_price: 100,
        condition: "great",
        description: "test item",
      },

      body: "test body",
      sent_at: expect.any(String),
    });
  });

  test("works for correct users", async function () {
    const res = await request(app)
      .get("/messages/1")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.body).toEqual({
      from_user: {
        username: "u1",
        first_name: "fn1",
        last_name: "ln1",
        email: "testemail1@gmail.com",
      },
      to_user: {
        username: "u3",
        first_name: "fn3",
        last_name: "ln3",
        email: "testemail3@gmail.com",
      },
      item: {
        name: "i4",
        asking_price: 100,
        condition: "great",
        description: "test item",
      },

      body: "test body",
      sent_at: expect.any(String),
    });
  });

  test("fails for incorrect users", async function () {
    const res = await request(app)
      .get("/messages/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("POST /messages/post/:itemID/to/:toUser", function () {
  test("posts message to other user about item", async function () {
    const res = await request(app)
      .post("/messages/post/3/to/u2")
      .send({ body: "test message" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      id: 3,
      from_username: "u1",
      to_username: "u2",
      item_id: 3,
      body: "test message",
      sent_at: expect.any(String),
    });
  });

  test("fails if item has already been sold", async function () {
    const res = await request(app)
      .post("/messages/post/4/to/u3")
      .send({ body: "test message" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails if item does not belong to target user", async function () {
    const res = await request(app)
      .post("/messages/post/3/to/u3")
      .send({ body: "test message" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails if user tries to message themselves", async function () {
    const res = await request(app)
      .post("/messages/post/1/to/u1")
      .send({ body: "test message" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails if target user doesn't exist", async function () {
    const res = await request(app)
      .post("/messages/post/2/to/baduser")
      .send({ body: "test message" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(404);
  });

  test("fails if user is flagged", async function () {
    const res = await request(app)
      .post("/messages/post/1/to/u1")
      .send({ body: "test message" })
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails if user is unauth", async function () {
    const res = await request(app)
      .post("/messages/post/1/to/u1")
      .send({ body: "test message" });
    expect(res.statusCode).toEqual(401);
  });
});
