const express = require('express');

const {getUserPointByUserId} = require('../controllers/user');
const {protect,authorize} = require('../middleware/auth');

router.route('/user/:id/points').get(protect, authorize('admin', 'user'), getUserPointByUserId);

module.exports = router;