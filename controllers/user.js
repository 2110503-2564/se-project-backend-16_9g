const { models } = require('mongoose');
const User = require('../models/User');

exports.getUserPointByUserId = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('name tel currentPoints');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No user id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: user
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Cannot find Reservation'
        })
    }
};