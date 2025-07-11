'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gameId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      packageData: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      gameAccount: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.ENUM('credit_card', 'bank_transfer', 'truemoney', 'promptpay'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      finalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      promoCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      failureReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
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
    await queryInterface.addIndex('Orders', ['orderNumber'], {
      unique: true,
      name: 'orders_order_number_unique'
    })

    await queryInterface.addIndex('Orders', ['userId'], {
      name: 'orders_user_id_index'
    })

    await queryInterface.addIndex('Orders', ['gameId'], {
      name: 'orders_game_id_index'
    })

    await queryInterface.addIndex('Orders', ['status'], {
      name: 'orders_status_index'
    })

    await queryInterface.addIndex('Orders', ['createdAt'], {
      name: 'orders_created_at_index'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders')
  }
}
