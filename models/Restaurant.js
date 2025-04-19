const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.ObjectId, 
        ref: "User", 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        trim: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

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
    picture: {
        type: String,
        required: [true, 'Please add a picture']
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
    },
    smallTable: {
        type: Number,
        required: [true, 'Please add small table number']   
    },
    mediumTable: {
        type: Number,
        required: [true, 'Please add medium table number']   
    },  
    largeTable: {
        type: Number,
        required: [true, 'Please add large table number']   
    },
    reviews: [reviewSchema]
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



// Then keep your existing export
module.exports = mongoose.model('Restaurant', RestaurantSchema);