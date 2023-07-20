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
            await queryInterface.addColumn('strategy_instances', 'initial_position', {
                allowNull: true,
                type: Sequelize.DECIMAL(30, 15),
            }, {transaction});

            await queryInterface.addColumn('strategy_instances', 'active_buys', {
                allowNull: true,
                type: Sequelize.INTEGER,
            }, {transaction});

            await queryInterface.addColumn('strategy_instances', 'active_sells', {
                allowNull: true,
                type: Sequelize.INTEGER,
            }, {transaction});

            await queryInterface.sequelize.query(`update strategy_instances set 
                active_buys = a.active_buys,
                active_sells = a.active_sells,
                initial_position = a.initial_position
                FROM strategies as a where a.id = strategy_instances.strategy_id`, {
                type: Sequelize.QueryTypes.UPDATE,
                transaction
            });

            await queryInterface.changeColumn('strategy_instances', 'initial_position', {
                allowNull: false,
                type: Sequelize.DECIMAL(30, 15),
            }, {transaction});

            await queryInterface.changeColumn('strategy_instances', 'active_buys', {
                allowNull: false,
                type: Sequelize.INTEGER,
            }, {transaction});

            await queryInterface.changeColumn('strategy_instances', 'active_sells', {
                allowNull: false,
                type: Sequelize.INTEGER,
            }, {transaction});

            await queryInterface.addColumn('telegram_chatids', 'scope', {
                allowNull: true,
                type: Sequelize.ENUM('strategy', 'other'),
            }, {transaction});

            await queryInterface.createTable('telegram_scope_strategies', {
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
                telegram_chat_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                    references: {
                        model: {
                            tableName: 'telegram_chatids'
                        },
                        key: 'id'
                    }
                },
                strategy_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                    references: {
                        model: {
                            tableName: 'strategies'
                        },
                        key: 'id'
                    }
                },
            }, {
                uniqueKeys: {
                    unique_order: {
                        customIndex: true,
                        fields: ['strategy_id', 'telegram_chat_id']
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
            await queryInterface.removeColumn('strategy_instances', 'active_sells', {transaction});
            await queryInterface.removeColumn('strategy_instances', 'active_buys', {transaction});
            await queryInterface.removeColumn('strategy_instances', 'initial_position', {transaction});
            await queryInterface.removeColumn('telegram_chatids', 'scope', {transaction});
            await queryInterface.sequelize.query(
                'DROP TYPE "enum_telegram_chatids_scope";',
                {transaction}
            );
            await queryInterface.dropTable('telegram_scope_strategies',{transaction});
        });

    }
}