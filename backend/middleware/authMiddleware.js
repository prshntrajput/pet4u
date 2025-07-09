const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (id, role)
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

const isSeller = (req, res, next) => {
    if (req.user.role !== "seller") {
      return res.status(403).json({ msg: "Only sellers can perform this action" });
    }
    next();
  };
  
  module.exports = { authMiddleware, isSeller };
