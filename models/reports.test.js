const { NotFoundError } = require("../expressError");
const Report = require("./reports.js");
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
  let newReport = {
    reporterUsername: "u1",
    reportedUsername: "u2",
    body: "test report",
  };

  test("works", async function () {
    let report = await Report.create(newReport);
    expect(report).toEqual({
      id: 2,
      ...newReport,
      madeAt: expect.any(Date),
    });
  });

  test("fails with nonexistent username", async function () {
    try {
      await Report.create({
        ...newReport,
        reportedUsername: "baduser",
      });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("getByID", function () {
  test("works", async function () {
    let report = await Report.get(1);
    expect(report).toEqual({
      report: {
        reportedUser: "u2",
        reporterUser: "u1",
        body: "test body",
        madeAt: expect.any(Date),
        isCleared: false,
      },
    });
  });

  test("fails with nonexistent id", async function () {
    try {
      await Report.get(2);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("getAll without specified username", function () {
  test("works", async function () {
    let reports = await Report.getAll("u3");
    expect(reports).toEqual({
      reports: [
        {
          id: 1,
          reportedUser: "u2",
          reporterUser: "u1",
          body: "test body",
          madeAt: expect.any(Date),
          isCleared: false,
        },
      ],
    });
  });

  test("fails with nonexistent username", async function () {
    try {
      await Report.getAll("bad user");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("clear report", function () {
  test("works", async function () {
    let report = await Report.clearReport(1);
    expect(report).toEqual({
      reported_username: "u2",
      reporter_username: "u1",
      body: "test body",
      made_at: expect.any(Date),
      is_cleared: true,
    });
  });

  test("fails with nonexistent id", async function () {
    try {
      await Report.clearReport(2);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
