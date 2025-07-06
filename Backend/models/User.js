// models/User.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    balance: { type: Number, default: 0 }, // ยอดเงินในระบบ
    totalSpent: { type: Number, default: 0 }, // ยอดที่ใช้ไปทั้งหมด
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

// เข้ารหัสรหัสผ่านก่อนบันทึก
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// เปรียบเทียบรหัสผ่าน
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)