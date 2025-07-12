// models/index.js - ปรับปรุงเพื่อให้ใช้กับ Sequelize instances ที่ถูกต้อง
const sequelize = require('../config/database')
const { Sequelize } = require('sequelize')
// Import models
const User = require('./User')
const Game = require('./Game')
const GamePackage = require('./GamePackage')
const Order = require('./Order')
const Payment = require('./Payment')
const PromoCode = require('./PromoCode')
const UserPromoCode = require('./UserPromoCode')
const PaymentMethod = require('./PaymentMethod')

// Define associations
// User associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' })
User.hasMany(UserPromoCode, { foreignKey: 'userId', as: 'promoUsages' })
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' })

// Game associations
Game.hasMany(GamePackage, { foreignKey: 'gameId', as: 'packages' })
Game.hasMany(Order, { foreignKey: 'gameId', as: 'orders' })

// GamePackage associations
GamePackage.belongsTo(Game, { foreignKey: 'gameId', as: 'game' })

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Order.belongsTo(Game, { foreignKey: 'gameId', as: 'game' })
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' })
Order.hasMany(UserPromoCode, { foreignKey: 'orderId', as: 'promoUsages' })

// Payment associations
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// PromoCode associations
PromoCode.hasMany(UserPromoCode, { foreignKey: 'promoCodeId', as: 'usages' })

// UserPromoCode associations
UserPromoCode.belongsTo(User, { foreignKey: 'userId', as: 'user' })
UserPromoCode.belongsTo(PromoCode, { foreignKey: 'promoCodeId', as: 'promoCode' })
UserPromoCode.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })

const db = {
    sequelize,
    Sequelize,
    User,
    Game,
    GamePackage,
    Order,
    Payment,
    PromoCode,
    UserPromoCode,
    PaymentMethod
}

module.exports = db