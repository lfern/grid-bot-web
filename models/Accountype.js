'use strict';

const sequelize  = require("sequelize");

/**
 * 
 * @param {*} sequelize 
 * @param {sequelize.DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    var Accounttype = sequelize.define('Accounttype', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        account_type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        account_type_name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'accounttypes'
    });

    return Accounttype;
}