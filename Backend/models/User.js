// models/User.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    balance: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)

// models/Game.js
const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        required: true,
        enum: ['moba', 'fps', 'mmorpg', 'mobile', 'other']
    },
    image: {
        type: String,
        required: true
    },
    banner: String,
    developer: String,
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    topupFields: [{
        name: String,
        label: String,
        type: {
            type: String,
            enum: ['text', 'number', 'select'],
            default: 'text'
        },
        placeholder: String,
        required: {
            type: Boolean,
            default: true
        },
        options: [String] // For select type
    }],
    packages: [{
        name: String,
        description: String,
        amount: Number,
        price: Number,
        currency: String,
        bonus: Number,
        isPopular: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Game', gameSchema)

// models/Order.js
const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    package: {
        name: String,
        amount: Number,
        price: Number,
        currency: String
    },
    gameAccount: {
        type: Map,
        of: String // Store game account details as key-value pairs
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'wallet', 'promptpay'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    transactionId: String,
    paymentReference: String,
    notes: String,
    processedAt: Date,
    completedAt: Date,
    failureReason: String
}, {
    timestamps: true
})

// Generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await this.constructor.countDocuments()
        this.orderNumber = `GT${Date.now()}${String(count + 1).padStart(4, '0')}`
    }
    next()
})

module.exports = mongoose.model('Order', orderSchema)

// models/Payment.js
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