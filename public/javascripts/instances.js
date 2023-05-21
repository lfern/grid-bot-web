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
        error: ((error) => {
            console.log("Error:", error);
        })
    })
}