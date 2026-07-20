const Journey = require('../models/Journey.model');
const cloudinary = require('../config/cloudinary');

// @desc    Create journey
// @route   POST /api/v1/journeys
// @access  Private
const createJourney = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { title, description, location, startDate, endDate } = req.body;

    let coverImage = '';

    if (req.file) {
      console.log("Uploading to Cloudinary...");

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'memora/journeys',
        transformation: [{ width: 800, height: 400, crop: 'fill' }],
      });

      console.log("Cloudinary Success:", result);

      coverImage = result.secure_url;
    }

    // Your Journey.create(...) code remains the same

  } catch (error) {
    console.error("FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createJourney,
};

// @desc    Get all user journeys
// @route   GET /api/v1/journeys
// @access  Private
const getJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({
      'members.userId': req.user._id,
    })
      .populate('ownerId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      journeys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single journey
// @route   GET /api/v1/journeys/:id
// @access  Private
const getJourney = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id)
      .populate('ownerId', 'fullName email')
      .populate('members.userId', 'fullName email profilePicture');

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const isMember = journey.members.some(
      (m) => m.userId._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this journey',
      });
    }

    res.json({
      success: true,
      journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update journey
// @route   PUT /api/v1/journeys/:id
// @access  Private
const updateJourney = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const isAdmin = journey.members.some(
      (m) =>
        m.userId.toString() === req.user._id.toString() &&
        m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this journey',
      });
    }

    const { title, description, location, startDate, endDate, status } = req.body;

    let coverImage = journey.coverImage;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'memora/journeys',
        transformation: [{ width: 800, height: 400, crop: 'fill' }],
      });
      coverImage = result.secure_url;
    }

    const updated = await Journey.findByIdAndUpdate(
      req.params.id,
      { title, description, coverImage, location, startDate, endDate, status },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      journey: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete journey
// @route   DELETE /api/v1/journeys/:id
// @access  Private
const deleteJourney = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    if (journey.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this journey',
      });
    }

    await journey.deleteOne();

    res.json({
      success: true,
      message: 'Journey deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Invite member
// @route   POST /api/v1/journeys/:id/invite
// @access  Private
const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const journey = await Journey.findById(req.params.id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const isAdmin = journey.members.some(
      (m) =>
        m.userId.toString() === req.user._id.toString() &&
        m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can invite members',
      });
    }

    const User = require('../models/User.model');
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    const isMember = journey.members.some(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    journey.members.push({
      userId: user._id,
      role: 'member',
      joinedAt: new Date(),
    });

    await journey.save();

    res.json({
      success: true,
      message: 'Member invited successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Remove member
// @route   DELETE /api/v1/journeys/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const isAdmin = journey.members.some(
      (m) =>
        m.userId.toString() === req.user._id.toString() &&
        m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members',
      });
    }

    if (journey.ownerId.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the owner',
      });
    }

    journey.members = journey.members.filter(
      (m) => m.userId.toString() !== req.params.userId
    );

    await journey.save();

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  createJourney,
  getJourneys,
  getJourney,
  updateJourney,
  deleteJourney,
  inviteMember,
  removeMember,
};