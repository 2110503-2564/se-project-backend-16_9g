const express = require('express');
const router = express.Router();

const {getUserPointByUserId, getUserRewards} = require('../controllers/user');
const {protect,authorize} = require('../middleware/auth');

router.route('/:id/points').get(protect, authorize('admin', 'user'), getUserPointByUserId);
router.route('/:id/rewards').get(protect, getUserRewards);
module.exports = router;