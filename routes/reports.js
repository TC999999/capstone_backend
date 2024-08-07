const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const Report = require("../models/reports");
const {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} = require("../expressError");

const newReportSchema = require("../schemas/reportNew.json");

router.get("/", ensureAdmin, async (req, res, next) => {
  try {
    const { username } = req.query;
    const reports = await Report.getAll(username);
    return res.json(reports);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const report = await Report.get(req.params.id);
    if (
      report.report.reportedUser === res.locals.user.username ||
      report.report.reporterUser === res.locals.user.username
    ) {
      throw new UnauthorizedError("Can't view a report made by or for you");
    }
    if (report) {
      return res.json(report);
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, newReportSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const { reportedUsername, body } = req.body;
    const report = await Report.create({
      reporterUsername: res.locals.user.username,
      reportedUsername,
      body,
    });
    return res.status(201).json(report);
  } catch (err) {
    return next(err);
  }
});

router.patch("/clear/:id", ensureAdmin, async (req, res, next) => {
  try {
    const check = await Report.get(req.params.id);
    if (!check) {
      throw new NotFoundError();
    }
    if (
      check.report.reportedUser === res.locals.user.username ||
      check.report.reporterUser === res.locals.user.username
    ) {
      throw new UnauthorizedError("Can't clear a report made by or for you");
    }

    const report = await Report.clearReport(req.params.id);
    if (report) {
      return res.json(report);
    }

    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
