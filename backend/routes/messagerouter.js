// backend/routes/messageRouter.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");

// GET all messages between two users
router.get("/:from/:to", async (req, res) => {
  const { from, to } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { from: new mongoose.Types.ObjectId(from), to: new mongoose.Types.ObjectId(to) },
        { from: new mongoose.Types.ObjectId(to), to: new mongoose.Types.ObjectId(from) },
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
