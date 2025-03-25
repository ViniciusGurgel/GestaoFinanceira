document.addEventListener("DOMContentLoaded", function () {
    // Inicialização do Swiper
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: 1, // Exibe apenas um slide por vez
        spaceBetween: 10, // Espaçamento entre os slides
        loop: true, // Ativa o loop infinito
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });

    // Gráfico de Despesas e Receitas
    const financeChartCtx = document.getElementById('financeChart').getContext('2d');
    new Chart(financeChartCtx, {
        type: 'bar',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [3000, 2500, 3200, 2800],
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: [2000, 1800, 2200, 2000],
                    backgroundColor: '#F44336',
                    borderColor: '#D32F2F',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });

    // Gráfico de Categorias de Despesas
    const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Alimentação', 'Transporte', 'Lazer', 'Saúde'],
            datasets: [
                {
                    data: [350, 150, 100, 200],
                    backgroundColor: ['#FF5722', '#2196F3', '#FFC107', '#9C27B0'],
                    borderColor: ['#E64A19', '#1976D2', '#FFA000', '#7B1FA2'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });

    // Gráfico de Evolução das Despesas e Receitas
    const lineChartCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [3000, 2500, 3200, 2800],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Despesas',
                    data: [2000, 1800, 2200, 2000],
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });

    // Gráfico de Metas Financeiras
    const goalsChartCtx = document.getElementById('goalsChart').getContext('2d');
    new Chart(goalsChartCtx, {
        type: 'pie',
        data: {
            labels: ['Concluído', 'Restante'],
            datasets: [
                {
                    data: [40, 60],
                    backgroundColor: ['#4CAF50', '#FFC107'],
                    borderColor: ['#388E3C', '#FFA000'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });
});


    // Adiciona a classe "active" ao item de menu que corresponde à página atual
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.endsWith(href)) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page'); // Indica que é a página atual
            item.style.pointerEvents = 'none'; // Desativa o clique no link
            item.setAttribute('tabindex', '-1'); // Remove o foco do link
        }
    });