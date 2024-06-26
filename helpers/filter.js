const { BadRequestError } = require("../expressError");

//filters the search query so that we get a string to filter the sql query

function sqlForFilter(query, jsToSQL) {
  // Get the keys of the query and sql query documentation
  const queryArr = Object.keys(query);
  const sqlArr = Object.keys(jsToSQL);

  // filters out any query criteria that aren't in jsToSql
  const filteredArr = queryArr.filter((val) => {
    if (sqlArr.includes(val)) {
      return val;
    }
  });

  // adds percent characters to query.name to use for ILIKE in the sql query
  if (filteredArr.includes("name")) {
    query.name = `%${query.name}%`;
  }

  // adds percent characters to query.condition to use for ILIKE in the SQL query
  if (filteredArr.includes("condition")) {
    query.condition = `%${query.condition}%`;
  }

  // adds percent characters to query.type to use for ILIKE in the SQL query
  // if(filteredArr.includes("type")){
  //   query.type=`%${query.type}%`
  // }

  // if the filtered query is empty, return an empty string and values array
  if (filteredArr.length === 0) {
    return { searchQuery: "", values: [] };
  }

  // get an array of strings to make the query string
  const filteredSearchArr = filteredArr.map((val, idx) => {
    return `${jsToSQL[val]}$${idx + 1}`;
  });

  // filters out the values of any filtered out keys
  const valueArr = filteredArr.map((val) => {
    return query[val];
  });

  // makes the sql query string and array of values to prevent sql injection
  return {
    searchQuery: `${filteredSearchArr.join(" AND ")} AND`,
    values: valueArr,
  };
}

module.exports = { sqlForFilter };
