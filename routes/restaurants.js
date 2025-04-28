const express = require('express');
const {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurants,
    reviewRestaurant,
    getALlReviewsFromRestaurant,
    deleteReviews,
    changeTableStatus,
    checkAvailableTable,
    getAllTableStatus
} = require('../controllers/restaurant');

// Include other resources routers
const reservationRouter = require('./reservations');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:restaurantId/reservations', reservationRouter);

// Routes
router.route('/')
    .get(getRestaurants)
    .post(protect, authorize('admin'), createRestaurant);

router.route('/:id')
    .get(getRestaurant)
    .put(protect, authorize('admin'), updateRestaurant)
    .delete(protect, authorize('admin'), deleteRestaurants);

router.route('/:id/reviews')
    .post(protect, reviewRestaurant)
    .get(getALlReviewsFromRestaurant);

router.route('/:id/reviews/:reviewId')
    .delete(protect, deleteReviews);

router.route('/:resId/available-tables')
    .get(protect, checkAvailableTable);

router.get('/:restaurantId/table-status', protect, authorize('admin'), getAllTableStatus); // ✅


//router.put('/:restaurantId/change-table-status', protect, authorize('admin'), changeTableStatus);

/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - district
 *         - province
 *         - postalcode
 *         - picture
 *         - tel
 *         - region
 *         - opentime
 *         - closetime
 *         - smallTable
 *         - mediumTable
 *         - largeTable
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the restaurant
 *           example: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         name:
 *           type: string
 *           description: Restaurant name
 *         address:
 *           type: string
 *           description: House No., Street, Road
 *         district:
 *           type: string
 *           description: District
 *         province:
 *           type: string
 *           description: Province
 *         postalcode:
 *           type: string
 *           description: 5-digit postal code
 *         picture:
 *           type: string
 *           description: Image URL
 *         tel:
 *           type: string
 *           description: Telephone number
 *         region:
 *           type: string
 *           description: Region
 *         opentime:
 *           type: string
 *           description: Restaurant open time
 *         closetime:
 *           type: string
 *           description: Restaurant close time
 *         smallTable:
 *           type: number
 *           description: Number of small tables
 *         mediumTable:
 *           type: number
 *           description: Number of medium tables
 *         largeTable:
 *           type: number
 *           description: Number of large tables
 *       example:
 *         id: 609bda561452242d88d36e37
 *         name: Happy Restaurant
 *         address: 121 ถ.สุขุมวิท
 *         district: บางนา
 *         province: กรุงเทพมหานคร
 *         postalcode: 10110
 *         picture: https://example.com/image.jpg
 *         tel: 02-2187000
 *         region: กรุงเทพมหานคร (Bangkok)
 *         opentime: 10:00
 *         closetime: 22:00
 *         smallTable: 10
 *         mediumTable: 8
 *         largeTable: 4
 */

/**
 * @swagger
 * tags:
 *   - name: Restaurants
 *     description: The restaurants managing API
 */

/**
 * @swagger
 * /api/stb/restaurants:
 *   get:
 *     summary: Returns the list of all the restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: The list of the restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */

/**
 * @swagger
 * /api/stb/restaurants/{id}:
 *   get:
 *     summary: Get a single restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: The restaurant data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Restaurant not found
 */

/**
 * @swagger
 * /api/stb/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */

/**
 * @swagger
 * /api/stb/restaurants/{id}:
 *   put:
 *     summary: Update an existing restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *       400:
 *         description: Invalid restaurant ID
 */

/**
 * @swagger
 * /api/stb/restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *       404:
 *         description: Restaurant not found
 */

/**
 * @swagger
 * /api/stb/restaurants/{id}/reviews:
 *   post:
 *     summary: Add a review to a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - rating
 *               - comment
 *             properties:
 *               user:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added successfully
 */

/**
 * @swagger
 * /api/stb/restaurants/{id}/reviews:
 *   get:
 *     summary: Get all reviews of a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comment:
 *                     type: string
 */

/**
 * @swagger
 * /api/stb/restaurants/{id}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review from a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review or restaurant not found
 */

/**
 * @swagger
 * /api/stb/restaurants/{resId}/available-tables:
 *   get:
 *     summary: Check available tables at a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: duration
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: partySize
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available time slots and tables
 */

/**
 * @swagger
 * /api/stb/restaurants/{restaurantId}/table-status:
 *   get:
 *     summary: Get current table status (available/unavailable) for today
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: Table status per time slot
 */

module.exports = router;