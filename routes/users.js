const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate, validateCards } = require("../models/user");
const { Card } = require("../models/card");
const auth = require("../middleware/auth");
const router = express.Router();

const getCards = async (cardsArray) => {
  const cards = await Card.find({ bizNumber: { $in: cardsArray } });
  return cards;
};

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(
    _.pick(req.body, ["name", "email", "password", "biz", "cards"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  res.send(_.pick(user, ["_id", "name", "email"]));
});

router.get("/cards", auth, async (req, res) => {
  if (!req.user) return res.status(401).send("Access denied.");
  let user = await User.findById(req.user._id);
  favs = user.cards;
  res.send(favs);
});

router.get("/", auth, async (req, res) => {
  if (!req.user) return res.status(401).send("Access denied.");
  const users = await User.find();
  res.send(users);
});

router.put("/cards", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  user.cards = req.body;
  user = await user.save();
  res.send(user);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

module.exports = router;
