const express = require('express');
const router = express.Router();

const { getUserPointByUserId, getUserRewards } = require('../controllers/user');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and points/rewards operations
 */

/**
 * @swagger
 * /api/stb/user/{id}/points:
 *   get:
 *     summary: Get user's current points
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved user points
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6616012a1b2d3f001ea9ef58
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     tel:
 *                       type: string
 *                       example: 0891234567
 *                     currentPoints:
 *                       type: integer
 *                       example: 150
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/stb/user/{id}/rewards:
 *   get:
 *     summary: Get user's rewards
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved user rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6616012a1b2d3f001ea9ef58
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     rewards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: reward123
 *                           name:
 *                             type: string
 *                             example: "10% Off Coupon"
 *                           description:
 *                             type: string
 *                             example: "Get 10% off your next order"
 *                           expire:
 *                             type: string
 *                             example: "2025-12-31"
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

router.route('/:id/points').get(protect, authorize('admin', 'user'), getUserPointByUserId);
router.route('/:id/rewards').get(protect, getUserRewards);

module.exports = router;