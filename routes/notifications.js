const express = require('express');
const { protect } = require('../middleware/auth');
const { addNotification, getNotifications, markAllAsRead } = require('../controllers/notifications');

const router = express.Router();

router.route('/')
    .post(protect, addNotification)    // add new notification
    .get(protect, getNotifications);   // get all notifications for current user

router.route('/mark-all').put(protect, markAllAsRead);
module.exports = router;
