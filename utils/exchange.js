const models = require('../models');
const exchangeMarketsService = require('grid-bot/src/services/ExchangeMarket');


/** @typedef {import('grid-bot/src/crypto/exchanges/BaseExchange').BaseExchange} BaseExchange */

/**
 * 
 * @param {string} exchangeId 
 * @param {string} accountTypeId 
 * @param {boolean} paper 
 * @returns {BaseExchange}
 */
let getExchangeMarkets = async function(exchangeId, accountTypeId, paper) {
    const exchangeMarket = await models.ExchangeMarket.findOne({
        where: {
            exchange_id: exchangeId,
            account_type_id: accountTypeId,
            paper: paper
        },
        include: [
            models.ExchangeMarket.AccountType,
            models.ExchangeMarket.Exchange
        ]
    });

    if (exchangeMarket == null) {
        return null;
    }

    return exchangeMarketsService.exchangeInstanceWithMarkets(
        exchangeMarket.exchange.exchange_name,
        {
            paper,
            exchangeType: exchangeMarket.account_type.account_type
        }
    );
}


module.exports = {
    getExchangeMarkets, 
}