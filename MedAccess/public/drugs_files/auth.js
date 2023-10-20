function auth(){

    let username = document.getElementById("username").value
    let password = document.getElementById("password").value
    let request = {command:"auth", args:{user:username, passwd: password}}
    $.post(API_URL, request , getJSON)
}

function deauth(){
    let request = {command:"deauth", args:{token:localStorage.sessionToken}}
    $.post(API_URL, request, getJSON)
}