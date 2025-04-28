const express = require('express');

const { getReservations,
    getReservation,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationByUserId,
    cancelReservation,
    incompleteReservation,
    checkTableAvailability,
    completeReservation, }
    = require('../controllers/reservations');

//commit(web)
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getReservations)
    .post(protect, authorize('admin', 'user'), addReservation);

router.route('/:id')
    .get(protect, getReservation)
    .put(protect, authorize('admin', 'user'), updateReservation)
    .delete(protect, authorize('admin', 'user'), deleteReservation);

router.route('/user/:id').get(protect, authorize('admin'), getReservationByUserId);

router.route('/cancel/:id').put(protect, authorize('admin', 'user'), cancelReservation);

// incomplete reservation
router.route('/incomplete/:id').put(protect, authorize('admin'), incompleteReservation);

// complete reservation
router.route('/complete/:id').put(protect, authorize('admin'), completeReservation);


router.route('/check-availability/:restaurantId').post(protect, checkTableAvailability);

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: API for managing reservations
 */

/**
 * @swagger
 * /api/stb/reservations:
 *   get:
 *     summary: Get all reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reservations
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/stb/reservations/{id}:
 *   get:
 *     summary: Get a reservation by ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: A single reservation
 *       404:
 *         description: Reservation not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/stb/reservations/user/{id}:
 *   get:
 *     summary: Get all reservations by user ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: A list of reservations by the user
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/stb/reservations/cancel/{id}:
 *   put:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID to cancel
 *     responses:
 *       200:
 *         description: Reservation cancelled
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /api/stb/reservations/incomplete/{id}:
 *   put:
 *     summary: Mark reservation as incomplete
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID to mark as incomplete
 *     responses:
 *       200:
 *         description: Reservation marked as incomplete
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /api/stb/reservations/complete/{id}:
 *   put:
 *     summary: Mark reservation as complete
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID to mark as complete
 *     responses:
 *       200:
 *         description: Reservation marked as complete
 *       401:
 *         description: Unauthorized
 */






module.exports = router;