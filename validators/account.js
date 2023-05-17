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
        console.log(req.body);
        validateCreateAccountFields(errors, req);
        return models.Exchange.findOne({
            where: {
                id: req.body.exchange
            }
        }).then( u => {
            if (u === null) {
                errors["exchange"] = "Exchange is not valid now.";
            }

            return models.Accounttype.findOne({
                where: {
                    id: req.body.accounttype
                }
            });
        }).then ( u => {
            if (u === null) {
                errors["accounttype"] = "Account type is not valid.";
            }
 
            resolve(errors);
        });
    });
    
}