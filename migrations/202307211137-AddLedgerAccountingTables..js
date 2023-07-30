'use strict'

/** @typedef {import('sequelize').QueryInterface} QueryInterface */
/** @typedef {import('sequelize')} sequelize */

module.exports = {
    /**
     * 
     * @param {QueryInterface} queryInterface 
     * @param {sequelize} Sequelize 
     * @returns 
     */
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {

            await queryInterface.addColumn('accounts', 'synced_at', {
                allowNull: true,
                type: Sequelize.DATE
            }, {transaction});

            await queryInterface.createTable('account_sync_endpoints', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    autoIncrement: true
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts'
                        },
                        key: 'id'
                    }
                },
                endpoint: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                last_ts: {
                    allowNull: false,
                    type: Sequelize.BIGINT,
                },
                last_timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                pending_ts_start: {
                    allowNull: true,
                    type: Sequelize.BIGINT,
                },
                pending_ts_end: {
                    allowNull: true,
                    type: Sequelize.BIGINT,
                }
            },
            {
                uniqueKeys: {
                    unique_trade: {
                        customIndex: true,
                        fields: ['account_id', 'endpoint']
                    }
                },
                transaction
            });

            await queryInterface.createTable('account_ledgers', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.BIGINT,
                    autoIncrement: true
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts'
                        },
                        key: 'id'
                    }
                },
                exchange: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                exchange_holder: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                exchange_account: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                wallet: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                exchange_txid: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                order_id: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                related_id: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                symbol: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                asset: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                tx_ts: {
                    allowNull: false,
                    type: Sequelize.BIGINT,
                },
                tx_timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                tx_datetime: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                tx_type: {
                    allowNull: false,
                    type: Sequelize.ENUM(
                        'Trade', 'Fee', 'Deposit', 'Withdrawal',
                        'Transfer', 'Settlement', 'OtherCredit', 'OtherDebit'
                    ),
                }, 
                tx_subtype: {
                    allowNull: true,
                    type: Sequelize.ENUM(
                        'SpotTrade','DerivativeTrade',
                        'TradingFee', 'FundingFee', 'WithdrawalFee','CanceledWithdrawalFee','DepositFee', 'OtherFee',
                        'Deposit', 
                        'Withdrawal', 'CanceledWithdrawal',
                        'WalletTransfer', 'SubaccountTransfer',
                        'Settlement',
                        'OtherCredit',
                        'OtherDebit'
                    ),
                },
                amount: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15),
                },
                amount_change: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15),
                },
                balance: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15),
                },
                description: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                status: {
                    allowNull: true,
                    type: Sequelize.ENUM(
                        'ok', 'canceled', 'pending' 
                    ),
                },
                other_data: {
                    allowNull: true,
                    type: Sequelize.JSONB,
                }
            },
            {
                uniqueKeys: {
                    unique_tx: {
                        customIndex: true,
                        fields: ['account_id', 'exchange_txid']
                    }
                },
                transaction
            });

            await queryInterface.addIndex(
                'account_ledgers',
                 ['tx_type', 'tx_subtype'],
                { transaction }
            );

            await queryInterface.addIndex(
                'account_ledgers',
                 ['tx_ts', 'exchange_txid'],
                { transaction }
            );

            await queryInterface.addIndex(
                'account_ledgers',
                 ['asset', 'wallet'],
                { transaction }
            );

            await queryInterface.createTable('account_executions', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.BIGINT,
                    autoIncrement: true
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                account_id: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    references: {
                        model: {
                            tableName: 'accounts'
                        },
                        key: 'id'
                    }
                },
                exchange: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                exchange_holder: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                exchange_account: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                wallet: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                symbol: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                exchange_order_id: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                exchange_trade_id: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                ts: {
                    allowNull: false,
                    type: Sequelize.BIGINT
                },
                timestamp: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                datetime: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                price: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30, 15)
                },
                amount: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30, 15)
                },
                cost: {
                    allowNull: false,
                    type: Sequelize.DECIMAL(30, 15)
                },
                fee_cost: {
                    allowNull: true,
                    type: Sequelize.DECIMAL(30, 15)
                },
                fee_coin: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                matched_exchange_order_id: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                instance_tag: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
            },
            {
                uniqueKeys: {
                    unique_trade: {
                        customIndex: true,
                        fields: ['account_id', 'symbol', 'exchange_trade_id']
                    }
                },
                transaction
            });

            await queryInterface.addIndex(
                'account_executions',
                 ['ts'],
                { transaction }
            );
            
        });
    },
    
    /**
     * 
     * @param {QueryInterface} queryInterface 
     * @param {sequelize} Sequelize 
     * @returns 
     */
    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeIndex(
                'account_executions',
                ['ts'],
                { transaction }
            );
            await queryInterface.dropTable('account_executions', {transaction});
            await queryInterface.removeIndex(
                'account_ledgers',
                ['tx_type', 'tx_subtype'],
                { transaction }
            );
            await queryInterface.removeIndex(
                'account_ledgers',
                ['tx_ts', 'exchange_txid'],
                { transaction }
            );
            await queryInterface.removeIndex(
                'account_ledgers',
                ['asset', 'wallet'],
                { transaction }
            );
            await queryInterface.dropTable('account_ledgers', {transaction});
            await queryInterface.sequelize.query(
                'DROP TYPE "enum_account_ledgers_tx_type";',
                {transaction}
            );
            await queryInterface.sequelize.query(
                'DROP TYPE "enum_account_ledgers_tx_subtype";',
                {transaction}
            );


            await queryInterface.dropTable('account_sync_endpoints', {transaction});
            await queryInterface.removeColumn('accounts', 'synced_at', {transaction});
        });

    }
}