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
            // Table exchanges
            await queryInterface.createTable('exchanges', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                exchange_name: {
                    allowNull: false,
                    type: Sequelize.STRING,
                    unique: true
                },
                exchange_desc: {
                    allowNull: false,
                    type: Sequelize.STRING,
                }
            }, {transaction});

            // Table account_types
            await queryInterface.createTable('account_types', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                account_type: {
                    allowNull: false,
                    type: Sequelize.STRING,
                    unique: true
                },
                account_type_name: {
                    allowNull: false,
                    type: Sequelize.STRING,
                }
            }, {transaction});

            // Table accounts
            await queryInterface.createTable('accounts', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                exchange_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'exchanges',
                        },
                        key: 'id'
                    }
                },
                account_type_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'account_types',
                        },
                        key: 'id'
                    }
                },
                account_name: {
                    allowNull: false,
                    type: Sequelize.STRING,
                    unique: true
                },
                api_key: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                api_secret: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                paper: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                enabled: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                valid: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                wallet_balance: {
                    allowNull: true,
                    type: Sequelize.JSONB,
                },
                wallet_balance_updated_at: {
                    allowNull: true,
                    type: Sequelize.DATE,
                },
                main_balance: {
                    allowNull: true,
                    type: Sequelize.JSONB,
                },
                main_balance_updated_at: {
                    allowNull: true,
                    type: Sequelize.DATE,
                }
            }, {transaction});

            // Insert bitfinex exchange
            await queryInterface.sequelize.query('insert into exchanges (id, "createdAt", "updatedAt", exchange_name, exchange_desc) values (?,NOW(),NOW(),?,?)',{
                replacements: [
                    '2259fc1a-5212-438e-aca9-a4f6cd0bc9dd',
                    'bitfinex2',
                    'Bitfinex'
                ],
                type: Sequelize.QueryTypes.INSERT,
                transaction
            });
            
            // Insert spot account type
            await queryInterface.sequelize.query('insert into account_types ("createdAt", "updatedAt", account_type, account_type_name) values (NOW(),NOW(),?,?)',{
                replacements: [
                    'spot',
                    'spot'
                ],
                type: Sequelize.QueryTypes.INSERT,
                transaction
            });

            // Insert futures account type
            await queryInterface.sequelize.query('insert into account_types ("createdAt", "updatedAt", account_type, account_type_name) values (NOW(),NOW(),?,?)',{
                replacements: [
                    'futures',
                    'futures'
                ],
                type: Sequelize.QueryTypes.INSERT,
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
            await queryInterface.dropTable('accounts', {transaction});
            await queryInterface.dropTable('account_types', {transaction});
            await queryInterface.dropTable('exchanges', {transaction});
        });

    }
}