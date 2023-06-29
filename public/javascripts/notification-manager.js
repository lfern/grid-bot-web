function deleteTelegram(id) {
    $.ajax({
        url:'/notificationmanager/telegram/' + id + '/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({id}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#telegram-"+id).remove();
        }),
        error: ((error) => {
            console.log("Error:", error);
        })
    })
}

function checkTelegram(id) {
    $.ajax({
        url:'/notificationmanager/telegram/' + id + '/test/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({id}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
            console.log("Error:", jqXHR);
            if (jqXHR.status == 401) {
                window.location.replace('/login');
                return;
            }

            alert(jqXHR.responseText);
        })
    })
}