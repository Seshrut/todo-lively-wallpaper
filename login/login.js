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
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email: email,
        password: password,
    }),
    })
    .then((response) =>{return response.json()})
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error("Error:", error);
    });

};