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
            await queryInterface.addColumn('strategy_instances', 'is_dirty', {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }, {transaction});

            await queryInterface.addColumn('strategy_instances', 'dirty_at', {
                allowNull: true,
                type: Sequelize.DATE
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
            await queryInterface.removeColumn('strategy_instances', 'is_dirty', {transaction});
            await queryInterface.removeColumn('strategy_instances', 'dirty_at', {transaction});
        });
    }
}