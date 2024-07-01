const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const {
  ensureLoggedIn,
  ensureCorrectUsers,
  ensureAdmin,
} = require("../middleware/auth");
const Message = require("../models/messages");
const Item = require("../models/items");
const User = require("../models/users");
const { UnauthorizedError, BadRequestError } = require("../expressError");

const newMessageSchema = require("../schemas/messageNew.json");

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const message = await Message.get(req.params.id);
    if (
      res.locals.user.username == message.from_user.username ||
      res.locals.user.username == message.to_user.username
    ) {
      return res.json(message);
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/conversation/item/:itemID/users/:userOne/and/:userTwo",
  ensureCorrectUsers,
  async (req, res, next) => {
    try {
      const conversation = await Message.getConversation(
        req.params.itemID,
        req.params.userOne,
        req.params.userTwo
      );
      return res.json(conversation);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/users/:userOne/and/:userTwo",
  ensureAdmin,
  async (req, res, next) => {
    try {
      const conversation = await Message.getMessagesBetween(
        req.params.userOne,
        req.params.userTwo
      );
      return res.json(conversation);
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/post/:itemID/to/:toUser",
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const item = await Item.findById(req.params.itemID);
      if (
        req.params.toUser !== item.sellerUser &&
        res.locals.user.username !== item.sellerUser
      ) {
        throw new BadRequestError(
          "Either you or the user you are messaging have no relation to the item in question"
        );
      }
      if (req.params.toUser === res.locals.user.username) {
        throw new BadRequestError("Cannot message yourself");
      }
      await User.get(req.params.toUser);
      const validator = jsonschema.validate(req.body, newMessageSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const { body } = req.body;

      const message = await Message.create({
        from_username: res.locals.user.username,
        to_username: req.params.toUser,
        item_id: req.params.itemID,
        body,
      });
      return res.status(201).json(message);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
