"use strict";

const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u2Token,
  u1Token,
  adminToken,
  u4Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /reports", function () {
  test("works for admins", async function () {
    let res = await request(app)
      .get("/reports")
      .set("authorization", `Bearer ${u2Token}`)
      .query({ username: "u2" });
    expect(res.body).toEqual({ reports: [] });
  });

  test("works for admins", async function () {
    let res = await request(app)
      .get("/reports")
      .set("authorization", `Bearer ${u2Token}`)
      .query({ username: "u3" });
    expect(res.body).toEqual({
      reports: [
        {
          id: 1,
          reportedUser: "u2",
          reporterUser: "u1",
          body: "test body",
          madeAt: expect.any(String),
          isCleared: false,
        },
      ],
    });
  });

  test("fails for non admins", async function () {
    let res = await request(app)
      .get("/reports")
      .set("authorization", `Bearer ${u1Token}`)
      .query({ username: "u3" });
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /reports/:id", function () {
  test("works for admins", async function () {
    let res = await request(app)
      .get("/reports/1")
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.body).toEqual({
      report: {
        reportedUser: "u2",
        reporterUser: "u1",
        body: "test body",
        madeAt: expect.any(String),
        isCleared: false,
      },
    });
  });

  test("fails for non admins", async function () {
    let res = await request(app)
      .get("/reports/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails for non admins with reports", async function () {
    let res = await request(app)
      .get("/reports/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

describe("POST /reports", function () {
  test("works for all users", async function () {
    let res = await request(app)
      .post("/reports")
      .send({ reportedUsername: "u3", body: "test report" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({
      id: 2,
      reporterUsername: "u1",
      reportedUsername: "u3",
      body: "test report",
      madeAt: expect.any(String),
    });
  });

  test("fails if user reports themselves", async function () {
    let res = await request(app)
      .post("/reports")
      .send({ reportedUsername: "u1", body: "test report" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });

  test("fails if user is flagged", async function () {
    let res = await request(app)
      .post("/reports")
      .send({ reportedUsername: "u1", body: "test report" })
      .set("authorization", `Bearer ${u4Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("fails if user is unauth", async function () {
    let res = await request(app)
      .post("/reports")
      .send({ reportedUsername: "u1", body: "test report" });
    expect(res.statusCode).toEqual(401);
  });
});

describe("PATCH /reports/clear/:id", function () {
  test("admins can clear reports", async function () {
    let res = await request(app)
      .patch("/reports/clear/1")
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.body).toEqual({
      reported_username: "u2",
      reporter_username: "u1",
      body: "test body",
      made_at: expect.any(String),
      is_cleared: true,
    });
  });

  test("admins cannot clear nonexistent reports", async function () {
    let res = await request(app)
      .patch("/reports/clear/4")
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(404);
  });

  test("admins who have been reported cannot clear their own reports", async function () {
    let res = await request(app)
      .patch("/reports/clear/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("regular users cannot clear reports", async function () {
    let res = await request(app)
      .patch("/reports/clear/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });
});
