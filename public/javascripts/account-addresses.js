function deleteAddress(addressId) {
    $.ajax({
        url:'/account-address/' + addressId + '/delete/json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({addressId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+addressId).remove();
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