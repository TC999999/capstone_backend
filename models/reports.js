const db = require("../db");
const { NotFoundError } = require("../expressError");

class Report {
  static async create({ reporterUsername, reportedUsername, body }) {
    const result = await db.query(
      `INSERT INTO reports (
                    reporter_username,
                    reported_username,
                    body, 
                    made_at)
                VALUES ($1, $2, $3, current_timestamp)
                RETURNING
                    id,
                    reporter_username AS "reporterUsername",
                    reported_username AS "reportedUsername",
                    body,
                    made_at AS "madeAt"`,
      [reporterUsername, reportedUsername, body]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await db.query(
      `SELECT 
            id,  
            reporter_username AS "reporterUser",
            reported_username AS "reportedUser",
            body,
            made_at AS "madeAt"
      FROM reports`
    );

    let reports = result.rows;

    return { reports };
  }

  static async get(id) {
    const result = await db.query(
      `SELECT 
            reporter_username AS "reporterUser",
            reported_username AS "reportedUser",
            body,
            made_at AS "madeAt"
      FROM reports
      WHERE id = $1`,
      [id]
    );

    let report = result.rows[0];

    if (!report) {
      throw new NotFoundError(`No such review: ${id}`, 404);
    }

    return { report };
  }
}

module.exports = Report;
