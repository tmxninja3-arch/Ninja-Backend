// Check if user is admin
const admin = (req, res, next) => {
  // This middleware should be used AFTER protect middleware
  // so req.user is already available
  
  if (req.user && req.user.role === 'admin') {
    // User is admin, allow access
    next();
  } else {
    // User is not admin, deny access
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

module.exports = { admin };