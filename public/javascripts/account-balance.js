$( document ).ready(function() {
    $("form[name=form-transfer]").submit(function (event) {
        let $form = $(this);
        var formData = {
          coin: $form.find("[name=coin]").val(),
          amount: $form.find("[name=amount]").val(),
          from_wallet: $form.find("[name=from_wallet]").val(),
          to_wallet: $form.find("[name=to_wallet]").val(),
        };

        $form.find('button').prop('disabled', true);
        $.ajax({
          type: "POST",
          url: $form.attr('action'),
          data: formData,
          dataType: "json",
          encode: true,
          success: ((res) => {
            $form.find('button').prop('disabled', false);
            console.log(res);
            setTimeout(populateAccountBalance, 3000);
          }),
          error: ((jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status == 401) {
                window.location.replace('/login');
            } else {
                alert(jqXHR.responseText);
            }
            $form.find('button').prop('disabled', false);
            console.log(jqXHR);
          })
        });
    
        event.preventDefault();
    });

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
                res.walletBalanceUpdatedAt,
                res.mainBalance == null
                );

            populateBalanceTable(
                $('#main-balance'),
                $('#main-balance-updated-at'),
                res.mainBalance,
                res.mainBalanceUpdatedAt,
                res.mainBalance != null
                );

            setTimeout(populateAccountBalance, 20000);
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status == 401) {
                window.location.replace('/login');
            }
            console.log(jqXHR);
            setTimeout(populateAccountBalance, 20000);
        })
    });
}

function populateBalanceTable($table, $updatedAt, balanceData, updatedAt, updateTransferCoins) {
    let walletBalance = [];
    if (balanceData != null) {
        delete balanceData['free'];
        delete balanceData['total'];
        delete balanceData['used'];
        delete balanceData['info'];
        walletBalance = typeof balanceData === 'object' ? Object.entries(balanceData).map(([coin, values]) => ({ coin, ...values })) : [];
        walletBalance.sort((a, b) => parseFloat(a.coin) > parseFloat(b.coin) ? -1 : (parseFloat(a.coin) < parseFloat(b.coin) ? 1 : 0));
        if (updateTransferCoins) {
            populate(walletBalance, $('select[name=coin]'), 'option', 'coin', genTransferCoinEntry, updateTransferCoinEntry);
        }
    }
    populate(walletBalance, $table.find('tbody'), 'tr', 'coin', genBalanceEntry, updateBalanceEntry);
    $updatedAt.text(updatedAt ? updatedAt : 'never');
}

function populate(arrayData, $container, tag, dataAttr, genFunc, updateFunc) {
    let index = 0;
    let arrayDataLen = arrayData.length;
    $container.find(tag).each(function(i) {
        //var index = $(this).index();
        //var text = $(this).text();
        let $current = $(this);
        const data = $current.data(dataAttr);
        if (data == undefined) return;
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
        $container.append(genFunc(arrayData[index]));
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

function genTransferCoinEntry(elem) {
    return $('<option>').data('coin', elem.coin)
    .val(elem.coin).text(elem.coin);
}

function updateTransferCoinEntry(elem, $option) {
    $option.text(elem.coin).val(elem.coin);
}
