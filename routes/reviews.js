const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const { ensureLoggedIn } = require("../middleware/auth");
const Review = require("../models/reviews");
const { UnauthorizedError, BadRequestError } = require("../expressError");

const newReviewSchema = require("../schemas/reviewNew.json");

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const review = await Review.getById(req.params.id);
    if (review) {
      return res.json(review);
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

router.post("/post", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, newReviewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const { reviewedUsername, rating, body } = req.body;

    if (reviewedUsername === res.locals.user.username) {
      throw new BadRequestError("Can't review yourself");
    }
    const review = await Review.create({
      reviewerUsername: res.locals.user.username,
      reviewedUsername,
      rating,
      body,
    });
    return res.status(201).json(review);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
