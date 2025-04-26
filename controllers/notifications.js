const Notification = require('../models/Notification');

// Add notification
exports.addNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        const notification = await Notification.create({
            user: req.user.id,
            title,
            message
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
};

// Get all notifications of a user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};
