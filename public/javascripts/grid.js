
$( document ).ready(function() {    
    populateAll();
});

function populateAll() {
    populateGrid();
    populateOrders();
    populateTrades();
    populateEvents();
}

function populate(res, $tableTbody, dataAttr, genFunc, updateFunc) {
    let index = 0;
    let resLen = res.length;
    $tableTbody.find('tr').each(function(i) {
        //var index = $(this).index();
        //var text = $(this).text();
        let $current = $(this);
        const data = $current.data(dataAttr);
        if (data == undefined) return;
        while (true) {
            let elem = res[index];
            if (index >= resLen) {
                // no more data, remove this element
                $current.remove();
                // return to next
                return;
            } else if (data > elem[dataAttr]) {
                // current price above got from server, remove this element
                $current.remove();
                // return to next
                return;
            } else if (data == elem[dataAttr]) {
                // update this element with new data
                updateFunc(elem, $current);
                // increment index
                index++;
                // return to next
                return;
            } else {
                // insert above this element
                genFunc(elem).insertBefore($current);
                // increment index
                index++;
            }
        }
    })
    for (; index < resLen; index++) {
        $tableTbody.append(genFunc(res[index]));
    }
}

function genGridGridOrder(elem) {
    let gridOrder = '';
    if (elem.side == 'sell') {
        gridOrder = elem.sell_order_id;
    } else if (elem.side == 'buy') {
        gridOrder = elem.buy_order_id;
    }

    return gridOrder;
}
function genGridPrice(elem) {
    return $('<tr>').data('price', elem.price)
    .append($('<td>').text(elem.price))
    .append($('<td>').text(elem.buy_order_id))
    .append($('<td>').text(elem.buy_order_qty))
    .append($('<td>').text(elem.buy_order_cost))
    .append($('<td>').text(elem.sell_order_id))
    .append($('<td>').text(elem.sell_order_qty))
    .append($('<td>').text(elem.sell_order_cost))
    .append($('<td>').text(elem.position_before_order))
    .append($('<td>').text(elem.order_qty))
    .append($('<td>').text(elem.side))
    .append($('<td>').text(elem.active))
    .append($('<td>').text(genGridGridOrder(elem)))
    .append($('<td>').text(elem.exchange_order_id))
    .append($('<td>').text(elem.matching_order_id))
    .append($('<td>').text(elem.order_id));
}

function updateGridPrice(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.eq(0).text(elem.price)
    $tds.eq(1).text(elem.buy_order_id)
    $tds.eq(2).text(elem.buy_order_qty)
    $tds.eq(3).text(elem.buy_order_cost)
    $tds.eq(4).text(elem.sell_order_id)
    $tds.eq(5).text(elem.sell_order_qty)
    $tds.eq(6).text(elem.sell_order_cost)
    $tds.eq(7).text(elem.position_before_order)
    $tds.eq(8).text(elem.order_qty)
    $tds.eq(9).text(elem.side)
    $tds.eq(10).text(elem.active)
    $tds.eq(11).text(genGridGridOrder(elem))
    $tds.eq(12).text(elem.exchange_order_id);
    $tds.eq(13).text(elem.matching_order_id);
    $tds.eq(14).text(elem.order_id);
}

function populateGrid() {
    let instanceId = $('#grid').data('instance');
    $.ajax({
        cache: false,
        url:'/strategy-instance/' + instanceId + '/grid/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            let $tableTbody = $('#grid tbody');
            res.sort((a, b) => parseFloat(a.price) > parseFloat(b.price) ? -1 : (parseFloat(a.price) < parseFloat(b.price) ? 1 : 0));
            populate(res, $tableTbody, 'price', genGridPrice, updateGridPrice);
            setTimeout(populateGrid, 20000);
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            console.log("Error:", jqXHR);
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }
            setTimeout(populateGrid, 20000);
        })
    });

}

function genGridOrder(elem) {
    return $('<tr>').data('order', elem.exchange_order_id)
    .append($('<td>').text(elem.price))
    .append($('<td>').text(elem.amount))
    .append($('<td>').text(elem.cost))
    .append($('<td>').text(elem.side))
    .append($('<td>').text(elem.status))
    .append($('<td>').text(elem.datetime))
    .append($('<td>').text(elem.filled))
    .append($('<td>').text(elem.average))
    .append($('<td>').text(elem.exchange_order_id))
    .append($('<td>').text(elem.id))
    .append($('<td>').text(elem.matching_order_id));
}


function updateGridOrder(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.eq(0).text(elem.price)
    $tds.eq(1).text(elem.amount)
    $tds.eq(2).text(elem.cost)
    $tds.eq(3).text(elem.side)
    $tds.eq(4).text(elem.status)
    $tds.eq(5).text(elem.datetime)
    $tds.eq(6).text(elem.filled)
    $tds.eq(7).text(elem.average)
    $tds.eq(8).text(elem.exchange_order_id);
    $tds.eq(9).text(elem.id);
    $tds.eq(10).text(elem.matching_order_id);
}

function populateOrders() {
    let instanceId = $('#grid').data('instance');
    $.ajax({
        cache: false,
        url:'/strategy-instance/' + instanceId + '/orders/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            let $tableTbody = $('#orders tbody');
            res.sort((a, b) => a.datetime > b.datetime ? -1 : (a.datetime < b.datetime ? 1 : 0));
            populate(res, $tableTbody, 'order', genGridOrder, updateGridOrder);
            setTimeout(populateOrders, 20000);
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            console.log("Error:", jqXHR);
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }

            setTimeout(populateOrders, 20000);
        })
    });

}

function genGridTrade(elem) {
    return $('<tr>').data('trade', elem.exchange_trade_id)
    .append($('<td>').text(elem.price))
    .append($('<td>').text(elem.amount))
    .append($('<td>').text(elem.cost))
    .append($('<td>').text(elem.side))
    .append($('<td>').text(elem.fee_cost))
    .append($('<td>').text(elem.fee_coin))
    .append($('<td>').text(elem.datetime))
    .append($('<td>').text(elem.taker_or_maker))
    .append($('<td>').text(elem.exchange_order_id))
    .append($('<td>').text(elem.exchange_trade_id));
}

function updateGridTrade(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.eq(0).text(elem.price)
    $tds.eq(1).text(elem.amount)
    $tds.eq(2).text(elem.cost)
    $tds.eq(3).text(elem.side)
    $tds.eq(4).text(elem.fee_cost)
    $tds.eq(5).text(elem.fee_coin)
    $tds.eq(6).text(elem.datetime)
    $tds.eq(7).text(elem.taker_or_maker)
    $tds.eq(8).text(elem.exchange_order_id)
    $tds.eq(9).text(elem.exchange_trade_id);
}

function populateTrades() {
    let instanceId = $('#grid').data('instance');
    $.ajax({
        cache: false,
        url:'/strategy-instance/' + instanceId + '/trades/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            let $tableTbody = $('#trades tbody');
            res.sort((a, b) => a.datetime > b.datetime ? -1 : (a.datetime < b.datetime ? 1 : 0));
            populate(res, $tableTbody, 'trade', genGridTrade, updateGridTrade);
            setTimeout(populateTrades, 20000);
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            console.log("Error:", jqXHR);
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }

            setTimeout(populateTrades, 20000);
        })
    });

}

function genGridEvent(elem) {
    return $('<tr>').data('event', elem.id)
    .append($('<td>').text(elem.datetime))
    .append($('<td>').text(elem.event))
    .append($('<td>').text(elem.message))
    .append($('<td>').text(JSON.stringify(elem.params)));
}

function updateGridEvent(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.eq(0).text(elem.datetime);
    $tds.eq(1).text(elem.event);
    $tds.eq(2).text(elem.message)
    $tds.eq(3).text(JSON.stringify(elem.params));
}

function populateEvents() {
    let instanceId = $('#grid').data('instance');
    $.ajax({
        cache: false,
        url:'/strategy-instance/' + instanceId + '/events/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            let $tableTbody = $('#events tbody');
            res.sort((a, b) => a.id > b.id ? -1 : (a.id < b.id ? 1 : 0));
            populate(res, $tableTbody, 'event', genGridEvent, updateGridEvent);
            setTimeout(populateEvents, 20000);
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            console.log("Error:", jqXHR);
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }

            setTimeout(populateEvents, 20000);
        })
    });

}

