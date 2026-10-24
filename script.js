alert("JavaScript is working!");

document.getElementById("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let studentId = document.getElementById("studentId").value;
    let password = document.getElementById("password").value;
    let message = document.getElementById("message");

    if (studentId === "KWASU001" && password === "12345") {

        message.textContent = "LOGIN SUCCESSFUL!";
        message.style.color = "green";

    } else {

        message.textContent = "Wrong Student ID or Password!";
        message.style.color = "red";

    }

});