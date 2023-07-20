function deleteTelegramStrategy(telegramStrategyId) {
    $.ajax({
        url:'/notificationmanager/telegram/strategy/'+telegramStrategyId+'/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({telegramStrategyId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+telegramStrategyId).remove();
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            console.log("Error:", jqXHR);
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }
        })
    })
}