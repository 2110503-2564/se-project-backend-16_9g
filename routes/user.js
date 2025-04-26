const express = require('express');
const router = express.Router();

const {getUserPointByUserId} = require('../controllers/user');
const {protect,authorize} = require('../middleware/auth');

router.route('/:id/points').get(protect, authorize('admin', 'user'), getUserPointByUserId);

module.exports = router;