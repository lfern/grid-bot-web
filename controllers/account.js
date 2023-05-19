const models = require('../models');
const {validateAccount} = require('../validators/account');
const { isEmpty } = require('lodash');
let createError = require('http-errors');

exports.show_accounts = function(req, res, next) {
    return models.Account.findAll({
        include: [models.Account.Exchange, models.Account.AccountType]
    }).then(accounts => {
        res.render('account/accounts', {
            title: 'Accounts',
            accounts: accounts,
            user: req.user,
        });
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
    })
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
    })
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
    });
}

exports.delete_account = function(req, res, next) {
    return models.Account.destroy({
        where:{
            id: req.params.account_id
        }
    }).then(result => {
        res.redirect('/accounts');
    });
}

exports.delete_account_json = function(req, res, next) {
    return models.Account.destroy({
        where:{
            id: req.params.account_id
        }
    }).then(result => {
        res.send({msg: "Success"});
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
            next(createError(404, "Page does not exist"));            
        }
        res.render('account/account', {
            account: account,
            user: req.user,
        })
    });
}

