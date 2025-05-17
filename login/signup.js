var email;
var password;
function btnpress(){
    email = document.getElementById("emailinp").value;
    password = document.getElementById("passwordinp").value;
    passwordagain = document.getElementById("passwordinpagain").value;
    if(password != passwordagain){
        //show invalid email or password
        alert("Passwords do not match");
        return;
    }
    if(!email || !password){
        //show invalid email or password
        alert("Invalid email or password");
        return;
    }
    //send to server at localhost:8080/login
    fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username:email, password })
    })
    .then(res => res.json())
    .then(data => {
        if(data.message == "User already exists"){
            alert("User already exists");
            return;
        }
        if(data.token){
        window.Login.sendLoginSuccess(data.token);
        } else {
        window.Login.sendLoginFailed();
        alert("Incorrect email or password");
        }
    })
    .catch(() => {
        window.Login.sendLoginFailed();
    });
}