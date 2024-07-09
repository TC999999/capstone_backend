const { sqlForFilter } = require("./filter");

let jsToSQL = {
  name: '"name" ILIKE ',
  condition: '"condition" ILIKE',
  maxPrice: '"initial_price"<=',
};

describe("returnFilteredSearchQuery", () => {
  test("returns object with an sql string and values for full filtered query", () => {
    let results = sqlForFilter(
      {
        name: "test",
        condition: "great",
        maxPrice: "100",
      },
      jsToSQL
    );
    expect(results).toEqual({
      searchQuery:
        '"name" ILIKE $1 AND "condition" ILIKE$2 AND "initial_price"<=$3 AND',
      values: ["%test%", "%great%", "100"],
    });
  });

  test("returns object with an sql string and values for partial filtered query", () => {
    let results = sqlForFilter(
      {
        name: "test",
        condition: "great",
      },
      jsToSQL
    );
    expect(results).toEqual({
      searchQuery: '"name" ILIKE $1 AND "condition" ILIKE$2 AND',
      values: ["%test%", "%great%"],
    });
  });
});
