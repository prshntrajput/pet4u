const animalRouter = require("express").Router();
const Animal = require("../models/animalSchema");
const Joi = require("joi");
const auth = require("../middleware/authMiddleware")
const role = require("../middleware/roleMiddleware")



// Joi validation schema for animal data
const animalSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  age: Joi.number().min(0).required(),
  animalCategory: Joi.string().valid("Dog", "Cat", "Bird", "Other").required(),
  breed: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(500).required(),
  healthStatus: Joi.string().max(100).required(),
  image: Joi.string().uri().optional(),
});  

// testing route
animalRouter.get("/", auth(), (req, res)=>{
    res.send("working")
})


/**
 * GET: Get all animals posted by the authenticated user
 */
animalRouter.get("/my-animals", auth(), async (req, res) => {
  try {
    // Fetch animals where `postedBy` matches the authenticated user's ID
    const animals = await Animal.find({ postedBy: req.user._id });

    if (!animals.length) {
      return res.status(404).json({ message: "You have not posted any animals yet." });
    }

    res.status(200).json({ animals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// animal post request
animalRouter.post("/", auth(), role("seller"), async (req,res)=>{
  
    // validate schema
    const { error }= animalSchema.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
    try {
        const animals = new Animal({
           ...req.body,
           postedBy: req.user._id,
        });
// saved animal
   const savedAnimal = await animals.save();
   res.status(201).send({message: "animal created succesfully", data:savedAnimal});

    } catch (error) {
    console.error("Error posting animal:", error);
    res.status(500).send({ message: error.message });
    }
})


// Animal delete route

animalRouter.delete("/:id", auth(), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    // Check if the user is the owner or admin
    if (animal.postedBy.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    await Animal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Animal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Animal

animalRouter.put("/:id", auth(), async (req, res) => {
  const updates = req.body;

  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    // Check if the user is the owner
    if (animal.postedBy.toString() !== req.user._id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "age",
      "animalCategory",
      "breed",
      "description",
      "healthStatus",
      "image",
      "isAdopted",
      "status",
    ];
    const validUpdates = Object.keys(updates).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!validUpdates)
      return res.status(400).json({ error: "Invalid fields in the update" });

    Object.keys(updates).forEach((key) => {
      animal[key] = updates[key];
    });

    await animal.save();
    res.status(200).json({ message: "Animal updated successfully", animal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





module.exports= animalRouter;