let models = require('../models');
let validator = require('validator');

const validateCreateTelegramFields = function(errors, req){
    if (validator.isEmpty(req.body.chat_id)){
        errors["chat_id"] = "Please provide a valid chat id.";
    }
    if (validator.isEmpty(req.body.description)){
        errors["description"] = "Please provide a valid description.";
    }
    if (!validator.isInt(req.body.level, {
        min: 0,
        max: 3
    })) {
        errors['level'] = "Please provide a valid level";
    }
}

exports.validateTelegram = function(errors, req) {
    return new Promise(function(resolve, reject){
        validateCreateTelegramFields(errors, req);
        resolve(errors);
    });
    
}
