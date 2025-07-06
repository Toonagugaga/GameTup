// models/Order.js
const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },

    // ข้อมูลแพ็คเกจที่เลือก
    package: {
        name: String,
        amount: Number,
        price: Number
    },

    // ข้อมูลบัญชีเกมที่จะเติม
    gameAccount: { type: Map, of: String }, // { gameId: "123", server: "Asia" }

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

    totalAmount: Number,
    finalAmount: Number,

    processedAt: Date,
    completedAt: Date
}, { timestamps: true })

// สร้างเลขที่ออเดอร์อัตโนมัติ
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await this.constructor.countDocuments()
        this.orderNumber = `GT${Date.now()}${String(count + 1).padStart(4, '0')}`
    }
    next()
})

module.exports = mongoose.model('Order', orderSchema)