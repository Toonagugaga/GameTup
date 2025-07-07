// routes/auth.js - ปรับปรุงสำหรับ Sequelize
const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { auth, rememberAuth } = require('../middleware/auth')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const router = express.Router()

// Validation rules
const registerValidation = [
    body('username').isLength({ min: 3, max: 30 }).isAlphanumeric(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').isLength({ min: 1, max: 50 }),
    body('lastName').isLength({ min: 1, max: 50 }),
    body('phone').matches(/^[0-9]{10}$/)
]

const loginValidation = [
    body('login').notEmpty().withMessage('Username หรือ Email จำเป็น'),
    body('password').isLength({ min: 6 }).withMessage('Password ต้องมีอย่างน้อย 6 ตัวอักษร')
]

// สมัครสมาชิก
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            })
        }

        const { username, email, password, firstName, lastName, phone } = req.body

        // ตรวจสอบผู้ใช้ที่มีอยู่
        const existingUser = await User.findOne({
            where: {
                $or: [{ email }, { username }]
            }
        })

        if (existingUser) {
            return res.status(400).json({
                message: 'อีเมลหรือชื่อผู้ใช้นี้มีอยู่แล้ว'
            })
        }

        // สร้างผู้ใช้ใหม่
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            phone
        })

        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        // สร้าง Remember Token
        const rememberToken = user.generateRememberToken()
        await user.save()

        res.status(201).json({
            message: 'สมัครสมาชิกสำเร็จ',
            token,
            rememberToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                balance: user.balance,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Register error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' })
    }
})

// เข้าสู่ระบบ
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            })
        }

        const { login, password, rememberMe } = req.body

        // หาผู้ใช้ด้วย username หรือ email
        const user = await User.findOne({
            where: {
                $or: [{ email: login }, { username: login }]
            }
        })

        if (!user) {
            return res.status(401).json({
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            })
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            })
        }

        // อัพเดทเวลาล็อกอินล่าสุด
        user.lastLogin = new Date()

        // สร้าง Remember Token หากเลือก Remember Me
        let rememberToken = null
        if (rememberMe) {
            rememberToken = user.generateRememberToken()
        }

        await user.save()

        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        const response = {
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                balance: user.balance,
                role: user.role
            }
        }

        if (rememberToken) {
            response.rememberToken = rememberToken
        }

        res.json(response)
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
    }
})

// ดูข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', rememberAuth, auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password', 'rememberToken', 'passwordResetToken', 'passwordResetExpires'] }
        })

        const response = { user }

        // ถ้าเป็น auto login ให้ส่ง token ใหม่
        if (req.autoLogin && req.newToken) {
            response.token = req.newToken
        }

        res.json(response)
    } catch (error) {
        console.error('Get me error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ออกจากระบบ
router.post('/logout', auth, async (req, res) => {
    try {
        // ล้าง Remember Token
        const user = await User.findByPk(req.user.userId)
        if (user) {
            user.rememberToken = null
            await user.save()
        }

        res.json({ message: 'ออกจากระบบสำเร็จ' })
    } catch (error) {
        console.error('Logout error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ขอรีเซ็ตรหัสผ่าน
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้งานด้วยอีเมลนี้' })
        }

        // สร้าง Reset Token
        const resetToken = user.generatePasswordResetToken()
        await user.save()

        // ส่งอีเมล (ตัวอย่าง)
        // await sendPasswordResetEmail(user.email, resetToken)

        res.json({ message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว' })
    } catch (error) {
        console.error('Forgot password error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// รีเซ็ตรหัสผ่าน
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body

        const user = await User.findOne({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() }
            }
        })

        if (!user) {
            return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' })
        }

        // อัพเดทรหัสผ่าน
        user.password = newPassword
        user.passwordResetToken = null
        user.passwordResetExpires = null
        await user.save()

        res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' })
    } catch (error) {
        console.error('Reset password error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router