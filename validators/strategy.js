let models = require('../models');
let validator = require('validator');
let { parse } = require('csv-parse/sync');
let CsvGridService = require('../services/CsvGridService');
const { exchangeInstanceFromAccount } = require('grid-bot/src/services/ExchangeMarket');
/** @typedef {import('../services/CsvGridService').ImportGrid} ImportGrid */

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

const validateImportStrategyFields = function(errors, req){
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


}

exports.validateImportStrategy = function(errors, fields, files) {
    return new Promise(function(resolve, reject){
        validateImportStrategyFields(errors, fields);
        let promises = [
            !fields.body.strategy_type ? Promise.resolve(null):
                models.StrategyType.findOne({where: {id: fields.body.strategy_type}}),
            !fields.body.account ? Promise.resolve(null):
                models.Account.findOne({where: {id: fields.body.account}})
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

            /** @type {ImportGrid} */
            let importGrid = {
                accountId: fields.body.account,
                activeBuys: fields.body.active_buys,
                activeSells: fields.body.active_sells,
                grid: [],
                initialPosition: fields.body.initial_position,
                initialPrice: 0,
                strategyName: fields.body.name,
                strategyType: fields.body.strategy_type,
                symbol: fields.body.symbol,
            };

            let ret = {
                errors,
                validatedData: importGrid,
            };

            exchangeInstanceFromAccount(account, true).then(exchange => {
                CsvGridService.parseCsv(files.file[0].filepath,fields.body.symbol, exchange).then(gridEntries => {
                    ret.validatedData.grid = gridEntries;
                    try {
                        CsvGridService.checkValidity();
                    } catch (ex){
                        ret.errors['file'] = ex.message;
                    }
                    resolve(ret);
                }).catch(err => {
                    console.error("Error parsing csv file", err);
                    ret.errors['file'] = err.message;
                    resolve(ret);
                });
            }).catch(ex => {
                console.error(ex);
                ret.errors['account'] = ex.message;
                resolve(ret);
            });

        })

    });
    
}