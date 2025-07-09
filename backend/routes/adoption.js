const express = require("express");
const router = express.Router();
const AdoptionRequest = require("../models/AdoptionReuest"); // ✅ FIXED typo
const Pet = require("../models/Pet");
const { authMiddleware } = require("../middleware/authMiddleware");

// POST /api/adopt - User requests to adopt a pet
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { petId } = req.body;
    if (!petId) return res.status(400).json({ msg: "Pet ID is required" });

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ msg: "Pet not found" });

    const exists = await AdoptionRequest.findOne({ user: req.user.id, pet: petId });
    if (exists) return res.status(400).json({ msg: "You already requested this pet" });

    const request = await AdoptionRequest.create({
      pet: petId,
      user: req.user.id,
      seller: pet.seller,
    });

    res.status(201).json({ msg: "Request submitted", request });
  } catch (err) {
    res.status(500).json({ msg: "Failed to submit request", error: err.message });
  }
});

// GET /api/adopt/requests - Seller sees all adoption requests
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ msg: "Unauthorized" });

    const requests = await AdoptionRequest.find({ seller: req.user.id })
      .populate("pet")
      .populate("user", "name email");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Failed to get requests", error: err.message });
  }
});

// PUT /api/adopt/accept/:id - Accept adoption request
router.put("/accept/:id", authMiddleware, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.seller.toString() !== req.user.id)
      return res.status(403).json({ msg: "Not your request" });

    request.status = "accepted";
    await request.save();

    res.json({ msg: "Request accepted", request });
  } catch (err) {
    res.status(500).json({ msg: "Failed to accept request", error: err.message });
  }
});

// PUT /api/adopt/reject/:id - Reject adoption request
router.put("/reject/:id", authMiddleware, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.seller.toString() !== req.user.id)
      return res.status(403).json({ msg: "Not your request" });

    request.status = "rejected";
    await request.save();

    res.json({ msg: "Request rejected", request });
  } catch (err) {
    res.status(500).json({ msg: "Failed to reject request", error: err.message });
  }
});

// GET /api/adopt/status/:petId - Get request status for logged-in user
router.get("/status/:petId", authMiddleware, async (req, res) => {
  try {
    const request = await AdoptionRequest.findOne({
      user: req.user.id,
      pet: req.params.petId,
    });

    if (!request) return res.json({ status: "none" });

    res.json({
      status: request.status,
      sellerId: request.seller,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get adoption status" });
  }
});

module.exports = router;
