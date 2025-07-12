// config/payment.js - การตั้งค่า payment gateway
require('dotenv').config()

const paymentConfig = {
    // PromptPay Configuration
    promptpay: {
        enabled: process.env.PROMPTPAY_ENABLED === 'true',
        phoneNumber: process.env.PROMPTPAY_PHONE || '0123456789',
        merchantName: process.env.PROMPTPAY_MERCHANT_NAME || 'GameTopup',
        qrCodeApi: process.env.PROMPTPAY_QR_API || 'https://api.qrserver.com/v1/create-qr-code/'
    },

    // TrueMoney Wallet Configuration
    truemoney: {
        enabled: process.env.TRUEMONEY_ENABLED === 'true',
        apiUrl: process.env.TRUEMONEY_API_URL || 'https://api.truemoney.com',
        apiKey: process.env.TRUEMONEY_API_KEY,
        secretKey: process.env.TRUEMONEY_SECRET_KEY,
        merchantId: process.env.TRUEMONEY_MERCHANT_ID,
        redirectUrl: process.env.TRUEMONEY_REDIRECT_URL || 'http://localhost:3000/api/payments/truemoney/callback'
    },

    // Bank Transfer Configuration
    bankTransfer: {
        enabled: process.env.BANK_TRANSFER_ENABLED === 'true',
        accounts: [
            {
                bank: 'SCB',
                accountNumber: process.env.SCB_ACCOUNT_NUMBER || '1234567890',
                accountName: process.env.SCB_ACCOUNT_NAME || 'GameTopup Co., Ltd.'
            },
            {
                bank: 'KBANK',
                accountNumber: process.env.KBANK_ACCOUNT_NUMBER || '0987654321',
                accountName: process.env.KBANK_ACCOUNT_NAME || 'GameTopup Co., Ltd.'
            }
        ],
        verificationApi: process.env.BANK_VERIFICATION_API,
        verificationKey: process.env.BANK_VERIFICATION_KEY
    },

    // Credit Card Configuration (สำหรับอนาคต)
    creditCard: {
        enabled: process.env.CREDIT_CARD_ENABLED === 'true',
        gateway: process.env.CREDIT_CARD_GATEWAY || 'omise', // omise, 2c2p, etc.
        apiKey: process.env.CREDIT_CARD_API_KEY,
        secretKey: process.env.CREDIT_CARD_SECRET_KEY,
        publicKey: process.env.CREDIT_CARD_PUBLIC_KEY
    },

    // General Settings
    general: {
        currency: 'THB',
        timeout: 30 * 60 * 1000, // 30 นาที
        retryLimit: 3,
        webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
        callbackUrl: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/api/payments/callback'
    }
}

// Validation
const validatePaymentConfig = () => {
    const errors = []

    // ตรวจสอบ PromptPay
    if (paymentConfig.promptpay.enabled && !paymentConfig.promptpay.phoneNumber) {
        errors.push('PromptPay phone number is required')
    }

    // ตรวจสอบ TrueMoney
    if (paymentConfig.truemoney.enabled) {
        if (!paymentConfig.truemoney.apiKey) errors.push('TrueMoney API key is required')
        if (!paymentConfig.truemoney.secretKey) errors.push('TrueMoney secret key is required')
        if (!paymentConfig.truemoney.merchantId) errors.push('TrueMoney merchant ID is required')
    }

    // ตรวจสอบ Bank Transfer
    if (paymentConfig.bankTransfer.enabled) {
        const hasValidAccount = paymentConfig.bankTransfer.accounts.some(acc =>
            acc.accountNumber && acc.accountName
        )
        if (!hasValidAccount) {
            errors.push('At least one valid bank account is required')
        }
    }

    // ตรวจสอบ Credit Card
    if (paymentConfig.creditCard.enabled) {
        if (!paymentConfig.creditCard.apiKey) errors.push('Credit card API key is required')
        if (!paymentConfig.creditCard.secretKey) errors.push('Credit card secret key is required')
    }

    if (errors.length > 0) {
        console.warn('Payment configuration warnings:', errors)
    }

    return errors.length === 0
}

// รายการ Payment Methods ที่ใช้ได้
const getAvailablePaymentMethods = () => {
    const methods = []

    if (paymentConfig.promptpay.enabled) {
        methods.push({
            id: 'promptpay',
            name: 'PromptPay',
            description: 'ชำระผ่าน QR Code',
            icon: '/images/promptpay.png',
            type: 'qr_code'
        })
    }

    if (paymentConfig.truemoney.enabled) {
        methods.push({
            id: 'truemoney',
            name: 'TrueMoney Wallet',
            description: 'ชำระผ่าน TrueMoney Wallet',
            icon: '/images/truemoney.png',
            type: 'e_wallet'
        })
    }

    if (paymentConfig.bankTransfer.enabled) {
        methods.push({
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'โอนเงินผ่านธนาคาร',
            icon: '/images/bank.png',
            type: 'bank_transfer'
        })
    }

    if (paymentConfig.creditCard.enabled) {
        methods.push({
            id: 'credit_card',
            name: 'Credit Card',
            description: 'ชำระด้วยบัตรเครดิต',
            icon: '/images/credit-card.png',
            type: 'credit_card'
        })
    }

    return methods
}

// ตรวจสอบการตั้งค่าเมื่อเริ่มต้น
validatePaymentConfig()

module.exports = {
    paymentConfig,
    validatePaymentConfig,
    getAvailablePaymentMethods
}