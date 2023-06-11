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
            await queryInterface.removeColumn('strategy_instance_events', 'max_price', {transaction});
            await queryInterface.removeColumn('strategy_instance_events', 'min_price', {transaction});
            await queryInterface.removeColumn('strategy_instance_events', 'price', {transaction});
            await queryInterface.removeColumn('strategy_instance_events', 'position', {transaction});    
            await queryInterface.addColumn('strategy_instance_events', 'level', {
                allowNull: false,
                type: Sequelize.SMALLINT,
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
            await queryInterface.removeColumn('strategy_instance_events', 'level', {transaction});

            await queryInterface.addColumn('strategy_instance_events', 'max_price', {
                allowNull: true,
                type: Sequelize.DECIMAL(30, 15),
            }, {transaction});
            
            await queryInterface.addColumn('strategy_instance_events', 'min_price', {
                allowNull: true,
                type:Sequelize.DECIMAL(30, 15)
            }, {transaction});
            
            await queryInterface.addColumn('strategy_instance_events', 'price', {
                allowNull: true,
                type:Sequelize.DECIMAL(30, 15)
            }, {transaction});

            await queryInterface.addColumn('strategy_instance_events', 'position', {
                allowNull: true,
                type:Sequelize.DECIMAL(30, 15)
            }, {transaction});
        });
    }
}