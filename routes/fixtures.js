const express = require('express');
const router = express.Router();
const {
  getFixtures,
  getFixture,
  createFixture,
  updateFixture,
  deleteFixture,
  getUpcomingFixtures,
  getRecentResults,
  updateFixtureResult
} = require('../controllers/fixtureController');
const { protect, admin } = require('../middleware/auth');

//Public routes
router.get('/', getFixtures);
router.get('/upcoming', getUpcomingFixtures);
router.get('/results', getRecentResults);
router.get('/:id', getFixture);

//Protected routes - for admin only
router.post('/', protect, admin, createFixture);
router.put('/:id', protect, admin, updateFixture);
router.delete('/:id', protect, admin, deleteFixture);
router.put('/:id/result', protect, admin, updateFixtureResult);

module.exports = router;