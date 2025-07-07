// routes/admin.js - ปรับปรุงสำหรับ Sequelize
const express = require('express')
const { Op } = require('sequelize')
const { adminAuth } = require('../middleware/auth')
const Order = require('../models/Order')
const User = require('../models/User')
const Game = require('../models/Game')
const Payment = require('../models/Payment')
const sequelize = require('../config/database')

const router = express.Router()

// Dashboard สถิติ
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [userStats, orderStats, revenueStats] = await Promise.all([
            // จำนวนผู้ใช้ทั้งหมด
            User.count({
                where: { role: 'user' }
            }),
            // จำนวนคำสั่งซื้อทั้งหมด
            Order.count(),
            // รายได้รวม
            Order.sum('finalAmount', {
                where: { status: 'completed' }
            })
        ])

        // สถิติรายเดือน
        const monthlyStats = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
                [sequelize.fn('SUM', sequelize.col('finalAmount')), 'revenue']
            ],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
                }
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
            raw: true
        })

        res.json({
            totalUsers: userStats,
            totalOrders: orderStats,
            totalRevenue: revenueStats || 0,
            monthlyStats
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูคำสั่งซื้อทั้งหมด
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query
        const offset = (page - 1) * limit

        const whereCondition = {}
        if (status && status !== 'all') {
            whereCondition.status = status
        }

        if (search) {
            whereCondition.orderNumber = {
                [Op.iLike]: `%${search}%`
            }
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName']
                },
                {
                    model: Game,
                    attributes: ['id', 'name', 'displayName', 'image']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            orders,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Get orders error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูรายละเอียดคำสั่งซื้อ
router.get('/orders/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phone']
                },
                {
                    model: Game,
                    attributes: ['id', 'name', 'displayName', 'image']
                }
            ]
        })

        if (!order) {
            return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' })
        }

        res.json({ order })
    } catch (error) {
        console.error('Get order error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// อัพเดทสถานะคำสั่งซื้อ
router.put('/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status, notes } = req.body
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: User }]
        })

        if (!order) {
            return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' })
        }

        const oldStatus = order.status
        order.status = status

        if (notes) {
            order.notes = notes
        }

        if (status === 'completed' && oldStatus !== 'completed') {
            order.completedAt = new Date()
            order.processedAt = new Date()

            // อัพเดทยอดใช้จ่ายของผู้ใช้
            const user = order.User
            if (user) {
                user.totalSpent = parseFloat(user.totalSpent) + parseFloat(order.finalAmount)
                await user.save()
            }
        } else if (status === 'processing' && oldStatus === 'pending') {
            order.processedAt = new Date()
        } else if (status === 'failed') {
            order.failureReason = notes || 'ไม่ระบุเหตุผล'
        }

        await order.save()

        res.json({
            message: 'อัพเดทสถานะสำเร็จ',
            order
        })
    } catch (error) {
        console.error('Update order status error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูรายการผู้ใช้
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query
        const offset = (page - 1) * limit

        const whereCondition = {}
        if (search) {
            whereCondition[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
            ]
        }

        if (role && role !== 'all') {
            whereCondition.role = role
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereCondition,
            attributes: { exclude: ['password', 'rememberToken', 'passwordResetToken', 'passwordResetExpires'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Get users error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// อัพเดทสถานะผู้ใช้
router.put('/users/:id/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body
        const user = await User.findByPk(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' })
        }

        user.isActive = isActive
        await user.save()

        res.json({
            message: `${isActive ? 'เปิดใช้งาน' : 'ระงับ'}ผู้ใช้สำเร็จ`,
            user
        })
    } catch (error) {
        console.error('Update user status error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูรายงานยอดขาย
router.get('/reports/sales', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate, gameId } = req.query

        const whereCondition = {
            status: 'completed'
        }

        if (startDate && endDate) {
            whereCondition.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        }

        if (gameId) {
            whereCondition.gameId = gameId
        }

        const salesReport = await Order.findAll({
            where: whereCondition,
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
                [sequelize.fn('SUM', sequelize.col('finalAmount')), 'revenue']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']],
            raw: true
        })

        res.json({ salesReport })
    } catch (error) {
        console.error('Sales report error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router