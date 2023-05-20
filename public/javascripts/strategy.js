
$( document ).ready(function() {
    $("select[name=exchange]").change(function(){
        updateAccounts($(this).val())
    })
    $("select[name=account]").change(function(){
        updateSymbols($(this).val())
    })
    updateExchanges();
});

function updateExchanges() {
    let $exchange = $("select[name=exchange]");
    $exchange.attr('disabled', 'disabled').empty();
    $("select[name=account]").attr('disabled', 'disabled').empty();
    $("select[name=symbol]").attr('disabled', 'disabled').empty();
    $.ajax({
        cache: false,
        url:'/exchanges/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            $.each(res, function (i, item) {
                $exchange.append($('<option>', { 
                    value: item.id,
                    text : item.name 
                }));
            });

            if (res.length > 0) {
                $exchange.removeAttr('disabled');
                updateAccounts(res[0].id);
            }
        }),
        error: ((error) => {
            console.log("Error:", error);
        })
    });
}

function updateAccounts(exchangeId) {
    let $account = $("select[name=account]");
    $account.attr('disabled', 'disabled').empty();
    $("select[name=symbol]").attr('disabled', 'disabled').empty();
    $.ajax({
        cache: false,
        url:'/exchange/'+exchangeId+'/accounts/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            $.each(res, function (i, item) {
                $account.append($('<option>', { 
                    value: item.id,
                    text : item.name + " (" + item.type_name + (item.paper ?", paper":"") +")"
                }));
            });

            if (res.length > 0) {
                $account.removeAttr('disabled');
                updateSymbols(res[0].id, res[0].paper);
            }
        }),
        error: ((error) => {
            console.log("Error:", error);
        })
    });
}

function updateSymbols(accountId) {
    let $symbol = $("select[name=symbol]");
    $symbol.attr('disabled', 'disabled').empty();
    $.ajax({
        cache: false,
        url:'/account/'+accountId+'/markets/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type:'GET',
        success: ((res) => {
            console.log("Result:", res);
            Object.keys(res)
                .sort()
                .forEach(function(v, i) {
                    $symbol.append($('<option>', { 
                        value: v,
                        text : v 
                    }));
                });
           
            if (Object.keys(res).length > 0) {
                $symbol.removeAttr('disabled');
            }
        }),
        error: ((error) => {
            console.log("Error:", error);
        })
    });
}