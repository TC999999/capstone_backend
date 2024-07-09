"use strict";

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../expressError");
const User = require("./users.js");
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

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "fn1",
      lastName: "ln1",
      email: "testemail1@gmail.com",
      isAdmin: false,
      isFlagged: false,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("u4", "password4");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("u1", "password2");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

describe("register", function () {
  const newUser = {
    username: "testNew",
    firstName: "fn4",
    lastName: "ln4",
    email: "newtest@gmail.com",
    address: "test address",
    zipCode: 11111,
    city: "test city",
    country: "test country",
    regionOrState: "test state",
    latitude: 10.99999,
    longitude: -10.99999,
    isAdmin: false,
    isFlagged: false,
  };

  test("works", async function () {
    let user = await User.register({ ...newUser, password: "password" });
    expect(user).toEqual({
      username: "testNew",
      firstName: "fn4",
      lastName: "ln4",
      email: "newtest@gmail.com",
      isAdmin: false,
      isFlagged: false,
    });
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
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
    ]);
  });
});

describe("get", function () {
  test("works", async function () {
    let user = await User.get("u1");
    expect(user).toEqual({
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
          soldAt: expect.any(Date),
          fromFlaggedUser: false,
        },
      ],
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("uf");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  const updateData = {
    firstName: "fnNew",
    lastName: "lnNew",
    email: "newtest@gmail.com",
  };
  test("works", async function () {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      username: "u1",
      firstName: "fnNew",
      lastName: "lnNew",
      email: "newtest@gmail.com",
      city: "city1",
      regionOrState: "state1",
      country: "country1",
      isFlagged: false,
      isAdmin: false,
    });
  });
});

describe("make sale", function () {
  test("works", async function () {
    let sale = await User.makeSale(3, "u1", 200, "pickup");
    expect(sale).toEqual({
      itemID: 3,
      username: "u1",
      message: "success",
    });
  });

  test("error if item is already sold", async function () {
    try {
      await User.makeSale(4, "u1", 200, "pickup");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("reccomended items", function () {
  test("works", async function () {
    let pastTypes = await User.getPastPurchasesTypes("u1");
    expect(pastTypes).toEqual([1]);
    let items = await User.recItemsByTypes("u1", pastTypes);
    expect(items).toEqual([
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
    ]);
  });
});
