document.getElementById("recoverForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Captura o valor do e-mail
    let email = document.getElementById("email").value;

    // Simula um processo de validação
    if (email.includes("@") && email.includes(".")) {
        alert("Instruções de recuperação de senha enviadas para o seu e-mail.");
        window.location.href = "login.html";
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
});
