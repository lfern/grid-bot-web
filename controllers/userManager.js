const models = require('../models');
const { isEmpty } = require('lodash');
let createError = require('http-errors');

exports.show_users = function(req, res, next) {
    return models.User.findAll()
    .then(result => {
        res.render('usermanager/users', {
            title: 'Users',
            dbusers: result,
            user: req.user,
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });
}


const rerender_user = function(errors, req, res, next) {
    return models.User.findOne({
        where:{
            id: req.params.user_id
        },
    }).then(dbuser => {
        if (dbuser == null) {
            return next(createError(404, "User does not exist"));
        }
        res.render('usermanager/edit-user', {
            title: 'User',
            dbuser: dbuser,
            user: req.user,
            formData: errors ? req.body : undefined,
            errors
        })
    }).catch(ex => {
        return next(createError(500, ex));
    });

}

exports.show_user = function(req, res, next) {
    rerender_user(undefined, req, res, next);
}

exports.update_user = function(req, res, next) {
    let errors = {};
    models.sequelize.transaction((transaction) => {
        if (req.user.id == req.params.user_id && req.body.validated === undefined) {
            errors['validated'] = "You can't invalidate your own user!!!";
            throw new Error("Trying to invalidate myself?");
        } 

        return models.User.update( {
            is_admin: req.body.is_admin !== undefined,
            validated: req.body.validated !== undefined,
        }, {
            where: {
                id: req.params.user_id,
            },
            transaction
        }).then(result => {
            return models.User.findOne({
                where: {is_admin: true},
                transaction
            }).then(result => {
                if (result == null) {
                    errorNotAdmins = true;
                    errors['is_admin'] = "Could not remove all admins";
                    throw new Error("Could not remove all admins");
                }
            })
        }); 
    }).then(result => {
        res.redirect('/usermanager');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_user = function(req, res, next) {
    return models.User.destroy({
        where:{
            id: req.params.user_id,
            is_admin: false
        }
    }).then(result => {
        res.redirect('/usermanager');
    }).catch(ex => {
        return next(createError(500, ex));
    });
}

exports.delete_user_json = function(req, res, next) {
    return models.User.destroy({
        where:{
            id: req.params.user_id,
            is_admin: false
        }
    }).then(result => {
        res.send({msg: "Success"});
    }).catch(ex => {
        console.error(ex);
        res.status(500).send({error: ex.message});
    });
}
