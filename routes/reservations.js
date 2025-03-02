const express = require('express');

const {getReservations, getReservation, addReservation, updateReservation, deleteReservation, getReservationByUserId} = require('../controllers/reservations');

const router = express.Router({mergeParams : true});

const {protect,authorize} = require('../middleware/auth');

router.route('/').get(protect, getReservations).post(protect, authorize('admin' , 'user'), addReservation);

router.route('/:id').get(protect, authorize('admin'),  getReservation).put(protect, authorize('admin' , 'user'), updateReservation).delete(protect, authorize('admin' , 'user'), deleteReservation);

router.route('/user/:id').get(protect, authorize('admin'), getReservationByUserId);

module.exports = router;