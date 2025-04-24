const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ['earn', 'redeem'],
        required: true
    }, 
    source : { 
        type: String,
        enum: ['reservation', 'reward'],
        required: true
    },
    sourceId: {
        type: String,
        required: true
    },
    amount: {
        type: Number, //100, -50
        required: true
    },
    message: {
        type: String
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);