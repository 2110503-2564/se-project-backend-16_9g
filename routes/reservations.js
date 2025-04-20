const express = require('express');

const {getReservations, 
    getReservation, 
    addReservation, 
    updateReservation, 
    deleteReservation, 
    getReservationByUserId,
    cancelReservation,
    checkTableAvailability} 
    = require('../controllers/reservations');

    //commit(web)
const router = express.Router({mergeParams : true});

const {protect,authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getReservations)
    .post(protect, authorize('admin' , 'user'), addReservation);

router.route('/:id')
    .get(protect,  getReservation)
    .put(protect, authorize('admin' , 'user'), updateReservation)
    .delete(protect, authorize('admin' , 'user'), deleteReservation);

router.route('/user/:id')
    .get(protect, authorize('admin'), getReservationByUserId);

router.route('/cancel/:id').put(protect, authorize('admin', 'user'), cancelReservation);

router.route('/check-availability/:restaurantId').post(protect, checkTableAvailability);

module.exports = router;