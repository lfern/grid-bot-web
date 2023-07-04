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
            }, {
                association: models.StrategyInstanceTrade.StrategyInstanceOrder,
                include: [{
                    association: models.StrategyInstanceOrder.StrategyInstance,
                    include: [models.StrategyInstance.Strategy]
                }]
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 5000
        }),
        models.StrategyInstanceTrade.count(),
    ]).then(result => {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");
        res.status(200);

        res.write(stringify([["TotalRecords:", result[1]]]));

        let columns = [
            'exchange','account',
            'strategy',
            'instance_id',
            'symbol', 'exchange_trade_id',
            'side', 'order_id',
            'timestamp', 'datetime',
            'price','amount','cost',
            'fee_cost','fee_coin',
            'taker_or_maker', 'order_price',
            'order_amount', 'internal_order_id',
            'internal_order_id_matched',
            'account_holder'
        ];

        res.write(stringify([columns]));
        result[0].forEach(x => {
            res.write(stringify([
                [
                    x.account.exchange.exchange_desc, x.account.account_name,
                    x.strategy_instance_order.strategy_instance.strategy.strategy_name,
                    x.strategy_instance_order.strategy_instance.id,
                    x.symbol, x.exchange_trade_id,
                    x.strategy_instance_order.side, x.strategy_instance_order.exchange_order_id,
                    x.timestamp, x.datetime,
                    x.price, x.amount, x.cost,
                    x.fee_cost, x.fee_coin,
                    x.taker_or_maker, x.strategy_instance_order.price,
                    x.strategy_instance_order.amount,x.strategy_instance_order.id,
                    x.strategy_instance_order.matching_order_id,
                    x.account.holder
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