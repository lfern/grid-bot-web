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
            // Table strategy_types
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
            }, {transaction});
            
            // Table strategies
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
            }, {transaction});

            // Table startegy_instances
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
            }, {transaction});

            // Table strategy_instance_grids
            await queryInterface.createTable('strategy_instance_grids', {
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
            }, {transaction});

            // Insert Grid strategy type
            await queryInterface.sequelize.query('insert into strategy_types (id, "createdAt", "updatedAt", strategy_type, strategy_type_name) values (?,NOW(),NOW(),?,?)',{
                replacements: [
                    'd726ffe7-80ae-4266-8b77-af70bc34daf1',
                    'grid',
                    'Grid'
                ],
                type: Sequelize.QueryTypes.INSERT,
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
            await queryInterface.dropTable('strategy_instance_grids', {transaction});
            await queryInterface.dropTable('strategy_instances', {transaction});
            await queryInterface.dropTable('strategies', {transaction});
            await queryInterface.dropTable('strategy_types', {transaction});
        });
    }
}