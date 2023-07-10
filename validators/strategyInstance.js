let models = require('../models');
let validator = require('validator');
const { default: BigNumber } = require('bignumber.js');

/** @typedef {import('../services/CsvGridService').ImportGrid} ImportGrid */

/**
 * 
 * @param {*} errors 
 * @param {*} req 
 * @param {ImportGrid} data 
 */
const validateRefreshRecoveryFields = function(errors, req, data){
    let ret = {
        prices: [],
        initial_position: null,
        active_sells: null,
        active_buys: null,
    };

    if (!validator.isFloat(req.body.initial_position)){
        errors["initial_position"] = "Please provide a valid initial position.";
    } else {
        ret.initial_position = parseFloat(req.body.initial_position);
    }

    if (!validator.isInt(req.body.active_buys, {
        min: 1
    })){
        errors["active_buys"] = "Please provide a valid active buys (min 1).";
    } else {
        ret.active_buys = parseInt(req.body.active_buys);
    }

    if (!validator.isInt(req.body.active_sells, {
        min: 1
    })){
        errors["active_sells"] = "Please provide a valid active sells (min 1).";
    } else {
        ret.active_sells = parseInt(req.body.active_sells);
    }


    // extract prices from field names
    ret.prices = [];
    let fields = Object.keys(req.body);
    for(let i=0; i < fields.length; i++) {
        if (fields[i].startsWith('price-')) {
            let priceTag = fields[i].replace('price-', '');
            let price = new BigNumber(priceTag);
            if (price.isNaN()) {
                errors[fields[i]] = 'Invalid price in field name???';
            } else {
                ret.prices.push({
                    price: price,
                    priceTag: priceTag,
                    priceField: fields[i],
                    newPrice: null,
                    userQty: null,
                });
            }
        }
    }

    if (ret.prices.length == 0) {
        return ret;
    }

    ret.prices = ret.prices.sort((a, b) => (a.price > b.price) ? -1 : ((a.price < b.price) ? 1 : 0));
    let lastPrice = new BigNumber(req.body[ret.prices[0].priceField]).plus(1);
    for(let i=0;i<ret.prices.length;i++) {
        let price = ret.prices[i];
        let newPriceValue = req.body[price.priceField];
        let qtyField = 'qty-'+price.priceTag;
        let userQty = req.body[qtyField] && req.body[qtyField] != '' ? new BigNumber(req.body[qtyField]) : null;
        price.newPrice = new BigNumber(newPriceValue);
        price.userQty = userQty;

        if (userQty != null && userQty.isNaN()) {
            errors[qtyField] = 'Invalid Quantity';
        }

        if (newPriceValue == '') {
            // check if we could remove this price
            continue;
        }

        if (price.newPrice.isNaN()) {
            errors[price.field] = 'Invalid price';
            continue;
        }

        if (price.newPrice.isGreaterThanOrEqualTo(lastPrice)) {
            errors[price.field] = 'Price higher or equal to previous price';
            continue;
        }

        lastPrice = price.newPrice;
    }

    return ret;

}
/**
 * 
 * @param {*} errors 
 * @param {*} req 
 * @param {ImportGrid} data 
 * @returns 
 */
exports.validateRefreshRecovery = function(errors, req, data) {
    return new Promise(function(resolve, reject){
        let validatedData = null;
        try {
            validatedData = validateRefreshRecoveryFields(errors, req, data);console.log(validatedData)
        } catch(ex) {
            console.error(ex);
        } finally {
            resolve({
                errors,
                validatedData,
            });
        }
    });
    
}