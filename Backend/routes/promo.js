// routes/promo.js - ระบบจัดการโปรโมชั่นและคูกี้
const express = require('express')
const router = express.Router()
const { PromoCode, PromoCodeUsage, User, Game, Order } = require('../models')
const { auth } = require('../middleware/auth')
const { Op } = require('sequelize')
const cookieParser = require('cookie-parser')

// Middleware สำหรับ cookie
router.use(cookieParser())

// @route   GET /api/promo
// @desc    ดูโปรโมชั่นที่ใช้ได้
// @access  Public
router.get('/', async (req, res) => {
    try {
        const now = new Date()
        const promoCodes = await PromoCode.findAll({
            where: {
                isActive: true,
                startDate: { [Op.lte]: now },
                endDate: { [Op.gte]: now },
                [Op.or]: [
                    { usageLimit: null },
                    { usageCount: { [Op.lt]: { usageLimit: null } } }
                ]
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            order: [['createdAt', 'DESC']]
        })

        res.json({
            success: true,
            promoCodes: promoCodes.map(promo => ({
                code: promo.code,
                name: promo.name,
                description: promo.description,
                type: promo.type,
                value: promo.value,
                minAmount: promo.minAmount,
                maxDiscount: promo.maxDiscount,
                applicableGames: promo.applicableGames,
                endDate: promo.endDate
            }))
        })
    } catch (error) {
        console.error('Get promo codes error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรโมชั่น'
        })
    }
})

// @route   POST /api/promo/validate
// @desc    ตรวจสอบความถูกต้องของโปรโมชั่น
// @access  Private
router.post('/validate', auth, async (req, res) => {
    try {
        const { code, gameId, amount } = req.body
        const userId = req.user.userId

        if (!code || !gameId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาใส่ข้อมูลให้ครบถ้วน'
            })
        }

        const now = new Date()
        const promoCode = await PromoCode.findOne({
            where: {
                code: code.toUpperCase(),
                isActive: true,
                startDate: { [Op.lte]: now },
                endDate: { [Op.gte]: now }
            }
        })

        if (!promoCode) {
            return res.status(400).json({
                success: false,
                message: 'รหัสโปรโมชั่นไม่ถูกต้องหรือหมดอายุ'
            })
        }

        // ตรวจสอบจำนวนเงินขั้นต่ำ
        if (amount < promoCode.minAmount) {
            return res.status(400).json({
                success: false,
                message: `จำนวนเงินขั้นต่ำสำหรับโปรโมชั่นนี้คือ ${promoCode.minAmount} บาท`
            })
        }

        // ตรวจสอบเกมที่ใช้ได้
        if (promoCode.applicableGames.length > 0 && !promoCode.applicableGames.includes(gameId)) {
            return res.status(400).json({
                success: false,
                message: 'โปรโมชั่นนี้ไม่สามารถใช้กับเกมที่เลือกได้'
            })
        }

        // ตรวจสอบจำนวนการใช้ทั้งหมด
        if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'โปรโมชั่นนี้ถูกใช้งานครบจำนวนแล้ว'
            })
        }

        // ตรวจสอบจำนวนการใช้ของผู้ใช้
        const userUsageCount = await PromoCodeUsage.count({
            where: {
                promoCodeId: promoCode.id,
                userId: userId
            }
        })

        if (userUsageCount >= promoCode.userUsageLimit) {
            return res.status(400).json({
                success: false,
                message: 'คุณใช้โปรโมชั่นนี้ครบจำนวนแล้ว'
            })
        }

        // คำนวณส่วนลด
        let discountAmount = 0
        if (promoCode.type === 'percentage') {
            discountAmount = (amount * promoCode.value) / 100
            if (promoCode.maxDiscount) {
                discountAmount = Math.min(discountAmount, promoCode.maxDiscount)
            }
        } else if (promoCode.type === 'fixed_amount') {
            discountAmount = Math.min(promoCode.value, amount)
        } else if (promoCode.type === 'bonus_amount') {
            discountAmount = promoCode.value
        }

        res.json({
            success: true,
            promo: {
                code: promoCode.code,
                name: promoCode.name,
                type: promoCode.type,
                value: promoCode.value,
                discountAmount: discountAmount,
                finalAmount: amount - discountAmount
            }
        })
    } catch (error) {
        console.error('Validate promo code error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบโปรโมชั่น'
        })
    }
})

// @route   POST /api/promo/use
// @desc    ใช้โปรโมชั่น (เรียกใช้ตอนสร้าง order)
// @access  Private
router.post('/use', auth, async (req, res) => {
    try {
        const { promoCodeId, orderId, discountAmount } = req.body
        const userId = req.user.userId

        if (!promoCodeId || !orderId || discountAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาใส่ข้อมูลให้ครบถ้วน'
            })
        }

        // ตรวจสอบว่า order เป็นของผู้ใช้หรือไม่
        const order = await Order.findOne({
            where: {
                id: orderId,
                userId: userId
            }
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลคำสั่งซื้อ'
            })
        }

        // บันทึกการใช้โปรโมชั่น
        const usage = await PromoCodeUsage.create({
            promoCodeId,
            userId,
            orderId,
            discountAmount
        })

        // อัปเดตจำนวนการใช้ของโปรโมชั่น
        await PromoCode.increment('usageCount', {
            where: { id: promoCodeId }
        })

        res.json({
            success: true,
            message: 'ใช้โปรโมชั่นสำเร็จ',
            usage
        })
    } catch (error) {
        console.error('Use promo code error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการใช้โปรโมชั่น'
        })
    }
})

// @route   GET /api/promo/my-usage
// @desc    ดูประวัติการใช้โปรโมชั่น
// @access  Private
router.get('/my-usage', auth, async (req, res) => {
    try {
        const userId = req.user.userId
        const { page = 1, limit = 10 } = req.query

        const offset = (page - 1) * limit
        const usages = await PromoCodeUsage.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: PromoCode,
                    attributes: ['code', 'name', 'type', 'value']
                },
                {
                    model: Order,
                    attributes: ['orderNumber', 'totalAmount', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            success: true,
            usages: usages.rows,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(usages.count / limit),
                count: usages.count
            }
        })
    } catch (error) {
        console.error('Get usage history error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงประวัติการใช้'
        })
    }
})

// Cookie Management Routes

// @route   POST /api/promo/remember-token
// @desc    สร้าง remember token และเก็บในคุกกี้
// @access  Private
router.post('/remember-token', auth, async (req, res) => {
    try {
        const userId = req.user.userId
        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            })
        }

        const rememberToken = user.generateRememberToken()
        await user.save()

        // ตั้งค่าคุกกี้
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
            domain: process.env.COOKIE_DOMAIN || 'localhost'
        }

        res.cookie('remember_token', rememberToken, cookieOptions)

        res.json({
            success: true,
            message: 'สร้าง remember token สำเร็จ'
        })
    } catch (error) {
        console.error('Create remember token error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้าง remember token'
        })
    }
})

// @route   POST /api/promo/logout-all
// @desc    ล้างคุกกี้และ remember token
// @access  Private
router.post('/logout-all', auth, async (req, res) => {
    try {
        const userId = req.user.userId
        const user = await User.findByPk(userId)

        if (user) {
            user.rememberToken = null
            await user.save()
        }

        // ล้างคุกกี้
        res.clearCookie('remember_token', {
            domain: process.env.COOKIE_DOMAIN || 'localhost'
        })

        res.json({
            success: true,
            message: 'ออกจากระบบทุกอุปกรณ์สำเร็จ'
        })
    } catch (error) {
        console.error('Logout all error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
        })
    }
})

// @route   GET /api/promo/check-remember
// @desc    ตรวจสอบ remember token จากคุกกี้
// @access  Public
router.get('/check-remember', async (req, res) => {
    try {
        const rememberToken = req.cookies.remember_token

        if (!rememberToken) {
            return res.status(401).json({
                success: false,
                message: 'ไม่พบ remember token'
            })
        }

        const user = await User.findOne({
            where: { rememberToken },
            attributes: { exclude: ['password', 'passwordResetToken', 'passwordResetExpires'] }
        })

        if (!user || !user.isActive) {
            // ล้างคุกกี้ที่ไม่ถูกต้อง
            res.clearCookie('remember_token', {
                domain: process.env.COOKIE_DOMAIN || 'localhost'
            })

            return res.status(401).json({
                success: false,
                message: 'Remember token ไม่ถูกต้อง'
            })
        }

        // สร้าง JWT token ใหม่
        const jwt = require('jsonwebtoken')
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.json({
            success: true,
            message: 'ตรวจสอบ remember token สำเร็จ',
            token,
            user
        })
    } catch (error) {
        console.error('Check remember token error:', error)
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบ remember token'
        })
    }
})

module.exports = router