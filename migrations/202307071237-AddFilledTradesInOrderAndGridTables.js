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
            await queryInterface.addColumn('strategy_instance_orders', 'trades_ok', {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }, {transaction});
            
            await queryInterface.addIndex(
                'strategy_instance_orders',
                 ['trades_ok'],
                { transaction }
            );

            await queryInterface.addColumn('strategy_instance_orders', 'trades_filled', {
                allowNull: false,
                type: Sequelize.DECIMAL(30, 15),
                defaultValue: 0
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_grids', 'filled', {
                allowNull: true,
                type: Sequelize.DECIMAL(30, 15),
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_recovery_grids', 'filled', {
                allowNull: true,
                type: Sequelize.DECIMAL(30, 15),
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
            await queryInterface.removeIndex(
                'strategy_instance_orders',
                 ['trades_ok'],
                { transaction }
            );

            await queryInterface.removeColumn('strategy_instance_orders', 'trades_ok', {transaction});
            await queryInterface.removeColumn('strategy_instance_orders', 'trades_filled', {transaction});
            await queryInterface.removeColumn('strategy_instance_recovery_grids', 'filled', {transaction});
            await queryInterface.removeColumn('strategy_instance_grids', 'filled', {transaction});

        });

    }
}