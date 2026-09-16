const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey', required: true },
    type: { type: String, enum: ['journey_invitation'], required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, journeyId: 1, status: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
