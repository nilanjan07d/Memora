const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getNotifications, markRead, respondToInvite } = require('../controllers/notification.controller');
const router = express.Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.post('/:id/respond', respondToInvite);
module.exports = router;
