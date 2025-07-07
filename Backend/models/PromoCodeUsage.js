// models/PromoCodeUsage.js - ติดตามการใช้โปรโมชั่น
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PromoCodeUsage = sequelize.define('PromoCodeUsage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    promoCodeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'PromoCodes',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    indexes: [
        { fields: ['promoCodeId'] },
        { fields: ['userId'] },
        { fields: ['orderId'] }
    ]
})

module.exports = PromoCodeUsage

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