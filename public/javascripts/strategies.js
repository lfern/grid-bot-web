function deleteStrategy(strategyId) {
    $.ajax({
        url:'/strategy/' + strategyId + '/delete-json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({strategyId}),
        type:'POST',
        success: ((res) => {
            console.log("Result:", res);
            $("#"+strategyId).remove();
        }),
        error: ((error) => {
            console.log("Error:", error);
        })
    })
}