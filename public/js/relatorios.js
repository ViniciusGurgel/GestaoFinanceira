async function fetchComToken(url, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token não encontrado.");
    }

    const headers = {
        ...options.headers,
        "x-auth-token": token,
        "Content-Type": "application/json"
    };

    return fetch(url, { ...options, headers });
}

document.addEventListener("DOMContentLoaded", function () {
    const dateFilterForm = document.getElementById('dateFilterForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilter');
    const resetFilterBtn = document.getElementById('resetFilter');
    const synthesisCard = document.querySelector('.card');

    function getDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        return { start, end };
    }

    const { start, end } = getDefaultDateRange();
    startDateInput.valueAsDate = start;
    endDateInput.valueAsDate = end;

    initPage();

    applyFilterBtn.addEventListener('click', applyDateFilter);
    resetFilterBtn.addEventListener('click', resetDateFilter);

    function initPage() {
        fetchDataAndUpdateCharts(startDateInput.value, endDateInput.value);
    }

    function applyDateFilter() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Por favor, selecione ambas as datas');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('A data inicial não pode ser maior que a data final');
            return;
        }

        fetchDataAndUpdateCharts(startDate, endDate);
    }

    function resetDateFilter() {
        const { start, end } = getDefaultDateRange();
        startDateInput.valueAsDate = start;
        endDateInput.valueAsDate = end;

        fetchDataAndUpdateCharts(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
    }

    function fetchDataAndUpdateCharts(startDate, endDate) {
        fetchComToken(`/relatorio/relatorio_completo?periodoInicio=${startDate}&periodoFim=${endDate}`)
            .then(res => res.json())
            .then(data => {
                const categorias = data.graficoCategorias.map(c => c.categoria);
                const despesas = data.graficoCategorias.map(c => c.total);
                updateBarChart(categorias, despesas);

                const pieData = {
                    receitas: [data.totalGasto],
                    despesas: [data.totalGasto]
                };
                updatePieChart(pieData);

                updateSynthesis({
                    totalTransactions: data.totalTransacoes || 0,
                    totalSpent: data.totalGasto || 0,
                    maxCategory: data.categoriaComMaiorGasto || "Nenhuma",
                    lastDate: data.dataMaisRecente || "Nenhuma"
                });

                window.transacoesPdf = data.transacoes || [];
            })
            .catch(err => console.error('Erro ao buscar relatório completo:', err));
    }

    function getChartColors() {
        const isDark = document.body.classList.contains("dark-theme");
        return {
            textColor: isDark ? "#fff" : "#000",
            bgColors: ['#4CAF50', '#FFC107', '#2196F3', '#F44336', '#9C27B0', '#607D8B'],
            borderColors: ['#388E3C', '#FFA000', '#1976D2', '#D32F2F', '#7B1FA2', '#455A64']
        };
    }

    function updateBarChart(categories, expenses) {
        const ctx = document.getElementById('barChart').getContext('2d');
        const { bgColors, borderColors, textColor } = getChartColors();

        if (window.barChart && typeof window.barChart.destroy === 'function') {
            window.barChart.destroy();
        }

        window.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Gastos por Categoria (R$)',
                    data: expenses,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: getChartOptions('Gastos por Categoria', textColor)
        });
    }

    function updatePieChart(data) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        const { textColor } = getChartColors();

        const totalIncome = data.receitas.reduce((a, b) => a + b, 0);
        const totalExpenses = data.despesas.reduce((a, b) => a + b, 0);
        const balance = totalIncome - totalExpenses;

        if (window.pieChart && typeof window.pieChart.destroy === 'function') {
            window.pieChart.destroy();
        }

        window.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Receitas', 'Despesas', 'Saldo'],
                datasets: [{
                    data: [totalIncome, totalExpenses, balance],
                    backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
                    borderColor: ['#388E3C', '#D32F2F', '#1976D2'],
                    borderWidth: 1
                }]
            },
            options: getChartOptions('Distribuição Financeira', textColor)
        });
    }

    function getChartOptions(title, textColor) {
        return {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor }
                },
                title: {
                    display: true,
                    text: title,
                    color: textColor
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }
                },
                x: {
                    ticks: { color: textColor }
                }
            }
        };
    }

    function updateSynthesis(data) {
        document.getElementById('totalTransacoes').textContent = data.totalTransactions;

        // Formatando para moeda com 2 casas decimais e vírgula
        document.getElementById('totalGasto').textContent = data.totalSpent.toFixed(2).replace('.', ',');

        document.getElementById('categoriaMaiorGasto').textContent = data.maxCategory || '-';

        // Formatando a data para formato brasileiro (ex: 08/05/2025)
        if (data.lastDate) {
          const dt = new Date(data.lastDate);
          const formattedDate = dt.toLocaleDateString('pt-BR');
          document.getElementById('dataRecente').textContent = formattedDate;
        } else {
          document.getElementById('dataRecente').textContent = '-';
        }
    }



    function formatDate(dateString) {
        if (!dateString || dateString === 'Nenhuma') return 'Nenhuma';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    setupPdfDownload();
    setupTheme();
    setupSidebar();
});

function setupPdfDownload() {
    document.getElementById('downloadBtn').addEventListener('click', function () {
        mostrarAlerta('alertaDownload');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Relatório Financeiro', 105, 20, null, null, 'center');

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        doc.setFontSize(12);
        doc.text(`Período: ${formatDateForPdf(startDate)} à ${formatDateForPdf(endDate)}`, 105, 30, null, null, 'center');

        doc.setFontSize(16);
        doc.text('Síntese dos Dados', 20, 50);
        doc.setFontSize(12);
        const synthesisItems = document.querySelectorAll('.list-group-item');
        synthesisItems.forEach((item, index) => {
            doc.text(item.textContent, 20, 60 + (index * 10));
        });

        // Página de gráficos
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Gráficos do Relatório', 20, 20);
        const barImg = window.barChart.toBase64Image();
        const pieImg = window.pieChart.toBase64Image();
        doc.addImage(barImg, 'PNG', 15, 30, 180, 80);
        doc.addImage(pieImg, 'PNG', 15, 120, 180, 80);

        // Página de transações
        if (window.transacoesPdf && window.transacoesPdf.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Transações Detalhadas', 20, 20);
            doc.setFontSize(10);
            const headers = ['ID', 'Nome', 'Tipo', 'Categoria', 'Meio', 'Valor', 'Data'];
            let y = 30;

            doc.text(headers.join(' | '), 20, y);
            y += 10;

            window.transacoesPdf.forEach(t => {
                const linha = [
                    t.Id,
                    t.Nome,
                    t.Tipo,
                    t.Categoria,
                    t.MeioPagamento,
                    `R$ ${parseFloat(t.Valor).toFixed(2)}`,
                    formatDateForPdf(t.Data)
                ];
                doc.text(linha.join(' | '), 20, y);
                y += 8;
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
            });
        }

        doc.save(`relatorio_financeiro_${startDate}_a_${endDate}.pdf`);
    });
}

function formatDateForPdf(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function mostrarAlerta(id) {
    const alerta = document.getElementById(id);
    alerta.classList.remove('d-none');
    alerta.classList.add('show');
    setTimeout(() => {
        alerta.classList.remove('show');
        alerta.classList.add('d-none');
    }, 1750);
}

function setupSidebar() {
    const menuButton = document.querySelector(".menu-button");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");

    if (menuButton && sidebar && mainContent) {
        menuButton.addEventListener("click", function () {
            sidebar.classList.toggle("active");
            mainContent.classList.toggle("shift");
        });
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
