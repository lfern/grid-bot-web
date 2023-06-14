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
            await queryInterface.addColumn('broadcast_transactions', 'deposit_id', {
                allowNull: true,
                type: Sequelize.STRING
            }, {transaction});

            await queryInterface.addColumn('broadcast_transactions', 'deposited_at', {
                allowNull: true,
                type: Sequelize.DATE
            }, {transaction});

            await queryInterface.addColumn('broadcast_transactions', 'deposit', {
                allowNull: true,
                type: Sequelize.JSONB
            }, {transaction});

            await queryInterface.addColumn('broadcast_transactions', 'deposit_status', {
                allowNull: false,
                type: Sequelize.ENUM('n/a', 'pending', 'deposited', 'missing'),
                defaultValue: 'n/a'
            }, {transaction});

            await queryInterface.addIndex(
                'broadcast_transactions',
                 ['deposit_status'],
                { transaction }
            );

            await queryInterface.addColumn('strategy_instances', 'nofunds', {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }, {transaction});

            await queryInterface.addIndex(
                'strategy_instances',
                 ['nofunds'],
                { transaction }
            );

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
                 ['nofunds'],
                { transaction }
            );
            await queryInterface.removeColumn('strategy_instances', 'nofunds', {transaction});

            await queryInterface.removeIndex(
                'broadcast_transactions',
                 ['deposit_status'],
                { transaction }
            );
           
            await queryInterface.removeColumn('broadcast_transactions', 'deposit_status', {transaction});
            await queryInterface.removeColumn('broadcast_transactions', 'deposit', {transaction});
            await queryInterface.removeColumn('broadcast_transactions', 'deposited_at', {transaction});
            await queryInterface.removeColumn('broadcast_transactions', 'deposit_id', {transaction});
        });
    }
}