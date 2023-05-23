let models = require('../models');
let validator = require('validator');

const validateCreateStrategyFields = function(errors, req){
    if (validator.isEmpty(req.body.strategy_type)){
        errors["strategy_type"] = "Please provide a valid strategy type.";
    }

    if (validator.isEmpty(req.body.name)){
        errors["name"] = "Please provide a valid name.";
    }

    if (!req.body.account || validator.isEmpty(req.body.account)){
        errors["account"] = "Please provide a valid account.";
    }

    if (!req.body.symbol || validator.isEmpty(req.body.symbol)){
        errors["symbol"] = "Please provide a valid symbol.";
    }

    if (!validator.isFloat(req.body.initial_position)){
        errors["initial_position"] = "Please provide a valid initial position.";
    }

    if (!validator.isFloat(req.body.order_qty, {
        gt: 0
    })) {
        errors["order_qty"] = "Please provide a valid order qty (>0).";
    }

    if (!validator.isInt(req.body.buy_orders, {
        min: 1
    })){
        errors["buy_orders"] = "Please provide a valid buy orders (min 1).";
    }

    if (!validator.isInt(req.body.sell_orders, {
        min: 1
    })){
        errors["sell_orders"] = "Please provide a valid sell orders (min 1).";
    }

    if (!validator.isInt(req.body.active_buys, {
        min: 1
    })){
        errors["active_buys"] = "Please provide a valid active buys (min 1).";
    }

    if (!validator.isInt(req.body.active_sells, {
        min: 1
    })){
        errors["active_sells"] = "Please provide a valid active sells (min 1).";
    }

    if (!validator.isFloat(req.body.step, {
        gt: 0,
    })){
        errors["step"] = "Please provide a valid step (>0).";
    }

    if (req.body.step_type != 'percent' && req.body.step_type != 'absolute'){
        errors["step_type"] = "Invalid step type.";
    }
}

exports.validateStrategy = function(errors, req) {
    return new Promise(function(resolve, reject){
        validateCreateStrategyFields(errors, req);
        let promises = [
            !req.body.strategy_type ? Promise.resolve(null):
                models.StrategyType.findOne({where: {id: req.body.strategy_type}}),
            !req.body.account ? Promise.resolve(null):
                models.Account.findOne({where: {id: req.body.account}})
        ]; 

        Promise.all(promises).then(data => {
            let strategyType = data[0];
            let account = data[1];
            if (strategyType == null) {
                errors["strategy_type"] = "Strategy does not exist.";
            }
            
            if (account == null) {
                errors["account"] = "Account does not exist.";
            }

            resolve(errors);
        })

    });
    
}