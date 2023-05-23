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
            // Table pending orders
            await queryInterface.createTable('account_pending_orders', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
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
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts',
                        },
                        key: 'id'
                    }
                },
                order: {
                    allowNull: false,
                    type: Sequelize.JSONB,
                },
                timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                order_id: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                symbol: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
            },
            {
                uniqueKeys: {
                  unique_exchange_market: {
                      customIndex: true,
                      fields: ['account_id', 'symbol', 'timestamp', 'order_id']
                  }
                },
                transaction
            });

            // Table pending orders
            await queryInterface.createTable('account_pending_trades', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
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
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts',
                        },
                        key: 'id'
                    }
                },
                trade: {
                    allowNull: false,
                    type: Sequelize.JSONB,
                },
                timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                trade_id: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                order_id: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                symbol: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
            },
            {
                uniqueKeys: {
                    unique_exchange_market: {
                        customIndex: true,
                        fields: ['account_id', 'symbol', 'trade_id']
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
            await queryInterface.dropTable('account_pending_trades', {transaction});
            await queryInterface.dropTable('account_pending_orders', {transaction});
        });

    }
}