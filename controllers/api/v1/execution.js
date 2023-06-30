const models = require('../../../models');

const {stringify} = require('csv-stringify/sync')

exports.execution = function(req, res, next) {

    Promise.all([
        models.StrategyInstanceTrade.findAll({
            include: [{
                association: models.StrategyInstanceTrade.Account,
                include: [
                    models.Account.AccountType,
                    models.Account.Exchange
                ]
            }, models.StrategyInstanceTrade.StrategyInstanceOrder],
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 5000
        }),
        models.StrategyInstanceTrade.count()
    ]).then(result => {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");
        res.status(200);

        res.write(stringify([["TotalRecords:", result[1]]]));

        let columns = [
            'exchange','account',
            'symbol', 'exchange_trade_id',
            'side', 'order_id',
            'timestamp', 'datetime',
            'price','amount','cost',
            'fee_cost','fee_coin',
            'taker_or_maker', 'order_price',
            'order_amount', 'internal_order_id',
            'internal_order_id_matched'
        ];

        res.write(stringify([columns]));
        result[0].forEach(x => {
            res.write(stringify([
                [
                    x.account.exchange.exchange_desc, x.account.account_name,
                    x.symbol, x.exchange_trade_id,
                    x.strategy_instance_order.side, x.strategy_instance_order.exchange_order_id,
                    x.timestamp, x.datetime,
                    x.price, x.amount, x.cost,
                    x.fee_cost, x.fee_coin,
                    x.taker_or_maker, x.strategy_instance_order.price,
                    x.strategy_instance_order.amount,x.strategy_instance_order.id,
                    x.strategy_instance_order.matching_order_id
                ]
            ]));
        })

        res.end();
    }).catch(ex => {
        console.error(ex);
        res.write(ex.message);
        res.end();
    })

}