//const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Protect routes - checks if user is authenticated
exports.protect = async (req, res, next) => {
  //Check for user in session
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    //Get user from the database
    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    //Add user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

//Admin-only middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized as an admin' 
    });
  }
};

//Simple authentication check for non-API routes
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  
  res.redirect('/login.html');
};

//For non-API routes - redirect if already authenticated
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  
  res.redirect('/dashboard.html');
};