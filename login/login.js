var email;
var password;
var URI;
document.addEventListener('DOMContentLoaded',async ()=>{
  URI = await window.onstart.getURL();
})

function btnpress(){
  console.log(URI);
  email = document.getElementById("emailinp").value;
  password = document.getElementById("passwordinp").value;
  if(!email || !password){
      //show invalid email or password
      alert("Invalid email or password");
      return;
  }
  //send to server at localhost:8080/login
    fetch(URI+"/login", {
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
        alert("Incorrect email or password");
      }
    })
    .catch(() => {
      window.Login.sendLoginFailed();
    });
}