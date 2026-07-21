const Journey = require('../models/Journey.model');
const cloudinary = require('../config/cloudinary');

// @desc    Create journey
// @route   POST /api/v1/journeys
// @access  Private
const createJourney = async (req, res) => {
  try {
    console.log("📝 Creating journey for user:", req.user._id);
    console.log("📦 Request body:", req.body);

    const { title, description, location, startDate, endDate } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required',
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date is required',
      });
    }

    let coverImage = '';

    // Handle cover image upload if provided
    if (req.file) {
      console.log("🖼️ Uploading to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'memora/journeys',
        transformation: [{ width: 800, height: 400, crop: 'fill' }],
      });
      coverImage = result.secure_url;
      console.log("✅ Cloudinary upload successful");
    }

    // ✅ Create journey with owner as member
    const journey = await Journey.create({
      title,
      description,
      location,
      startDate,
      endDate,
      coverImage, // Will be empty string if no image uploaded
      ownerId: req.user._id,
      members: [{
        userId: req.user._id,
        role: 'admin',
        joinedAt: new Date(),
      }],
    });

    console.log("✅ Journey created successfully:", journey._id);

    res.status(201).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    console.error("❌ Create journey error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all user journeys
// @route   GET /api/v1/journeys
// @access  Private
const getJourneys = async (req, res) => {
  try {
    console.log("🔍 Getting journeys for user:", req.user._id);
    console.log("📧 User email:", req.user.email);

    // Find journeys where user is a member
    const journeys = await Journey.find({
      'members.userId': req.user._id,
    })
      .populate('ownerId', 'fullName email profilePicture')
      .populate('members.userId', 'fullName email profilePicture')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${journeys.length} journeys`);

    res.json({
      success: true,
      count: journeys.length,
      journeys,
    });
  } catch (error) {
    console.error("❌ Get journeys error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get a journey the current user belongs to
// @route   GET /api/v1/journeys/:id
// @access  Private
const getJourney = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      'members.userId': req.user._id,
    })
      .populate('ownerId', 'fullName email profilePicture')
      .populate('members.userId', 'fullName email profilePicture');

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
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
