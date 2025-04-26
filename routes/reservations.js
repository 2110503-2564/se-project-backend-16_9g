const express = require('express');

const {getReservations, 
    getReservation, 
    addReservation, 
    updateReservation, 
    deleteReservation, 
    getReservationByUserId,
    cancelReservation,
    incompleteReservation,
    checkTableAvailability,
    completeReservation,
    getUserPointByUserId} 
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

router.route('/user/:id').get(protect, authorize('admin'), getReservationByUserId);

router.route('/cancel/:id').put(protect, authorize('admin', 'user'), cancelReservation);

// incomplete reservation
router.route('/incomplete/:id').put(protect, authorize('admin'), incompleteReservation);

// complete reservation
router.route('/complete/:id').put(protect, authorize('admin'), completeReservation);


router.route('/check-availability/:restaurantId').post(protect, checkTableAvailability);

router.route('/user/:id/point').get(protect, authorize('admin', 'user'), getUserPointByUserId);
module.exports = router;