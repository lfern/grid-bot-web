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
            await queryInterface.addColumn('strategy_instance_orders', 'matching_order_id', {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'strategy_instance_orders'
                    },
                    key: 'id'
                }
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_grids', 'order_id', {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'strategy_instance_orders'
                    },
                    key: 'id'
                }
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_grids', 'matching_order_id', {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'strategy_instance_orders'
                    },
                    key: 'id'
                }
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_recovery_grids', 'order_id', {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'strategy_instance_orders'
                    },
                    key: 'id'
                }
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_recovery_grids', 'matching_order_id', {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'strategy_instance_orders'
                    },
                    key: 'id'
                }
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_trades', 'taker_or_maker', {
                allowNull: true,
                type: Sequelize.STRING,
            }, {transaction});            

            /*
              update strategy_instance_trades set side = strategy_instance_orders.side::text::enum_strategy_instance_trades_side
              from strategy_instance_orders where strategy_instance_orders.id = strategy_instance_order_id
              and strategy_instance_trades.side is null;
            */
            await queryInterface.addColumn('strategy_instance_trades', 'side', {
                allowNull: true,
                type: Sequelize.ENUM('buy', 'sell')
            }, {transaction});     
            
            /*
              update strategy_instance_trades set exchange_order_id = strategy_instance_orders.exchange_order_id
              from strategy_instance_orders where strategy_instance_orders.id = strategy_instance_order_id
              and strategy_instance_trades.exchange_order_id is null;
            */
            await queryInterface.addColumn('strategy_instance_trades', 'exchange_order_id', {
                allowNull: true,
                type: Sequelize.STRING
            }, {transaction});
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
            await queryInterface.removeColumn('strategy_instance_orders', 'matching_order_id', {transaction});

            await queryInterface.removeColumn('strategy_instance_grids', 'order_id', {transaction});
            await queryInterface.removeColumn('strategy_instance_grids', 'matching_order_id', {transaction});

            await queryInterface.removeColumn('strategy_instance_recovery_grids', 'order_id', {transaction});
            await queryInterface.removeColumn('strategy_instance_recovery_grids', 'matching_order_id', {transaction});

            await queryInterface.removeColumn('strategy_instance_trades', 'taker_or_maker', {transaction});
            await queryInterface.removeColumn('strategy_instance_trades', 'side', {transaction});
            await queryInterface.removeColumn('strategy_instance_trades', 'exchange_order_id', {transaction});

            await queryInterface.sequelize.query(
                'DROP TYPE "enum_strategy_instance_trades_side";',
                {transaction}
            );
        });

    }
}