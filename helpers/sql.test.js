const { sqlForPartialUpdate } = require("./sql");

describe("returnUpdateInfo", () => {
  let jsToSQL = {
    name: "name",
    condition: "condition",
    description: "description",
  };

  test("returns information needed to update user if all info is included", () => {
    let result = sqlForPartialUpdate(
      { name: "new item", condition: "good", description: "new description" },
      jsToSQL
    );
    expect(result).toEqual({
      setCols: '"name"=$1, "condition"=$2, "description"=$3',
      values: ["new item", "good", "new description"],
    });
  });
});
