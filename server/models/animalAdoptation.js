const adoptionRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The animal's seller
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: { type: String }, // Optional message from the user
}, { timestamps: true });

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
