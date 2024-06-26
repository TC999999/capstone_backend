"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { supabase } = require("../config");

const { BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const Item = require("../models/items");

const newItemSchema = require("../schemas/itemNew.json");
const updateItemSchema = require("../schemas/itemUpdate.json");

const router = new express.Router();

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate({ ...req.body }, newItemSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const { name, initialPrice, imagePath, condition, description, typeIDArr } =
      req.body;

    console.log(req.body);
    let publicImageUrl = null;

    if (imagePath) {
      console.log(imagePath);
      let { data } = supabase.storage.from("images").getPublicUrl(imagePath);
      publicImageUrl = data.publicUrl;
    }
    const item = await Item.create({
      name,
      imageURL: publicImageUrl,
      initialPrice,
      condition,
      description,
      sellerUsername: res.locals.user.username,
      isSold: false,
    });

    await Item.addItemToTypes(item.id, typeIDArr);
    return res.status(201).json({ item });
  } catch (err) {
    return next(err);
  }
});

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const items = await Item.findAll(req.query);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    return res.json({ item });
  } catch (err) {
    return next(err);
  }
});

router.get("/types/all", ensureLoggedIn, async (req, res, next) => {
  try {
    const types = await Item.getItemTypes();
    return res.json({ types });
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/:id/edit/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, updateItemSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => {
          return e.stack;
        });
        throw new BadRequestError(errs);
      }
      const item = await Item.update(req.params.id, req.body);
      return res.json({ item });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/:id/delete/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      await Item.delete(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
