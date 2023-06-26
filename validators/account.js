let models = require('../models');
let validator = require('validator');

const validateCreateAccountFields = function(errors, req){
    if (validator.isEmpty(req.body.name)){
        errors["name"] = "Please provide a valid name.";
    }
    if (validator.isEmpty(req.body.apikey)){
        errors["apikey"] = "Please provide a valid apikey.";
    }
    if (validator.isEmpty(req.body.secret)){
        errors["secret"] = "Please provide a valid secret.";
    }
}

exports.validateAccount = function(errors, req) {
    return new Promise(function(resolve, reject){
        validateCreateAccountFields(errors, req);
        Promise.all([
            models.Exchange.findOne({
                where: {
                    id: req.body.exchange
                }
            }),
            models.ExchangeMarket.findOne({where: {
                exchange_id: req.body.exchange,
                account_type_id: req.body.account_type,
                paper: req.body.paper !== undefined
            }}),
        ]).then(result => {
            let exchange = result[0];
            let accountType = result[1];
            if (exchange === null) {
                errors["exchange"] = "Exchange is not valid now.";
            }

            if (accountType === null) {
                errors["account_type"] = "Account type is not valid.";
            }

            resolve(errors);
        });
    });
    
}

const validateCreateAddressFields = function(errors, req){
    if (validator.isEmpty(req.body.address)){
        errors["address"] = "Please provide a valid address.";
    }
}

exports.validateAddress = function(errors, req) {
    return new Promise(function(resolve, reject){
        validateCreateAddressFields(errors, req);
        return models.Account.findOne({
            where: {
                id: req.params.account_id
            }
        }).then( u => {
            if (u === null) {
                errors["account"] = "Account does not longer exists.";
            }
            resolve(errors);
        });
    });
    
}