const Notification = require('../models/Notification.model');
const Journey = require('../models/Journey.model');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id }).populate('senderId', 'fullName profilePicture').populate('journeyId', 'title coverImage').sort({ createdAt: -1 });
    res.json({ success: true, notifications, unreadCount: notifications.filter((item) => !item.isRead).length });
  } catch (error) { next(error); }
};
const markRead = async (req, res, next) => {
  try { const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user._id }, { isRead: true, readAt: new Date() }, { new: true }); if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' }); res.json({ success: true, notification }); } catch (error) { next(error); }
};
const respondToInvite = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipientId: req.user._id, type: 'journey_invitation' });
    if (!notification) return res.status(404).json({ success: false, message: 'Invitation not found.' });
    if (notification.status !== 'pending') return res.status(409).json({ success: false, message: 'This invitation has already been handled.' });
    const accept = req.body.action === 'accept'; if (!accept && req.body.action !== 'reject') return res.status(400).json({ success: false, message: 'Action must be accept or reject.' });
    if (accept) { const journey = await Journey.findById(notification.journeyId); if (!journey) return res.status(404).json({ success: false, message: 'Journey no longer exists.' }); if (!journey.members.some((member) => member.userId.toString() === req.user._id.toString())) { journey.members.push({ userId: req.user._id, role: 'member' }); await journey.save(); } }
    notification.status = accept ? 'accepted' : 'rejected'; notification.isRead = true; notification.readAt = new Date(); await notification.save();
    res.json({ success: true, notification, message: accept ? 'Invitation accepted.' : 'Invitation rejected.' });
  } catch (error) { next(error); }
};
module.exports = { getNotifications, markRead, respondToInvite };
