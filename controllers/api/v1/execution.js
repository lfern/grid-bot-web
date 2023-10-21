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

exports.ledger = function(req, res, next) {
    let page = 'page' in req.query ? req.query.page : 1;
    if (page <= 0) {
        page = 1;
    }

    let limit = 5000;
 
    Promise.all([
        models.AccountLedger.findAll({
            include: [{
                association: models.AccountLedger.Account,
                include: [
                    models.Account.AccountType,
                    models.Account.Exchange
                ]
            }],
            order: [
                ['tx_timestamp', 'ASC']
            ],
            limit,
            offset: ((page-1) * limit)
        }),
        models.AccountLedger.count(),
    ]).then(result => {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");
        res.status(200);

        res.write(stringify([["TotalRecords:", result[1]]]));

        let columns = [
            'exchange',
            'internal_account',
            'exchange_holder',
            'exchange_account',
            'wallet',
            
            'exchange_txid',
            'order_id',
            'related_id',
            'symbol',
            'asset',
            
            'tx_ts',
            'tx_timestamp',
            'tx_datetime',
            'tx_type',
            'tx_subtype',
            
            'amount',
            'amount_change',
            'balance',
            'description',
            'status',
            
            'other_data',
        ];

        res.write(stringify([columns]));
        result[0].forEach(x => {
            res.write(stringify([
                [
                    x.account.exchange.exchange_desc,
                    x.account.account_name,
                    x.exchange_holder,
                    x.exchange_account,
                    x.wallet,
                    
                    x.exchange_txid,
                    x.order_id,
                    x.related_id,
                    x.symbol,
                    x.asset,
                    
                    x.tx_ts,
                    x.tx_timestamp,
                    x.tx_datetime,
                    x.tx_type,
                    x.tx_subtype,
                    
                    x.amount,
                    x.amount_change,
                    x.balance,
                    x.description,
                    x.status,
                    
                    x.other_data,
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

exports.ledgerExecution = function(req, res, next) {
    let page = 'page' in req.query ? req.query.page : 1;
    if (page <= 0) {
        page = 1;
    }

    let limit = 5000;

    Promise.all([
        models.AccountExecution.findAll({
            include: [{
                association: models.AccountExecution.Account,
                include: [
                    models.Account.AccountType,
                    models.Account.Exchange
                ]
            }],
            order: [
                ['timestamp', 'ASC']
            ],
            limit,
            offset: ((page-1) * limit)
        }),
        models.AccountExecution.count(),
    ]).then(result => {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");
        res.status(200);

        res.write(stringify([["TotalRecords:", result[1]]]));

        let columns = [
            'exchange',
            'internal_account',
            'exchange_holder',
            'exchange_account',
            'wallet',
           
            'symbol',
            'exchange_order_id',
            'exchange_trade_id',
            'ts',
            'timestamp',
           
            'datetime',
            'price',
            'amount',
            'cost',
            'fee_cost',
           
            'fee_coin',
            'matched_exchange_order_id',
            'instance_tag',
        ];

        res.write(stringify([columns]));
        result[0].forEach(x => {
            res.write(stringify([
                [
                    x.account.exchange.exchange_desc,
                    x.account.account_name,
                    x.exchange_holder,
                    x.exchange_account,
                    x.wallet,
                   
                    x.symbol,
                    x.exchange_order_id,
                    x.exchange_trade_id,
                    x.ts,
                    x.timestamp,
                   
                    x.datetime,
                    x.price,
                    x.amount,
                    x.cost,
                    x.fee_cost,
                   
                    x.fee_coin,
                    x.matched_exchange_order_id,
                    x.instance_tag,
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