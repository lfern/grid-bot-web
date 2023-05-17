'use strict';

const sequelize  = require("sequelize");

/**
 * 
 * @param {*} sequelize 
 * @param {sequelize.DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    var Exchange = sequelize.define('Exchange', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        exchange_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        exchange_desc: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'exchanges'
    });

    return Exchange;
}