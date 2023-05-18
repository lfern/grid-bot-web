const models = require('../models');

exports.get_account_types_json = function(req, res, next) {
    models.ExchangeMarket.findAll({
        where: {
            exchange_id: req.params.exchange_id,
        },
        include: [
            models.ExchangeMarket.AccountType
        ]
    }).then(exchangeMarkets => {
        let response = [];
        exchangeMarkets.forEach(m => {
            console.log(m)
            response.push({
                type: m.account_type.account_type,
                paper: m.paper
            });
        });
        res.json(response);
    })
}

exports.get_accounts_json = function(req, res, next) {

}

exports.get_markets_json = function(req, res, next) {

}
