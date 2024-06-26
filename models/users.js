const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const {
  sqlForPartialUpdate,
  selectMultipleTypes,
} = require("../helpers/sql.js");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

const Item = require("./items.js");

class User {
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username, 
            password, 
            first_name AS "firstName", 
            last_name AS "lastName", 
            email, 
            is_admin AS "isAdmin", 
            is_flagged AS "isFlagged"
        FROM users
        WHERE username=$1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    address,
    zipCode,
    city,
    regionOrState,
    country,
    latitude,
    longitude,
    isAdmin,
    isFlagged,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
         FROM users
         WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
         (username,
          password,
          first_name,
          last_name,
          email,
          address,
          zip_code,
          city,
          region_or_state,
          country,
          latitude,
          longitude,
          is_admin,
          is_flagged)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING 
            username, 
            first_name AS "firstName", 
            last_name AS "lastName", 
            email, 
            city, 
            region_or_state AS "regionOrState", 
            country, 
            is_admin AS "isAdmin",
            is_flagged AS "isFlagged"`,

      [
        username,
        hashedPassword,
        firstName,
        lastName,
        email,
        address,
        zipCode,
        city,
        regionOrState,
        country,
        latitude,
        longitude,
        isAdmin,
        isFlagged,
      ]
    );

    const user = result.rows[0];

    return user;
  }

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  city,
                  region_or_state AS "regionOrState",
                  country
           FROM users
           ORDER BY username`
    );
    let users = result.rows.map(async (val) => {
      const reviews = await User.getReviews(val.username);
      return { ...val, reviews };
    });

    users = await Promise.all(users);

    return users;
  }

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  address,
                  city,
                  region_or_state AS "regionOrState",
                  country,
                  zip_code AS "zipCode",
                  latitude,
                  longitude,
                  is_admin AS "isAdmin",
                  is_flagged AS "isFlagged"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const items = await User.getItems(username);
    const pastPurchases = await User.getPurchasedItems(username);
    const reviews = await User.getReviews(username);

    user.items = items;
    user.pastPurchases = pastPurchases;
    user.reviews = reviews;

    return user;
  }

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
      isFlagged: "is_flagged",
      address: "address",
      zipCode: "zip_code",
      city: "city",
      regionOrState: "region_or_state",
      country: "country",
      latitude: "latitude",
      longitude: "longitude",
      isAdmin: "is_admin",
      isFlagged: "is_flagged",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                city,
                                region_or_state AS "regionOrState",
                                country,
                                is_flagged AS "isFlagged",
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;

    return user;
  }

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  static async makeSale(username, itemID) {
    let soldCheckRes = await db.query(
      `SELECT is_sold AS "isSold" FROM items WHERE id=$1`,
      [itemID]
    );
    let soldCheck = soldCheckRes.rows[0].isSold;
    if (soldCheck) {
      throw new BadRequestError("This item has already been sold");
    }

    await db.query(`UPDATE items SET is_sold = true WHERE id=$1`, [itemID]);
    let result = await db.query(
      `INSERT INTO purchases (item_id, username) VALUES ($1, $2) RETURNING username, item_id AS itemID`,
      [itemID, username]
    );
    const purchase = result.rows[0];
    purchase.message = "success";
    return purchase;
  }

  static async getPurchasedItems(username) {
    let purchases = await db.query(
      `
        SELECT 
            i.id AS "ItemID"
        FROM
            users AS u
        JOIN 
            purchases AS p ON u.username = p.username
        JOIN 
            items AS i ON p.item_id = i.id
        WHERE
            u.username=$1`,
      [username]
    );
    let idArr = purchases.rows.map((val) => {
      return val.ItemID;
    });
    return idArr;
  }

  static async getItems(username) {
    let items = await db.query(
      `
        SELECT 
        id as "itemID",
        name,
        initial_price AS "initialPrice",
        condition,
        description
        FROM
        items
        WHERE
        seller_username=$1 AND is_sold=false`,
      [username]
    );
    return items.rows;
    // let idArr = items.rows.map((val) => {
    //   return val.itemID;
    // });
    // return idArr;
  }

  static async getMessages(username) {
    let messages = await db.query(
      `
        SELECT 
        id as "messageID"
        FROM
        messages
        WHERE
        to_username=$1`,
      [username]
    );
    let idArr = messages.rows.map((val) => {
      return val.messageID;
    });
    return idArr;
  }

  static async getReviews(username) {
    let reviews = await db.query(
      `
        SELECT 
        id as "reviewID",
        reviewer_username AS "reviewer",
        rating,
        body,
        made_at AS "createdAt"
        FROM
        reviews
        WHERE
        reviewed_username=$1`,
      [username]
    );
    return reviews.rows;
    // let idArr = reviews.rows.map((val) => {
    //   return val.reviewID;
    // });
    // return idArr;
  }

  static async getReports(username) {
    let reports = await db.query(
      `
        SELECT 
        id as "reportID"
        FROM
        reports
        WHERE
        reported_username=$1`,
      [username]
    );
    let idArr = reports.rows.map((val) => {
      return val.reportID;
    });
    return idArr;
  }

  static async getPastPurchasesTypes(username) {
    let results = await db.query(
      `
        SELECT 
            it.type_id, 
            t.name,
            COUNT(*) AS "count"
        FROM 
            purchases AS p 
        JOIN 
            items_to_types AS it 
        ON 
            p.item_id = it.item_id 
        JOIN 
            item_types AS t
        ON
            it.type_id = t.id
        WHERE 
            p.username=$1 
        GROUP BY 
            it.type_id,
            t.name
        ORDER BY
            count
        DESC
        LIMIT 
            5
        `,
      [username]
    );

    let pastPurchasesTypes = results.rows;
    let pastPurchasesTypesArr = pastPurchasesTypes.map((val) => {
      return val.type_id;
    });

    return pastPurchasesTypesArr;
  }

  static async recItemsByTypes(username, typeIDArr) {
    if (!typeIDArr.length) {
      return [];
    }
    let selectTypeString = selectMultipleTypes(typeIDArr);

    let results = await db.query(
      `
        SELECT 
            i.id, 
            i.name,
            i.image_url AS "imageURL",
            i.initial_price AS "initialPrice", 
            i.seller_username AS "sellerUser",
            i.condition,
            i.description,
            COUNT(*) 
        FROM 
            items AS i 
        JOIN 
            items_to_types AS it 
        ON 
            i.id=it.item_id 
        JOIN 
            item_types AS t 
        ON 
            it.type_id=t.id 
        WHERE 
            i.is_sold=false 
        AND
            i.seller_username!=$1
        AND 
            (${selectTypeString}) 
        GROUP BY 
            i.id, i.name 
        ORDER BY 
            count 
        DESC
        LIMIT
            10
        
        `,
      [username]
    );

    let reccomendedItems = results.rows.map(async (val) => {
      delete val.count;
      let location = await Item.findItemLocation(val.sellerUser);
      delete location.address;
      delete location.latitude;
      delete location.longitude;
      return { ...val, location };
    });
    reccomendedItems = await Promise.all(reccomendedItems);
    return reccomendedItems;
  }

  static async getItemsInUserLocation(userName, zipCode, city, regionOrState) {
    let results = await db.query(
      `
        SELECT 
            i.id,
            i.name, 
            i.image_url AS "imageURL", 
            i.initial_price AS "initialPrice", 
            i.seller_username AS "sellerUser",
            i.condition,
            i.description,
            u.city, 
            u.region_or_state AS "regionOrState"
        FROM 
            items AS i 
        JOIN 
            users as u 
        ON 
            i.seller_username = u.username 
        WHERE 
            i.is_sold = false
        AND
            i.seller_username!=$1
        AND (
            u.zip_code = $2
        OR  
            (u.city = $3 AND u.region_or_state=$4)  
        OR 
            u.region_or_state=$4 )
        LIMIT 
            10`,
      [userName, zipCode, city, regionOrState]
    );
    let itemsInLocation = results.rows;
    return itemsInLocation;
  }
}

module.exports = User;
