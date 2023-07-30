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
            let spot = await queryInterface.sequelize.query("select id from account_types where account_type = 'spot'", {
                type: Sequelize.QueryTypes.SELECT,
                transaction
            });

            let future = await queryInterface.sequelize.query("select id from account_types where account_type = 'future'", {
                type: Sequelize.QueryTypes.SELECT,
                transaction
            });

            let deribitUuid = 'd3ce862f-5ba5-42ca-a27b-30894cc091e9';
            // Insert deribit exchange
            await queryInterface.sequelize.query('insert into exchanges (id, "createdAt", "updatedAt", exchange_name, exchange_desc) values (?,NOW(),NOW(),?,?)',{
                replacements: [
                    deribitUuid,
                    'deribit',
                    'Deribit'
                ],
                type: Sequelize.QueryTypes.INSERT,
                transaction
            });
            
            let allMarkets = [
                {
                    exchange_id: deribitUuid,
                    account_type_id: spot[0].id,
                    paper: false,

                },
                {
                    exchange_id: deribitUuid,
                    account_type_id: spot[0].id,
                    paper: true,
                },
                {
                    exchange_id: deribitUuid,
                    account_type_id: future[0].id,
                    paper: false,
                },
                {
                    exchange_id: deribitUuid,
                    account_type_id: future[0].id,
                    paper: true,
                },
            ];

            for(var i=0; i < allMarkets.length; i++) {
                let market=allMarkets[i];
                // Insert markets for deribit paper/no-paper spot/futures 
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
        });

    }
}