// middleware/auth.js - ปรับปรุงสำหรับ Sequelize
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        if (!token) {
            return res.status(401).json({ message: 'ไม่มี Token' })
        }

        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET)

        // ใช้ Sequelize แทน Mongoose
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password', 'rememberToken', 'passwordResetToken', 'passwordResetExpires'] }
        })

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'ผู้ใช้ไม่พบหรือถูกระงับ' })
        }

        req.user = decoded
        req.userInfo = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        res.status(401).json({ message: 'Token ไม่ถูกต้อง' })
    }
}

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        if (!token) {
            return res.status(401).json({ message: 'ไม่มี Token' })
        }

        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET)

        // ใช้ Sequelize แทน Mongoose
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password', 'rememberToken', 'passwordResetToken', 'passwordResetExpires'] }
        })

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'ผู้ใช้ไม่พบหรือถูกระงับ' })
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' })
        }

        req.user = decoded
        req.userInfo = user
        next()
    } catch (error) {
        console.error('Admin auth middleware error:', error)
        res.status(401).json({ message: 'Token ไม่ถูกต้อง' })
    }
}

// Remember token middleware
const rememberAuth = async (req, res, next) => {
    try {
        const rememberToken = req.cookies.remember_token || req.header('X-Remember-Token')
        if (!rememberToken) {
            return next()
        }

        const user = await User.findOne({
            where: { rememberToken },
            attributes: { exclude: ['password', 'passwordResetToken', 'passwordResetExpires'] }
        })

        if (user && user.isActive) {
            // สร้าง JWT token ใหม่
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

            req.user = { userId: user.id }
            req.userInfo = user
            req.autoLogin = true
            req.newToken = token
        }

        next()
    } catch (error) {
        console.error('Remember auth middleware error:', error)
        next()
    }
}

module.exports = { auth, adminAuth, rememberAuth }