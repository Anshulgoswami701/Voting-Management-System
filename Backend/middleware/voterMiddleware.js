const voterMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "voter") {
    return res.status(403).json({ message: "Access denied. Voter only." });
  }

  next();
};

module.exports = voterMiddleware;
