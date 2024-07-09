const jwt = require("jsonwebtoken");
const { createToken } = require("./token");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
  test("works: not admin", function () {
    const token = createToken({
      username: "test",
      isAdmin: false,
      isFlagged: false,
    });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
      isFlagged: false,
    });
  });

  test("works: admin", function () {
    const token = createToken({
      username: "test",
      isAdmin: true,
      isFlagged: false,
    });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: true,
      isFlagged: false,
    });
  });

  test("works: flagged", function () {
    const token = createToken({
      username: "test",
      isAdmin: false,
      isFlagged: true,
    });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
      isFlagged: true,
    });
  });

  test("works: default no admin and no flagged", function () {
    // given the security risk if this didn't work, checking this specifically
    const token = createToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
      isFlagged: false,
    });
  });
});
