
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
        const price = $current.data(dataAttr) | 0;
        while (true) {
            let elem = res[index];
            if (index >= resLen) {
                // no more data, remove this element
                $current.remove();
                // return to next
                return;
            } else if (price > elem.price) {
                // current price above got from server, remove this element
                $current.remove();
                // return to next
                return;
            } else if (price == elem.price) {
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

function genGridPrice(elem) {
    return $('<tr>').data('price', elem.price)
    .append('<td>').text(elem.price)
    .append('<td>').text(elem.buy_order_id)
    .append('<td>').text(elem.buy_order_qty)
    .append('<td>').text(elem.buy_order_cost)
    .append('<td>').text(elem.sell_order_id)
    .append('<td>').text(elem.sell_order_qty)
    .append('<td>').text(elem.sell_order_cost)
    .append('<td>').text(elem.position_before_order)
    .append('<td>').text(elem.order_qty)
    .append('<td>').text(elem.side)
    .append('<td>').text(elem.active)
    .append('<td>').text(0)
    .append('<td>').text(elem.exchange_order_id);
}

function updateGridPrice(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.get(1).text(elem.price)
    $tds.get(2).text(elem.buy_order_id)
    $tds.get(3).text(elem.buy_order_qty)
    $tds.get(4).text(elem.buy_order_cost)
    $tds.get(5).text(elem.sell_order_id)
    $tds.get(6).text(elem.sell_order_qty)
    $tds.get(7).text(elem.sell_order_cost)
    $tds.get(8).text(elem.position_before_order)
    $tds.get(9).text(elem.order_qty)
    $tds.get(10).text(elem.side)
    $tds.get(11).text(elem.active)
    $tds.get(12).text(0)
    $tds.get(13).text(elem.exchange_order_id);
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
            res.sort((a, b) => a.price > b.price ? -1 : (a.price < b.price ? 1 : 0));
            populate(res, $tableTbody, 'price', genGridPrice, updateGridPrice);
            setTimeout(populateGrid, 60000);
        }),
        error: ((error) => {
            console.log("Error:", error);
            setTimeout(populateGrid, 60000);
        })
    });

}

function genGridOrder(elem) {
    return $('<tr>').data('order', elem.exchange_order_id)
    .append('<td>').text(elem.price)
    .append('<td>').text(elem.amount)
    .append('<td>').text(elem.cost)
    .append('<td>').text(elem.side)
    .append('<td>').text(elem.status)
    .append('<td>').text(elem.datetime)
    .append('<td>').text(elem.filled)
    .append('<td>').text(elem.average)
    .append('<td>').text(elem.exchange_order_id);
}


function updateGridOrder(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.get(1).text(elem.price)
    $tds.get(2).text(elem.amount)
    $tds.get(3).text(elem.cost)
    $tds.get(4).text(elem.side)
    $tds.get(5).text(elem.status)
    $tds.get(6).text(elem.datetime)
    $tds.get(7).text(elem.filled)
    $tds.get(8).text(elem.average)
    $tds.get(9).text(elem.exchange_order_id);
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
            res.sort((a, b) => a.exchange_order_id > b.exchange_order_id ? -1 : (a.exchange_order_id < b.exchange_order_id ? 1 : 0));
            populate(res, $tableTbody, 'order', genGridOrder, updateGridOrder);
            setTimeout(populateOrders, 60000);
        }),
        error: ((error) => {
            console.log("Error:", error);
            setTimeout(populateOrders, 60000);
        })
    });

}

function genGridTrade(elem) {
    return $('<tr>').data('order', elem.exchange_order_id)
    .append('<td>').text(elem.price)
    .append('<td>').text(elem.amount)
    .append('<td>').text(elem.cost)
    .append('<td>').text(elem.side)
    .append('<td>').text(elem.status)
    .append('<td>').text(elem.datetime)
    .append('<td>').text(elem.filled)
    .append('<td>').text(elem.average)
    .append('<td>').text(elem.exchange_order_id);
}

function updateGridTrade(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.get(1).text(elem.price)
    $tds.get(2).text(elem.amount)
    $tds.get(3).text(elem.cost)
    $tds.get(4).text(elem.side)
    $tds.get(5).text(elem.status)
    $tds.get(6).text(elem.datetime)
    $tds.get(7).text(elem.filled)
    $tds.get(8).text(elem.average)
    $tds.get(9).text(elem.exchange_order_id);
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
            res.sort((a, b) => a.exchange_order_id > b.exchange_order_id ? -1 : (a.exchange_order_id < b.exchange_order_id ? 1 : 0));
            populate(res, $tableTbody, 'trade', genGridTrade, updateGridTrade);
            setTimeout(populateTrades, 60000);
        }),
        error: ((error) => {
            console.log("Error:", error);
            setTimeout(populateTrades, 60000);
        })
    });

}

function genGridEvent(elem) {
    return $('<tr>').data('event', elem.id)
    .append('<td>').text(elem.datetime)
    .append('<td>').text(elem.event)
    .append('<td>').text(elem.message)
}

function updateGridEvent(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.get(1).text(elem.datetime);
    $tds.get(2).text(elem.event);
    $tds.get(3).text(elem.message);
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
            setTimeout(populateEvents, 60000);
        }),
        error: ((error) => {
            console.log("Error:", error);
            setTimeout(populateEvents, 60000);
        })
    });

}

