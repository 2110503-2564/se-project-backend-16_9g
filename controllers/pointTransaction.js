// imports
const PointTransaction = require('../models/PointTransaction');

exports.getPointTransactions = async (req, res, next) => {
    try {
        let query;

        // ถ้าไม่ใช่ admin -> ดูได้เฉพาะของตัวเอง
        if (req.user.role !== 'admin') {
            query = PointTransaction.find({ user: req.user.id }).populate({
                path: 'user',
                select: 'name email'
            });
        } else {
            // ถ้าเป็น admin -> ดูได้ทุกคน
            query = PointTransaction.find().populate({
                path: 'user',
                select: 'name email'
            });
        }

        const transactions = await query;

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Cannot fetch point transactions'
        });
    }
};
