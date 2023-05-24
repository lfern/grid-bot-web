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
            //  Table strategy_intance_events
            await queryInterface.createTable('strategy_instance_events', {
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
                strategy_instance_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'strategy_instances'
                        },
                        key: 'id'
                    }
                },
                event: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                message: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                params: {
                    allowNull: false,
                    type: Sequelize.JSONB,
                },
                max_price: {
                    allowNull: true,
                    type:Sequelize.DECIMAL(30, 15)
                },
                min_price: {
                    allowNull: true,
                    type:Sequelize.DECIMAL(30, 15)
                },
                price: {
                    allowNull: true,
                    type:Sequelize.DECIMAL(30, 15)
                },
                position: {
                    allowNull: true,
                    type:Sequelize.DECIMAL(30, 15)
                }
            }, {transaction});

            // Table strategy_instance_orders
            await queryInterface.createTable('strategy_instance_orders', {
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
                strategy_instance_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'strategy_instances'
                        },
                        key: 'id'
                    }
                },
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts'
                        },
                        key: 'id'
                    }
                },
                exchange_order_id: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                symbol: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                order_type: {
                    allowNull: false,
                    type: Sequelize.ENUM('market', 'limit')
                },
                side: {
                    allowNull: false,
                    type: Sequelize.ENUM('buy', 'sell')
                },
                timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                datetime: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                status: {
                    allowNull: false,
                    type: Sequelize.ENUM('open', 'closed', 'expired', 'canceled', 'rejected')
                },
                price: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                amount: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                cost: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                average: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                filled: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                remaining: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                }
            },
            {
                uniqueKeys: {
                  unique_order: {
                      customIndex: true,
                      fields: ['account_id', 'symbol', 'exchange_order_id']
                  }
                },
                transaction
            });

            // Table strategy_instance_trades
            await queryInterface.createTable('strategy_instance_trades', {
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
                strategy_instance_order_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'strategy_instance_orders'
                        },
                        key: 'id'
                    }
                },
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts'
                        },
                        key: 'id'
                    }
                },
                symbol: {
                    allowNull: false,
                    type: Sequelize.STRING
                },

                exchange_trade_id: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                datetime: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                price: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30, 15)
                },
                amount: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30, 15)
                },
                cost: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30, 15)
                },
                fee_cost: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                fee_coin: {
                    allowNull: true,
                    type: Sequelize.STRING
                }
            },
            {
                uniqueKeys: {
                  unique_trade: {
                      customIndex: true,
                      fields: ['account_id', 'symbol', 'strategy_instance_order_id']
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
            await queryInterface.dropTable('strategy_instance_trades', {transaction});
            await queryInterface.dropTable('strategy_instance_orders', {transaction});
            await queryInterface.dropTable('strategy_instance_events', {transaction});
        });
    }
}