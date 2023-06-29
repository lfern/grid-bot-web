function deleteAccount(accountId) {
    $.ajax({
        url:'/account/' + accountId + '/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({accountId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+accountId).remove();
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