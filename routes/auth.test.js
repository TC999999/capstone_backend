"use strict";

const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
      password: "password1",
    });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with nonexistent user", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "bad user",
      password: "password1",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
      password: "bad password",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with flaggedUser", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u4",
      password: "password4",
    });
    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /auth/register", function () {
  const newUser = {
    username: "testNew",
    password: "newpassword",
    firstName: "fn4",
    lastName: "ln4",
    email: "newtest@gmail.com",
    address: "test address",
    zipCode: "11111",
    city: "test city",
    country: "test country",
    regionOrState: "test state",
    latitude: 10.99999,
    longitude: -10.99999,
  };

  test("works for new user", async function () {
    const resp = await request(app).post("/auth/register").send(newUser);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app).post("/auth/register").send({
      username: "testnew",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        ...newUser,
        email: "bad email",
      });
    expect(resp.statusCode).toEqual(400);
  });
});
