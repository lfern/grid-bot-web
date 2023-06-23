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
            
            await queryInterface.createTable('strategy_instance_recovery_grids', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
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
                strategy_instance_grid_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'strategy_instance_grids'
                        },
                        key: 'id'
                    }
                },
                order_qty: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30,15),
                },
                side: {
                    allowNull: true,
                    type: Sequelize.ENUM('buy', 'sell'),
                },
                exchange_order_id: {
                    allowNull: true,
                    type: Sequelize.STRING,
                }
            },
            {
                transaction
            });

            // Table broadcast transactions
            await queryInterface.createTable('strategy_instance_recovery_grid_orders', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
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
                status: {
                    allowNull: false,
                    type: Sequelize.ENUM('downloaded', 'executed', 'executed-order-created', 'all-downloaded')
                },
                order_id: {
                    allowNull: true,
                    type: Sequelize.STRING,
                    unique: true
                },
                order: {
                    allowNull:true,
                    type: Sequelize.JSONB,
                },
                execution_timestamp: {
                    allowNull: true,
                    type: Sequelize.INTEGER
                },
                creation_timestamp: {
                    allowNull: true,
                    type: Sequelize.INTEGER
                },
            },
            {
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
            await queryInterface.dropTable('strategy_instance_recovery_grid_orders', {transaction});
            await queryInterface.dropTable('strategy_instance_recovery_grids', {transaction});

            await queryInterface.sequelize.query(
                'DROP TYPE "enum_strategy_instance_recovery_grid_orders_status";',
                {transaction}
            );

            await queryInterface.sequelize.query(
                'DROP TYPE "enum_strategy_instance_recovery_grids_side";',
                {transaction}
            );
            /*
            queryInterface.sequelize.query(`
                DELETE 
                FROM
                    pg_enum
                WHERE
                    enumlabel = '...' AND
                    enumtypid = (
                        SELECT
                            oid
                        FROM
                            pg_type
                        WHERE
                            typname = 'enum_strategy_instance_recovery_grid_orders_status'
                    )
            `);
            */
        });

    }
}