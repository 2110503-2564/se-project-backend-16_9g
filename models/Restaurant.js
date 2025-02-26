const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name can not be more than 100 chaaracters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postalcode'],
        maxlength: [5, 'Postal Code can not be more than 5 digits']
    },
    tel: {
        type: String,
        required: [true, 'Please add telephon number']
    },
    region: {
        type: String,
        required: [true, 'Please add a region']
    },
    opentime: {
        type: String,
        required: [true, 'Please add open time']
    },
    closetime: {
        type: String,
        required: [true, 'Please add close time']
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
RestaurantSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'restaurant',
    justOne: false
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);