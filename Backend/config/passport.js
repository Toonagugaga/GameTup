// config/passport.js - การตั้งค่า authentication
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/User')
require('dotenv').config()

// Local Strategy สำหรับ Login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({
            where: { email },
            attributes: { exclude: ['rememberToken', 'passwordResetToken', 'passwordResetExpires'] }
        })

        if (!user) {
            return done(null, false, { message: 'ไม่พบผู้ใช้งาน' })
        }

        if (!user.isActive) {
            return done(null, false, { message: 'บัญชีผู้ใช้ถูกระงับ' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return done(null, false, { message: 'รหัสผ่านไม่ถูกต้อง' })
        }

        return done(null, user)
    } catch (error) {
        return done(error)
    }
}))

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    try {
        const user = await User.findByPk(payload.userId, {
            attributes: { exclude: ['password', 'rememberToken', 'passwordResetToken', 'passwordResetExpires'] }
        })

        if (!user || !user.isActive) {
            return done(null, false)
        }

        return done(null, user)
    } catch (error) {
        return done(error, false)
    }
}))

// Serialize/Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'rememberToken', 'passwordResetToken', 'passwordResetExpires'] }
        })
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

module.exports = passport