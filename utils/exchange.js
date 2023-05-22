const models = require('../models');
const ccxt = require('ccxt');
const _ = require('lodash');

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
     
    let exchangeName = exchangeMarket.exchange.exchange_name;
    if (exchangeMarket.markets == null ||
        exchangeMarket.markets_updated_at == null ||
        ((new Date().getTime() - exchangeMarket.markets_updated_at.getTime()) > 3600 * 1000)) {
    
        
        if (!ccxt.hasOwnProperty(exchangeName)) {
            throw new Error("Ccxt Exchange not valid "+exchangeName);
        }
        
        let ccxtExchange = new ccxt[exchangeName]();
                
        let markets = await ccxtExchange.loadMarkets();
        var filtered = _.pickBy(markets, function(market) {
            return market.type == exchangeMarket.account_type.account_type_name;
        });

        exchangeMarket.markets = filtered;
        exchangeMarket.markets_updated_at = models.Sequelize.fn('NOW');
        await exchangeMarket.save();

        ccxtExchange.setMarkets(filtered);
        return ccxtExchange;
    } else {
        let ccxtExchange = new ccxt[exchangeName]();
        ccxtExchange.setMarkets(exchangeMarket.markets);
        return ccxtExchange;
    }
}


module.exports = {
    getExchangeMarkets, 
}