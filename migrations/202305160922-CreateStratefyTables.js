'use strict'

const Sequelize = require("sequelize");

module.exports = {
    /**
     * 
     * @param {Sequelize.QueryInterface} queryInterface 
     * @param {Sequelize} Sequelize 
     * @returns 
     */
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.createTable('strategy_types', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                strategy_type: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true
                },
                strategy_type_name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                }
            });
            await queryInterface.createTable('strategies', {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true
                },
                strategy_type_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'strategy_types'
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
                    type: Sequelize.STRING,
                },
                initial_position: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20, 20),
                },
                order_qty: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20, 20),
                },
                buy_orders: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                },
                sell_orders: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                },
                active_buys: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                },
                active_sells: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                },
                step: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(3,2),
                }
            });
            await queryInterface.createTable('strategy_instances', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
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
                running: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                }
            });
            await queryInterface.createTable('strategy_instance_grid', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
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
                price: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20,20),
                },
                buy_order_id: {
                    allowNull: false,
                    type:Sequelize.INTEGER
                },
                buy_order_qty: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20,20),
                },
                buy_order_cost: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20,20),
                },
                sell_order_id: {
                    allowNull: false,
                    type:Sequelize.INTEGER
                },
                sell_order_qty: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20,20),
                },
                sell_order_cost: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(20,20),
                },
                position_before_order: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(20,20),
                },
                order_qty: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(20,20),
                },
                side: {
                    allowNull: true,
                    type: Sequelize.ENUM('buy', 'sell'),
                },
                active: {
                    allowNull: true,
                    type: Sequelize.BOOLEAN,
                },
                exchange_order_id: {
                    allowNull: true,
                    type: Sequelize.STRING,
                }
            });
        });
    },
    
    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.dropTable('strategy_instance_grid');
            await queryInterface.dropTable('strategy_instances');
            await queryInterface.dropTable('strategies');
            await queryInterface.dropTable('strategy_types');
        });
    }
}