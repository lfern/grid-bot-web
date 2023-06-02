$( document ).ready(function() {    
    populateAccountBalance();
});

function populateAccountBalance() {
    let accountId = $('#wallet-balance').data('account');
    $.ajax({
        cache: false,
        url:'/account/' + accountId + '/balance/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            populateBalanceTable(
                $('#wallet-balance'),
                $('#wallet-balance-updated-at'),
                res.walletBalance,
                res.walletBalanceUpdatedAt
                );

            populateBalanceTable(
                $('#main-balance'),
                $('#main-balance-updated-at'),
                res.mainBalance,
                res.mainBalanceUpdatedAt
                );

            setTimeout(populateAccountBalance, 20000);
        }),
        error: ((error) => {
            console.log("Error:", error);
            setTimeout(populateAccountBalance, 20000);
        })
    });
}

function populateBalanceTable($table, $updatedAt, balanceData, updatedAt) {
    let walletBalance = [];
    if (balanceData != null) {
        delete balanceData['free'];
        delete balanceData['total'];
        delete balanceData['used'];
        delete balanceData['info'];
        walletBalance = typeof balanceData === 'object' ? Object.entries(balanceData).map(([coin, values]) => ({ coin, ...values })) : [];
        walletBalance.sort((a, b) => parseFloat(a.coin) > parseFloat(b.coin) ? -1 : (parseFloat(a.coin) < parseFloat(b.coin) ? 1 : 0));
    }
    populate(walletBalance, $table.find('tbody'), 'coin', genBalanceEntry, updateBalanceEntry);
    $updatedAt.text(updatedAt ? updatedAt : 'never');
}

function populate(arrayData, $tableTbody, dataAttr, genFunc, updateFunc) {
    let index = 0;
    let arrayDataLen = arrayData.length;
    $tableTbody.find('tr').each(function(i) {
        //var index = $(this).index();
        //var text = $(this).text();
        let $current = $(this);
        const data = $current.data(dataAttr) | 0;
        while (true) {
            let elem = arrayData[index];
            if (index >= arrayDataLen) {
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
    for (; index < arrayDataLen; index++) {
        $tableTbody.append(genFunc(arrayData[index]));
    }
}

function genBalanceEntry(elem) {
    return $('<tr>').data('coin', elem.coin)
    .append($('<td>').text(elem.coin))
    .append($('<td>').text(elem.free))
    .append($('<td>').text(elem.used))
    .append($('<td>').text(elem.total));
}

function updateBalanceEntry(elem, $tr) {
    let $tds = $tr.find('td');
    $tds.eq(0).text(elem.coin)
    $tds.eq(1).text(elem.free)
    $tds.eq(2).text(elem.used)
    $tds.eq(3).text(elem.total);
}
