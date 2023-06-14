const models = require('../models');
const {validateAccount, validateAddress} = require('../validators/account');
const { isEmpty } = require('lodash');
let createError = require('http-errors');
const {getExchange, getExchangeMarkets} = require('../utils/exchange');
const { BaseExchange } = require('grid-bot/src/crypto/exchanges/BaseExchange');

exports.show_accounts = function(req, res, next) {
    return models.Account.findAll({
        include: [models.Account.Exchange, models.Account.AccountType]
    }).then(accounts => {
        res.render('account/accounts', {
            title: 'Accounts',
            accounts: accounts,
            user: req.user,
        });
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_create = function(req, res, next) {
    return models.Exchange.findAll().then(exchanges => {
        return models.AccountType.findAll().then(account_types => {
            return {exchanges, account_types};
        })
    }).then (result => {
        res.render('account/create', {
            formData: req.body,
            title: 'Add account',
            exchanges: result.exchanges,
            account_types: result.account_types,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

const rerender_create = function(errors, req, res, next) {
    return models.Exchange.findAll().then(exchanges => {
        return models.AccountType.findAll().then(account_types => {
            return {exchanges, account_types};
        })
    }).then (result => {
        res.render('account/create', {
            formData: req.body,
            title: 'Add account',
            exchanges: result.exchanges,
            account_types: result.account_types,
            errors: errors,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}


exports.submit_account = function(req, res, next) {
    let errors = {};
    return validateAccount(errors, req).then(errors =>{
        if (!isEmpty(errors)){
            rerender_create(errors, req, res, next);
        } else {
            return models.Account.create({
                api_key: req.body.apikey,
                api_secret: req.body.secret,
                paper: req.body.paper !== undefined ? true : false,
                valid: true,
                exchange_id: req.body.exchange,
                account_type_id: req.body.account_type,
                account_name: req.body.name
            }).then(result => {
                res.redirect('/accounts');
            });
        }
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_account = function(req, res, next) {
    return models.sequelize.transaction(async (transaction) => {
        await models.AccountPendingOrder.destroy({
            where: {account_id: req.params.account_id}
        });

        await models.AccountPendingTrade.destroy({
            where: {account_id: req.params.account_id}
        });

        await models.AccountAddress.destroy({
            where: {account_id: req.params.account_id}
        });

        await models.Account.destroy({
            where:{id: req.params.account_id}
        });
    }).then(result => {
        res.redirect('/accounts');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_account_json = function(req, res, next) {
    return models.sequelize.transaction(async (transaction) => {
        await models.AccountPendingOrder.destroy({
            where: {account_id: req.params.account_id}
        });

        await models.AccountPendingTrade.destroy({
            where: {account_id: req.params.account_id}
        });

        await models.AccountAddress.destroy({
            where: {account_id: req.params.account_id}
        });

        await models.Account.destroy({
            where:{id: req.params.account_id}
        });
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_account = function(req, res, next) {
    return models.Account.findOne({
        where:{
            id: req.params.account_id
        },
        include: [models.Account.Exchange, models.Account.AccountType]
    }).then(account => {
        if (account == null) {
            return next(createError(404, "Page does not exist"));    
        }

        return getExchangeMarkets(
            account.exchange.exchange_name,
            account.account_type.account_type,
            account.paper,
        ).then(/** @param {BaseExchange} exchange */ exchange => {
            if (exchange == null) {
                res.status(404).send({ error: "Exchange does not exist" });
                return next(new Error("Exchange does not exist"))
            }
    
            res.render('account/account', {
                account: account,
                user: req.user,
                wallets: exchange.getWalletNames(),
                currencies: exchange.currencies
            })
        });
        
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_addresses = function(req, res, next) {
    Promise.all([
        models.Account.findOne({
            where:{
                id: req.params.account_id
            },
            include: [models.Account.Exchange, models.Account.AccountType]
        }),
        models.AccountAddress.findAll({
            where:{
                account_id: req.params.account_id
            }
        })
    ]).then(result => {
        let account = result[0];
        let addresses = result[1];
        if (account == null) {
            return next(createError(404, "Account does not exist"));    
        }
        res.render('account/addresses', {
            account: account,
            addresses: addresses,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}
const rerender_create_address = function(errors, req, res, next) {
    models.Account.findOne({where:{id: req.params.account_id}})
        .then(account => {
            if (account == null) {
                return next(createError(404, "Account does not exist"))
            }
            res.render('account/address/create', {
                account, user: req.user, errors, formData: req.body
            })
        }).catch(ex => {
            return next(createError(500, ex));
        });
}
exports.show_create_address = function(req, res, next) {
    rerender_create_address([], req, res, next);
}

exports.submit_address = function(req, res, next) {
    let errors = {};
    return validateAddress(errors, req).then(errors =>{
        if (!isEmpty(errors)){
            rerender_addresses(errors, req, res, next);
        } else {
            return models.AccountAddress.create({
                account_id: req.params.account_id,
                address: req.body.address,
                confidential: false,
            }).then(result => {res.redirect('/account/'+req.params.account_id+'/addresses')});
        }
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_address_json = function(req, res, next) {
    return models.AccountAddress.destroy({
        where:{
            id: req.params.account_address_id
        }
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.get_balances_json = function(req, res, next) {
    return models.Account.findOne({where: {id: req.params.account_id}})
    .then(account => {
        if (account == null) {
            return next(createError(404, "Account does not exist"));
        }

        res.send({
            walletBalance: account.wallet_balance,
            walletBalanceUpdatedAt: account.wallet_balance_updated_at ? account.wallet_balance_updated_at.toISOString() : null,
            mainBalance: account.main_balance,
            mainBalanceUpdatedAt: account.main_balance_updated_at ? account.main_balance_updated_at.toISOString() : null,
        });
    }).catch (ex => {
        return next(createError, 500, ex);
    })
}

exports.transfer_json = async function(req, res, next) {
    try {
        let account = await models.Account.findOne({
            where:{
                id: req.params.account_id
            },
            include: [models.Account.Exchange, models.Account.AccountType]
        });

        if (account == null) {
            res.status(404).send({ error: "Account does not exist" });
            return next(new Error("Account does not exist"))
        }
        let exchange = await getExchangeMarkets(
            account.exchange.exchange_name,
            account.account_type.account_type,
            account.paper,
            account.api_key,
            account.api_secret
        );

        // exchange.loadMarkets(true);
        
        if (exchange == null) {
            res.status(404).send({ error: "Exchange does not exist" });
            return next(new Error("Exchange does not exist"))
        }
        await exchange.transfer(
                req.body.coin,
                req.body.amount,
                req.body.from_wallet,
                req.body.to_wallet
        );

        res.send({msg: "Success"});
    } catch (ex) {
        res.status(500).send({ error: ex.message });
        return next(ex);
    }
}