const { default: BigNumber } = require('bignumber.js');
const { parse } = require('csv-parse');
const fs = require('fs');
const { clone } = require('lodash');

/** @typedef {import('grid-bot/src/crypto/exchanges/BaseExchange').BaseExchange} BaseExchange */

/**
 * @typedef {Object} ImportGridEntry
 * @property {number} price
 * @property {number} qty
 * @property {numner} cost
 * @property {number} positionBeforeExecution
 * @property {number} orderQty
 * @property {number} userOrderQty
 * @property {string|undefined} side
 * @property {string|undefined} userSide
 * @property {boolean} active
 */

/**
 * @typedef {Object} ImportGrid
 * @property {string} strategyName
 * @property {string} strategyType
 * @property {string} accountId
 * @property {string} symbol
 * @property {number} activeBuys
 * @property {number} activeSells
 * @property {number} initialPrice
 * @property {number} initialPosition
 * @property {CsvGridEntry[]} grid
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
                /** @type CsvGridEntry */
                let gridEntry = {
                    price: csvrow[0] != null ? exchange.priceToPrecision2(symbol, parseFloat(csvrow[0])) : null,
                    qty: csvrow[1] != null ? exchange.amountToPrecision2(symbol, parseFloat(csvrow[1])) : null,
                    cost: 0,
                    positionBeforeExecution: null,
                    orderQty: null,
                    userOrderQty: csvrow[2] != null ? exchange.amountToPrecision2(symbol, parseFloat(csvrow[3])) : null,
                    side: null,
                    userSide: csvrow[3] != null ? (csvrow[4].toLowerCase() == 'buy'?'buy':'sell') : null,
                    active: null, 
                };
                gridEntry.cost = exchange.priceToPrecision2(symbol, new BigNumber(gridEntry.price).multipliedBy(gridEntry.qty).toFixed());
                gridEntries.push(gridEntry);
            }).on('end',function() {
                resolve(gridEntries);
            }).on('error', function(err){
                reject(err);
            });  
    });
}

/**
 * 
 * @param {ImportGrid} grid 
 * @return {ImportGrid}
 */
const cloneGrid = function(grid) {
    /** @type {ImportGrid} */
    let cloned = {
        accountId: grid.accountId,
        activeBuys: grid.activeBuys,
        activeSells: grid.activeSells,
        grid: [],
        initialPosition: grid.initialPosition,
        initialPrice: grid.initialPrice,
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
            userOrderQty: entry.userOrderQty,
            userSide: entry.userSide
        };
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

    cloned.initialPrice = newPrice;
    // ir generando ordenes a crear por niveles desde ese nivel 0
    let currentPosition = new BigNumber(grid.initialPosition);
    for(let i=index-1, activeSells=cloned.activeSells;i>0 && activeSells>0; i--, activeSells--) {
        /** @type {ImportGridEntry} */
        let entry = cloned.grid[i];
        entry.active = false;
        entry.orderQty = exchange.amountToPrecision2(grid.symbol, entry.qty);
        entry.side = 'sell';
        entry.positionBeforeExecution = exchange.amountToPrecision2(grid.symbol, currentPosition.toFixed());
        entry.active = true;
        currentPosition = currentPosition.minus(entry.orderQty);
    }

    currentPosition = new BigNumber(grid.initialPosition);
    for(let i=index+1, activeBuys=cloned.activeBuys;i<cloned.grid.length && activeBuys > 0;i++, activeBuys--) {
        /** @type {ImportGridEntry} */
        let entry = cloned.grid[i];
        entry.active = false;
        entry.orderQty = exchange.amountToPrecision2(grid.symbol, entry.qty);
        entry.side = 'buy';
        entry.positionBeforeExecution = exchange.amountToPrecision2(grid.symbol, currentPosition.toFixed());
        entry.active = true;
        currentPosition = currentPosition.plus(entry.orderQty);
    }

    return cloned;
}

module.exports = {
    parseCsv, checkValidity, recalculateForPrice, cloneGrid
}