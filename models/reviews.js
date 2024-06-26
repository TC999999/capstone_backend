const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

class Review {
  static async create({ reviewerUsername, reviewedUsername, rating, body }) {
    const dupRevCheckRes = await db.query(
      `SELECT
            reviewer_username,
            reviewed_username
      FROM reviews
      WHERE reviewer_username = $1 AND reviewed_username = $2`,
      [reviewerUsername, reviewedUsername]
    );
    let dupCheck = dupRevCheckRes.rows[0];
    if (dupCheck) {
      throw new BadRequestError("You have already given this user a review");
    }
    const result = await db.query(
      `INSERT INTO reviews (
                    reviewer_username,
                    reviewed_username,   
                    rating,              
                    body, 
                    made_at)
                VALUES ($1, $2, $3, $4, current_timestamp)
                RETURNING
                    id,
                    reviewer_username AS "reviewerUsername",
                    reviewed_username AS "reviewedUsername",
                    rating,
                    body,
                    made_at AS "madeAt"`,
      [reviewerUsername, reviewedUsername, rating, body]
    );
    return result.rows[0];
  }

  static async getById(id) {
    const result = await db.query(
      `SELECT
            reviewer_username AS "reviewerUser",
            reviewed_username AS "reviewedUser",
            body,
            made_at AS "madeAt"
      FROM reviews
      WHERE id = $1`,
      [id]
    );

    let review = result.rows[0];

    if (!review) {
      throw new NotFoundError(`No such review: ${id}`, 404);
    }

    return { review };
  }
}

module.exports = Review;
