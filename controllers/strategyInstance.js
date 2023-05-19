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
    next(createError(500, "Not implemented"));
}

exports.get_instance_position_json = function(req, res, next) {
    next(createError(500, "Not implemented"));
}

exports.get_instance_events_json = function(req, res, next) {
    next(createError(500, "Not implemented"));
}

exports.get_instance_orders_json = function(req, res, next) {
    next(createError(500, "Not implemented"));
}

exports.get_instance_trades_json = function(req, res, next) {
    next(createError(500, "Not implemented"));
}