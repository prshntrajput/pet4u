const loginRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi")
const auth = require("../middleware/authMiddleware")


// validation with joi
const userSchema = Joi.object({    
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    
});

loginRouter.get("/",auth(),(req,res)=>{
    res.send("login router working")
})

// login user
loginRouter.post("/", async (req,res)=>{

    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

try{

  let user = await User.findOne({email:req.body.email});
  if(!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const token = user.generateAuthToken();

 /// res.header("x-auth-token", token).send({_id: user._id, name: user.name, email: user.email,token: token, // You can also send the token in the response body        });

   // Send the token in an HTTP-only cookie and return user details
    res
      .cookie("authToken", token, { httpOnly: true, secure: true }) // Use `secure: true` in production
      .status(200)
      .json({
        message: "Login successful.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
}catch(error){
    res.json({error:error.message})
}     
})


module.exports= loginRouter;