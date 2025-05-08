document.addEventListener("DOMContentLoaded", async function () {
    // Inicialização do Swiper
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 10,
        loop: true,
        direction: "vertical", // Adicionado se você quiser rolagem vertical
        mousewheel: true,
    });
    

    // Função para inicializar gráficos
    function initializeChart(ctx, type, data, options) {
        return new Chart(ctx, {
            type: type,
            data: data,
            options: options,
        });
    }

    // Configuração de opções padrão para os gráficos
    const defaultOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Gráfico de Despesas e Receitas
    try {
        const res = await fetchComToken('/api/grafico_transacoes');
        const data = await res.json();
        const financeChartCtx = document.getElementById('financeChart').getContext('2d');
        initializeChart(financeChartCtx, 'bar', {
            labels: data.meses.reverse(),
            datasets: [
                {
                    label: 'Receitas',
                    data: data.receitas.reverse(),
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1,
                },
                {
                    label: 'Despesas',
                    data: data.despesas.reverse(),
                    backgroundColor: '#F44336',
                    borderColor: '#D32F2F',
                    borderWidth: 1,
                },
            ],
        }, defaultOptions);
    } catch (error) {
        console.error('Erro ao carregar gráfico de transações:', error);
    }

    // Gráfico de Categorias de Despesas (DOUGHNUT) - /grafico_categorias
    try {
        const res = await fetchComToken('/api/grafico_categorias');
        const data = await res.json();
        const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
        initializeChart(categoryChartCtx, 'doughnut', {
            labels: data.categorias,
            datasets: [
                {
                    data: data.despesas,
                    backgroundColor: ['#FF5722', '#2196F3', '#FFC107', '#9C27B0'],
                    borderColor: ['#E64A19', '#1976D2', '#FFA000', '#7B1FA2'],
                    borderWidth: 1,
                },
            ],
        }, defaultOptions);

        // Resumo de Categorias (ul dinâmica)
        const resumoDiv = document.getElementById('resumoCategorias');
        resumoDiv.innerHTML = ""; // Limpa conteúdo anterior

        data.categorias.forEach((categoria, index) => {
            const valor = data.despesas[index].toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const li = document.createElement('li');
            li.innerHTML = `<strong>${categoria}:</strong> ${valor}`;
            resumoDiv.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao carregar gráfico de categorias:', error);
    }

    // Gráfico de Evolução das Despesas e Receitas (LINE) - /evolucao_transacoes
    try {
        const hoje = new Date();
        const fim = hoje.toISOString().split('T')[0];
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1).toISOString().split('T')[0];
        const res = await fetchComToken(`/api/evolucao_transacoes?periodoInicio=${inicio}&periodoFim=${fim}`);
        const data = await res.json();
        const lineChartCtx = document.getElementById('lineChart').getContext('2d');
        initializeChart(lineChartCtx, 'line', {
            labels: data.meses.reverse(),
            datasets: [
                {
                    label: 'Receitas',
                    data: data.receitas.reverse(),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Despesas',
                    data: data.despesas.reverse(),
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        }, defaultOptions);
    } catch (error) {
        console.error('Erro ao carregar gráfico de evolução:', error);
    }

    // Gráfico de Metas Financeiras
    const goalsChartCtx = document.getElementById('goalsChart').getContext('2d');
    initializeChart(goalsChartCtx, 'pie', {
        labels: ['Concluído', 'Restante'],
        datasets: [
            {
                data: [40, 60],
                backgroundColor: ['#4CAF50', '#FFC107'],
                borderColor: ['#388E3C', '#FFA000'],
                borderWidth: 1,
            },
        ],
    }, defaultOptions);

    try {
        const res = await fetchComToken('/api/ultimas_transacoes');
        const transacoes = await res.json();
    
        const tbody = document.getElementById("ultimasTransacoesBody");
        const swiperWrapper = document.querySelector(".swiper-wrapper");
    
        tbody.innerHTML = "";
        swiperWrapper.innerHTML = "";
    
        transacoes.forEach(transacao => {
            const valorFormatado = parseFloat(transacao.Valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
    
            const dataFormatada = new Date(transacao.Data).toLocaleDateString('pt-BR');
    
            // Preencher tabela
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${transacao.Id}</td>
                <td>${transacao.Tipo}</td>
                <td>${transacao.Categoria}</td>
                <td>${valorFormatado}</td>
                <td>${dataFormatada}</td>
            `;
            tbody.appendChild(tr);
    
            // Preencher swiper
            const slide = document.createElement("div");
            slide.className = "swiper-slide";
            slide.innerHTML = `
                <div class="transaction-card">
                    <h6>${transacao.Tipo} - ${transacao.Categoria}</h6>
                    <p>Valor: ${valorFormatado}</p>
                    <p>Data: ${dataFormatada}</p>
                    <p>Meio: ${transacao.MeioPagamento}</p>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });
    
        // Atualiza o Swiper (se necessário)
        if (swiper && swiper.update) {
            swiper.update();
        }
    } catch (error) {
        console.error("Erro ao carregar últimas transações:", error);
        const tbody = document.getElementById("ultimasTransacoesBody");
        tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar transações.</td></tr>`;
    }
});

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