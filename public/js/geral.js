let userName = 'João'; 
document.getElementById('user-name').textContent = userName;

// Função de logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}








