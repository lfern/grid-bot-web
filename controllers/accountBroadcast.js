const models = require('../models');
const { isEmpty } = require('lodash');
let createError = require('http-errors');
let {validateBroadcastTransaction} = require('../validators/broadcastTransaction');

exports.show_broadcasts = function(req, res, next) {
    Promise.all([
        models.Account.findOne({
            where:{
                id: req.params.account_id
            },
            include: [models.Account.Exchange, models.Account.AccountType]
        }),
        models.BroadcastTransaction.findAll({
            where:{
                account_id: req.params.account_id
            }
        })
    ]).then(result => {
        let account = result[0];
        let transactions = result[1];
        if (account == null) {
            return next(createError(404, "Account does not exist"));    
        }
        res.render('account/broadcast-transactions', {
            account: account,
            transactions: transactions,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

const rerender_create = function(errors, req, res, next) {
    models.Account.findOne({where:{id: req.params.account_id}})
        .then(account => {
            if (account == null) {
                return next(createError(404, "Account does not exist"))
            }
            res.render('account/broadcast-transaction/create', {
                account, user: req.user, errors, formData: req.body
            })
        }).catch(ex => {
            return next(createError(500, ex));
        });
}

exports.show_create = function(req, res, next) {
    rerender_create([], req, res, next);
}

exports.submit_broadcast = function(req, res, next) {
    let errors = {};
    return validateBroadcastTransaction(errors, req).then(data =>{
        if (!isEmpty(data.errors)){
            rerender_create(data.errors, req, res, next);
        } else {

            return models.sequelize.transaction(async transaction => {
                let broadcastTransaction = await models.BroadcastTransaction.create({
                    account_id: req.params.account_id,
                    transaction_raw: req.body.transaction,
                    valid:true,
                    transaction_hash: data.validatedData.hash
                },{transaction});
                for(let i=0;i<data.validatedData.addresses.length;i++) {
                    await models.BroadcastTransactionAddress.create({
                        broadcast_transaction_id: broadcastTransaction.id,
                        address: data.validatedData.addresses[i]
                    }, {transaction});
                }
            }).then(result => {
                res.redirect('/account/'+req.params.account_id+'/broadcast-transactions')
            });
        }
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.show_broadcast = function(req, res, next) {
    return Promise.all([
        models.BroadcastTransaction.findOne({
            where:{
                id: req.params.transaction_id
            },
            include: [models.BroadcastTransaction.Account]
        }),
        models.BroadcastTransactionAddress.findAll({
            where:{
                broadcast_transaction_id: req.params.transaction_id
            },
        })
    ]).then(result => {
        let transaction = result[0];
        let addresses = result[1];
        if (transaction == null) {
            return next(createError(404, "Broadcast Transaction does not exist"));    
        }
        res.render('account/broadcast-transaction/transaction', {
            transaction: transaction,
            addresses: addresses,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}


exports.delete_broadcast = function(req, res, next) {
    return models.sequelize.transaction(async (transaction) => {
        await models.BroadcastTransactionAddress.destroy({
            where: {broadcast_transaction_id: req.params.transaction_id}
        }); 

        await models.BroadcastTransaction.destroy({
            where:{
                id: req.params.transaction_id
            }
        });
    }).then(result => {
        if (req.body.account_id) {
            res.redirect('/account/'+req.body.account_id+'/broadcast-transactions')
        } else {
            res.redirect('/accounts');
        }
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_broadcast_json = function(req, res, next) {
    return models.sequelize.transaction(async (transaction) => {
        await models.BroadcastTransactionAddress.destroy({
            where: {broadcast_transaction_id: req.params.transaction_id}
        }); 

        await models.BroadcastTransaction.destroy({
            where:{
                id: req.params.transaction_id
            }
        });
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.send_broadcast = function(req, res, next) {
    models.BroadcastTransaction.update( {
        send_requested_at: models.sequelize.fn('NOW'),
    }, {
        where: {
            id: req.params.transaction_id,
            sent_at: null,
            send_requested_at: null
        }
    }).then(result => {
        res.redirect('/account-broadcast-transaction/'+req.params.transaction_id);
    }).catch(ex => {
        return next(createError(500, ex));
    });
}