const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForFilter } = require("../helpers/filter");
const { sqlForPartialUpdate, insertMultipleSQL } = require("../helpers/sql");
const User = require("./users.js");

class Item {
  static async create({
    name,
    imageURL,
    initialPrice,
    condition,
    description,
    sellerUsername,
    isSold,
  }) {
    const results = await db.query(
      `INSERT INTO 
            items 
                (name, 
                image_url, 
                initial_price, 
                condition,
                description,
                is_sold,
                seller_username) 
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING 
            id, 
            name, 
            image_url AS "imageURL", 
            initial_price AS "initialPrice", 
            condition,
            description,
            seller_username AS "sellerUser"`,
      [
        name,
        imageURL,
        initialPrice,
        condition,
        description,
        isSold,
        sellerUsername,
      ]
    );

    const item = results.rows[0];
    return item;
  }

  static async addItemToTypes(itemID, typeIDArr) {
    let valStr = insertMultipleSQL(itemID, typeIDArr);
    await db.query(
      `INSERT INTO items_to_types (item_id, type_id) VALUES ${valStr}`
    );
  }

  static async findAll(query) {
    let { searchQuery, values } = sqlForFilter(query, {
      name: '"name" ILIKE ',
      condition: '"condition" ILIKE ',
      maxPrice: '"initial_price"<=',
    });
    const searchStr = `
    SELECT
        id,
        name,
        image_url AS "imageURL",
        initial_price AS "initialPrice",
        condition,
        description,
        seller_username as "sellerUser"
    FROM items
    WHERE ${searchQuery} is_sold = false`;

    const results = await db.query(searchStr, values);

    let items = results.rows.map(async (val) => {
      const types = await Item.findItemTypes(val.id);
      const location = await Item.findItemLocation(val.sellerUser);
      delete location.address;
      delete location.latitude;
      delete location.longitude;
      return { ...val, location, types };
    });
    items = await Promise.all(items);
    return items;
  }

  static async findById(id) {
    const results = await db.query(
      `SELECT 
            i.id,
            i.name, 
            i.image_url AS "imageURL", 
            i.initial_price AS "initialPrice", 
            i.condition,
            i.description, 
            i.seller_username as "sellerUser",
            i.is_sold AS "isSold"
        FROM
            items AS i
        WHERE 
            id=$1`,
      [id]
    );
    const item = results.rows[0];
    if (!item) throw new NotFoundError(`No item: ${id}`);

    let location = await Item.findItemLocation(item.sellerUser);
    item.location = location;

    let types = await Item.findItemTypes(id);
    item.types = types;

    return item;
  }

  static async getItemTypes() {
    const results = await db.query(`SELECT * FROM item_types`);
    const types = results.rows;
    return types;
  }

  static async findItemTypes(id) {
    const results = await db.query(
      `SELECT t.id, t.name FROM item_types AS t JOIN items_to_types AS it ON t.id = it.type_id 
        JOIN
            items AS i ON it.item_id = i.id
        WHERE 
            i.id=$1`,
      [id]
    );

    const types = results.rows;
    return types;
  }

  static async findItemLocation(username) {
    const results = await db.query(
      `SELECT 
        address,
        city, 
        region_or_state AS "regionOrState",
        zip_code AS "zipCode",
        country,
        latitude,
        longitude
      FROM
        users
      WHERE
        username=$1`,
      [username]
    );

    let location = results.rows[0];
    return location;
  }

  static async update(id, data) {
    let soldCheckRes = await db.query(
      `SELECT is_sold AS "isSold" FROM items WHERE id=$1`,
      [id]
    );
    let soldCheck = soldCheckRes.rows[0].isSold;
    if (soldCheck) {
      throw new BadRequestError("This item has already been sold");
    }
    const { setCols, values } = sqlForPartialUpdate(data, {
      name: "name",
      condition: "condition",
      description: "description",
      initialPrice: "initial_price",
    });

    const idIdx = "$" + (values.length + 1);

    const queryStr = `UPDATE items SET ${setCols} WHERE id=${idIdx} 
    RETURNING 
        id, 
        name, 
        image_url AS "imageURL", 
        initial_price AS "initialPrice", 
        condition,
        description`;

    const results = await db.query(queryStr, [...values, id]);
    const item = results.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);

    return item;
  }

  static async delete(id) {
    const result = await db.query(
      `DELETE
             FROM items
             WHERE id = $1
             RETURNING id`,
      [id]
    );
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);
  }

  static async getMaxItemID() {
    const result = await db.query(`
      SELECT
        MAX(id)
      FROM 
        items`);

    const max = result.rows[0];
    return max;
  }
}

module.exports = Item;
