'use strict';

const sequelize  = require("sequelize");

/**
 * 
 * @param {*} sequelize 
 * @param {sequelize.DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    const Exchange = require('./Exchange')(sequelize, DataTypes);
    const Accounttype = require('./Accountype')(sequelize, DataTypes);

    var Account = sequelize.define('Account', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        exchange_id: {
            allowNull: false,
            type: DataTypes.UUID,
            references: {
                model: {
                    tableName: 'exchanges'
                },
                key: 'id'
            }
        },
        accounttype_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            references: {
                model: {
                    tableName: 'accounttypes'
                },
                key: 'id'
            }
        },
        account_name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        api_key: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        api_secret: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        paper: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        enabled: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        valid: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'accounts'
    });
 
    Account.Exchange = Account.belongsTo(Exchange, {
        as: 'exchange',
        foreignKey: 'exchange_id'
    });

    Account.Accounttype = Account.belongsTo(Accounttype, {
        as: 'accounttype',
        foreignKey: 'accounttype_id'
    });

    return Account;
}