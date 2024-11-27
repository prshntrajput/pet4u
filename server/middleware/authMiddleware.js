const jwt = require("jsonwebtoken");
const config = require("../utils/config");

function auth(allowedRoles = []) {
  return (req, res, next) => {
    // Check for the token in the request's cookies or headers
    const token = req.cookies?.authToken || req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, config.JWT_KEY);
      req.user = decoded; // Attach the decoded user information to the request object

      // Check for role-based authorization
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ message: "Invalid token." });
    }
  };
}

module.exports = auth;
