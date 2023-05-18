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
            // Table exchange_markets
            await queryInterface.createTable('exchange_markets', {
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
                markets: {
                    allowNull: true,
                    type: Sequelize.JSON,
                },
                markets_updated_at: {
                    allowNull: true,
                    type: Sequelize.DATE
                },
                paper: {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                }
            },
            {
                uniqueKeys: {
                  unique_exchange_market: {
                      customIndex: true,
                      fields: ['exchange_id', 'account_type_id', 'paper']
                  }
                },
                transaction
            });

            let data = await Promise.all([
                queryInterface.sequelize.query("select id from exchanges where exchange_name = 'bitfinex2'", {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }),
                queryInterface.sequelize.query("select id from account_types where account_type = 'spot'", {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }),
                queryInterface.sequelize.query("select id from account_types where account_type = 'futures'", {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }),
            ]);

            let allMarkets = [
                {
                    exchange_id: data[0][0].id,
                    account_type_id: data[1][0].id,
                    paper: false,

                },
                {
                    exchange_id: data[0][0].id,
                    account_type_id: data[1][0].id,
                    paper: true,
                },
                {
                    exchange_id: data[0][0].id,
                    account_type_id: data[2][0].id,
                    paper: false,
                },
                {
                    exchange_id: data[0][0].id,
                    account_type_id: data[2][0].id,
                    paper: true,
                },
            ];

            for(var i=0; i < allMarkets.length; i++) {
                let market=allMarkets[i];
                // Insert markets for bitfinex paper/no-paper spot/futures 
                await queryInterface.sequelize.query('insert into exchange_markets (exchange_id, account_type_id, paper, "createdAt", "updatedAt") values (?,?,?,NOW(),NOW())',{
                    replacements: [
                        market.exchange_id,
                        market.account_type_id,
                        market.paper
                    ],
                    type: Sequelize.QueryTypes.INSERT,
                    transaction
                });
            }
            
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
            await queryInterface.dropTable('exchange_markets', {transaction});
        });

    }
}