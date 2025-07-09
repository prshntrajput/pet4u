const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/:otherId", authMiddleware, async (req, res) => {
  const { otherId } = req.params;

  const messages = await Message.find({
    $or: [
      { from: req.user.id, to: otherId },
      { from: otherId, to: req.user.id },
    ],
  }).sort("createdAt");

  res.json(messages);
});

module.exports = router;
