// routes/admin.js
const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const Game = require('../models/User') // ใช้ Game model จาก User.js
const Order = require('../models/User') // ใช้ Order model จาก User.js
const { adminAuth } = require('../middleware/auth')

const router = express.Router()

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [
            totalUsers,
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            totalGames
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$finalAmount' } } }
            ]),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'completed' }),
            Game.countDocuments({ isActive: true })
        ])

        const revenueData = totalRevenue.length > 0 ? totalRevenue[0].total : 0

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('user', 'username email')
            .populate('game', 'name displayName')
            .sort({ createdAt: -1 })
            .limit(10)

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalOrders,
                totalRevenue: revenueData,
                pendingOrders,
                completedOrders,
                totalGames
            },
            recentOrders
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query
        const query = {}

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ]
        }

        if (role) {
            query.role = role
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await User.countDocuments(query)

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Get users error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId, gameId } = req.query
        const query = {}

        if (status) query.status = status
        if (userId) query.user = userId
        if (gameId) query.game = gameId

        const orders = await Order.find(query)
            .populate('user', 'username email firstName lastName')
            .populate('game', 'name displayName image')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Order.countDocuments(query)

        res.json({
            success: true,
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Get orders error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Get all games (including inactive)
router.get('/games', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query
        const query = {}

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
            ]
        }

        if (category) {
            query.category = category
        }

        const games = await Game.find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Game.countDocuments(query)

        res.json({
            success: true,
            games,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Get games error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Update user status
router.put('/users/:id/status', adminAuth, [
    body('isActive').isBoolean().withMessage('Status must be boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            })
        }

        const { isActive } = req.body
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Cannot deactivate admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin user status'
            })
        }

        user.isActive = isActive
        await user.save()

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            }
        })
    } catch (error) {
        console.error('Update user status error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Update user balance
router.put('/users/:id/balance', adminAuth, [
    body('balance').isFloat({ min: 0 }).withMessage('Balance must be a positive number'),
    body('action').isIn(['set', 'add', 'subtract']).withMessage('Action must be set, add, or subtract')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            })
        }

        const { balance, action } = req.body
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        switch (action) {
            case 'set':
                user.balance = balance
                break
            case 'add':
                user.balance += balance
                break
            case 'subtract':
                user.balance = Math.max(0, user.balance - balance)
                break
        }

        await user.save()

        res.json({
            success: true,
            message: 'User balance updated successfully',
            user: {
                id: user._id,
                username: user.username,
                balance: user.balance
            }
        })
    } catch (error) {
        console.error('Update user balance error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Get revenue analytics
router.get('/analytics/revenue', adminAuth, async (req, res) => {
    try {
        const { period = 'daily', days = 30 } = req.query
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(days))

        let groupBy
        switch (period) {
            case 'hourly':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                    hour: { $hour: '$createdAt' }
                }
                break
            case 'daily':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                }
                break
            case 'monthly':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                }
                break
            default:
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                }
        }

        const analytics = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$finalAmount' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
            }
        ])

        res.json({
            success: true,
            analytics,
            period,
            days: parseInt(days)
        })
    } catch (error) {
        console.error('Revenue analytics error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

module.exports = router