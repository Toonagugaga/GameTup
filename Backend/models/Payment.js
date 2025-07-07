// models/Payment.js
const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'wallet', 'promptpay'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'cancelled'],
        default: 'pending'
    },
    transactionId: String,
    reference: String,
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    processedAt: Date,
    failureReason: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Payment', paymentSchema)