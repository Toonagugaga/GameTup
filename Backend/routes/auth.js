// routes/auth.js
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

// สมัครสมาชิก
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone } = req.body

        // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
        const existingUser = await User.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
            return res.status(400).json({ message: 'อีเมลหรือชื่อผู้ใช้นี้มีอยู่แล้ว' })
        }

        // สร้างผู้ใช้ใหม่
        const user = new User({ username, email, password, firstName, lastName, phone })
        await user.save()

        // สร้าง Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({
            message: 'สมัครสมาชิกสำเร็จ',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                balance: user.balance
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' })
    }
})

// เข้าสู่ระบบ
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body

        // หาผู้ใช้ด้วย username หรือ email
        const user = await User.findOne({ $or: [{ email: login }, { username: login }] })
        if (!user) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
        }

        // อัพเดทเวลาล็อกอินล่าสุด
        user.lastLogin = new Date()
        await user.save()

        // สร้าง Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                balance: user.balance,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
    }
})

// ดูข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password')
        res.json({ user })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router