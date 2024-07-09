"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /reviews/:id", function () {
  test("get a review by id", async function () {
    let res = await request(app)
      .get("/reviews/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      review: {
        reviewerUser: "u1",
        reviewedUser: "u2",
        rating: 10,
        body: "test body",
        madeAt: expect.any(String),
      },
    });
  });

  test("fails for nonexistent review", async function () {
    let res = await request(app)
      .get("/reviews/0")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(404);
  });

  test("fails for flagged user", async function () {
    let res = await request(app)
      .get("/reviews/1")
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails for unauth user", async function () {
    let res = await request(app).get("/reviews/1");
    expect(res.statusCode).toEqual(401);
  });
});

describe("POST /reviews", function () {
  test("make a new review for a user you have bought something from", async function () {
    let res = await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u3", rating: 10, body: "test review" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      id: 2,
      reviewedUsername: "u3",
      reviewerUsername: "u1",
      rating: 10,
      body: "test review",
      madeAt: expect.any(String),
    });
  });

  test("fails at making duplicate reviews", async function () {
    await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u3", rating: 10, body: "test review" })
      .set("authorization", `Bearer ${u1Token}`);
    let res = await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u3", rating: 10, body: "test review" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails at making reviews to people you have not bought anything from", async function () {
    let res = await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u2", rating: 10, body: "test review" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails at making reviews to nonexistent users", async function () {
    let res = await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u0", rating: 10, body: "test review" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(404);
  });

  test("fails for flagged users", async function () {
    let res = await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u1", rating: 10, body: "test review" })
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails for unauth users", async function () {
    let res = await request(app)
      .post("/reviews/post")
      .send({ reviewedUsername: "u1", rating: 10, body: "test review" });
    expect(res.statusCode).toEqual(401);
  });
});
