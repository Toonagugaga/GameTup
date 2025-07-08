// models/index.js - ตั้งค่าความสัมพันธ์
const User = require('./User')
const Game = require('./Game')
const Order = require('./Order')
const PromoCode = require('./PromoCode')
const PromoCodeUsage = require('./PromoCodeUsage')

// ความสัมพันธ์
User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId' })

Game.hasMany(Order, { foreignKey: 'gameId' })
Order.belongsTo(Game, { foreignKey: 'gameId' })

PromoCode.hasMany(PromoCodeUsage, { foreignKey: 'promoCodeId' })
PromoCodeUsage.belongsTo(PromoCode, { foreignKey: 'promoCodeId' })

User.hasMany(PromoCodeUsage, { foreignKey: 'userId' })
PromoCodeUsage.belongsTo(User, { foreignKey: 'userId' })

Order.hasMany(PromoCodeUsage, { foreignKey: 'orderId' })
PromoCodeUsage.belongsTo(Order, { foreignKey: 'orderId' })

module.exports = {
    User,
    Game,
    Order,
    PromoCode,
    PromoCodeUsage
}