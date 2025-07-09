const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  const userExists = await User.findOne({ username });
  if (userExists) return res.status(400).json({ msg: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hash, role });

  res.json({ msg: "User created", id: newUser._id });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res
    .cookie("token", token, { httpOnly: true, sameSite: "lax" })
    .json({ msg: "Login successful", user: { id: user._id, role: user.role } });
};
