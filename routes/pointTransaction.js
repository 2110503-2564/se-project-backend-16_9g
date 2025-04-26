const express = require('express');
const { getPointTransactions } = require('../controllers/pointTransaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/mytransactions', protect, getPointTransactions);

module.exports = router;
