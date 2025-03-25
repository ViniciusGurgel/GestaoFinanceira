document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Captura os valores dos campos
    let fullName = document.getElementById("fullName").value;
    let email = document.getElementById("email").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Simula um processo de validação
    if (fullName && email && username && password.length >= 6) {
        alert("Conta criada com sucesso! Redirecionando para login...");
        window.location.href = "login.html";
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
});
