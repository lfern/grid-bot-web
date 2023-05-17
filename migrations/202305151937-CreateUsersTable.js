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
        return queryInterface.createTable('Users', {
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
            username: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            firstname: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            lastname: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
    
        });
    },
    
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Users');
    }
}