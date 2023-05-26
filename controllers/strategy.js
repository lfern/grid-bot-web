const models = require('../models');
const {validateStrategy} = require('../validators/strategy');
const { isEmpty } = require('lodash');
let createError = require('http-errors');


exports.show_strategies = function(req, res, next) {
    return models.Strategy.findAll({
        include: [
            models.Strategy.StrategyType, {
                association: models.Strategy.Account,
                include: [
                    models.Account.AccountType,
                    models.Account.Exchange
                ]
            },
        ]
    }).then(strategies => {
        res.render('strategy/strategies', {
            title: 'Strategies',
            strategies: strategies,
            user: req.user,
        });
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_create = function(req, res, next) {
    return models.StrategyType.findAll().then(results => {
        res.render('strategy/create', {
            formData: req.body,
            title: 'Add strategy',
            strategy_types: results,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });;
}

const rerender_create = function(errors, req, res, next) {
    return models.StrategyType.findAll().then(results => {
        res.render('strategy/create', {
            formData: req.body,
            title: 'Add strategy',
            strategy_types: results,
            user: req.user,
            errors: errors,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });;
}


exports.submit_strategy = function(req, res, next) {
    let errors = {};
    return validateStrategy(errors, req).then(errors =>{
        if (!isEmpty(errors)){
            rerender_create(errors, req, res, next);
        } else {
            return models.Strategy.create({
                strategy_type_id: req.body.strategy_type,
                strategy_name: req.body.name,
                account_id: req.body.account,
                symbol: req.body.symbol,
                initial_position: req.body.initial_position,
                order_qty: req.body.order_qty,
                buy_orders: req.body.buy_orders,
                sell_orders: req.body.sell_orders,
                active_buys: req.body.active_buys,
                active_sells: req.body.active_sells,
                step: req.body.step,
                step_type: req.body.step_type
            }).then(result => {
                res.redirect('/strategies');
            });
        }
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_strategy = function(req, res, next) {
    return models.Strategy.destroy({
        where:{
            id: req.params.strategy_id
        }
    }).then(result => {
        res.redirect('/strategies');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_strategy_json = function(req, res, next) {
    return models.Strategy.destroy({
        where:{
            id: req.params.strategy_id
        }
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_strategy = function(req, res, next) {
    return models.Strategy.findOne({
        where:{
            id: req.params.strategy_id
        },
        include: [
            models.Strategy.StrategyType, {
                association: models.Strategy.Account,
                include: [
                    models.Account.AccountType,
                    models.Account.Exchange
                ]
            },
        ]
    }).then(strategy => {
        if (strategy == null) {
            return next(createError(404, "Page does not exist"));
        }
        res.render('strategy/strategy', {
            strategy: strategy,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_strategy_instances = function(req, res, next) {
    return Promise.all([
        models.Strategy.findOne({
            where: {id: req.params.strategy_id},
            include: [
                models.Strategy.StrategyType, {
                    association: models.Strategy.Account,
                    include: [
                        models.Account.AccountType,
                        models.Account.Exchange
                    ]
                },
            ]
        }),
        models.StrategyInstance.findAll({
            where: { strategy_id: req.params.strategy_id}
        }),
    ]).then(result => {
        if (!result[0]) {
            return next(createError(404, "Page not found"));
        }

        res.render('strategy/instances', {
            strategy: result[0],
            instances: result[1],
            user: req.user,
        });
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.submit_instance = function(req, res, next) {
    models.StrategyInstance.create({
        strategy_id: req.params.strategy_id,
        running: true
    }).then(result => {
        res.redirect('/strategy-instance/'+result.id);
    }).catch(ex => {
        return next(createError(500, ex));
    });
}