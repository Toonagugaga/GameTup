// models/User.js - ปรับปรุงสำหรับ Sequelize + PostgreSQL
const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 30],
            isAlphanumeric: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[0-9]{10}$/
        }
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    totalSpent: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLogin: {
        type: DataTypes.DATE
    },
    // เพิ่มฟิลด์สำหรับ Remember Token
    rememberToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // เพิ่มฟิลด์สำหรับ Password Reset
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10)
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10)
            }
        }
    },
    indexes: [
        { fields: ['email'] },
        { fields: ['username'] },
        { fields: ['role'] },
        { fields: ['rememberToken'] }
    ]
})

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get())
    delete values.password
    delete values.rememberToken
    delete values.passwordResetToken
    delete values.passwordResetExpires
    return values
}

User.prototype.generateRememberToken = function () {
    const crypto = require('crypto')
    this.rememberToken = crypto.randomBytes(32).toString('hex')
    return this.rememberToken
}

User.prototype.generatePasswordResetToken = function () {
    const crypto = require('crypto')
    this.passwordResetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 นาที
    return this.passwordResetToken
}

module.exports = User