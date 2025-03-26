document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    let nome = document.getElementById("fullName").value;
    let email = document.getElementById("email").value;
    let usuarioNome = document.getElementById("username").value;
    let senha = document.getElementById("Password").value;
    let senhaConfirm = document.getElementById("PasswordConfirm").value;

    try {
        const response = await fetch("/auth/criar_conta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, usuarioNome, senha, senhaConfirm })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("email", email);
            alert("Código enviado! Verifique seu email.");
            window.location.href = data.redirect;
        } else {
            alert(data.message.join("\n"));  // Exibir todos os erros
        }
    } catch (error) {
        alert("Erro ao criar conta.");
        console.error(error);
    }
});

document.getElementById('show-password').addEventListener('change', function () {
    const passwordField = document.getElementById('Password');
    const passwordConfirmField = document.getElementById('PasswordConfirm');

    if (this.checked) {
        passwordField.type = 'text';
        passwordConfirmField.type = 'text';
    } else {
        passwordField.type = 'password';
        passwordConfirmField.type = 'password';
    }
});
