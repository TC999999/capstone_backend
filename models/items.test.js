"use strict";

const db = require("../db.js");
const Item = require("./items.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { BadRequestError } = require("../expressError.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  let newItem = {
    name: "newI",
    imageURL: "new_image_url",
    initialPrice: 100,
    condition: "good",
    description: "test item",
    sellerUsername: "u2",
    isSold: false,
  };

  let newTypeArr = [1, 2];

  test("works", async function () {
    let item = await Item.create(newItem);
    expect(item).toEqual({
      name: "newI",
      imageURL: "new_image_url",
      initialPrice: 100,
      condition: "good",
      description: "test item",
      sellerUser: "u2",
      id: 5,
    });

    await Item.addItemToTypes(5, newTypeArr);
    let types = await db.query(
      "SELECT type_id from items_to_types WHERE item_id=5"
    );
    expect(types.rows).toEqual([
      {
        type_id: 1,
      },
      { type_id: 2 },
    ]);
  });
});

describe("findAll", function () {
  test("no query", async function () {
    let items = await Item.findAll({});
    expect(items).toEqual([
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
    ]);
  });

  test("name query", async function () {
    let items = await Item.findAll({ name: "i1" });
    expect(items).toEqual([
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
    ]);
  });
});

describe("findByID", function () {
  test("works", async function () {
    let item = await Item.findById(1);
    expect(item).toEqual({
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
    });
  });
});

describe("update", function () {
  let updateData = {
    initialPrice: 200,
    description: "new description",
    condition: "good",
  };
  test("works", async function () {
    let item = await Item.update(1, updateData);
    expect(item).toEqual({
      id: 1,
      name: "i1",
      imageURL: "test_url_1",
      initialPrice: 200,
      condition: "good",
      description: "new description",
    });
  });
});

describe("addItemTypes", function () {
  test("works", async function () {
    let newType = await Item.addItemTypes("newType");
    expect(newType).toEqual({ name: "newType" });
  });

  test("fails when type already exists", async function () {
    try {
      await Item.addItemTypes("books");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
