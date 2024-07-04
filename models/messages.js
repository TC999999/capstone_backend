const db = require("../db");
const { NotFoundError } = require("../expressError");
const { merge } = require("../helpers/mergeSort");

class Message {
  static async create({ from_username, to_username, item_id, body }) {
    const result = await db.query(
      `INSERT INTO messages (
                from_username,
                to_username,
                item_id,
                body, 
                sent_at)
            VALUES ($1, $2, $3, $4, current_timestamp)
            RETURNING
                id,
                from_username,
                to_username,
                item_id,
                body,
                sent_at`,
      [from_username, to_username, item_id, body]
    );
    return result.rows[0];
  }

  static async get(id) {
    const result = await db.query(
      `SELECT
                m.from_username,
                f.first_name AS from_first_name,
                f.last_name AS from_last_name,
                f.email AS from_email,
                m.to_username,
                t.first_name AS to_first_name,
                t.last_name AS to_last_name,
                t.email AS to_email,
                i.name AS item_name,
                i.condition AS item_condition,
                i.description AS item_description,
                i.initial_price AS item_asking_price,
                m.body,
                m.sent_at
          FROM messages AS m
            JOIN users AS f ON m.from_username = f.username
            JOIN users AS t ON m.to_username = t.username
            JOIN items AS i on m.item_id = i.id
          WHERE m.id = $1`,
      [id]
    );

    let m = result.rows[0];

    if (!m) {
      throw new NotFoundError(`No such message: ${id}`, 404);
    }

    return {
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.from_first_name,
        last_name: m.from_last_name,
        email: m.from_email,
      },
      to_user: {
        username: m.to_username,
        first_name: m.to_first_name,
        last_name: m.to_last_name,
        email: m.to_email,
      },
      item: {
        name: m.item_name,
        condition: m.item_condition,
        description: m.item_description,
        asking_price: m.item_asking_price,
      },
      body: m.body,
      sent_at: m.sent_at,
    };
  }

  static async getConversation(itemID, userOne, userTwo) {
    const fromMessages = await db.query(
      `SELECT 
                m.id,
                m.from_username,
                m.to_username,
                i.name AS item_name,
                m.body,
                m.sent_at
          FROM messages AS m
            JOIN items AS i on m.item_id = i.id
          WHERE m.item_id = $1 AND m.from_username = $2 AND m.to_username = $3
          ORDER BY m.id DESC`,
      [itemID, userOne, userTwo]
    );

    let from_buyer = fromMessages.rows;

    const toMessages = await db.query(
      `SELECT 
                m.id,
                m.from_username,
                m.to_username,
                i.name AS item_name,
                m.body,
                m.sent_at
          FROM messages AS m
            JOIN items AS i on m.item_id = i.id
          WHERE m.item_id = $1 AND m.to_username = $2 AND m.from_username = $3
          ORDER BY m.id DESC`,
      [itemID, userOne, userTwo]
    );

    let to_buyer = toMessages.rows;

    let conversation = merge(from_buyer, to_buyer);

    return { conversation };
  }

  static async getMessagesBetween(userOne, userTwo) {
    const fromMessages = await db.query(
      `SELECT 
                m.id,
                m.from_username,
                m.to_username,
                i.name AS item_name,
                m.body,
                m.sent_at
          FROM messages AS m
            JOIN items AS i on m.item_id = i.id
          WHERE m.from_username = $1 AND m.to_username = $2
          ORDER BY m.id DESC`,
      [userOne, userTwo]
    );

    let from_buyer = fromMessages.rows;

    const toMessages = await db.query(
      `SELECT 
                m.id,
                m.from_username,
                m.to_username,
                i.name AS item_name,
                m.body,
                m.sent_at
          FROM messages AS m
            JOIN items AS i on m.item_id = i.id
          WHERE m.to_username = $1 AND m.from_username = $2
          ORDER BY m.id DESC`,
      [userOne, userTwo]
    );

    let to_buyer = toMessages.rows;

    let messages = merge(from_buyer, to_buyer);

    return { messages };
  }
}

module.exports = Message;
