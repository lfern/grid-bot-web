const models = require('../models');
const exchangeMarketsService = require('grid-bot/src/services/ExchangeMarket');
const {exchangeInstance} = require('grid-bot/src/crypto/exchanges/exchanges');


/** @typedef {import('grid-bot/src/crypto/exchanges/BaseExchange').BaseExchange} BaseExchange */

/**
 * 
 * @param {string} exchangeId 
 * @param {string} accountTypeId 
 * @param {boolean} paper 
 * @returns {BaseExchange}
 */
let getExchangeMarketsDbData = async function(exchangeId, accountTypeId, paper = false, apiKey = undefined, secret = undefined) {
    const exchangeMarket = await models.ExchangeMarket.findOne({
        where: {
            exchange_id: exchangeId,
            account_type_id: accountTypeId,
            paper: paper,
        },
        include: [
            models.ExchangeMarket.AccountType,
            models.ExchangeMarket.Exchange
        ]
    });

    if (exchangeMarket == null) {
        return null;
    }

    return getExchangeMarkets(
        exchangeMarket.exchange.exchange_name,
        exchangeMarket.account_type.account_type,
        paper,
        apiKey,
        secret
    );
}


/**
 * Exchange with markets not initialized
 * 
 * @param {string} exchangeId 
 * @param {string} accountTypeId 
 * @param {boolean} paper 
 * @returns {BaseExchange}
 */
let getExchangeDbData = async function(exchangeId, accountTypeId, paper = false) {
    const exchangeMarket = await models.ExchangeMarket.findOne({
        where: {
            exchange_id: exchangeId,
            account_type_id: accountTypeId,
            paper: paper,
        },
        include: [
            models.ExchangeMarket.AccountType,
            models.ExchangeMarket.Exchange
        ]
    });

    if (exchangeMarket == null) {
        return null;
    }

    return getExchange(
        exchangeId,
        exchangeMarket.account_type.account_type,
        paper
    );
}

/**
 * 
 * @param {string} exchangeId 
 * @param {string} exchangeType 
 * @param {boolean|undefined} paper 
 * @param {string|undefined} apiKey 
 * @param {string|undefined} secret 
 * @returns {BaseExchange}
 */
let getExchange = function(exchangeId, exchangeType, paper = false, apiKey = undefined, secret = undefined) {
    return exchangeInstance(exchangeId, {
        paper, 
        exchangeType,
        apiKey,
        secret
    })
}

/**
 * 
 * @param {*} exchangeId 
 * @param {*} exchangeType 
 * @param {*} paper 
 * @param {*} apiKey 
 * @param {*} secret 
 * @returns {BaseExchange}
 */
let getExchangeMarkets = async function(exchangeId, exchangeType, paper = false, apiKey = undefined, secret = undefined) {
    return await exchangeMarketsService.exchangeInstanceWithMarkets(
        exchangeId,
        {
            paper,
            exchangeType: exchangeType,
            apiKey, secret
        }
    );
}



module.exports = {
    getExchangeMarketsDbData, 
    getExchangeDbData,
    getExchange,
    getExchangeMarkets
}