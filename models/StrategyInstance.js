'use strict';

const StrategyModel = require('./Strategy');

/** @typedef {import('sequelize').Sequelize} Sequelize */
/** @typedef {import('sequelize').DataTypes} DataTypes */

/**
 * 
 * @param {Sequelize} sequelize 
 * @param {DataTypes} DataTypes 
 */
module.exports = (sequelize, DataTypes) => {
    const Strategy = StrategyModel(sequelize, DataTypes);

    var StrategyInstance = sequelize.define('StrategyInstance', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        strategy_id: {
            allowNull: false,
            type: DataTypes.UUID,
            references: {
                model: {
                    tableName: 'strategies'
                },
                key: 'id'
            }
        },
        running: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        tableName: 'strategy_instances'
    });
 
    StrategyInstance.Strategy = StrategyInstance.belongsTo(Strategy, {
        as: 'strategy',
        foreignKey: 'strategy_id'
    });

    return StrategyInstance;
}
