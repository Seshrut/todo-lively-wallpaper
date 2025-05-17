var email;
var password;
function btnpress(){
email = document.getElementById("emailinp").value;
password = document.getElementById("passwordinp").value;
if(!email || !password){
    //show invalid email or password
    alert("Invalid email or password");
    return;
}
//send to server at localhost:8080/login
  fetch("http://localhost:8080/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username:email, password })
  })
  .then(res => res.json())
  .then(data => {
    if(data.token){
      window.Login.sendLoginSuccess(data.token);
    } else {
      window.Login.sendLoginFailed();
    }
  })
  .catch(() => {
    window.Login.sendLoginFailed();
  });
}