const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    contact: {
        type: String,
        required: [true, 'Please add a contact number'],
        trim: true,
        maxlength: [15, 'Contact number can not be more than 15 characters']
    },
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
    lockedByAdmin: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'cancelled', 'complete', 'incomplete'], // add complete & incomplete
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);