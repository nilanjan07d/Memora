const Journey = require('../models/Journey.model');
const Memory = require('../models/Memory.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const cloudinary = require('../config/cloudinary');
const { removeTemporaryFile, destroyCloudinaryImage } = require('../utils/uploads');

const isAdmin = (journey, userId) => journey.members.some((member) => member.userId.toString() === userId.toString() && member.role === 'admin');
const isMember = (journey, userId) => journey.members.some((member) => member.userId.toString() === userId.toString());
const validDate = (value) => value && !Number.isNaN(new Date(value).getTime());
const uploadImage = async (file, folder, transformation) => {
  if (!file) return null;
  try { return await cloudinary.uploader.upload(file.path, { folder, transformation, resource_type: 'image' }); }
  finally { await removeTemporaryFile(file); }
};

const createJourney = async (req, res, next) => {
  try {
    const { title, description, location, startDate, endDate, latitude, longitude, isPublic } = req.body;
    if (!title?.trim() || !description?.trim() || !validDate(startDate) || !validDate(endDate)) return res.status(400).json({ success: false, message: 'Title, description, start date, and end date are required.' });
    if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    const image = await uploadImage(req.file, 'memora/journeys', [{ width: 1600, height: 900, crop: 'limit', quality: 'auto' }]);
    const coordinates = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) ? { latitude: Number(latitude), longitude: Number(longitude) } : undefined;
    const journey = await Journey.create({ title: title.trim(), description: description.trim(), location: location?.trim(), coordinates, startDate, endDate, isPublic: isPublic === 'true' || isPublic === true, coverImage: image?.secure_url || '', coverImagePublicId: image?.public_id || '', ownerId: req.user._id, members: [{ userId: req.user._id, role: 'admin' }] });
    res.status(201).json({ success: true, journey });
  } catch (error) { await removeTemporaryFile(req.file); next(error); }
};

const getJourneys = async (req, res, next) => {
  try {
    const search = req.query.search?.trim(); const query = { 'members.userId': req.user._id };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }];
    const journeys = await Journey.find(query).populate('ownerId', 'fullName email username profilePicture').populate('members.userId', 'fullName email username profilePicture').populate('memoryCount').sort({ createdAt: -1 });
    res.json({ success: true, count: journeys.length, journeys });
  } catch (error) { next(error); }
};

const getJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({ _id: req.params.id, 'members.userId': req.user._id }).populate('ownerId', 'fullName email username profilePicture').populate('members.userId', 'fullName email username profilePicture').populate('memoryCount');
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    res.json({ success: true, journey });
  } catch (error) { next(error); }
};

const updateJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    if (!isAdmin(journey, req.user._id)) return res.status(403).json({ success: false, message: 'Only journey admins can update it.' });
    ['title', 'description', 'location', 'startDate', 'endDate', 'status', 'isPublic'].forEach((field) => { if (req.body[field] !== undefined) journey[field] = req.body[field]; });
    if (!validDate(journey.startDate) || !validDate(journey.endDate) || journey.endDate < journey.startDate) return res.status(400).json({ success: false, message: 'Please provide a valid date range.' });
    if (req.file) { const image = await uploadImage(req.file, 'memora/journeys', [{ width: 1600, height: 900, crop: 'limit', quality: 'auto' }]); const oldPublicId = journey.coverImagePublicId; journey.coverImage = image.secure_url; journey.coverImagePublicId = image.public_id; await destroyCloudinaryImage(oldPublicId); }
    await journey.save(); await journey.populate(['ownerId', 'members.userId']); res.json({ success: true, journey });
  } catch (error) { await removeTemporaryFile(req.file); next(error); }
};

const deleteJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    if (journey.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the owner can delete this journey.' });
    const memories = await Memory.find({ journeyId: journey._id }).select('imagePublicId');
    await Promise.all(memories.map((memory) => destroyCloudinaryImage(memory.imagePublicId))); await destroyCloudinaryImage(journey.coverImagePublicId);
    await Promise.all([Memory.deleteMany({ journeyId: journey._id }), Notification.deleteMany({ journeyId: journey._id }), journey.deleteOne()]);
    res.json({ success: true, message: 'Journey and its memories were deleted.' });
  } catch (error) { next(error); }
};

const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.query?.trim(); if (!query || query.length < 2) return res.json({ success: true, users: [] });
    const users = await User.find({ _id: { $ne: req.user._id }, $or: [{ fullName: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }, { username: { $regex: query, $options: 'i' } }] }).select('fullName email username profilePicture').limit(20);
    res.json({ success: true, users });
  } catch (error) { next(error); }
};

const inviteMember = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    if (!isAdmin(journey, req.user._id)) return res.status(403).json({ success: false, message: 'Only journey admins can invite people.' });
    const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!userId && !email) return res.status(400).json({ success: false, message: 'Select a user to invite.' });
    const user = userId ? await User.findById(userId) : await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (isMember(journey, user._id)) return res.status(400).json({ success: false, message: 'This user is already a member.' });
    if (await Notification.exists({ recipientId: user._id, journeyId: journey._id, type: 'journey_invitation', status: 'pending' })) return res.status(409).json({ success: false, message: 'An invitation is already pending.' });
    const notification = await Notification.create({ recipientId: user._id, senderId: req.user._id, journeyId: journey._id, type: 'journey_invitation', message: req.body.message || '' });
    await notification.populate([{ path: 'senderId', select: 'fullName profilePicture' }, { path: 'journeyId', select: 'title coverImage' }]);
    res.status(201).json({ success: true, notification, message: 'Invitation sent.' });
  } catch (error) { next(error); }
};

const removeMember = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    if (!isAdmin(journey, req.user._id)) return res.status(403).json({ success: false, message: 'Only journey admins can remove members.' });
    if (journey.ownerId.toString() === req.params.userId) return res.status(400).json({ success: false, message: 'The owner cannot be removed.' });
    journey.members = journey.members.filter((member) => member.userId.toString() !== req.params.userId); await journey.save(); res.json({ success: true, message: 'Member removed.' });
  } catch (error) { next(error); }
};

const getJourneyInvites = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    if (!isAdmin(journey, req.user._id)) return res.status(403).json({ success: false, message: 'Only journey admins can view invitations.' });
    const invites = await Notification.find({ journeyId: journey._id, type: 'journey_invitation', status: 'pending' }).populate('recipientId', 'fullName email username profilePicture').sort({ createdAt: -1 });
    res.json({ success: true, invites });
  } catch (error) { next(error); }
};

const cancelInvite = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found.' });
    if (!isAdmin(journey, req.user._id)) return res.status(403).json({ success: false, message: 'Only journey admins can cancel invitations.' });
    const invite = await Notification.findOne({ _id: req.params.inviteId, journeyId: journey._id, type: 'journey_invitation' });
    if (!invite) return res.status(404).json({ success: false, message: 'Invitation not found.' });
    if (invite.status !== 'pending') return res.status(409).json({ success: false, message: 'This invitation has already been handled.' });
    await invite.deleteOne();
    res.json({ success: true, message: 'Invitation cancelled.' });
  } catch (error) { next(error); }
};

module.exports = { createJourney, getJourneys, getJourney, updateJourney, deleteJourney, searchUsers, inviteMember, removeMember, getJourneyInvites, cancelInvite };
