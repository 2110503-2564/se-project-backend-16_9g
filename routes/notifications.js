const express = require('express');
const { protect } = require('../middleware/auth');
const { addNotification, getNotifications } = require('../controllers/notifications');

const router = express.Router();

router.route('/')
    .post(protect, addNotification)    // add new notification
    .get(protect, getNotifications);   // get all notifications for current user

module.exports = router;
