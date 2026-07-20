const express = require('express');
const {
  addMemory,
  getJourneyMemories,
  getMemory,
  updateMemory,
  deleteMemory,
} = require('../controllers/memory.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

// Journey memories
router.get('/journey/:journeyId', getJourneyMemories);
router.post('/journey/:journeyId', upload.single('image'), addMemory);

// Single memory
router.route('/:id')
  .get(getMemory)
  .put(upload.single('image'), updateMemory)
  .delete(deleteMemory);

module.exports = router;