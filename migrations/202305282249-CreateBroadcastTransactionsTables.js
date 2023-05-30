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
            // Table account addresses
            await queryInterface.createTable('account_addresses', {
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
                address: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                confidential: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
            },
            {
                transaction
            });

            // Table broadcast transactions
            await queryInterface.createTable('broadcast_transactions', {
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
                transaction_raw: {
                    allowNull: false,
                    type: Sequelize.STRING(65535),
                },
                transaction_hash: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                txid: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                transaction: {
                    allowNull: true,
                    type: Sequelize.JSONB,
                },
                status: {
                    allowNull: false,
                    type: Sequelize.ENUM('created', 'pending', 'sent', 'confirmed', 'error'),
                    defaultValue: 'created'
                },
                error: {
                    allowNull: true,
                    type: Sequelize.STRING(4096),
                },
                fee: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15),
                },
                sent_at: {
                    allowNull: true,
                    type: Sequelize.DATE
                },
                valid: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
                send_requested_at: {
                    allowNull: true,
                    type: Sequelize.DATE
                },
                request_status_count: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                }
            },
            {
                transaction
            });

            await queryInterface.addIndex(
                'broadcast_transactions',
                 ['status'],
                { transaction }
            );

            // Table broadcast transactions addresses
            await queryInterface.createTable('broadcast_addresses', {
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
                broadcast_transaction_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'broadcast_transactions'
                        },
                        key: 'id'
                    }
                },
                address: {
                    allowNull: false,
                    type: Sequelize.STRING,
                }
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
            await queryInterface.dropTable('broadcast_addresses', {transaction});
            await queryInterface.removeIndex(
                'broadcast_transactions',
                 ['status'],
                { transaction }
            );
            await queryInterface.dropTable('broadcast_transactions', {transaction});
            await queryInterface.dropTable('account_addresses', {transaction});
        });

    }
}