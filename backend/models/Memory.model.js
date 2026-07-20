const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: [true, 'Caption is required'],
      trim: true,
      maxlength: [200, 'Caption cannot exceed 200 characters'],
    },
    story: {
      type: String,
      trim: true,
      maxlength: [5000, 'Story cannot exceed 5000 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image is required'],
    },
    thumbnailUrl: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
    },
    memoryDate: {
      type: Date,
      required: [true, 'Memory date is required'],
      default: Date.now,
    },
    journeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journey',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: uploader details
MemorySchema.virtual('uploader', {
  ref: 'User',
  localField: 'uploadedBy',
  foreignField: '_id',
  justOne: true,
});

// Virtual: journey details
MemorySchema.virtual('journey', {
  ref: 'Journey',
  localField: 'journeyId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Memory', MemorySchema);