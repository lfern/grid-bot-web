var express = require('express');
var router = express.Router();

let landing = require('../controllers/landing')
let user = require('../controllers/user');
let account = require('../controllers/account');
let strategy = require('../controllers/strategy');
let exchange = require('../controllers/exchange')
let strategyInstance = require('../controllers/strategyInstance');

let {isLoggedIn, hasAuth} = require('../middleware/hasAuth');

/* Login related routes */
router.get('/login', user.show_login);
router.get('/signup', user.show_signup);
router.post('/login', user.login);
router.post('/signup', user.signup);
router.post('/logout', user.logout);
router.get('/logout', user.logout);

/* GET home page. */
router.get('/', isLoggedIn, landing.get_landing);

/* Account related routes */
router.get('/accounts', isLoggedIn, account.show_accounts);
router.get('/accounts/create', isLoggedIn, account.show_create);
router.post('/accounts/create', isLoggedIn, account.submit_account);
router.post('/account/:account_id/delete', isLoggedIn, account.delete_account);
router.post('/account/:account_id/delete/json', isLoggedIn, account.delete_account_json);
router.get('/account/:account_id', isLoggedIn, account.show_account);

/* Strategy related routes */
router.get('/strategies', isLoggedIn, strategy.show_strategies);
router.get('/strategies/create', isLoggedIn, strategy.show_create);
router.post('/strategies/create', isLoggedIn, strategy.submit_strategy);
router.post('/strategy/:strategy_id/delete', isLoggedIn, strategy.delete_strategy);
router.post('/strategy/:strategy_id/delete/json', isLoggedIn, strategy.delete_strategy_json);
router.get('/strategy/:strategy_id', isLoggedIn, strategy.show_strategy);
// Strategy instances
router.get('/strategy/:strategy_id/instances', isLoggedIn, strategy.show_strategy_instances);
router.post('/strategy/:strategy_id/instance/create', isLoggedIn, strategy.submit_instance);

/* Strategy instance */
router.get('/strategy-instance/:instance_id', isLoggedIn, strategyInstance.show_instance);
router.get('/strategy-instance/:instance_id/grid/json', isLoggedIn, strategyInstance.get_instance_grid_json);
router.get('/strategy-instance/:instance_id/position/json', isLoggedIn, strategyInstance.get_instance_position_json);
router.get('/strategy-instance/:instance_id/orders/json', isLoggedIn, strategyInstance.get_instance_orders_json);
router.get('/strategy-instance/:instance_id/trades/json', isLoggedIn, strategyInstance.get_instance_trades_json);
router.get('/strategy-instance/:instance_id/events/json', isLoggedIn, strategyInstance.get_instance_events_json);
router.post('/strategy-instance/:instance_id/stop', isLoggedIn, strategyInstance.stop_instance);
router.post('/strategy-instance/:instance_id/delete', isLoggedIn, strategyInstance.delete_instance);
router.post('/strategy-instance/:instance_id/delete/json', isLoggedIn, strategyInstance.delete_instance_json);

/* Exchange related routes */
router.get('/exchanges/json', isLoggedIn, exchange.get_exchanges_json);
router.get('/exchange/:exchange_id/accounts/json', isLoggedIn, exchange.get_accounts_json);
router.get('/exchange/:exchange_id/account-types/json', isLoggedIn, exchange.get_account_types_json);
router.get('/exchange/:exchange_id/:account_type_id/markets/json', isLoggedIn, exchange.get_markets_json);
router.get('/exchange/:exchange_id/:account_type_id/markets/paper/json', isLoggedIn, exchange.get_markets_json_paper);
router.get('/account/:account_id/markets/json', isLoggedIn, exchange.get_markets_account_json);

module.exports = router;
