const { default: BigNumber } = require('bignumber.js');
const { parse } = require('csv-parse');
const fs = require('fs');
const models = require('../models');

/** @typedef {import('grid-bot/src/crypto/exchanges/BaseExchange').BaseExchange} BaseExchange */

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
 * @property {number} lastOrderQty
 * @property {number} lastFilled
 * @property {string|undefined} lastSide
 * @property {number} userQty
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
 * @property {number} initialPosition
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
                    lastOrderQty: csvrow[2] != null ? exchange.amountToPrecision2(symbol, parseFloat(csvrow[3])) : null,
                    lastSide: csvrow[3] != null ? (csvrow[4].toLowerCase() == 'buy'?'buy':'sell') : null,
                    lastFilled: 0,
                    userQty: null,
                    dups: [] 
                };
                grid.orderQty = grid.lastOrderQty;
                grid.side = grid.lastSide;
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
        price: null,
        initialPosition: instance.strategy.initial_position,
        grid: [],
    };

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
            lastOrderQty: null,
            lastSide: null,
            lastFilled: null,
            userQty: null,
            dups: [] 
        };

        gridEntry.lastOrderQty = gridEntry.orderQty;
        gridEntry.lastSide = gridEntry.side;
        gridEntry.lastFilled = gridEntry.filled;
        
        for(let j=0;j<rec.recovery_grids.length;j++) {
            let recDup = rec.recovery_grids[j];
            /** @type {ImportGridEntryDup} */
            let dup = {
                orderQty: recDup.orer_qty ? exchange.amountToPrecision2(symbol, recDup.order_qty) : null,
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
        price: grid.price,
        strategyName: grid.strategyName,
        symbol: grid.symbol,
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
            lastOrderQty: entry.lastOrderQty,
            lastSide: entry.lastSide,
            lastFilled: entry.lastFilled,
            userQty: entry.userQty,
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

    // ir generando ordenes a crear por niveles desde ese nivel 0
    let currentPosition = new BigNumber(grid.initialPosition);
    for(let i=index-1, activeSells=cloned.activeSells;i>=0; i--, activeSells--) {
        /** @type {ImportGridEntry} */
        let entry = cloned.grid[i];
        if (activeSells > 0) {
            if (entry.userQty != null) {
                entry.orderQty = entry.userQty;
                entry.filled = 0;
            } else if (entry.lastOrderQty != null && entry.matching_order_id == null) {
                // create matched order
                entry.orderQty = entry.lastOrderQty;
                entry.filled = entry.lastFilled;
            } else {
                entry.orderQty = exchange.amountToPrecision2(grid.symbol, entry.qty);
            }
            entry.side = 'sell';
            entry.positionBeforeExecution = exchange.amountToPrecision2(grid.symbol, currentPosition.toFixed());
            entry.active = true;
            entry.filled = 0;
            currentPosition = currentPosition.minus(entry.orderQty);
        } else {
            entry.orderQty = null;
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
            if (entry.userQty != null) {
                entry.orderQty = entry.userQty;
                entry.filled = 0;
            } else if (entry.lastOrderQty != null && entry.matching_order_id == null) {
                // create matched order
                entry.orderQty = entry.lastOrderQty;
                entry.filled = entry.lastFilled;
            } else {
                entry.orderQty = exchange.amountToPrecision2(grid.symbol, entry.qty);
            }
            entry.side = 'buy';
            entry.positionBeforeExecution = exchange.amountToPrecision2(grid.symbol, currentPosition.toFixed());
            entry.active = true;
            entry.filled = 0;
            currentPosition = currentPosition.plus(entry.orderQty);
        } else {
            entry.orderQty = null;
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

module.exports = {
    parseCsv, checkValidity, recalculateForPrice, cloneGrid,parseFromInstance, getPriceEntry,
    removePriceEntry
}