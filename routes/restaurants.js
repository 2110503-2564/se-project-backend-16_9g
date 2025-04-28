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




module.exports = router;