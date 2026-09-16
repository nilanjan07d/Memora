const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const cloudinary = require('../config/cloudinary');
const { removeTemporaryFile, destroyCloudinaryImage } = require('../utils/uploads');

const {
  sendPasswordResetEmail,
} = require('../services/email.service');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create a unique default username. MongoDB's unique index remains the
    // final authority if two registrations race.
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'traveler';
    let username = baseUsername;
    let suffix = 1;
    while (await User.exists({ username })) username = `${baseUsername}${suffix++}`;

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      username,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Request password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    // Always return the same message so people cannot use this
    // endpoint to discover which emails have accounts.
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate a random token.
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store only the hash of the token in MongoDB.
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(
      Date.now() +
        (Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 15) * 60 * 1000
    );

    await user.save();

    // This URL will be handled by the mobile app later.
    const resetUrl =
          `memora://reset-password?token=${resetToken}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);

      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    } catch (emailError) {
      // Remove the token if the email could not be sent.
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.error('Password reset email error:', emailError);

      return res.status(500).json({
        success: false,
        message: 'Unable to send password reset email. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash the token received from the user.
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired',
      });
    }

    // Set the new password.
    // UserSchema.pre('save') will automatically hash it.
    user.password = password;

    // Invalidate the reset token immediately.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to reset password. Please try again later.',
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id.toString()).select('-password');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, username } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (fullName !== undefined) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase();
      if (!normalizedUsername) return res.status(400).json({ success: false, message: 'Username cannot be empty' });
      const existing = await User.findOne({ username: normalizedUsername, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ success: false, message: 'Username already exists' });
      user.username = normalizedUsername;
    }
    if (req.file) {
      let image;
      try { image = await cloudinary.uploader.upload(req.file.path, { folder: 'memora/profiles', resource_type: 'image', transformation: [{ width: 512, height: 512, crop: 'fill', quality: 'auto' }] }); }
      finally { await removeTemporaryFile(req.file); }
      const oldPublicId = user.profilePicturePublicId;
      user.profilePicture = image.secure_url;
      user.profilePicturePublicId = image.public_id;
      await destroyCloudinaryImage(oldPublicId);
    }
    await user.save();

    res.json({
      success: true,
      user: user.toObject({ versionKey: false }),
    });
  } catch (error) {
    await removeTemporaryFile(req.file);
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Username already exists' });
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
};
