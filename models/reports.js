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

  static async getAll(username) {
    const result = await db.query(
      `SELECT 
            r.id,  
            r.reporter_username AS "reporterUser",
            r.reported_username AS "reportedUser",
            r.body,
            r.made_at AS "madeAt",
            r.is_cleared AS "isCleared"
      FROM reports AS r
      JOIN users AS u
      ON r.reported_username = u.username
      WHERE
        r.reporter_username!=$1
      AND
        r.reported_username!=$1
      AND
        r.is_cleared=false
      AND
        u.is_flagged=false
      ORDER BY r.id DESC`,
      [username]
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
            made_at AS "madeAt",
            is_cleared AS "isCleared"
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

  static async clearReport(id) {
    const result = await db.query(
      `UPDATE reports SET is_cleared=true WHERE id=$1 RETURNING reported_username, reporter_username, body, made_at, is_cleared`,
      [id]
    );

    const report = result.rows[0];

    if (!report) throw new NotFoundError(`No user: ${id}`);
    return report;
  }
}

module.exports = Report;
