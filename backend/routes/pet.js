const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");
const { authMiddleware, isSeller } = require("../middleware/authMiddleware");
const logger = require("../config/logger");

// POST /api/pets (only seller)
router.post("/", authMiddleware, isSeller, async (req, res) => {
  const { name, age, breed, description, image } = req.body;
  if (!name || !age) return res.status(400).json({ msg: "Name and age are required" });

  try {
    const newPet = await Pet.create({
      name,
      age,
      breed,
      description,
      image,
      seller: req.user.id,
    });

    logger.info(`Pet created: ${newPet._id}`);
    res.status(201).json(newPet);
  } catch (err) {
    logger.error("Error creating pet", err);
    res.status(500).json({ msg: "Failed to create pet" });
  }
});

// GET /api/pets (public)
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find().populate("seller", "username role");
    res.json(pets);
  } catch (err) {
    res.status(500).json({ msg: (err.message) });
  }
});

module.exports = router;
