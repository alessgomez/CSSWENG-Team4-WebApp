$(document).ready(function(){
    var username = document.getElementById("uname");
    var pw = document.getElementById("password");
    var btn = document.getElementById("login");

    username.onkeyup = function () {
        if (username.value.length != 0 && pw.value.length != 0)
            btn.disabled = false;
        else
            btn.disabled = true;
    }

    pw.onkeyup = function () {
        if (username.value.length != 0 && pw.value.length != 0)
            btn.disabled = false;
        else
            btn.disabled = true;
    }
});