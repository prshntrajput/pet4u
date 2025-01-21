const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const { required } = require('joi');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type:  String},
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }, // Can be toggled by admin
}, { timestamps: true });

userSchema.methods.generateAuthToken = function (){
    const token = jwt.sign({_id: this._id, role:this.role},config.JWT_KEY,{ expiresIn: '1h' });
    return token;
}

module.exports = mongoose.model('User', userSchema);
