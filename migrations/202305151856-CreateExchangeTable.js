'use strict'

const Sequelize = require("sequelize");

module.exports = {
    /**
     * 
     * @param {*} queryInterface 
     * @param {Sequelize} Sequelize 
     * @returns 
     */
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
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
            });

            await queryInterface.createTable('accounttypes', {
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
            });

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
                accounttype_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'accounttypes',
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
                }
            });

            await queryInterface.sequelize.query('insert into exchanges (id, "createdAt", "updatedAt", exchange_name, exchange_desc) values (?,NOW(),NOW(),?,?)',{
                replacements: [
                    '2259fc1a-5212-438e-aca9-a4f6cd0bc9dd',
                    'bitfinex2',
                    'Bitfinex'
                ],
                type: Sequelize.QueryTypes.INSERT,
            });
            
            await queryInterface.sequelize.query('insert into accounttypes ("createdAt", "updatedAt", account_type, account_type_name) values (NOW(),NOW(),?,?)',{
                replacements: [
                    'spot',
                    'spot'
                ],
                type: Sequelize.QueryTypes.INSERT,
            });
            await queryInterface.sequelize.query('insert into accounttypes ("createdAt", "updatedAt", account_type, account_type_name) values (NOW(),NOW(),?,?)',{
                replacements: [
                    'futures',
                    'futures'
                ],
                type: Sequelize.QueryTypes.INSERT,
            });
        });
    },
    
    down: (queryInterface, Sequelize) => {
        return Promise.allSettled([
            queryInterface.dropTable('accounts'),
            queryInterface.dropTable('accounttypes'),
            queryInterface.dropTable('exchanges')
        ]);
        ;
    }
}