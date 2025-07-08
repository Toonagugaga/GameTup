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