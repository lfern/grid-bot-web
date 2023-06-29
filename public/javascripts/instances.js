function deleteInstance(instanceId) {
    $.ajax({
        url:'/strategy-instance/' + instanceId + '/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({instanceId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+instanceId).remove();
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