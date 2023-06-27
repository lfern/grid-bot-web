var express = require('express');
var router = express.Router();

let landing = require('../controllers/landing')
let user = require('../controllers/user');
let account = require('../controllers/account');
let strategy = require('../controllers/strategy');
let exchange = require('../controllers/exchange')
let strategyInstance = require('../controllers/strategyInstance');
let accountBroadcast = require('../controllers/accountBroadcast');
let userManager = require('../controllers/userManager');
let notificationManager = require('../controllers/notificationManager.js');
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
// Account addresses
router.get('/account/:account_id/addresses', isLoggedIn, account.show_addresses);
router.get('/account/:account_id/addresses/create', isLoggedIn, account.show_create_address)
router.post('/account/:account_id/addresses/create', isLoggedIn, account.submit_address)
router.post('/account-address/:account_address_id/delete/json', isLoggedIn, account.delete_address_json);
router.get('/account/:account_id/balance/json', isLoggedIn, account.get_balances_json);
router.post('/account/:account_id/transfer/json', isLoggedIn, account.transfer_json);

// Account Broadcast Transactions
router.get('/account/:account_id/broadcast-transactions', isLoggedIn, accountBroadcast.show_broadcasts);
router.get('/account/:account_id/broadcast-transactions/create', isLoggedIn, accountBroadcast.show_create);
router.post('/account/:account_id/broadcast-transactions/create', isLoggedIn, accountBroadcast.submit_broadcast);
router.get('/account-broadcast-transaction/:transaction_id', isLoggedIn, accountBroadcast.show_broadcast)
router.post('/account-broadcast-transaction/:transaction_id/delete', isLoggedIn, accountBroadcast.delete_broadcast);
router.post('/account-broadcast-transaction/:transaction_id/delete/json', isLoggedIn, accountBroadcast.delete_broadcast_json);
router.post('/account-broadcast-transaction/:transaction_id/send', isLoggedIn, accountBroadcast.send_broadcast);

/* Strategy related routes */
router.get('/strategies', isLoggedIn, strategy.show_strategies);
router.get('/strategies/create', isLoggedIn, strategy.show_create);
router.post('/strategies/create', isLoggedIn, strategy.submit_strategy);
router.post('/strategy/:strategy_id/delete', isLoggedIn, strategy.delete_strategy);
router.post('/strategy/:strategy_id/delete/json', isLoggedIn, strategy.delete_strategy_json);
router.get('/strategy/:strategy_id', isLoggedIn, strategy.show_strategy);
router.get('/strategy/:strategy_id/quantities', isLogged, strategy.show_qties);
router.post('/strategy/:strategy_id/quantities', isLoggedIn, strategy.submit_update_qty);
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

/* User manager routes */
router.get('/usermanager', isLoggedIn, hasAuth, userManager.show_users);
router.get('/usermanager/:user_id', isLoggedIn, hasAuth, userManager.show_user);
router.post('/usermanager/:user_id/update', isLoggedIn, hasAuth, userManager.update_user);
router.post('/usermanager/:user_id/delete', isLoggedIn, hasAuth, userManager.delete_user);
router.post('/usermanager/:user_id/delete/json', isLoggedIn, hasAuth, userManager.delete_user_json);

/* Notification manager routes */
router.get('/notificationmanager', isLoggedIn, hasAuth, notificationManager.show_notifications);
router.get('/notificationmanager/create-telegram', isLoggedIn, hasAuth, notificationManager.create_telegram);
router.post('/notificationmanager/create-telegram', isLoggedIn, hasAuth, notificationManager.post_telegram);
router.get('/notificationmanager/telegram/:telegram_id', isLoggedIn, hasAuth, notificationManager.edit_telegram);
router.post('/notificationmanager/telegram/:telegram_id/update', isLoggedIn, hasAuth, notificationManager.update_telegram);
router.post('/notificationmanager/telegram/:telegram_id/delete', isLoggedIn, hasAuth, notificationManager.delete_telegram);
router.post('/notificationmanager/telegram/:telegram_id/delete/json', isLoggedIn, hasAuth, notificationManager.delete_telegram_json);
router.post('/notificationmanager/telegram/:telegram_id/test/json', isLoggedIn, hasAuth, notificationManager.test_telegram_json);

module.exports = router;
