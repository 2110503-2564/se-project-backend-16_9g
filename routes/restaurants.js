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
    checkAvailableTable
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

router.route('/:resId/available-tables').get(protect, checkAvailableTable);

// ✅ Route สำหรับเปลี่ยนสถานะโต๊ะ (ไม่จำเป็นต้องใช้ restaurantId ใน URL)
router.put('/change-table-status', protect, authorize('admin'), changeTableStatus);



module.exports = router;