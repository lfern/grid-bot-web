'use strict'

/** @typedef {import('sequelize').QueryInterface} QueryInterface */
/** @typedef {import('sequelize')} sequelize */

module.exports = {
    /**
     * 
     * @param {QueryInterface} queryInterface 
     * @param {sequelize} Sequelize 
     * @returns 
     */
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.createTable('strategy_quantities', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                strategy_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'strategies'
                        },
                        key: 'id'
                    }
                },
                id_buy: {
                    allowNull: false,
                    type:Sequelize.INTEGER,
                },
                buy_order_qty: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30,15),
                },
                sell_order_qty: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30,15),
                },
            }, {
                uniqueKeys: {
                    unique_order: {
                        customIndex: true,
                        fields: ['strategy_id', 'id_buy']
                    }
                  },
                transaction
            });
        });
    },
    
    /**
     * 
     * @param {QueryInterface} queryInterface 
     * @param {sequelize} Sequelize 
     * @returns 
     */
    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.dropTable('strategy_quantities', {transaction});
        });

    }
}