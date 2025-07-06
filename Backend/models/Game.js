// models/Game.js
const gameSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // valorant, pubg
    displayName: { type: String, required: true }, // VALORANT, PUBG Mobile
    description: String,
    category: { type: String, enum: ['moba', 'fps', 'mmorpg', 'mobile', 'other'] },
    image: String, // รูปเกม

    // ช่องกรอกข้อมูลที่ต้องการ เช่น Game ID, Server
    topupFields: [{
        name: String, // gameId, server
        label: String, // "Game ID", "Server"
        type: { type: String, enum: ['text', 'number', 'select'] },
        required: { type: Boolean, default: true },
        options: [String] // สำหรับ select type
    }],

    // แพ็คเกจเติมเงิน
    packages: [{
        name: String, // "100 VP", "420 VP"
        amount: Number, // จำนวนเงินในเกม
        price: Number, // ราคาจริง (บาท)
        currency: { type: String, default: 'THB' },
        isPopular: { type: Boolean, default: false }
    }],

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Game', gameSchema)