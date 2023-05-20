const models = require('../models');
let createError = require('http-errors');

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
            next(createError(404, "Page does not exist"));            
        }
        
        res.render('strategy_instance/instance', {
            instance: instance,
            user: req.user,
            layout: './layouts/grid'
        })
    });
}

exports.get_instance_grid_json = function(req, res, next) {
    return models.StrategyInstanceGrid.findAll({
        where: {strategy_instance_id: req.params.instance_id}
    }).then(gridData => {
        let response = [];
        gridData.forEach(data => {
            response.push({
                price: data.price,
                buy_order_id: data.buy_order_id,
                buy_order_qty: data.buy_order_qty,
                buy_order_cost: data.buy_order_cost,
                sell_order_id: data.sell_order_id,
                sell_order_qty: data.sell_order_qty,
                sell_order_cost: data.sell_order_cost,
                position_before_order: data.position_before_order,
                order_qty: data.order_qty,
                side: data.side,
                active: data.active,
                exchange_order_id: data.exchange_order_id,
            });
        });
        res.json(response);
    })
}

exports.get_instance_position_json = function(req, res, next) {
    next(createError(500, "Not implemented"));
}

exports.get_instance_events_json = function(req, res, next) {
    next(createError(500, "Not implemented"));
}

exports.get_instance_orders_json = function(req, res, next) {
    return models.StrategyInstanceOrder.findAll({
        where: {strategy_instance_id: req.params.instance_id}
    }).then(gridData => {
        let response = [];
        gridData.forEach(data => {
            response.push({
                exchange_order_id: data.exchange_order_id,
                symbol: data.symbol,
                order_type: data.order_type,
                side: data.side,
                timestamp: data.timestamp,
                datetime: data.datetime,
                status: data.status,
                price: data.price,
                amount: data.amount,
                cost: data.cost,
                average: data.average,
                filled: data.filled,
                remaining: data.remaining,
            });
        });
        res.json(response);
    })
}

exports.get_instance_trades_json = function(req, res, next) {
    return models.StrategyInstanceTrade.findAll({
        where: {'$strategy_instance_order.strategy_instance_id$': req.params.instance_id},
        include:[models.StrategyInstanceTrade.StrategyInstanceOrder]
    }).then(gridData => {
        let response = [];
        gridData.forEach(data => {
            response.push({
                exchange_order_id: data.strategy_instance_order_id.exchange_order_id,
                exchange_trade_id: data.exchange_trade_id,
                timestamp: data.timestamp,
                datetime: data.datetime,
                price: data.price,
                amount: data.amount,
                cost: data.cost,
                fee_cost: data.fee_cost,
                fee_coin: data.fee_coin,
            });
        });
        res.json(response);
    })
}