// Função de login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Validação simples: verifique se o usuário e senha são válidos
    if (username === "admin" && password === "123456") {
        window.location.href = "transacoes.html";  // Redireciona para a página de dashboard (ou outra página)
    } else {
        errorMessage.style.display = 'block';  // Exibe a mensagem de erro
    }
});
