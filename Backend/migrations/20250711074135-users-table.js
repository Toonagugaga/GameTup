'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      totalSpent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      rememberToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    // เพิ่ม indexes
    await queryInterface.addIndex('Users', ['username'], {
      unique: true,
      name: 'users_username_unique'
    })

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    })

    await queryInterface.addIndex('Users', ['rememberToken'], {
      name: 'users_remember_token_index'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users')
  },
}
