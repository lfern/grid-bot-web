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
    // extract prices from field names
    let prices = [];
    let fields = Object.keys(req.body);
    for(let i=0; i < fields.length; i++) {
        if (fields[i].startsWith('price-')) {
            let priceTag = fields[i].replace('price-', '');
            let price = new BigNumber(priceTag);
            if (price.isNaN()) {
                errors[fields[i]] = 'Invalid price in field name???';
            } else {
                prices.push({
                    price: price,
                    priceTag: priceTag,
                    field: fields[i],
                    newPrice: null,
                });
            }
        }
    }

    if (prices.length == 0) {
        return {prices: []};
    }

    prices = prices.sort((a, b) => (a.price > b.price) ? -1 : ((a.price < b.price) ? 1 : 0));
    let lastPrice = new BigNumber(req.body[prices[0].field]).plus(1);
    for(let i=0;i<prices.length;i++) {
        let price = prices[i];
        let newPriceValue = req.body[price.field];
        price.newPrice = new BigNumber(newPriceValue);
        console.log(newPriceValue);console.log(price.newPrice);
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

    return {
        prices
    };

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
        } finally {
            resolve({
                errors,
                validatedData,
            });
        }
    });
    
}