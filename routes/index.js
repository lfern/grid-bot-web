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

module.exports = router;
