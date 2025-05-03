const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    console.log('Organization from manager from protect:', req.user.organization)
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = protect;
