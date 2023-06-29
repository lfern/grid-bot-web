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
            }],
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
            'symbol', 'id', 'exchange_trade_id', 'timestamp', 'datetime',
            'price','amount','cost','fee_cost','fee_coin'
        ];

        res.write(stringify([['exchange'].concat(columns)]));
        result[0].forEach(x => {
            console.log(x.id)
            let record = [
                x.account.exchange.exchange_name,
            ];
            columns.forEach(k => record.push(x[k]))
            res.write(stringify([record]));
        })

        res.end();
    }).catch(ex => {
        console.error(ex);
        res.status(500).send({error: ex.message});
    })

}