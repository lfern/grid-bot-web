const models = require('../models');
const { isEmpty } = require('lodash');
let createError = require('http-errors');
let {validateTelegram} = require('../validators/telegram');
const telegramService = require('grid-bot/src/services/TelegramService');

exports.show_notifications = function(req, res, next) {
    return models.TelegramChatid.findAll()
    .then(result => {
        res.render('notificationmanager/index', {
            title: 'Notifications',
            telegramIds: result,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

const rerender_create = function(errors, req, res, next) {
    res.render('notificationmanager/create-telegram', {
        title: 'Telegram chat id',
        user: req.user,
        formData: errors ? req.body : {},
        errors,
        botUrl: process.env.TELEGRAM_BOT_URL
    })
}

exports.create_telegram = function(req, res, next) {
    rerender_create(undefined, req, res, next);
}

exports.post_telegram = function(req, res, next) {
    let errors = {};
    return validateTelegram(errors, req).then(errors =>{
        if (!isEmpty(errors)){
            rerender_create(errors, req, res, next);
        } else {
            return models.TelegramChatid.create( {
                chat_id: req.body.chat_id,
                description: req.body.description,
                level: req.body.level,
                is_valid: true
            });
        }
    }).then(result => {
        res.redirect('/notificationmanager');
    }).catch(ex => {
        if (errors) {
            return rerender_create(errors,req, res, next);
        } else {
            return next(createError(500, ex));
        }
    });
}

const rerender_edit_telegram = function(errors, req, res, next) {
    return models.TelegramChatid.findOne({
        where:{
            id: req.params.telegram_id
        },
    }).then(data => {
        if (data == null) {
            return next(createError(404, "Telegram chat id does not exist"));
        }
        res.render('notificationmanager/edit-telegram', {
            title: 'Telegram chat id',
            user: req.user,
            formData: errors ? req.body : data,
            errors,
            botUrl: process.env.TELEGRAM_BOT_URL
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });

}

exports.edit_telegram = function(req, res, next) {
    rerender_edit_telegram(undefined, req, res, next);
}

exports.update_telegram = function(req, res, next) {
    let errors = {};
    return validateTelegram(errors, req).then(errors =>{
        console.log(errors);
        if (!isEmpty(errors)){
            rerender_edit_telegram(errors, req, res, next);
        } else {
            return models.TelegramChatid.update( {
                chat_id: req.body.chat_id,
                description: req.body.description,
                level: req.body.level,
                is_valid: true,
            }, {
                where: {
                    id: req.params.telegram_id,
                }
            });
        }
    }).then(result => {
        res.redirect('/notificationmanager');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_telegram = function(req, res, next) {
    return models.TelegramChatid.destroy({
        where:{
            id: req.params.telegram_id
        }
    }).then(result => {
        res.redirect('/notificationmanager');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_telegram_json = function(req, res, next) {
    return models.TelegramChatid.destroy({
        where:{
            id: req.params.telegram_id
        }
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.test_telegram_json = function(req, res, next) {
    return models.TelegramChatid.findOne({
        where:{
            id: req.params.telegram_id
        }
    }).then(result => {
        if (result == null) {
            return res.status(404).send({error: "Telegram chat id not found"});
        }
        sendTelegramTest(result.chat_id, req.params.telegram_id).then(result => {
            res.send({msg: "Success"});
        }).catch(ex => {
            res.status(500).send({error: ex.message});
        });
        
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

function sendTelegramTest(chatId, telegramId) {
    return new Promise((resolve, reject) => {
        telegramService.sendMessage (process.env.TELEGRAM_BOT_TOKEN, chatId, "This is a test message from grid-bot")
        .then(result => {
            models.TelegramChatid.update({is_valid: true},{where:{id: telegramId}})
                .then(result => {
                    res.send({msg: "Success"});
                }).catch(ex =>{
                    console.log(ex);
                });
            resolve(null);
        }).catch(ex => {
            if (ex instanceof telegramService.TelegramForbiddenException || 
                ex instanceof telegramService.TelegramInvalidParamsError) {
                models.TelegramChatid.update({is_valid: false},{where:{id: telegramId}})
                .then(result => {
                }).catch(ex =>{
                    console.log(ex);
                })
            }
            reject(ex);
        });
    });
}
