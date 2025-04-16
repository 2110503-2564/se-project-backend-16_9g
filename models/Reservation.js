const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    resDate: {
        type: String,
        required: true
    },
    resStartTime: {
        type: String,
        required: true
    },
    resEndTime: {
        type: String,
        required: true
    },
    tableSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "small",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);