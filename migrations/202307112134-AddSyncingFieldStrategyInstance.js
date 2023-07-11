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
            await queryInterface.addColumn('strategy_instances', 'is_syncing', {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }, {transaction});
            
            await queryInterface.addIndex(
                'strategy_instances',
                 ['is_syncing'],
                { transaction }
            );

            await queryInterface.addColumn('strategy_instances', 'syncing_at', {
                allowNull: true,
                type: Sequelize.DATE,
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
                'strategy_instances',
                 ['is_syncing'],
                { transaction }
            );

            await queryInterface.removeColumn('strategy_instances', 'syncing_at', {transaction});
            await queryInterface.removeColumn('strategy_instances', 'is_syncing', {transaction});

        });

    }
}