const { BadRequestError } = require("../expressError");

// Converts our data to sql language to update new info to db
// dataToUpdate = {firstName: 'Aliya', lastName: 'Smith', isAdmin: true}
// jsToSql = {firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"}

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  //keys = [firstname, age]
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstname: 'Aliya', lastname: 'Smith', isAdmin: true} => ['"first_name"=$1', '"last_name"=$2', '"is_admin"=$3']
  // This makes a new array of strings where the first half is either the value of the jsToSql key that matches the dataToUpdate key, or the dataToUpdate key name itself
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  //returns {setCols: '"first_name"=$1, "last_name"=$2, "is_admin"=$3', values: ['Aliya', 'Smith', true]}
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function insertMultipleSQL(itemID, typeIDArr) {
  let str = "";
  for (let t = 0; t < typeIDArr.length; t++) {
    if (t < typeIDArr.length - 1) {
      str = str + `(${itemID}, ${typeIDArr[t]}), `;
    } else {
      str = str + `(${itemID}, ${typeIDArr[t]})`;
    }
  }
  return str;
}

function selectMultipleTypes(typeIDArr) {
  let strArr = typeIDArr.map((type) => {
    return `t.id=${type}`;
  });
  return strArr.join(" OR ");
}

module.exports = {
  sqlForPartialUpdate,
  insertMultipleSQL,
  selectMultipleTypes,
};
