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
            await queryInterface.addColumn('broadcast_transactions', 'currency', {
                allowNull: true,
                type: Sequelize.STRING,
            }, {transaction});

            await queryInterface.sequelize.query("update broadcast_transactions set currency = 'USDT'", {
                type: Sequelize.QueryTypes.UPDATE,
                transaction
            });

            await queryInterface.changeColumn('broadcast_transactions', 'currency', {
                allowNull: false,
                type: Sequelize.STRING,
            }, {transaction});


            await queryInterface.addColumn('strategy_instances', 'nofunds_at', {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }, {transaction});


            await queryInterface.addColumn('account', 'transfer_permission', {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: true
            }, {transaction});

            await queryInterface.addIndex(
                'broadcast_transactions',
                 ['currency'],
                { transaction }
            );

            await queryInterface.addIndex(
                'strategy_instances',
                 ['nofunds_at'],
                { transaction }
            );

            await queryInterface.addIndex(
                'strategy_instances',
                 ['is_dirty'],
                { transaction }
            );

            await queryInterface.addIndex(
                'strategy_instances',
                 ['dirty_at'],
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
                'broadcast_transactions',
                 ['currency'],
                { transaction }
            );

            await queryInterface.removeIndex(
                'strategy_instances',
                 ['no_funds_at'],
                { transaction }
            );

            await queryInterface.removeIndex(
                'strategy_instances',
                 ['is_dirty'],
                { transaction }
            );

            await queryInterface.removeIndex(
                'strategy_instances',
                 ['dirty_at'],
                { transaction }
            );

            await queryInterface.removeColumn('strategy_instances', 'no_funds_at', {transaction});
            await queryInterface.removeColumn('account', 'transfer_permission', {transaction});

            await queryInterface.removeColumn('broadcast_transactions', 'currency', {transaction});
        });
    }
}