// routes/payments.js
const express = require('express')
const Order = require('../models/Order')
const GameService = require('../service/gameService')
const { auth } = require('../middleware/auth')

const router = express.Router()

// ชำระเงิน
router.post('/process', auth, async (req, res) => {
    try {
        const { orderId, paymentData } = req.body

        const order = await Order.findById(orderId).populate('game')
        if (!order) {
            return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' })
        }

        // จำลองการชำระเงิน (ควรเชื่อมต่อกับ Payment Gateway จริง)
        const paymentResult = await processPayment(paymentData, order.finalAmount)

        if (paymentResult.success) {
            // อัพเดทสถานะเป็น processing
            order.status = 'processing'
            order.paymentStatus = 'paid'
            order.transactionId = paymentResult.transactionId
            await order.save()

            // เรียกเติมเงินในเกม
            const topupResult = await GameService.processTopup(
                order.game.name,
                order.gameAccount,
                order.package.amount
            )

            if (topupResult.success) {
                order.status = 'completed'
                order.completedAt = new Date()
            } else {
                order.status = 'failed'
                order.failureReason = topupResult.error
            }

            await order.save()

            res.json({
                message: 'ชำระเงินสำเร็จ',
                order,
                topupResult
            })
        } else {
            order.status = 'failed'
            order.failureReason = paymentResult.error
            await order.save()

            res.status(400).json({
                message: 'การชำระเงินล้มเหลว',
                error: paymentResult.error
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ฟังก์ชันจำลองการชำระเงิน
async function processPayment(paymentData, amount) {
    // ตัวอย่าง - ควรเชื่อมต่อกับ Payment Gateway จริง
    return {
        success: true,
        transactionId: `TXN${Date.now()}`
    }
}

module.exports = router