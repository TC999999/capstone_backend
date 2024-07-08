"use strict";

const jsonschema = require("jsonschema");
const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { supabase } = require("../config");
const { decode } = require("base64-arraybuffer");

const { BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  ensureAdmin,
} = require("../middleware/auth");
const Item = require("../models/items");

const newItemSchema = require("../schemas/itemNew.json");
const updateItemSchema = require("../schemas/itemUpdate.json");

const router = new express.Router();

router.post(
  "/",
  [ensureLoggedIn, upload.single("imageFile")],
  async (req, res, next) => {
    try {
      req.body.initialPrice = parseInt(req.body.initialPrice);
      const validator = jsonschema.validate({ ...req.body }, newItemSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const {
        name,
        initialPrice,
        imageName,
        condition,
        description,
        typeIDArr,
      } = req.body;

      const fileBase64 = decode(req.file.buffer.toString("base64"));

      await supabase.storage
        .from("images")
        .upload(`public/${imageName}`, fileBase64, {
          cacheControl: "3600",
          upsert: false,
          contentType: req.file.mimetype,
        });

      let { data } = supabase.storage
        .from("images")
        .getPublicUrl(`public/${imageName}`);
      let publicImageUrl = data.publicUrl;

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
  }
);

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

router.get("/getname/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const item = await Item.findItemName(req.params.id);
    return res.json({ item });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/seller", ensureLoggedIn, async (req, res, next) => {
  try {
    const seller = await Item.getItemSeller(req.params.id);
    return res.json(seller);
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

router.post("/types/new", ensureAdmin, async (req, res, next) => {
  try {
    let typeName = req.body.typeName;
    const newType = await Item.addItemTypes(typeName);
    return res.status(201).json({ newType });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
