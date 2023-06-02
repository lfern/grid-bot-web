const models = require('../models');
let createError = require('http-errors');
const {getExchangeMarkets} = require('../utils/exchange');

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
    }).catch(ex => {
        return next(createError(500, ex));
    });
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
    }).catch(ex => {
        return next(createError(500, ex));
    });
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
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

const getMarketsJson = function(req, res, next, exchangeId, accountTypeId, paper) {

    getExchangeMarkets(exchangeId, accountTypeId, paper).then(exchange => {
        if (exchange == null) {
            return next(createError(404, "Not found"));
        }
        res.json(exchange.markets);

    }).catch(ex => {
        return next(createError(500, ex));
    });
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
            return next(createError(404, "Not found"));
        }
        
        getMarketsJson(req, res, next, account.exchange_id, account.account_type_id, account.paper);
        
    }).catch(ex => {
        return next(createError(500, ex));
    });

}
