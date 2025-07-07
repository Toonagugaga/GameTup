// routes/orders.js - ปรับปรุงสำหรับ Sequelize
const express = require('express')
const { Op } = require('sequelize')
const Order = require('../models/Order')
const Game = require('../models/Game')
const User = require('../models/User')
const PromoCode = require('../models/PromoCode')
const PromoCodeUsage = require('../models/PromoCodeUsage')
const { auth } = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Validation rules
const createOrderValidation = [
    body('gameId').isUUID().withMessage('Game ID ไม่ถูกต้อง'),
    body('packageIndex').isInt({ min: 0 }).withMessage('Package Index ไม่ถูกต้อง'),
    body('gameAccount').isObject().withMessage('ข้อมูลบัญชีเกมไม่ถูกต้อง'),
    body('paymentMethod').isIn(['credit_card', 'bank_transfer', 'truemoney', 'promptpay']).withMessage('วิธีชำระเงินไม่ถูกต้อง')
]

// สร้างคำสั่งซื้อ
router.post('/', auth, createOrderValidation, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            })
        }

        const { gameId, packageIndex, gameAccount, paymentMethod, promoCode } = req.body

        // ตรวจสอบเกม
        const game = await Game.findByPk(gameId)
        if (!game || !game.isActive) {
            return res.status(404).json({ message: 'ไม่พบเกมนี้' })
        }

        // ตรวจสอบแพ็คเกจ
        const selectedPackage = game.packages[packageIndex]
        if (!selectedPackage) {
            return res.status(404).json({ message: 'ไม่พบแพ็คเกจนี้' })
        }

        let totalAmount = parseFloat(selectedPackage.price)
        let discountAmount = 0
        let promoCodeData = null

        // ตรวจสอบโปรโมชั่น
        if (promoCode) {
            const promoResult = await validatePromoCode(promoCode, req.user.userId, gameId, totalAmount)
            if (!promoResult.valid) {
                return res.status(400).json({ message: promoResult.message })
            }
            discountAmount = promoResult.discountAmount
            promoCodeData = promoResult.promoCode
        }

        const finalAmount = totalAmount - discountAmount

        // สร้างคำสั่งซื้อ
        const order = await Order.create({
            userId: req.user.userId,
            gameId,
            packageData: selectedPackage,
            gameAccount,
            paymentMethod,
            totalAmount,
            discountAmount,
            finalAmount,
            promoCode: promoCode || null
        })

        // บันทึกการใช้โปรโมชั่น
        if (promoCodeData && discountAmount > 0) {
            await PromoCodeUsage.create({
                promoCodeId: promoCodeData.id,
                userId: req.user.userId,
                orderId: order.id,
                discountAmount
            })

            // อัพเดทจำนวนการใช้โปรโมชั่น
            promoCodeData.usageCount += 1
            await promoCodeData.save()
        }

        // โหลดข้อมูลเกม
        const orderWithGame = await Order.findByPk(order.id, {
            include: [
                {
                    model: Game,
                    attributes: ['id', 'name', 'displayName', 'image']
                }
            ]
        })

        res.status(201).json({
            message: 'สร้างคำสั่งซื้อสำเร็จ',
            order: orderWithGame
        })
    } catch (error) {
        console.error('Create order error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ' })
    }
})

// ดูคำสั่งซื้อของผู้ใช้
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query
        const offset = (page - 1) * limit

        const whereCondition = { userId: req.user.userId }
        if (status && status !== 'all') {
            whereCondition.status = status
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereCondition,
            include: [
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
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId
            },
            include: [
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

// ยกเลิกคำสั่งซื้อ
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        })

        if (!order) {
            return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' })
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'ไม่สามารถยกเลิกคำสั่งซื้อนี้ได้' })
        }

        order.status = 'cancelled'
        await order.save()

        // ถ้าใช้โปรโมชั่น ให้ลดจำนวนการใช้
        if (order.promoCode) {
            const promoCodeUsage = await PromoCodeUsage.findOne({
                where: { orderId: order.id }
            })

            if (promoCodeUsage) {
                const promoCode = await PromoCode.findByPk(promoCodeUsage.promoCodeId)
                if (promoCode) {
                    promoCode.usageCount -= 1
                    await promoCode.save()
                }
                await promoCodeUsage.destroy()
            }
        }

        res.json({ message: 'ยกเลิกคำสั่งซื้อสำเร็จ' })
    } catch (error) {
        console.error('Cancel order error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ตรวจสอบโปรโมชั่น
router.post('/validate-promo', auth, async (req, res) => {
    try {
        const { promoCode, gameId, amount } = req.body

        const result = await validatePromoCode(promoCode, req.user.userId, gameId, amount)

        if (result.valid) {
            res.json({
                valid: true,
                discount: result.discountAmount,
                promoCode: {
                    code: result.promoCode.code,
                    name: result.promoCode.name,
                    type: result.promoCode.type,
                    value: result.promoCode.value
                }
            })
        } else {
            res.status(400).json({
                valid: false,
                message: result.message
            })
        }
    } catch (error) {
        console.error('Validate promo error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ฟังก์ชันตรวจสอบโปรโมชั่น
async function validatePromoCode(code, userId, gameId, amount) {
    try {
        const promoCode = await PromoCode.findOne({
            where: {
                code: code.toUpperCase(),
                isActive: true,
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() }
            }
        })

        if (!promoCode) {
            return { valid: false, message: 'โปรโมชั่นไม่ถูกต้องหรือหมดอายุ' }
        }

        // ตรวจสอบจำนวนการใช้ทั้งหมด
        if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
            return { valid: false, message: 'โปรโมชั่นถูกใช้หมดแล้ว' }
        }

        // ตรวจสอบยอดขั้นต่ำ
        if (amount < promoCode.minAmount) {
            return { valid: false, message: `ยอดขั้นต่ำสำหรับโปรโมชั่นนี้คือ ${promoCode.minAmount} บาท` }
        }

        // ตรวจสอบการใช้ของผู้ใช้
        const userUsageCount = await PromoCodeUsage.count({
            where: {
                promoCodeId: promoCode.id,
                userId: userId
            }
        })

        if (userUsageCount >= promoCode.userUsageLimit) {
            return { valid: false, message: 'คุณใช้โปรโมชั่นนี้ครบจำนวนแล้ว' }
        }

        // ตรวจสอบเกมที่ใช้ได้
        if (promoCode.applicableGames.length > 0 && !promoCode.applicableGames.includes(gameId)) {
            return { valid: false, message: 'โปรโมชั่นนี้ไม่สามารถใช้กับเกมนี้ได้' }
        }

        // คำนวณส่วนลด
        let discountAmount = 0
        if (promoCode.type === 'percentage') {
            discountAmount = (amount * promoCode.value) / 100
            if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
                discountAmount = promoCode.maxDiscount
            }
        } else if (promoCode.type === 'fixed_amount') {
            discountAmount = Math.min(promoCode.value, amount)
        }

        return {
            valid: true,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            promoCode
        }
    } catch (error) {
        console.error('Validate promo code error:', error)
        return { valid: false, message: 'เกิดข้อผิดพลาด' }
    }
}

module.exports = router