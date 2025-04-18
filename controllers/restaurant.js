const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');


exports.getRestaurants = async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');

    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Restaurant.countDocuments();

        query = query.skip(startIndex).limit(limit);

        const restaurants = await query;

        const pagination = {}; // {}=json

        if (endIndex < total) {
            pagination.next = {
                page: page + 1, limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1, limit
            }
        }

        res.status(200).json({ success: true, count: restaurants.length, pagination, data: restaurants });
    } catch (err) {
        res.status(400).json({ success: false });
    }

};

exports.getRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate('reservations');

        if (!restaurant) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (err) {
        res.status(400).json({ success: false });
    }

};

exports.createRestaurant = async (req, res, next) => {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
};

exports.updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!restaurant) {
            return res.status(400).json({ success: false, msg: 'is not restaurant' });
        }

        res.status(200).json({ success: true, data: restaurant });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

exports.deleteRestaurants = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: `Restaurant not found with id of ${req.params.id}`
            });
        }

        await Reservation.deleteMany({ restaurant: req.params.id });
        await Restaurant.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });

    } catch (err) {
        res.status(400).json({ success: false });
    }
};

exports.reviewRestaurant = async (req, res, next) => {
    try {
        const { user, rating, comment } = req.body;
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const newReview = { user, rating, comment };
        restaurant.reviews.push(newReview);
        await restaurant.save();

        res.status(201).json({ success: true, data: restaurant });

    } catch (err) {
        console.log(err.stack)
        res.status(500).json({ success: false, message: "Can't make a review" })
    }
}

exports.getALlReviewsFromRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        res.status(200).json({ success: true, count: restaurant.length, data: restaurant.reviews })
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: "Can't get all reviews" })
    }
}

exports.deleteReviews = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        restaurant.reviews = restaurant.reviews.filter(
            (review) => review._id.toString() !== reviewId
        );

        await restaurant.save();
        res.status(200).json({ success: true, message: "Deleted review successfully" });

    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: "Can't delete a review" })
    }
}


exports.changeTableStatus = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const { size, status } = req.body;

        if (!['small', 'medium', 'large'].includes(size)) {
            return res.status(400).json({ success: false, message: "Invalid table size" });
        }

        if (!['available', 'reserved', 'occupied'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        // ดึงร้านที่ต้องการมา
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        // หา table ที่มี size ตรงกับที่ขอและสถานะไม่ใช่ occupied
        const table = restaurant.tables.find(
            (t) => t.size === size && t.status !== status
        );

        if (!table) {
            return res.status(404).json({ success: false, message: `No ${size} table found that can be updated.` });
        }

        // อัปเดตสถานะ
        table.status = status;
        await restaurant.save();

        res.status(200).json({
            success: true,
            message: `Updated a ${size} table to '${status}'`,
            data: table
        });

    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ success: false, message: "Server error while updating table status" });
    }
};

exports.checkAvailableTable = async (req, res, next) => {
    try {
        const { resId } = req.params;
        const { date, duration, partySize } = req.query;

        if (!date || !duration || !partySize) {
            return res.status(400).json({
                success: false,
                message: "Missing query params: date, duration, or partySize"
            });
        }

        const restaurant = await Restaurant.findById(resId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }


        const openHour = parseInt(restaurant.opentime.split(":")[0]);
        const closeHour = parseInt(restaurant.closetime.split(":")[0]);
        const parsedDuration = parseInt(duration);

        const allSlots = [];
        for (let hour = openHour; hour <= closeHour - parsedDuration; hour++) {
            const timeString = `${hour.toString().padStart(2, "0")}:00`; // Use consistent time format
            console.log(`Generated time slot: ${timeString}`);
            allSlots.push(timeString);
        }

        // Determine usable table size
        let usableTableType;
        if (partySize <= 3) {
            usableTableType = 'small';
        } else if (partySize >= 4 && partySize <= 9) {
            usableTableType = 'medium';
        } else {
            usableTableType = 'large';
        }

        const tableFieldMap = {
            small: 'smallTable',
            medium: 'mediumTable',
            large: 'largeTable'
        };

        const results = [];

        // Get all relevant reservations on this date for usable table type
        const allReservations = await Reservation.find({
            restaurant: resId,
            resDate: date,
            tableSize: usableTableType
        });

        const reservationMap = {}; // key: time string (e.g., '14:00:00'), value: number of tables used

        for (const reservation of allReservations) {
            const startHour = parseInt(reservation.resStartTime.split(":")[0]);
            const dur = parseInt(reservation.duration || duration); // fallback to requested duration if not stored
            for (let i = 0; i < dur; i++) {
                const affectedHour = startHour + i;
                const affectedTime = `${affectedHour.toString().padStart(2, "0")}:00`;
                reservationMap[affectedTime] = (reservationMap[affectedTime] || 0) + 1;
            }
        }

        for (const time of allSlots) {
            const reservedCount = reservationMap[time] || 0;
            const totalTables = restaurant[tableFieldMap[usableTableType]] || 0;
            const available = totalTables - reservedCount;

            if (available > 0) {
                results.push({
                    time : `${time} - ${parseInt(time.split(":")[0]) + parsedDuration}:00`,
                    availableTables: {
                        type : usableTableType,
                        amount: available
                    }
                });
            }
        }

        if(results.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No available tables found for the specified date and time."
            });
        }

        return res.status(200).json({
            success: true,
            data: results
        });

    } catch (err) {
        console.error(err.stack);
        return res.status(500).json({
            success: false,
            message: "Error checking table availability"
        });
    }
};
