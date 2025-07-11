'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      packages: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      accountFields: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('Games', ['name'], {
      unique: true,
      name: 'games_name_unique'
    })

    await queryInterface.addIndex('Games', ['category'], {
      name: 'games_category_index'
    })

    await queryInterface.addIndex('Games', ['isActive'], {
      name: 'games_is_active_index'
    })

    await queryInterface.addIndex('Games', ['isFeatured'], {
      name: 'games_is_featured_index'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Games')
  }
}
