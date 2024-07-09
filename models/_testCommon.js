const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM items");
  await db.query("ALTER SEQUENCE items_id_seq RESTART WITH 1");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM item_types");
  await db.query("ALTER SEQUENCE item_types_id_seq RESTART WITH 1");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM items_to_types");
  await db.query("ALTER SEQUENCE items_to_types_id_seq RESTART WITH 1");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM messages");
  await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM purchases");
  await db.query("ALTER SEQUENCE purchases_id_seq RESTART WITH 1");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM reviews");
  await db.query("ALTER SEQUENCE reviews_id_seq RESTART WITH 1");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM reports");
  await db.query("ALTER SEQUENCE reports_id_seq RESTART WITH 1");

  await db.query(
    `
    INSERT INTO users(username, password, first_name, last_name, email, address, zip_code, region_or_state, city, country, latitude, longitude, is_admin, is_flagged)
    VALUES ('u1', $1, 'fn1', 'ln1', 'testemail1@gmail.com', '100 address', 11111, 'state1', 'city1', 'country1', 10.99876, -99.99981, false, false),
           ('u2', $2, 'fn2', 'ln2', 'testemail2@gmail.com', '200 address', 22222, 'state2', 'city2', 'country2', 10.99876, -99.99981, true, false),
           ('u3', $3, 'fn3', 'ln3', 'testemail3@gmail.com', '300 address', 33333, 'state3', 'city3', 'country3', 10.99876, -99.99981, false, false)`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
    ]
  );

  await db.query(`
    INSERT INTO items(name, image_url, initial_price, condition, description, seller_username, is_sold)
    VALUES ('i1','test_url_1', 100, 'great', 'test item', 'u1', false), 
           ('i2','test_url_2', 100, 'great', 'test item', 'u1', false), 
           ('i3','test_url_3', 100, 'great', 'test item', 'u2', false),
           ('i4','test_url_4', 100, 'great', 'test item', 'u3', true)`);

  await db.query(`
    INSERT INTO item_types (name)
    VALUES  ('electronics'), 
            ('movies'), 
            ('books')`);

  await db.query(`
    INSERT INTO items_to_types(item_id, type_id)
    VALUES  (1, 1), 
            (2, 1), 
            (2, 2), 
            (3, 1),
            (3, 3),
            (4, 1)`);

  await db.query(`
    INSERT INTO purchases(item_id, username, final_price, exchange_method, sale_made)
        VALUES (4,'u1', 150, 'pickup', current_timestamp)`);

  await db.query(`
    INSERT INTO messages(to_username, from_username, item_id, body, sent_at)
        VALUES ('u3', 'u1', 4, 'test body', current_timestamp),
               ('u1', 'u3', 4, 'test body', current_timestamp)`);

  await db.query(`
    INSERT INTO reports(reported_username, reporter_username, body, made_at, is_cleared)
        VALUES ('u2', 'u1', 'test body', current_timestamp, false)`);

  await db.query(`
    INSERT INTO reviews(reviewed_username, reviewer_username, rating, body, made_at)
        VALUES ('u2', 'u1', 10, 'test body', current_timestamp)`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
