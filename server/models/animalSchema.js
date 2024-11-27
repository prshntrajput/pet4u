const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  breed: { type: String, required: true },
  description: { type: String, required: true },
  healthStatus: { type: String, required: true },
  isAdopted: { type: Boolean, default: false },
  image: { type: String }, // URL of the animal's image
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);
