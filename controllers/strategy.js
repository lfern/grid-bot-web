const models = require('../models');
const {validateStrategy, validateImportStrategy} = require('../validators/strategy');
const { isEmpty, isArray } = require('lodash');
let createError = require('http-errors');
const formidable = require('formidable');
const cache = require('memory-cache');
const crypto = require('crypto');
const CsvGridService = require('../services/CsvGridService');
const { exchangeInstanceFromAccount } = require('grid-bot/src/services/ExchangeMarket');

/** @typedef {import('../services/CsvGridService').ImportGrid} ImportGrid */
/** @typedef {import('../services/CsvGridService').GridCacheData} GridCacheData */

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
            return models.sequelize.transaction(async (transaction) => {
                let strategy = await models.Strategy.create({
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
                }, {
                    transaction
                });

                for(let i=1; i <= strategy.sell_orders + strategy.buy_orders + 1; i++) {
                    await models.StrategyQuantity.create({
                        strategy_id: strategy.id,
                        id_buy: i,
                        buy_order_qty: strategy.order_qty,
                        sell_order_qty: strategy.order_qty,
                    }, {
                        transaction
                    });
                }

            }).then(result => {
                res.redirect('/strategies');
            });
        }
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.import_strategy = function(req, res, next) {
    const form = new formidable.IncomingForm({});

    let errors = {};
    form.parse(req, function (err, fields, files) {
        if (err) {
            errors['file'] = err;
            return rerender_create(errors, req, res, next);
        }
        let f = {};
        Object.entries(fields).forEach(x => {
            f[x[0]] = Array.isArray(x[1]) ? x[1][0] : x[1];
        });

        return validateImportStrategy(errors, {body: f}, files).then(result => {
            if (!isEmpty(result.errors)) {
                rerender_create(result.errors, req, res, next)
            } else {
                let data = result.validatedData;

                let key = crypto.randomUUID();
                cache.put('import-'+key, {orig: data, current: null}, 15*60*1000);
                res.redirect('/strategies/import/' + key);
            }
        }).catch(ex => {
            return next(createError(500, ex));
        });
    });
}

exports.show_import = function(req, res, next) {
    /** @type {GridCacheData} */
    let data = cache.get('import-'+req.params.id);
    if (data == null) {
        return next(createError(404, "Import not found"));
    }

    cache.put('import-'+req.params.id, data, 60*60*1000);

    Promise.all([
        models.StrategyType.findOne({where:{id: data.orig.strategyType}}),
        models.Account.findOne({
            where:{id: data.orig.accountId},
            include:[models.Account.AccountType,models.Account.Exchange]
        })
    ]).then(result => {
        let strategyType = result[0];
        let account = result[1];
        if (strategyType == null) {
            return next(createError(404, 'StrategyType has been removed'));
        }

        if (account == null) {
            return next(creteError(404, 'Account has been removed'));
        }

        return exchangeInstanceFromAccount(account).then(
            exchange => {
                return new Promise((resolve, reject) => {
                    if (req.body.price != undefined && req.body.price != '') {
                        resolve(parseFloat(req.body.price));
                    } else {
                        exchange.fetchCurrentPrice(data.orig.symbol).then(price => {
                            if (price == null) {
                                reject(new Error("Could not get current price from exchange"));
                            }
                            resolve(price);
                        }).catch(ex => {
                            reject(ex);
                        });
                    }
                }).then (price => {
                    data.grid = CsvGridService.recalculateForPrice(data.orig, price, exchange);
                    cache.put('import-'+req.params.id, data, 60*60*1000);   
                    console.log(data.grid);         
                    res.render('strategy/show_import', {
                        title: 'Import',
                        grid: data.grid,
                        user: req.user,
                        layout: './layouts/grid2',
                        account: account,
                        id: req.params.id
                    });
                });
            }
        );
    
    }).catch(ex => {
        return next(createError(505, ex));
    })


}

exports.delete_strategy = function(req, res, next) {
    return models.StrategyQuantity.destroy({
        where:{
            strategy_id: req.params.strategy_id
        }
    }).then (result => {
        return models.Strategy.destroy({
            where:{
                id: req.params.strategy_id
            }
        });
    }).then(result => {
        res.redirect('/strategies');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_strategy_json = function(req, res, next) {
    return models.StrategyQuantity.destroy({
        where:{
            strategy_id: req.params.strategy_id
        }
    }).then (result => {
        return models.Strategy.destroy({
            where:{
            id: req.params.strategy_id
            }
        });
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        console.error(ex);
        res.status(500).send({error: ex.message});
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

exports.show_qties = function(req, res, next) {
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
            ],
        }),
        models.StrategyQuantity.findAll({
            where: { strategy_id: req.params.strategy_id},
            order: [['id_buy','ASC']]
        }),
    ]).then(result => {
        if (!result[0]) {
            return next(createError(404, "Page not found"));
        }

        res.render('strategy/quantities', {
            strategy: result[0],
            quantities: result[1],
            user: req.user,
        });
    }).catch(ex => {
        return next(createError(500, ex));
    });
    
}

exports.submit_update_qty = function(req, res, next) {
    return models.sequelize.transaction(async (transaction) => {
        let fields = Object.keys(req.body);
        for(let i=0; i < fields.length; i++) {
            if (fields[i].startsWith('qty-buy-')) {
                let id = parseInt(fields[i].replace('qty-buy-', ''));
                await models.StrategyQuantity.update({
                    buy_order_qty: req.body[fields[i]],
                }, {
                    where: {
                        strategy_id: req.params.strategy_id,
                        id_buy: id,    
                    },
                    transaction
                });
            } else if (fields[i].startsWith('qty-sell-')) {
                let id = parseInt(fields[i].replace('qty-sell-', ''));
                await models.StrategyQuantity.update({
                    sell_order_qty: req.body[fields[i]],
                }, {
                    where: {
                        strategy_id: req.params.strategy_id,
                        id_buy: id,    
                    },
                    transaction
                });
            }
        }

    }).then(result => {
        res.redirect('/strategy/'+req.params.strategy_id+'/quantities');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}
