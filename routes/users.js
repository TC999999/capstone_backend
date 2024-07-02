const jsonschema = require("jsonschema");

const express = require("express");
const {
  ensureAdmin,
  ensureCorrectUserOrAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/users");
const Item = require("../models/items");
const { createToken } = require("../helpers/token");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

router.get("/:username/email", ensureLoggedIn, async function (req, res, next) {
  try {
    const email = await User.getEmail(req.params.username);
    return res.json({ email });
  } catch (err) {
    return next(err);
  }
});

router.get("/get/current", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(res.locals.user.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/:username/items", ensureLoggedIn, async function (req, res, next) {
  try {
    const items = await User.getItems(req.params.username);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/:username/messages",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const messages = await User.getMessages(req.params.username);
      return res.json({ messages });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:username/reviews",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const reviews = await User.getReviews(req.params.username);
      return res.json({ reviews });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/:username/reports", ensureAdmin, async function (req, res, next) {
  try {
    const reports = await User.getReports(req.params.username);
    return res.json({ reports });
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/:username/reccomendedItems",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const purchasesArr = await User.getPastPurchasesTypes(
        req.params.username
      );
      const reccomendedItems = await User.recItemsByTypes(
        req.params.username,
        purchasesArr
      );
      return res.json({ reccomendedItems });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:username/itemsInLocation",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const itemsInLocation = await User.getItemsInUserLocation(
        user.username,
        user.zipCode,
        user.city,
        user.regionOrState
      );
      return res.json({ itemsInLocation });
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/items/sale", ensureLoggedIn, async function (req, res, next) {
  try {
    const item = await Item.findById(req.body.itemID);
    if (res.locals.user.username === req.body.buyerUsername) {
      throw new BadRequestError("Can't sell an item to yourself!");
    }
    if (res.locals.user.username !== item.sellerUser) {
      throw new BadRequestError(
        "Can't sell an item that doesn't belong to you!"
      );
    }
    const purchase = await User.makeSale(
      req.body.itemID,
      req.body.buyerUsername,
      req.body.finalPrice,
      req.body.exchangeMethod
    );
    return res.json({ purchase });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
