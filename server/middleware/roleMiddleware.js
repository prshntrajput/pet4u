//roleMiddleware


const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        message: `Access denied. Please create a ${requiredRole} account to use this feature.`,
        redirect: "/signup", // Optional, to inform the client about redirection
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
