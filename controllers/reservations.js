const { models } = require('mongoose');
const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

exports.getReservations = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        query = Reservation.find({ user: req.user.id }).populate({
            path: 'restaurant',
            select: 'name province tel picture'
        }).populate({
            path: 'user',
            select: 'name tel'
        });

    } else {
        if (req.params.restaurantId) {
            console.log(req.params.restaurantId);
            query = Reservation.find({ restaurant: req.params.restaurantId }).populate({
                path: 'restaurant',
                select: 'name province tel picture'
            }).populate({
                path: 'user',
                select: 'name tel'
            });
        } else {

            query = Reservation.find().populate({
                path: 'restaurant',
                select: 'name province tel picture'
            }).populate({
                path: 'user',
                select: 'name tel'
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    };
}

exports.getReservation = async (req, res, next) => {
    try {

        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name description tel'
        }).populate({
            path: 'user',
            select: 'name tel'
        });;

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
};

//additional method
exports.getReservationByUserId = async (req, res, next) => {
    try {
        const reservations = await Reservation.find({ user: req.params.id }).populate({
            path: 'restaurant',
            select: 'name description tel'
        }).populate({
            path: 'user',
            select: 'name tel'
        });

        if (!reservations) {
            return res.status(404).json({
                success: false,
                message: `No reservation with user id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Cannot find Reservation'
        })
    }
}


exports.addReservation = async (req, res, next) => {
    try {
        req.body.restaurant = req.params.restaurantId;

        req.body.user = req.user.id;
        const existedReservation = await Reservation.find({ user: req.user.id });

        if (existedReservation.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `the user with id ${req.user.id} has already made 3 reservations` });
        }

        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            });
        }

        //additional - check if reservation time is within the restaurant's open time
        const reservationTime = new Date(req.body.resDate);
        const [resHours, resMin] = req.body.resStartTime.split(':').map(Number);
        reservationTime.setUTCHours(resHours, resMin, 0, 0);

        const validReservationTime = checkReservationTime(reservationTime, restaurant.opentime, restaurant.closetime);

        if (!validReservationTime) {
            return res.status(400).json({
                success: false,
                message: `Reservation must be between ${restaurant.opentime} and ${restaurant.closetime}`
            });
        }

        const duplicateReservation = await Reservation.findOne({
            user: req.user.id,
            restaurant: req.params.restaurantId,
            resDate: req.body.resDate,
            resTime: req.body.resTime,
        });

        if (duplicateReservation) {
            return res.status(400).json({
                success: false,
                message: "You already made a reservation at this time.",
            });
        }


        const reservation = await Reservation.create(req.body);

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Reservation"
        });
    }
};


exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this reservation`
            });
        }

        const restaurant = await Restaurant.findById(reservation.restaurant);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            });
        }
        const reservationTime = new Date(req.body.resDate);
        const [resHours, resMin] = req.body.resStartTime.split(':').map(Number);
        reservationTime.setUTCHours(resHours, resMin, 0, 0);

        const validReservationTime = checkReservationTime(reservationTime, restaurant.opentime, restaurant.closetime);

        if (!validReservationTime) {
            return res.status(400).json({
                success: false,
                message: `Reservation must be between ${restaurant.opentime} and ${restaurant.closetime}`
            });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Reservation"
        });
    }
};

exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this bootcamp`
            });
        }

        await reservation.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            messsage: "Cannot delete Reservation"
        });
    }
};

const checkReservationTime = (reservationTime, resOpenTime, resCloseTime) => {
    const [openHour, openMinute] = resOpenTime.split(':').map(Number);
    const [closeHour, closeMinute] = resCloseTime.split(':').map(Number);

    const openTime = new Date(reservationTime);
    openTime.setUTCHours(openHour, openMinute, 0, 0);

    const closeTime = new Date(reservationTime);
    closeTime.setUTCHours(closeHour, closeMinute, 0, 0);

    return reservationTime >= openTime && reservationTime <= closeTime;
}