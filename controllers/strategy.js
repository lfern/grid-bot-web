const models = require('../models');
//const {validateStrategy} = require('../validators/strategy');
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
    });
}

exports.show_create = function(req, res, next) {

    return Promise.all([
        models.Account.findAll({
            include: [
                models.Account.Exchange,
                models.Account.AccountType
            ]
        }),
        models.StrategyType.findAll()
    ]).then(results => {
        res.render('strategy/create', {
            formData: req.body,
            title: 'Add strategy',
            accounts: results[0],
            strategy_types: results[1],
            user: req.user,
        })
    });
}