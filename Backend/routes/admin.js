// routes/admin.js
const express = require('express')
const { adminAuth } = require('../middleware/auth')
const Order = require('../models/Order')
const User = require('../models/User')

const router = express.Router()

// Dashboard สถิติ
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [totalUsers, totalOrders, totalRevenue] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$finalAmount' } } }
            ])
        ])

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// อัพเดทสถานะคำสั่งซื้อ
router.put('/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' })
        }

        order.status = status
        if (status === 'completed') {
            order.completedAt = new Date()

            // อัพเดทยอดใช้จ่ายของผู้ใช้
            const user = await User.findById(order.user)
            user.totalSpent += order.finalAmount
            await user.save()
        }

        await order.save()
        res.json({ message: 'อัพเดทสถานะสำเร็จ', order })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router