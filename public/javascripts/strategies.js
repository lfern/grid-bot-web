function deleteStrategy(strategyId) {
    $.ajax({
        url:'/strategy/' + strategyId + '/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({strategyId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+strategyId).remove();
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }

            console.log("Error:", jqXHR);
        })
    })
}