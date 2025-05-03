const permit = (...allowedRoles) => {
    return (req, res, next) => {
      const userRoles = req.user.roles;
      const hasAccess = userRoles.some(role => allowedRoles.includes(role));
      if (!hasAccess) return res.status(403).json({ message: "Access denied" });
      next();
    };
  };
  
module.exports = permit;
