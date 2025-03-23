const express = require('express');
const {getRestaurants , getRestaurant , createRestaurant , updateRestaurant , deleteRestaurants,
    reviewRestaurant, getALlReviewsFromRestaurant, deleteReviews
} = require('../controllers/restaurant');

//Include other resources routers
const reservationRouter = require('./reservations');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:restaurantId/reservations/', reservationRouter);

router.route('/').get(getRestaurants).post(protect, authorize('admin'), createRestaurant);
router.route('/:id').get(getRestaurant).put(protect, authorize('admin'), updateRestaurant).delete(protect, authorize('admin'), deleteRestaurants);
router.route('/:id/reviews').post(protect, reviewRestaurant).get(getALlReviewsFromRestaurant);
router.route('/:id/reviews/:reviewId').delete(protect, deleteReviews);

module.exports = router;