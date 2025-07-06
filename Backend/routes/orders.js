// routes/orders.js
const express = require('express')
const { body, validationResult } = require('express-validator')
const Order = require('../models/User') // ใช้ Order model จาก User.js
const Game = require('../models/User') // ใช้ Game model จาก User.js
const User = require('../models/User')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// Get user orders
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query
        const query = { user: req.user.userId }

        if (status) {
            query.status = status
        }

        const orders = await Order.find(query)
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

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('game', 'name displayName image')
            .populate('user', 'username email firstName lastName')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user.userId && req.userInfo.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            })
        }

        res.json({
            success: true,
            order
        })
    } catch (error) {
        console.error('Get order error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Create new order
router.post('/', auth, [
    body('game').isMongoId().withMessage('Invalid game ID'),
    body('packageIndex').isInt({ min: 0 }).withMessage('Package index is required'),
    body('gameAccount').isObject().withMessage('Game account details are required'),
    body('paymentMethod').isIn(['credit_card', 'bank_transfer', 'wallet', 'promptpay']).withMessage('Invalid payment method')
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

        const { game: gameId, packageIndex, gameAccount, paymentMethod } = req.body

        // Get game details
        const game = await Game.findById(gameId)
        if (!game || !game.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Game not found or not available'
            })
        }

        // Check if package exists
        if (!game.packages[packageIndex] || !game.packages[packageIndex].isActive) {
            return res.status(404).json({
                success: false,
                message: 'Package not found or not available'
            })
        }

        const selectedPackage = game.packages[packageIndex]

        // Create order
        const order = new Order({
            user: req.user.userId,
            game: gameId,
            package: {
                name: selectedPackage.name,
                amount: selectedPackage.amount,
                price: selectedPackage.price,
                currency: selectedPackage.currency || 'THB'
            },
            gameAccount,
            paymentMethod,
            totalAmount: selectedPackage.price,
            finalAmount: selectedPackage.price
        })

        await order.save()

        // Populate game details for response
        await order.populate('game', 'name displayName image')

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        })
    } catch (error) {
        console.error('Create order error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Update order status (Admin only)
router.put('/:id/status', adminAuth, [
    body('status').isIn(['pending', 'processing', 'completed', 'failed', 'refunded']).withMessage('Invalid status'),
    body('notes').optional().isString()
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

        const { status, notes } = req.body
        const order = await Order.findById(req.params.id).populate('user', 'username email balance')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        const oldStatus = order.status
        order.status = status
        if (notes) order.notes = notes

        // Update timestamps based on status
        if (status === 'processing' && oldStatus !== 'processing') {
            order.processedAt = new Date()
        } else if (status === 'completed' && oldStatus !== 'completed') {
            order.completedAt = new Date()

            // Update user's total spent
            const user = await User.findById(order.user._id)
            user.totalSpent += order.finalAmount
            await user.save()
        }

        await order.save()

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        })
    } catch (error) {
        console.error('Update order status error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Cancel order (User can cancel pending orders)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            })
        }

        // Can only cancel pending orders
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order that is not pending'
            })
        }

        order.status = 'failed'
        order.failureReason = 'Cancelled by user'
        await order.save()

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        })
    } catch (error) {
        console.error('Cancel order error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

module.exports = router