const { NotFoundError, BadRequestError } = require("../expressError");
const Review = require("./reviews.js");
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

describe("create", function () {
  let newReview = {
    reviewedUsername: "u3",
    reviewerUsername: "u1",
    rating: 10,
    body: "test review",
  };

  test("works", async function () {
    let review = await Review.create(newReview);
    expect(review).toEqual({
      id: 2,
      ...newReview,
      madeAt: expect.any(Date),
    });
  });

  test("fails with nonexistent user", async function () {
    try {
      await Review.create({ ...newReview, reviewedUser: "bad user" });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("fails when reviewer has already given user a review", async function () {
    try {
      await Review.create({ ...newReview, reviewedUser: "u2" });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("fails when reviewer and reviewed have not made any transactions", async function () {
    try {
      await Review.create({
        ...newReview,
        reviewerUser: "u2",
        reviewedUser: "u1",
      });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("get by id", function () {
  test("works", async function () {
    let review = await Review.getById(1);
    expect(review).toEqual({
      review: {
        reviewerUser: "u1",
        reviewedUser: "u2",
        rating: 10,
        body: "test body",
        madeAt: expect.any(Date),
      },
    });
  });

  test("fails when nonexistent id", async function () {
    try {
      await Review.getById(2);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
