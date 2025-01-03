const adoptionRouter = require('express').Router();
const AdoptionRequest = require("../models/animalAdoptation");
const Animal = require("../models/animalSchema")
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");




adoptionRouter.get("/adopt", (req,res)=>{
    res.send("working")
})

// User submits an adoption request
adoptionRouter.post('/adopt/:animalId', auth(), async (req, res) => {
  const { animalId } = req.params;
  const { message } = req.body;

  try {
    // Check if the animal exists and is not already adopted
    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found.' });
    }
    if (animal.isAdopted) {
      return res.status(400).json({ message: 'This animal has already been adopted.' });
    }

    // Create an adoption request
    const adoptionRequest = new AdoptionRequest({
      user: req.user._id,
      animal: animalId,
      seller: animal.postedBy, // Seller is the one who posted the animal
      message,
    });

    await adoptionRequest.save();
    res.status(201).json({
      message: 'Adoption request sent successfully.',
      adoptionRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Seller fetches all adoption requests for their animals
adoptionRouter.get('/requests', auth(), role("seller"), async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ seller: req.user._id })
      .populate('user', 'name email') // Populate user details
      .populate('animal', 'name'); // Populate animal details

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seller approves/rejects a request
adoptionRouter.patch('/requests/:requestId', auth(), role("seller"), async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // Status can be 'approved' or 'rejected'

  try {
    // Check if the request exists and belongs to the seller
    const adoptionRequest = await AdoptionRequest.findOne({
      _id: requestId,
      seller: req.user._id,
    });

    if (!adoptionRequest) {
      return res.status(404).json({ message: 'Adoption request not found.' });
    }

    // Update the request status
    adoptionRequest.status = status;
    await adoptionRequest.save();

    // Notify the user
    // (You can integrate real-time notifications using Socket.io here)

    if (status === 'approved') {
      // Mark the animal as adopted
      await Animal.findByIdAndUpdate(adoptionRequest.animal, { isAdopted: true });
    }

    res.status(200).json({
      message: `Adoption request ${status} successfully.`,
      adoptionRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// User fetches their adoption requests
adoptionRouter.get('/my-requests', auth(), async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ user: req.user._id })
      .populate('animal', 'name') // Populate animal details
      .populate('seller', 'name email'); // Populate seller details

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Generate a WhatsApp link for the seller's phone number
adoptionRouter.get('/contact-seller/:requestId', auth(), async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await AdoptionRequest.findOne({
      _id: requestId,
      user: req.user._id,
    }).populate('seller', 'name email phone'); // Populate seller details including phone

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const whatsappUrl = `https://wa.me/${request.seller.phone}?text=Hello%20${request.seller.name},%20I%20am%20interested%20in%20adopting%20your%20animal%20post%20"${request.animal.name}".`;

    res.status(200).json({ whatsappUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = adoptionRouter;
