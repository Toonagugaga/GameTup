// models/GamePackage.js - แพ็คเกจเติมเงินแยกออกมาเป็น Model ต่างหาก
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const GamePackage = sequelize.define('GamePackage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Games',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    bonus: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    isPopular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // ข้อมูลเพิ่มเติม
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    indexes: [
        { fields: ['gameId'] },
        { fields: ['isActive'] },
        { fields: ['isPopular'] },
        { fields: ['sortOrder'] },
        { fields: ['price'] }
    ]
})

module.exports = GamePackage