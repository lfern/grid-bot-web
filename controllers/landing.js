const models = require('../models');
let createError = require('http-errors');

exports.get_landing = function(req, res, next) {
    Promise.all([
        models.StrategyInstance.findAll({
            where: {running: true},
            include: [
                {
                    association: models.StrategyInstance.Strategy,
                    include: [
                        models.Strategy.Account
                    ]
                }
            ],
        }),
        models.StrategyInstanceEvent.findAll({
            order:[
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    association: models.StrategyInstanceEvent.StrategyInstance,
                    include: [
                        models.StrategyInstance.Strategy
                    ]
                }
            ],
            limit: 100
        }),
        models.Account.findAll()
    ]).then(result => {
        res.render('landing', {
            title: 'Dashboard',
            user: req.user,
            instances: result[0],
            events: result[1],
            accounts: result[2],
        });
    }).catch(ex => {
        return next(createError(500, ex));
    });

}

