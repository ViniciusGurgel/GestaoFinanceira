// Função de login
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Exibindo a mensagem de erro ao ocultá-la primeiro
    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: username,
                senha: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva o token JWT no localStorage (ou sessionStorage, conforme necessário)
            localStorage.setItem('token', data.token);
            
            window.location.href = "dashboard.html";
        } else {
            // Exibe a mensagem de erro
            errorMessage.style.display = 'block';
            errorMessage.textContent = data.error || 'Erro desconhecido';
        }
    } catch (err) {
        console.error('Erro ao tentar fazer login:', err);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Erro ao conectar com o servidor.';
    }
});
