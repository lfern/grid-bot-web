const models = require('../models');
const ccxt = require('ccxt');
const _ = require('lodash');
const sequelize = require('sequelize');
let createError = require('http-errors');

exports.get_exchanges_json = function(req, res, next) {
    models.Exchange.findAll().then(exchanges => {
        let response = [];
        exchanges.forEach(e => {
            response.push({
                id: e.id,
                name: e.exchange_name,
            });
        });
        res.json(response);
    })
}

exports.get_account_types_json = function(req, res, next) {
    models.ExchangeMarket.findAll({
        where: {
            exchange_id: req.params.exchange_id,
        },
        include: [
            models.ExchangeMarket.AccountType
        ]
    }).then(exchangeMarkets => {
        let response = [];
        exchangeMarkets.forEach(m => {
            response.push({
                id: m.account_type.id,
                type: m.account_type.account_type,
                paper: m.paper
            });
        });
        res.json(response);
    })
}

exports.get_accounts_json = function(req, res, next) {
    models.Account.findAll({
        where: {
            exchange_id: req.params.exchange_id,
        },
        include: [
            models.Account.AccountType,
            models.Account.Exchange
        ]
    }).then(accounts => {
        let response = [];
        accounts.forEach(acc => {
            response.push({
                id: acc.id,
                type: acc.account_type.account_type_name,
                type_id: acc.account_type.id,
                type_name: acc.account_type.account_type_name,
                name: acc.account_name,
                paper: acc.paper,
                exchange: acc.exchange.exchange_name,
                valid: acc.valid
            });
        });
        res.json(response);
    })
}

const getMarketsJson = function(req, res, next, exchangeId, accountTypeId, paper) {
    models.ExchangeMarket.findOne({
        where: {
            exchange_id: exchangeId,
            account_type_id: accountTypeId,
            paper: paper
        },
        include: [
            models.ExchangeMarket.AccountType,
            models.ExchangeMarket.Exchange
        ]
    }).then(exchangeMarket => {
        if (exchangeMarket == null) {
            next(createError(404, "Not found"));
        } else {
            if (exchangeMarket.markets == null ||
                exchangeMarket.markets_updated_at == null ||
                ((new Date().getTime() - exchangeMarket.markets_updated_at.getTime()) > 3600 * 1000)) {
                let exchangeName = exchangeMarket.exchange.exchange_name;
                if (!ccxt.hasOwnProperty(exchangeName)) {
                    next(createError(500, "Ccxt Exchange not valid "+exchangeName));
                }
                let ccxtExchange = new ccxt[exchangeName]({
                    verbose: true,
                });
                
                ccxtExchange.loadMarkets().then(markets => {
                    var filtered = _.pickBy(markets, function(market) {
                        return market.type == exchangeMarket.account_type.account_type_name;
                    });

                    exchangeMarket.markets = filtered;
                    exchangeMarket.markets_updated_at = sequelize.fn('NOW');
                    exchangeMarket.save().then(x => {

                        res.json(filtered);
                    }).catch(err => {
                        next(createError(500, err));
                    });

                }).catch(err => {
                    next(createError(500, err));
                })

            } else {
                res.json(exchangeMarket.markets);
            }
        }
    })
}

exports.get_markets_json = function(req, res, next) {
    getMarketsJson(req, res, next, req.params.exchange_id, req.params.account_type_id, false);
}

exports.get_markets_json_paper = function(req, res, next) {
    getMarketsJson(req, res, next, req.params.exchange_id, req.params.account_type_id, true);
}

exports.get_markets_account_json = function(req, res, next) {
    models.Account.findOne({where: {id: req.params.account_id}}).then(account => {
        if (!account) {
            next(createError(404, "Not found"));
        } else {
            getMarketsJson(req, res, next, account.exchange_id, account.account_type_id, account.paper);
        }
    });

}
