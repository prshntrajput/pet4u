const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("AdoptionRequest", adoptionSchema);
