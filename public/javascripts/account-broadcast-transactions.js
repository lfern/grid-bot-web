function deleteBroadcast(broadcastId, accountId) {
    $.ajax({
        url:'/account-broadcast-transaction/' + broadcastId + '/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({broadcast_id: broadcastId, account_id: accountId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+broadcastId).remove();
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