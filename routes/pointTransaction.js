const express = require('express');
const { getPointTransactions } = require('../controllers/pointTransaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PointTransactions
 *   description: Manage user's point transactions
 */

/**
 * @swagger
 * /api/stb/pointtransactions/mytransactions:
 *   get:
 *     summary: Get point transactions for current user
 *     tags: [PointTransactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's point transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "661f9c9ee2b4c5d6f1234567"
 *                   points:
 *                     type: integer
 *                     example: 50
 *                   type:
 *                     type: string
 *                     example: "reservation_complete"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-26T10:00:00Z"
 */
router.get('/mytransactions', protect, getPointTransactions);

module.exports = router;
