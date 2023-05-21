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
router.get('/', landing.get_landing);

/* Account related routes */
router.get('/accounts', account.show_accounts);
router.get('/accounts/create', account.show_create);
router.post('/accounts/create', account.submit_account);
router.post('/account/:account_id/delete', account.delete_account);
router.post('/account/:account_id/delete/json', account.delete_account_json);
router.get('/account/:account_id', account.show_account);

/* Strategy related routes */
router.get('/strategies', strategy.show_strategies);
router.get('/strategies/create', strategy.show_create);
router.post('/strategies/create', strategy.submit_strategy);
router.post('/strategy/:strategy_id/delete', strategy.delete_strategy);
router.post('/strategy/:strategy_id/delete/json', strategy.delete_strategy_json);
router.get('/strategy/:strategy_id', strategy.show_strategy);
// Strategy instances
router.get('/strategy/:strategy_id/instances', strategy.show_strategy_instances);
router.post('/strategy/:strategy_id/instance/create', strategy.submit_instance);

/* Strategy instance */
router.get('/strategy-instance/:instance_id', strategyInstance.show_instance);
router.get('/strategy-instance/:instance_id/grid/json', strategyInstance.get_instance_grid_json);
router.get('/strategy-instance/:instance_id/position/json', strategyInstance.get_instance_position_json);
router.get('/strategy-instance/:instance_id/orders/json', strategyInstance.get_instance_orders_json);
router.get('/strategy-instance/:instance_id/trades/json', strategyInstance.get_instance_trades_json);
router.get('/strategy-instance/:instance_id/events/json', strategyInstance.get_instance_events_json);
router.post('/strategy-instance/:instance_id/stop', strategyInstance.stop_instance);
router.post('/strategy-instance/:instance_id/delete', strategyInstance.delete_instance);
router.post('/strategy-instance/:instance_id/delete/json', strategyInstance.delete_instance_json);

/* Exchange related routes */
router.get('/exchanges/json', exchange.get_exchanges_json);
router.get('/exchange/:exchange_id/accounts/json', exchange.get_accounts_json);
router.get('/exchange/:exchange_id/account-types/json', exchange.get_account_types_json);
router.get('/exchange/:exchange_id/:account_type_id/markets/json', exchange.get_markets_json);
router.get('/exchange/:exchange_id/:account_type_id/markets/paper/json', exchange.get_markets_json_paper);
router.get('/account/:account_id/markets/json', exchange.get_markets_account_json);

module.exports = router;
