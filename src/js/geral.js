document.addEventListener("DOMContentLoaded", function() {
    // Obtém o nome da página atual (por exemplo, 'dashboard.html')
    const currentPage = window.location.pathname.split("/").pop();

    // Seleciona todos os links do menu
    const menuLinks = document.querySelectorAll('.menu li a');

    // Itera sobre os links e adiciona a classe 'active' no link da página atual
    menuLinks.forEach(link => {
        if (link.href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
});

let userName = 'João'; 
document.getElementById('user-name').textContent = userName;