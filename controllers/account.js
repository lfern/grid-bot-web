const models = require('../models');
const {validateAccount} = require('../validators/account');
const { isEmpty } = require('lodash');
let createError = require('http-errors');


exports.show_accounts = function(req, res, next) {
    return models.Account.findAll({
        include: [models.Account.Exchange, models.Account.Accounttype]
    }).then(accounts => {
        res.render('account/accounts', {title: 'Accounts', accounts: accounts});
    });
}

exports.show_create = function(req, res, next) {
    return models.Exchange.findAll().then(exchanges => {
        return models.Accounttype.findAll().then(accounttypes => {
            return {exchanges, accounttypes};
        })
    }).then (result => {
        res.render('account/create', {
            formData: req.body,
            title: 'Add account',
            exchanges: result.exchanges,
            accounttypes: result.accounttypes
        })
    })
}

const rerender_create = function(errors, req, res, next) {
    return models.Exchange.findAll().then(exchanges => {
        return models.Accounttype.findAll().then(accounttypes => {
            return {exchanges, accounttypes};
        })
    }).then (result => {
        res.render('account/create', {
            formData: req.body,
            title: 'Add account',
            exchanges: result.exchanges,
            accounttypes: result.accounttypes,
            errors: errors
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
                paper: typeof req.body.paper !== undefined ? true : false,
                valid: true,
                exchange_id: req.body.exchange,
                accounttype_id: req.body.accounttype,
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
        include: [models.Account.Exchange, models.Account.Accounttype]
    }).then(account => {
        if (account == null) {
            next(createError(404, "Page does not exist"));            
        }
        res.render('account/account', {account: account})
    });
}






exports.show_edit_account = function(req, res, next) {
    return models.Lead.findOne({
        where:{
            id: req.params.lead_id
        }
    }).then(lead => {
        res.render('lead/edit_lead', {lead: lead})
    });
}

exports.edit_account = function(req, res, next) {
    return models.Lead.update({
        email: req.body.lead_email
    },{
        where:{
            id: req.params.lead_id
        }
    }).then(result => {
        res.redirect('/lead/' + req.params.lead_id);
    });
}

