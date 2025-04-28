const express = require('express');
const { protect } = require('../middleware/auth');
const { addNotification, getNotifications, markAllAsRead } = require('../controllers/notifications');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing notifications
 */

/**
 * @swagger
 * /api/stb/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Message"
 *               message:
 *                 type: string
 *                 example: "You have received a new message."
 *               type:
 *                 type: string
 *                 enum: [earn, redeem, complete, incomplete]
 *                 example: earn
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       500:
 *         description: Failed to create notification
 *   get:
 *     summary: Get all notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6616012a1b2d3f001ea9ef58"
 *                       title:
 *                         type: string
 *                         example: "New Offer"
 *                       message:
 *                         type: string
 *                         example: "You have received a new offer."
 *                       type:
 *                         type: string
 *                         example: earn
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-04-26T14:23:06.722Z"
 *       500:
 *         description: Failed to fetch notifications
 */
router.route('/')
    .post(protect, addNotification)
    .get(protect, getNotifications);

/**
 * @swagger
 * /api/stb/notifications/mark-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       500:
 *         description: Failed to update notifications
 */
router.route('/mark-all').put(protect, markAllAsRead);

module.exports = router;
