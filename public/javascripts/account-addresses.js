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
        error: ((error) => {
            console.log("Error:", error);
        })
    })
}