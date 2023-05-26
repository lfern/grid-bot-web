const models = require('../models');

exports.get_landing = function(req, res, next) {
    models.Exchange.findAll().then(exchanges => {
        res.render('landing', {
            title: 'Express',
            user: req.user,
            exchanges: exchanges
        });
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

