// routes/orders.js
const express = require('express')
const Order = require('../models/Order')
const Game = require('../models/Game')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

// สร้างคำสั่งซื้อ
router.post('/', auth, async (req, res) => {
    try {
        const { gameId, packageIndex, gameAccount, paymentMethod } = req.body

        // ตรวจสอบเกม
        const game = await Game.findById(gameId)
        if (!game || !game.isActive) {
            return res.status(404).json({ message: 'ไม่พบเกมนี้' })
        }

        // ตรวจสอบแพ็คเกจ
        const selectedPackage = game.packages[packageIndex]
        if (!selectedPackage) {
            return res.status(404).json({ message: 'ไม่พบแพ็คเกจนี้' })
        }

        // สร้างคำสั่งซื้อ
        const order = new Order({
            user: req.user.userId,
            game: gameId,
            package: {
                name: selectedPackage.name,
                amount: selectedPackage.amount,
                price: selectedPackage.price
            },
            gameAccount,
            paymentMethod,
            totalAmount: selectedPackage.price,
            finalAmount: selectedPackage.price
        })

        await order.save()
        await order.populate('game', 'name displayName image')

        res.status(201).json({
            message: 'สร้างคำสั่งซื้อสำเร็จ',
            order
        })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ' })
    }
})

// ดูคำสั่งซื้อของผู้ใช้
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('game', 'name displayName image')
            .sort({ createdAt: -1 })

        res.json({ orders })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router