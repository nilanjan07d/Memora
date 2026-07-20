const Memory = require('../models/Memory.model');
const Journey = require('../models/Journey.model');
const cloudinary = require('../config/cloudinary');

// @desc    Add memory to journey
// @route   POST /api/v1/journeys/:journeyId/memories
// @access  Private
const addMemory = async (req, res) => {
  try {
    const { caption, story, location, memoryDate, tags } = req.body;
    const { journeyId } = req.params;

    const journey = await Journey.findById(journeyId);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const isMember = journey.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this journey',
      });
    }

    let imageUrl = '';
    let thumbnailUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'memora/memories',
        transformation: [{ width: 800, height: 600, crop: 'fill' }],
      });
      imageUrl = result.secure_url;
      thumbnailUrl = cloudinary.url(result.public_id, {
        transformation: [{ width: 200, height: 200, crop: 'fill' }],
      });
    }

    const memory = await Memory.create({
      caption,
      story,
      imageUrl,
      thumbnailUrl,
      location,
      memoryDate: memoryDate || new Date(),
      journeyId,
      uploadedBy: req.user._id,
      tags: tags ? tags.split(',') : [],
    });

    res.status(201).json({
      success: true,
      memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all memories for a journey
// @route   GET /api/v1/journeys/:journeyId/memories
// @access  Private
const getJourneyMemories = async (req, res) => {
  try {
    const { journeyId } = req.params;

    const journey = await Journey.findById(journeyId);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const memories = await Memory.find({ journeyId })
      .populate('uploader', 'fullName email profilePicture')
      .sort({ memoryDate: -1 });

    res.json({
      success: true,
      memories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single memory
// @route   GET /api/v1/memories/:id
// @access  Private
const getMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate('uploader', 'fullName email profilePicture')
      .populate('journey', 'title');

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    res.json({
      success: true,
      memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update memory
// @route   PUT /api/v1/memories/:id
// @access  Private
const updateMemory = async (req, res) => {
  try {
    const { caption, story, location, memoryDate, tags } = req.body;

    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    if (memory.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the uploader can update this memory',
      });
    }

    const updated = await Memory.findByIdAndUpdate(
      req.params.id,
      {
        caption,
        story,
        location,
        memoryDate,
        tags: tags ? tags.split(',') : [],
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      memory: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete memory
// @route   DELETE /api/v1/memories/:id
// @access  Private
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    const journey = await Journey.findById(memory.journeyId);
    const isAdmin = journey?.members.some(
      (m) =>
        m.userId.toString() === req.user._id.toString() &&
        m.role === 'admin'
    );

    if (
      memory.uploadedBy.toString() !== req.user._id.toString() &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this memory',
      });
    }

    await memory.deleteOne();

    res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  addMemory,
  getJourneyMemories,
  getMemory,
  updateMemory,
  deleteMemory,
};