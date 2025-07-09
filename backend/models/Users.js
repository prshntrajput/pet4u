const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role:{
        type:String,
        enum:["user", "seller"],
        require:true
    }
});

module.exports= mongoose.model("Users", userSchema);