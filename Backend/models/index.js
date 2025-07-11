// models/index.js
const { Sequelize } = require('sequelize')
const config = require('../config/database.json')[process.env.NODE_ENV || 'development']

const sequelize = new Sequelize(config)

// Import models
const User = require('./User')(sequelize, Sequelize)
const Game = require('./Game')(sequelize, Sequelize)
const Order = require('./Order')(sequelize, Sequelize)
const PromoCode = require('./PromoCode')(sequelize, Sequelize)
const PromoCodeUsage = require('./PromoCodeUsage')(sequelize, Sequelize)

// Define associations
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

const db = {
    sequelize,
    Sequelize,
    User,
    Game,
    Order,
    PromoCode,
    PromoCodeUsage
}

module.exports = db