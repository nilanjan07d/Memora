const express = require('express');
const {
  createJourney,
  getJourneys,
  getJourney,
  updateJourney,
  deleteJourney,
  inviteMember,
  removeMember,
} = require('../controllers/journey.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getJourneys)
  .post(upload.single('coverImage'), createJourney);

router.route('/:id')
  .get(getJourney)
  .put(upload.single('coverImage'), updateJourney)
  .delete(deleteJourney);

router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;