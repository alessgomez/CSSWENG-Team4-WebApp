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

    /*function validatePW (pw) {
        var uppercaseLetters = /[A-Z]/g;
        var specialChars = /\W|_/g;
        var numbers = /[0-9]/g;
        
        return pw.match(uppercaseLetters) && pw.match(specialChars) && pw.match(numbers) && pw.length >= 8;
    }*/
});