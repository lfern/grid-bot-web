const models = require('../models');
const db = require('../models/index');
let createError = require('http-errors');
let {getExchangeMarketsDbData} = require('../utils/exchange');

exports.show_instance = function(req, res, next) {
    return models.StrategyInstance.findOne({
        where:{
            id: req.params.instance_id
        },
        include: [
            {
                association: models.StrategyInstance.Strategy,
                include: [ 
                    {
                        association: models.Strategy.Account,
                        include: [
                            models.Account.Exchange,
                            models.Account.AccountType
                        ]
                    },
                    models.Strategy.StrategyType
                ]
            },
        ]
    }).then(instance => {
        if (instance == null) {
            return next(createError(404, "Page does not exist"));
        }
        
        res.render('strategy_instance/instance', {
            instance: instance,
            user: req.user,
            layout: './layouts/grid'
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.get_instance_grid_json = function(req, res, next) {
    Promise.all([
        models.StrategyInstanceGrid.findAll({
            where: {strategy_instance_id: req.params.instance_id}
        }),
        models.StrategyInstance.findOne({
            where:{
                id: req.params.instance_id
            },
            include: [
                {
                    association: models.StrategyInstance.Strategy,
                    include: [ 
                        {
                            association: models.Strategy.Account,
                            include: [
                                models.Account.Exchange,
                                models.Account.AccountType
                            ]
                        },
                        models.Strategy.StrategyType
                    ]
                },
            ]
        })
    ]).then(result => {
        let gridData = result[0];
        let instance = result[1];
        if (instance == null) {
            return next(createError(404, "Instance not found"));
        }
        
        getExchangeMarketsDbData(
            instance.strategy.account.exchange.id,
            instance.strategy.account.account_type.id,
            instance.strategy.account.paper
        ).then(exchange => {
            if (exchange == null) {
                return next(createError(404, "Markets not found"));
            }

            let response = [];
            gridData.forEach(data => {
                response.push({
                    price: exchange.priceToPrecision2(instance.strategy.symbol, data.price),
                    buy_order_id: data.buy_order_id,
                    buy_order_qty: exchange.amountToPrecision2(instance.strategy.symbol, data.buy_order_qty),
                    buy_order_cost: exchange.priceToPrecision2(instance.strategy.symbol, data.buy_order_cost),
                    sell_order_id: data.sell_order_id,
                    sell_order_qty: exchange.amountToPrecision2(instance.strategy.symbol, data.sell_order_qty),
                    sell_order_cost: exchange.priceToPrecision2(instance.strategy.symbol, data.sell_order_cost),
                    position_before_order: data.position_before_order ? exchange.amountToPrecision2(instance.strategy.symbol, data.position_before_order): null,
                    order_qty: data.order_qty ? exchange.amountToPrecision2(instance.strategy.symbol, data.order_qty) : null,
                    side: data.side,
                    active: data.active,
                    exchange_order_id: data.exchange_order_id,
                });
            });
            res.json(response);
        }) 
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.get_instance_position_json = function(req, res, next) {
    return next(createError(500, "Not implemented"));
}

exports.get_instance_orders_json = function(req, res, next) {

    return Promise.all([
        models.StrategyInstanceOrder.findAll({
            where: {strategy_instance_id: req.params.instance_id}
        }),
        models.StrategyInstance.findOne({
            where:{
                id: req.params.instance_id
            },
            include: [
                {
                    association: models.StrategyInstance.Strategy,
                    include: [ 
                        {
                            association: models.Strategy.Account,
                            include: [
                                models.Account.Exchange,
                                models.Account.AccountType
                            ]
                        },
                        models.Strategy.StrategyType
                    ]
                },
            ]
        })
    ]).then(results => {
        let gridData = results[0];
        let response = [];
        let instance = results[1];
        if (instance == null) {
            return next(createError(404, "Instance not found"));
        }
        
        getExchangeMarketsDbData(
            instance.strategy.account.exchange.id,
            instance.strategy.account.account_type.id,
            instance.strategy.account.paper
        ).then(exchange => {
            if (exchange == null) {
                return next(createError(404, "Markets not found"));
            }
            gridData.forEach(data => {console.log(data.cost);
                response.push({
                    id: data.id,
                    exchange_order_id: data.exchange_order_id,
                    symbol: data.symbol,
                    order_type: data.order_type,
                    side: data.side,
                    timestamp: data.creation_timestamp,
                    datetime: data.creation_datetime,
                    status: data.status,
                    price: exchange.priceToPrecision2(instance.strategy.symbol, data.price),
                    amount: exchange.amountToPrecision2(instance.strategy.symbol, data.amount),
                    cost: data.cost ? exchange.priceToPrecision2(instance.strategy.symbol, data.cost):null,
                    average: data.average ? exchange.priceToPrecision2(instance.strategy.symbol, data.average):null,
                    filled: data.filled ? exchange.amountToPrecision2(instance.strategy.symbol, data.filled):null,
                    remaining: data.remaining ? exchange.amountToPrecision2(instance.strategy.symbol, data.remaining):null,
                });
            });
            res.json(response);
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.get_instance_trades_json = function(req, res, next) {
    return Promise.all([
        models.StrategyInstanceTrade.findAll({
            where: {'$strategy_instance_order.strategy_instance_id$': req.params.instance_id},
            include:[models.StrategyInstanceTrade.StrategyInstanceOrder]
        }),
        models.StrategyInstance.findOne({
            where:{
                id: req.params.instance_id
            },
            include: [
                {
                    association: models.StrategyInstance.Strategy,
                    include: [ 
                        {
                            association: models.Strategy.Account,
                            include: [
                                models.Account.Exchange,
                                models.Account.AccountType
                            ]
                        },
                        models.Strategy.StrategyType
                    ]
                },
            ]
        })
    ]).then(results => {
        let gridData = results[0];
        let instance = results[1];
        if (instance == null) {
            return next(createError(404, "Instance not found"));
        }
        
        getExchangeMarketsDbData(
            instance.strategy.account.exchange.id,
            instance.strategy.account.account_type.id,
            instance.strategy.account.paper
        ).then(exchange => {
            if (exchange == null) {
                return next(createError(404, "Markets not found"));
            }

            let response = [];
            gridData.forEach(data => {
                response.push({
                    exchange_order_id: data.strategy_instance_order.exchange_order_id,
                    exchange_trade_id: data.exchange_trade_id,
                    timestamp: data.timestamp,
                    datetime: data.datetime,
                    side: data.strategy_instance_order.side,
                    price: exchange.priceToPrecision2(instance.strategy.symbol, data.price),
                    amount: data.amount ? exchange.amountToPrecision2(instance.strategy.symbol, data.amount):null,
                    cost: data.cost ? exchange.priceToPrecision2(instance.strategy.symbol, data.cost):null,
                    fee_cost: data.fee_cost?exchange.priceToPrecision2(instance.strategy.symbol, data.fee_cost):null,
                    fee_coin: data.fee_coin,
                });
            });
            res.json(response);
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.get_instance_events_json = function(req, res, next) {
    return models.StrategyInstanceEvent.findAll({
        where: {'strategy_instance_id': req.params.instance_id},
    }).then(events => {
        let response = [];
        events.forEach(event => {
            response.push({
                id: event.id,
                datetime: event.createdAt.toISOString(),
                event: event.event,
                message: event.message,
                params: event.params,
            });
        });
        res.json(response);
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.stop_instance = function(req, res, next) {
    return models.StrategyInstance.update({
        stop_requested_at: db.sequelize.fn('NOW')
    }, {
        where: {
            id: req.params.instance_id,
            running: true,
            stop_requested_at: null
        }
    }).then(result => {
        res.redirect('/strategy-instance/'+req.params.instance_id);
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

let removeInstance = function(instanceId) {
    // Todo add delete flag to do async removal
    return db.sequelize.transaction(async (transaction) => {
        let toBeDeleted = await models.StrategyInstanceOrder.findAll({
            attributes:['id'],
            where: {strategy_instance_id: instanceId},
            transaction
        });

        if (toBeDeleted.length > 0) {
            await models.StrategyInstanceTrade.destroy({
                where:{strategy_instance_order_id:toBeDeleted.map(function(d){ return d.id})},
                transaction
            });
        }

        await models.StrategyInstanceOrder.destroy({
            where: {strategy_instance_id: instanceId},
            transaction
        });


        await models.StrategyInstanceEvent.destroy({
            where: {strategy_instance_id: instanceId},
            transaction
        });

        await models.StrategyInstanceRecoveryGridOrder.destroy({
            where: {strategy_instance_id: instanceId},
            transaction
        });

        toBeDeleted = await models.StrategyInstanceGrid.findAll({
            attributes:['id'],
            where: {strategy_instance_id: instanceId},
            transaction
        });

        await models.StrategyInstanceRecoveryGrid.destroy({
            where:{strategy_instance_grid_id:toBeDeleted.map(function(d){ return d.id})},
            transaction
        });

        await models.StrategyInstanceGrid.destroy({
            where: {strategy_instance_id: instanceId},
            transaction
        });

        await models.StrategyInstance.destroy({
            where: {id: instanceId},
            transaction
        });
    });
}

exports.delete_instance = function(req, res, next) {
    return removeInstance(req.params.instance_id).then(result => {
        res.redirect('/strategies');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_instance_json = function(req, res, next) {
    return removeInstance(req.params.instance_id).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        return next(createError(500, ex));
    });
}
