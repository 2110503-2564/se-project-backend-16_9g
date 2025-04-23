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
            select: 'name description tel picture'
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

//commit(web)
exports.addReservation = async (req, res, next) => {
    try {
        req.body.restaurant = req.params.restaurantId;
        req.body.user = req.user.id;
        const existedReservation = (await Reservation.find({ user: req.user.id }))
        .filter(reservation => reservation.status === 'pending' && reservation.lockedByAdmin === false);

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

        // ตรวจสอบเวลาเปิด-ปิดร้าน
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
            status: 'pending',
            lockedByAdmin: false
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

exports.cancelReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation found with id ${req.params.id}`
            });
        }

        // ถ้าไม่ใช่ admin และไม่ใช่เจ้าของ → ห้ามยกเลิก
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this reservation'
            });
        }

        // ตรวจสอบว่าจองนี้ถูกยกเลิกไปแล้วหรือยัง
        if (reservation.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This reservation has already been cancelled'
            });
        }

        // เปลี่ยนสถานะเป็น cancelled
        reservation.status = 'cancelled';
        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Reservation has been cancelled',
            data: reservation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot cancel reservation'
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

exports.checkTableAvailability = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const { resDate, resStartTime, duration, partySize } = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: `No restaurant with id ${restaurantId}`
            });
        }

        // ไม่อนุญาตให้จองย้อนหลัง
        const today = new Date();
        const requestedDate = new Date(resDate);
        if (requestedDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                success: false,
                message: `Cannot make reservation in the past`
            });
        }

        // เวลาเริ่มต้นและสิ้นสุดของการจอง
        const [startHour, startMinute] = resStartTime.split(':').map(Number);
        const startDateTime = new Date(resDate);
        startDateTime.setUTCHours(startHour, startMinute, 0, 0);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        // เวลาเปิด-ปิดร้าน
        const [openHour, openMinute] = restaurant.opentime.split(':').map(Number);
        const [closeHour, closeMinute] = restaurant.closetime.split(':').map(Number);
        const openTime = new Date(resDate);
        openTime.setUTCHours(openHour, openMinute, 0, 0);
        const closeTime = new Date(resDate);
        closeTime.setUTCHours(closeHour, closeMinute, 0, 0);

        // เช็กว่าเวลาจองอยู่ในช่วงเปิดร้าน
        if (startDateTime < openTime || endDateTime > closeTime) {
            return res.status(400).json({
                success: false,
                message: `Reservation time must be between ${restaurant.opentime} and ${restaurant.closetime}`
            });
        }

        // ดึงรายการจองทั้งหมดของร้านในวันเดียวกัน
        const existingReservations = await Reservation.find({
            restaurant: restaurantId,
            resDate: resDate,
            status: { $ne: 'cancelled' } // ข้ามรายการที่ยกเลิกแล้ว
        });

        let overlappingReservations = 0;

        // ตรวจสอบว่ามีการจองช่วงเวลาเดียวกันหรือไม่
        for (let r of existingReservations) {
            const [rHour, rMinute] = r.resStartTime.split(':').map(Number);
            const rStart = new Date(r.resDate);
            rStart.setUTCHours(rHour, rMinute, 0, 0);
            const rEnd = new Date(rStart.getTime() + r.duration * 60000);

            // ซ้อนทับ: เวลาจองใหม่เริ่มก่อนสิ้นสุดของเก่า และจบหลังเริ่มของเก่า
            if (startDateTime < rEnd && endDateTime > rStart) {
                overlappingReservations++;
            }
        }

        if (overlappingReservations >= restaurant.tables) {
            return res.status(400).json({
                success: false,
                message: 'No available tables for the selected time slot'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Table is available'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error checking table availability'
        });
    }
};
