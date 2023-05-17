var express = require('express');
var router = express.Router();

let landing = require('../controllers/landing')
let user = require('../controllers/user');
let account = require('../controllers/account');
let {isLoggedIn, hasAuth} = require('../middleware/hasAuth');

router.get('/login', user.show_login);
router.get('/signup', user.show_signup);
router.post('/login', user.login);
router.post('/signup', user.signup);
router.post('/logout', user.logout);
router.get('/logout', user.logout);

/* GET home page. */
router.get('/', landing.get_landing);

router.get('/accounts', account.show_accounts);
router.get('/accounts/create', account.show_create);
router.post('/accounts/create', account.submit_account);
router.post('/account/:account_id/delete', account.delete_account);
router.post('/account/:account_id/delete-json', account.delete_account_json);
router.get('/account/:account_id', account.show_account);
//router.get('/account/:account_id', account.show_account);
//router.get('/account/:account_id/edit', account.edit_account);
//router.post('/account/:account_id/edit', account.edit_account);
//router.post('/account/:account_id/delete', account.delete_account);
//router.post('/account/:account_id/delete-json', account.delete_account_json);
//router.post('/', landing.submit_lead);
//router.get('/leads', hasAuth, landing.show_leads);
//router.get('/lead/:lead_id', landing.show_lead);
//router.get('/lead/:lead_id/edit', landing.show_edit_lead);
//router.post('/lead/:lead_id/edit', landing.edit_lead);
//router.post('/lead/:lead_id/delete', landing.delete_lead);
//router.post('/lead/:lead_id/delete-json', landing.delete_lead_json);

module.exports = router;
