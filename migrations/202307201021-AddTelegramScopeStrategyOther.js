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
            await queryInterface.sequelize.query("ALTER TYPE enum_telegram_chatids_scope ADD VALUE 'strategy-other'", {transaction});
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
            var query = "DELETE FROM pg_enum WHERE enumlabel = 'strategy-other' AND enumtypid = ( SELECT oid FROM pg_type WHERE typname = 'enum_telegram_chatids_scope')";
            await queryInterface.sequelize.query(query, {transaction});
        });

    }
}