const express = require('express');

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/update', protect, upload.single('profilePicture'), updateProfile);

module.exports = router;
