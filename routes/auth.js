const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const {
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

//Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

//Protected routes
router.get('/me', protect, getMe);
router.put('/update-details', protect, updateDetails);
router.put('/update-password', protect, updatePassword);

//Admin routes
router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, admin, getUser);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

//Get current authentication status
router.get('/check-auth', (req, res) => {
  console.log('Session:', req.session); //Debug
  if (req.session && req.session.user) {
    return res.json({ 
      success: true, 
      isAuthenticated: true,
      user: {
        username: req.session.user.username,
        role: req.session.user.role
      }
    });
  }
  
  res.json({ 
    success: true, 
    isAuthenticated: false 
  });
});

module.exports = router;