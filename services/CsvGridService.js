const { default: BigNumber } = require('bignumber.js');
const { parse } = require('csv-parse');
const fs = require('fs');
const models = require('../models');

/** @typedef {import('grid-bot/src/crypto/exchanges/BaseExchange').BaseExchange} BaseExchange */

/**
 * @typedef {Object} PriceUpdateEntry
 * @property {number} price,
 * @property {string} priceTag
 * @property {string} priceField
 * @property {number} newPrice
 * @property {number} orderQty
 * @property {number} qty
 */

/**
 * @typedef {Object} GridUpdateData
 * @property {PriceUpdateEntry[]} prices
 * @property {number} initial_position
 * @property {number} active_sells
 * @property {number} active_buys
 */

/**
 * @typedef {Object} ImportGridEntryDup
 * @property {number} orderQty
 * @property {number} filled
 * @property {string|undefined} side
 * @property {boolean} active
 * @property {number} order_id
 * @property {number} matching_order_id
 * 
 */

/**
 * @typedef {Object} ImportGridEntry
 * @property {number} price
 * @property {number} qty
 * @property {numner} cost
 * @property {number} positionBeforeExecution
 * @property {number} orderQty
 * @property {number} filled
 * @property {string|undefined} side
 * @property {boolean} active
 * @property {number} order_id
 * @property {number} matching_order_id
 * @property {number} lastQty
 * @property {number} lastOrderQty
 * @property {number} lastFilled
 * @property {string|undefined} lastSide
 * @property {number} newOrderQty
 * @property {number} newQty
 * @property {ImportGridEntryDup[]} dups
 */

/**
 * @typedef {Object} ImportGrid
 * @property {number|undefined} instanceId
 * @property {string} strategyName
 * @property {string} strategyType
 * @property {string} accountId
 * @property {string} symbol
 * @property {number} activeBuys
 * @property {number} activeSells
 * @property {number} price
 * @property {number} currentPrice
 * @property {number} currentPriceTimestamp
 * @property {number} initialPosition
 * @property {number} lastPrice
 * @property {ImportGridEntry[]} grid
 */

/**
 * @typedef {Object} GridCacheData
 * @property {ImportGrid} orig
 * @property {ImportGrid|null} grid
 */


/**
 * @param {string} csvFile
 * @param {BaseExchange} exchange
 */
const parseCsv = function(csvFile, symbol, exchange) {
    return new Promise((resolve, reject) => {
        let gridEntries = [];
        fs.createReadStream(csvFile)
            .pipe(parse({delimiter: ','}))
            .on('data', function(csvrow) {
                /** @type ImportGridEntry */
                let gridEntry = {
                    price: csvrow[0] != null ? exchange.priceToPrecision2(symbol, parseFloat(csvrow[0])) : null,
                    qty: csvrow[1] != null ? exchange.amountToPrecision2(symbol, parseFloat(csvrow[1])) : null,
                    cost: 0,
                    positionBeforeExecution: null,
                    filled: 0,
                    orderQty: null,
                    side: null,
                    active: null,
                    order_id: null,
                    matching_order_id: null,
                    lastQty: null,
                    lastOrderQty: csvrow[2] != null ? exchange.amountToPrecision2(symbol, parseFloat(csvrow[3])) : null,
                    lastSide: csvrow[3] != null ? (csvrow[4].toLowerCase() == 'buy'?'buy':'sell') : null,
                    lastFilled: 0,
                    newOrderQty: null,
                    newQty: null,
                    dups: [] 
                };
                gridEntry.lastQty = gridEntry.qty;
                gridEntry.orderQty = gridEntry.lastOrderQty;
                gridEntry.side = gridEntry.lastSide;
                gridEntry.cost = exchange.priceToPrecision2(symbol, new BigNumber(gridEntry.price).multipliedBy(gridEntry.qty).toFixed());
                gridEntries.push(gridEntry);
            }).on('end',function() {
                resolve(gridEntries);
            }).on('error', function(err){
                reject(err);
            });  
    });
}

const parseFromInstance = async function(instance, exchange) {

    let gridRecords = await models.StrategyInstanceGrid.findAll({
        where:{ strategy_instance_id: instance.id},
        include: [
            models.StrategyInstanceGrid.StrategyInstanceRecoveryGrid
        ],
        order: [
            ['buy_order_id', 'ASC']
        ]
    });

    let symbol = instance.strategy.symbol;

    /** @type {ImportGrid} */
    let grid = {
        instanceId: instance.id,
        strategyName: instance.strategy.strategy_name,
        strategyType: instance.strategy.strategy_type.strategy_type,
        accountId: instance.strategy.account_id,
        symbol: symbol,
        activeBuys: instance.strategy.active_buys,
        activeSells: instance.strategy.active_sells,
        currentPrice: null,
        currentPriceTimestamp: null,
        price: null,
        lastPrice: null,
        initialPosition: exchange.amountToPrecision2(symbol, instance.strategy.initial_position),
        grid: [],
    };

    let lastSide = null;
    let lastPrice = null;
    let gridPrice = null;
    for(let i=0;i<gridRecords.length;i++) {    
        let rec = gridRecords[i];
        /** @type {ImportGridEntry} */
        let gridEntry = {
            price: exchange.priceToPrecision2(symbol, rec.price),
            // we only handle buy_order_qty and should be the same that sell_order_qty
            qty: exchange.amountToPrecision2(symbol, rec.buy_order_qty),
            cost: exchange.priceToPrecision2(symbol, rec.buy_order_cost),
            positionBeforeExecution: rec.position_before_order ? exchange.amountToPrecision2(symbol, rec.position_before_order): null,
            orderQty: rec.order_qty ? exchange.amountToPrecision2(symbol, rec.order_qty): null,
            filled: rec.filled ? exchange.amountToPrecision2(symbol, rec.filled) : null,
            side: rec.side,
            active: rec.active,
            order_id: rec.order_id,
            matching_order_id: rec.matching_order_id,
            lastQty: null,
            lastOrderQty: null,
            lastSide: null,
            lastFilled: null,
            newOrderQty: null,
            newQty: null,
            dups: [] 
        };

        if (gridPrice == null) {
            if (i == 1){
                if (lastSide == null && gridEntry.side == 'buy') {
                    gridPrice = lastPrice;
                }
            } else if (i == gridRecords.length - 1) {
                if (lastSide == 'sell' && gridEntry.side == null) {
                    gridPrice = gridEntry.price;
                }
            } else if (lastSide == 'sell' && gridEntry.side == null && gridRecords[i+1].side == 'buy') {
                gridPrice = gridEntry.price;
            }
        }

        lastSide = gridEntry.side;
        lastPrice = gridEntry.price;

        gridEntry.lastQty = gridEntry.qty;
        gridEntry.lastOrderQty = gridEntry.orderQty;
        gridEntry.lastSide = gridEntry.side;
        gridEntry.lastFilled = gridEntry.filled;
        
        for(let j=0;j<rec.recovery_grids.length;j++) {
            let recDup = rec.recovery_grids[j];
            /** @type {ImportGridEntryDup} */
            let dup = {
                orderQty: recDup.order_qty ? exchange.amountToPrecision2(symbol, recDup.order_qty) : null,
                filled: recDup.filled ? exchange.amountToPrecision2(symbol, recDup.filled) : null,
                side: recDup.side,
                active: recDup.active,
                order_id: recDup.order_id,
                matching_order_id: recDup.matching_order_id,
            };
            gridEntry.dups.push(dup);
        }

        grid.grid.push(gridEntry);
    }

    grid.price = gridPrice;
    grid.lastPrice = gridPrice;

    return grid;
}

/**
 * 
 * @param {ImportGrid} grid 
 * @return {ImportGrid}
 */
const cloneGrid = function(grid) {
    /** @type {ImportGrid} */
    let cloned = {
        instanceId: grid.instanceId,
        accountId: grid.accountId,
        activeBuys: grid.activeBuys,
        activeSells: grid.activeSells,
        grid: [],
        initialPosition: grid.initialPosition,
        currentPrice: grid.currentPrice,
        currentPriceTimestamp: grid.currentPriceTimestamp,
        price: grid.price,
        lastPrice: grid.lastPrice,
        strategyName: grid.strategyName,
        symbol: grid.symbol,
        strategyType: grid.strategyType,
    };

    for(let i=0;i<grid.grid.length;i++) {
        /** @type {ImportGridEntry} */
        let entry = grid.grid[i];
        /** @type {ImportGridEntry} */
        let clonedEntry = {
            active: entry.active,
            cost: entry.cost,
            orderQty: entry.orderQty,
            positionBeforeExecution: entry.positionBeforeExecution,
            price: entry.price,
            qty: entry.qty,
            side: entry.side,
            order_id: entry.order_id,
            matching_order_id: entry.matching_order_id,
            lastQty: entry.lastQty,
            lastOrderQty: entry.lastOrderQty,
            lastSide: entry.lastSide,
            lastFilled: entry.lastFilled,
            newOrderQty: entry.newOrderQty,
            newQty: entry.newQty,
            dups: []
        };
        for(let j=0;j<entry.dups.length;j++) {
            /** @type {ImportGridEntryDup} */
            let dup = entry.dups[j];
            /** @type {ImportGridEntryDup} */
            let dupEntry = {
                active: dup.active,
                filled: dup.filled,
                orderQty: dup.orderQty,
                side: dup.side,
            }
            clonedEntry.dups.push(dupEntry);
        }

        cloned.grid.push(clonedEntry);
    }

    return cloned;
}

/**
 * 
 * @param {ImportGrid} grid 
 */
const checkValidity = function(grid) {
    // check min number of entries

    // check prices are descending

    // check if some side is set, then all should be set
    
}

/**
 * @param {ImportGrid} grid
 * @param {number} newPrice
 * @param {BaseExchange} exchange
 * @return {ImportGrid} 
 */
const recalculateForPrice = function(grid, newPrice, exchange) {
    let cloned = cloneGrid(grid);
    // ver donde cae el price y ese es el nivel 0
    let index = 0;
    let diffPrice = Math.abs(cloned.grid[0].price - newPrice);
    cloned.grid.forEach(
        /**
         * 
         * @param {ImportGridEntry} v 
         * @param {number} i 
         */
        (v, i) => {
            let currentDiff = Math.abs(v.price - newPrice);
            if (currentDiff <= diffPrice) {
                index = i;
                diffPrice = currentDiff;
            }
        }
    );

    cloned.price = newPrice;

    let entry = cloned.grid[index];
    entry.orderQty = null;
    entry.side = null;
    entry.positionBeforeExecution = null;
    entry.active = null;
    entry.filled = null;


    for (let i=0; i<cloned.grid.length;i++) {
        /** @type {ImportGridEntry} */
        let entry = cloned.grid[i];
        entry.qty = exchange.amountToPrecision2(grid.symbol, entry.newQty != null ? entry.newQty : entry.lastQty);
        entry.cost = exchange.priceToPrecision2(grid.symbol, new BigNumber(entry.price).multipliedBy(entry.qty).toFixed());
    }

    // ir generando ordenes a crear por niveles desde ese nivel 0
    let currentPosition = new BigNumber(grid.initialPosition);
    for(let i=index-1, activeSells=cloned.activeSells;i>=0; i--, activeSells--) {
        /** @type {ImportGridEntry} */
        let entry = cloned.grid[i];
        if (activeSells > 0) {
            if (entry.newOrderQty != null) {
                entry.orderQty = entry.newOrderQty;
                entry.filled = 0;
            } else if (entry.lastOrderQty != null && entry.matching_order_id != null) {
                // create matched order
                entry.orderQty = entry.lastOrderQty;
                entry.filled = entry.lastFilled;
            } else {
                entry.orderQty = exchange.amountToPrecision2(grid.symbol, entry.qty);
            }
            entry.side = 'sell';
            entry.positionBeforeExecution = exchange.amountToPrecision2(grid.symbol, currentPosition.toFixed());
            entry.active = false;
            entry.filled = 0;
            currentPosition = currentPosition.minus(entry.orderQty);
        } else {
            if (entry.lastOrderQty != null && entry.matching_order_id != null) {
                entry.orderQty = entry.lastOrderQty;
            } else {
                entry.orderQty = null;
            }
            entry.side = null;
            entry.positionBeforeExecution = null;
            entry.active = null;
            entry.filled = null;
        }
    }

    currentPosition = new BigNumber(grid.initialPosition);
    for(let i=index+1, activeBuys=cloned.activeBuys;i<cloned.grid.length;i++, activeBuys--) {
        /** @type {ImportGridEntry} */
        let entry = cloned.grid[i];
        if (activeBuys > 0) {
            if (entry.newOrderQty != null) {
                entry.orderQty = entry.newOrderQty;
                entry.filled = 0;
            } else if (entry.lastOrderQty != null && entry.matching_order_id != null) {
                // create matched order
                entry.orderQty = entry.lastOrderQty;
                entry.filled = entry.lastFilled;
            } else {
                entry.orderQty = exchange.amountToPrecision2(grid.symbol, entry.qty);
            }
            entry.side = 'buy';
            entry.positionBeforeExecution = exchange.amountToPrecision2(grid.symbol, currentPosition.toFixed());
            entry.active = false;
            entry.filled = 0;
            currentPosition = currentPosition.plus(entry.orderQty);
        } else {
            if (entry.lastOrderQty != null && entry.matching_order_id != null) {
                entry.orderQty = entry.lastOrderQty;
            } else {
                entry.orderQty = null;
            }
            entry.side = null;
            entry.positionBeforeExecution = null;
            entry.active = null;
            entry.filled = null;
        }
    }

    return cloned;
}

/**
 * 
 * @param {ImportGrid} data 
 * @param {string} price 
 */
const getPriceEntry = function (data, price) {
    for(let i=0;i<data.grid.length;i++) {
        let entry = data.grid[i];
        if (entry.price == price) {
            return entry;
        }
    }

    return null;
}

const removePriceEntry = function (data, price) {
    for(let i=0;i<data.grid.length;i++) {
        let entry = data.grid[i];
        if (entry.price == price) {
            data.grid.splice(i, 1);
            break;
        }
    }

}

/**
 * 
 * @param {ImportGrid} data 
 * @param {int} rows 
 */
const addPrices = function (data, rows, up = false) {
    for(let i=0;i<rows;i++) {
        /** @type {ImportGridEntry} */
        let newEntry;
        if (data.grid.length == 0) {
            newEntry = {
                active: null,
                cost: null,
                dups: [],
                filled: null,
                lastFilled: null,
                lastOrderQty: null,
                lastQty: 1,
                lastSide: null,
                matching_order_id: null,
                newOrderQty: null,
                newQty: null,
                order_id: null,
                orderQty: null,
                positionBeforeExecution: null,
                price: 1,
                qty: null,
                side: null,
            };
        } else {
            let other = data.grid[up ? 0 : data.grid.length-1];
            newEntry = {
                active: null,
                cost: null,
                dups: [],
                filled: null,
                lastFilled: null,
                lastOrderQty: null,
                lastQty: other.lastQty,
                lastSide: null,
                matching_order_id: null,
                newOrderQty: null,
                newQty: null,
                order_id: null,
                orderQty: null,
                positionBeforeExecution: null,
                price: up ? new BigNumber(other.price).plus(1): new BigNumber(other.price).minus(1),
                qty: null,
                side: null,
            }
        }
        up ? data.grid.unshift(newEntry) : data.grid.push(newEntry);
    }
}

/**
 * 
 * @param {ImportGrid} grid
 * @param {BaseExchange} exchange
 * @param {GridUpdateData} updateData 
 */
const updateGridData = function(exchange, data, updateData) {
    data.initialPosition = updateData.initial_position;
    data.activeSells = updateData.active_sells;
    data.activeBuys = updateData.active_buys;
    for(let i=0;i<updateData.prices.length;i++) {
        let price = updateData.prices[i];
        let gridEntry = getPriceEntry(data, price.priceTag);
        if (price.newPrice.isNaN()) {
            removePriceEntry(data, price.priceTag);
        } else {
            if (gridEntry != null) {
                gridEntry.price = exchange.priceToPrecision2(data.symbol, price.newPrice.toFixed());
            }    
        }

        if (gridEntry != null) {
            if (price.orderQty == null) {
                gridEntry.newOrderQty = null;
            } else if (!price.orderQty.isNaN()) {
                gridEntry.newOrderQty = exchange.amountToPrecision2(data.symbol, price.orderQty.toFixed());
            } else {
                gridEntry.newOrderQty = null;
            }

            if (price.qty == null) {
                gridEntry.newQty = null;
            } else if (!price.qty.isNaN()) {
                gridEntry.newQty = exchange.amountToPrecision2(data.symbol, price.qty.toFixed());
            } else {
                gridEntry.newQty = null;
            }
        }
    }
}

/**
 * 
 * @param {ImportGrid} data 
 * @param {number|null} instanceId 
 * @returns 
 */
const dbUpdateOrCreateGrid = function (data, instanceId) {
    console.log(data);
    // TODO: use repository classes!!!!
    return models.sequelize.transaction(async (transaction) => {
        let instance;
        if (instanceId != null) {
            instance = await models.StrategyInstance.findOne({where:{id: instanceId}});
            if (instance == null) {
                return null;
            }

            await models.StrategyInstance.update({
                active_buys: data.activeBuys,
                active_sells: data.activeSells,
                initial_position: data.initialPosition,
            },{
                where: {id: instance.id},
                transaction
            });

            await models.StrategyInstanceGrid.destroy({
                where: {strategy_instance_id: instance.id},
                transaction
            });
        } else {
            let strategyType = await models.StrategyType.findOne({
                where: {id: data.strategyType}
            });

            let account = await models.Account.findOne({
                where: {id: data.accountId}
            })

            if (strategyType == null || account == null) {
                return null;
            }

            let buyOrders = Math.floor(data.grid.length/2);
            let strategy = await models.Strategy.create({
                strategy_type_id: strategyType.id,
                strategy_name: data.strategyName,
                account_id: data.accountId,
                symbol: data.symbol,
                initial_position: data.initialPosition,
                order_qty:  data.grid[0].qty,
                buy_orders: buyOrders,
                sell_orders: data.grid.length - buyOrders,
                active_buys: data.activeBuys,
                active_sells: data.activeSells,
                step: data.grid[0].price - data.grid[1].price,
                step_type: 'absolute',
            });

            instance = await models.StrategyInstance.create({
                strategy_id: strategy.id,
                running: false,
                started_at: null,
                stopped_at: null,
                stop_requested_at: null,
                is_dirty: false,
                dirty_at: null,
                nofunds: false,
                nofunds_at: null,
                nofunds_currency: null,
                is_syncing: false,
                syncing_at: null,
                initial_position: data.initialPosition,
                active_buys: data.activeBuys,
                active_sells: data.activeSells,
            });
        }

        for(let i=0;i<data.grid.length;i++) {
            let entry = data.grid[i];
            await models.StrategyInstanceGrid.create({
                strategy_instance_id: instance.id,
                price: entry.price,
                buy_order_id: i+1,
                buy_order_qty: entry.qty,
                buy_order_cost: entry.cost,
                sell_order_id: i+2,
                sell_order_qty: entry.qty,
                sell_order_cost: entry.cost,
                position_before_order: entry.positionBeforeExecution,
                order_qty: entry.orderQty,
                side: entry.side,
                active: entry.active,
                exchange_order_id: null,
                order_id: null,
                matching_order_id: entry.matching_order_id,
                filled: entry.matching_order_id != null ? entry.filled : null,
            }, {
                transaction
            });
        }

        await models.StrategyInstance.update({
            running: true,
            started_at: models.Sequelize.fn('NOW'),
            stopped_at: null,
            stop_requested_at: null,
            is_dirty: false,
            dirty_at: null,
        }, {
            where:{id: instance.id},
            transaction
        })

        if (instanceId != null) {
            await models.StrategyInstanceEvent.create({
                strategy_instance_id: instance.id,
                event: 'GridRecovered',
                level: 3,
                message: 'Grid recovered',
                params: {},
            });
        } else {
            await models.StrategyInstanceEvent.create({
                strategy_instance_id: instance.id,
                event: 'GridStarted',
                level: 3,
                message: 'Grid Started',
                params: {},
            });
        }

        return instance.id;

    });
}

module.exports = {
    parseCsv, checkValidity, recalculateForPrice, cloneGrid,parseFromInstance, getPriceEntry,
    removePriceEntry, addPrices, updateGridData, dbUpdateOrCreateGrid
}