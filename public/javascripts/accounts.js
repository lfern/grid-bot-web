function deleteAccount(accountId) {
    $.ajax({
        url:'/account/' + accountId + '/delete-json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({accountId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+accountId).remove();
        }),
        error: ((error) => {
            console.log("Error:", error);
        })
    })
}