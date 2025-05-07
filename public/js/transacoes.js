let addTransactionModal; // Declaração global do modal

document.addEventListener("DOMContentLoaded", async () => {
    addTransactionModal = new bootstrap.Modal(document.getElementById("addTransactionModal"));
    await inicializarPagina();
});

async function inicializarPagina() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch('/api/verificar_token', {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }
    } catch (err) {
        console.error("Erro ao verificar o token:", err);
        window.location.href = "login.html";
        return;
    }

    carregarCategorias();
    configurarTema();
    configurarFiltros();

    const transacoesOriginais = await fetchTransacoes();
    renderizarTransacoes(transacoesOriginais);

    configurarEventosMenu();
    configurarEventosTransacoes(transacoesOriginais);
}

// Função auxiliar para chamadas autenticadas
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


async function carregarCategorias() {
    const token = localStorage.getItem('token');
    const selectCategoria = document.getElementById("transactionCategory");

    try {
        const response = await fetchComToken("/personalizar/listar_categorias", {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error("Erro ao buscar categorias.");
        }

        const categorias = await response.json();

        // Limpar opções atuais
        selectCategoria.innerHTML = '';

        // Inserir categorias dinâmicas
        categorias.forEach((categoria) => {
            const option = document.createElement("option");
            option.value = categoria.Id; // ou categoria.id
            option.textContent = categoria.Nome; // ou categoria.nome
            selectCategoria.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

function configurarTema() {
    const toggleThemeButton = document.getElementById("toggleThemeButton");
    const body = document.body;
    toggleThemeButton.addEventListener("click", () => {
        if (body.classList.contains("light-theme")) {
            body.classList.remove("light-theme");
            body.classList.add("dark-theme");
            toggleThemeButton.innerHTML = '<i id="themeIcon" class="bi bi-moon-stars"></i> <span id="themeText">Tema Escuro</span>';
        } else {
            body.classList.remove("dark-theme");
            body.classList.add("light-theme");
            toggleThemeButton.innerHTML = '<i id="themeIcon" class="bi bi-sun"></i> <span id="themeText">Tema Claro</span>';
        }

        // Atualizar estilos da tabela de transações
        atualizarEstilosTabela();
    });

    function atualizarEstilosTabela() {
        const tabela = document.querySelector(".table");
        if (body.classList.contains("dark-theme")) {
            tabela.classList.add("table-dark");
        } else {
            tabela.classList.remove("table-dark");
        }
    }

    // Chamar a função para aplicar o estilo inicial
    const savedTheme = localStorage.getItem("theme") || "light";
    const initialThemeButton = document.getElementById("toggleThemeButton");
    if (savedTheme === "dark") {
        body.classList.add("dark-theme");
        initialThemeButton.innerHTML = '<i id="themeIcon" class="bi bi-moon-stars"></i> <span id="themeText">Tema Escuro</span>';
    } else {
        body.classList.add("light-theme");
        initialThemeButton.innerHTML = '<i id="themeIcon" class="bi bi-sun"></i> <span id="themeText">Tema Claro</span>';
    }
    atualizarEstilosTabela();
}

function configurarFiltros() {
    const clearFiltersButton = document.getElementById("clear-filters");
    const filterMonth = document.getElementById("filter-month");
    const filterYear = document.getElementById("filter-year");
    const applyFiltersButton = document.getElementById("apply-filters");
    const transacoesLista = document.getElementById("transacoes-lista");

    clearFiltersButton.addEventListener("click", async () => {
        filterMonth.value = "";
        filterYear.value = "";
        applyFiltersButton.classList.remove("active");
        const transacoesOriginais = await fetchTransacoes();
        renderizarTransacoes(transacoesOriginais);
    });

    applyFiltersButton.addEventListener("click", () => {
        applyFiltersButton.classList.add("active");
        const selectedMonth = filterMonth.value;
        const selectedYear = filterYear.value;
        filtrarTransacoes(selectedMonth, selectedYear);
    });

    async function filtrarTransacoes(mes, ano) {
        const transacoesOriginais = await fetchTransacoes();
        let transacoesFiltradas = transacoesOriginais;

        if (mes) {
            transacoesFiltradas = transacoesFiltradas.filter(transacao => {
                const dataTransacao = new Date(transacao.data);
                return dataTransacao.getMonth() + 1 === parseInt(mes);
            });
        }

        if (ano) {
            transacoesFiltradas = transacoesFiltradas.filter(transacao => {
                const dataTransacao = new Date(transacao.data);
                return dataTransacao.getFullYear() === parseInt(ano);
            });
        }

        renderizarTransacoes(transacoesFiltradas);
    }
}

function configurarEventosMenu() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-link');

    menuItems.forEach(item => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
        item.removeAttribute('tabindex');
        item.style.pointerEvents = '';
    });

    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.endsWith(href)) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
            item.style.pointerEvents = 'none';
            item.setAttribute('tabindex', '-1');
        }
    });
}

function configurarEventosTransacoes(transacoesOriginais) {
    const transacoesLista = document.getElementById("transacoes-lista");
    const transactionForm = document.getElementById("transactionForm");

    transacoesLista.addEventListener("click", function (event) {
        const target = event.target;

        if (target.classList.contains("btn-edit") || target.closest(".btn-edit")) {
            const linha = target.closest("tr");
            editarTransacao(linha);
        }

        if (target.classList.contains("btn-delete") || target.closest(".btn-delete")) {
            const linha = target.closest("tr");
            excluirTransacao(linha);
        }
    });

    document.querySelector('[href="#todas"]').addEventListener("click", async () => {
        const transacoesAtualizadas = await fetchTransacoes();
        renderizarTransacoes(transacoesAtualizadas);
    });

    document.querySelector('[href="#receitas"]').addEventListener("click", async () => {
        const transacoesAtualizadas = await fetchTransacoes();
        const receitas = transacoesAtualizadas.filter((t) => t.tipo === "Receita");
        renderizarTransacoes(receitas);
    });

    document.querySelector('[href="#despesas"]').addEventListener("click", async () => {
        const transacoesAtualizadas = await fetchTransacoes();
        const despesas = transacoesAtualizadas.filter((t) => t.tipo === "Despesa");
        renderizarTransacoes(despesas);
    });

    const addTransactionModalButton = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addTransactionModal"]');
    addTransactionModalButton.addEventListener("click", () => {
        transactionForm.reset();
        document.getElementById("addTransactionButton").textContent = "Adicionar Transação";
        document.getElementById("addTransactionButton").removeAttribute("data-editing-id");
        addTransactionModal.show();
    });

    const addTransactionButton = document.getElementById("addTransactionButton");
    const transactionCategorySelect = document.getElementById("transactionCategory");
    const transactionNameInput = document.getElementById("transactionName");
    const transactionTypeSelect = document.getElementById("transactionType");
    const transactionValueInput = document.getElementById("transactionValue");
    const transactionDateInput = document.getElementById("transactionDate");

    transactionForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = transactionNameInput.value;
        const tipo = transactionTypeSelect.value;
        const categoria = transactionCategorySelect.value;
        const valor = parseFloat(transactionValueInput.value);
        const data = transactionDateInput.value;

        if (!nome || !tipo || !categoria || isNaN(valor) || !data) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const novaTransacao = {
            nome: nome,
            tipoTransacaoId: tipo === "receita" ? 1 : 2,
            meioPagamentoId: 1, // Por padrão
            categoriaId: categoria,
            valor: valor,
            data: data
        };

        try {
            let response;
            const id = addTransactionButton.dataset.editingId;
            if (id) {
                response = await fetchComToken(`/api/alterar_transacao/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(novaTransacao)
                });
            } else {
                response = await fetchComToken("/api/adicionar_transacao", {
                    method: "POST",
                    body: JSON.stringify(novaTransacao)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro ao salvar transação:", errorData);
                alert(`Ocorreu um erro ao salvar a transação: ${errorData.error || response.statusText}`);
                return;
            }

            const transacoesAtualizadas = await fetchTransacoes();
            renderizarTransacoes(transacoesAtualizadas);
            addTransactionModal.hide();
            transactionForm.reset();
            addTransactionButton.removeAttribute("data-editing-id");
            addTransactionButton.textContent = "Adicionar Transação";

        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao salvar a transação.");
        }
    });

    const modalElement = document.getElementById("addTransactionModal");
    modalElement.addEventListener("hidden.bs.modal", () => {
        transactionForm.reset();
        addTransactionButton.textContent = "Adicionar Transação";
        addTransactionButton.removeAttribute("data-editing-id");
    });
}

const editarTransacao = async (linha) => {
    const id = linha.dataset.id;
    const nome = linha.cells[0].textContent.trim();
    const tipoTexto = linha.cells[1].textContent.trim();
    const categoria = linha.cells[2].textContent.trim();
    const valorTexto = linha.cells[3].textContent.replace("R$", "").trim().replace(",", ".");
    const data = linha.cells[4].textContent.trim();

    document.getElementById("transactionName").value = nome;
    document.getElementById("transactionType").value = tipoTexto === "Receita" ? "receita" : "despesa";
    document.getElementById("transactionCategory").value = categoria;
    document.getElementById("transactionValue").value = parseFloat(valorTexto);
    document.getElementById("transactionDate").value = data;

    const addTransactionButton = document.getElementById("addTransactionButton");
    addTransactionButton.dataset.editingId = id;
    addTransactionButton.textContent = "Salvar Alterações";

    addTransactionModal.show();
};

const fetchTransacoes = async () => {
    try {
        const response = await fetchComToken("/api/listar_transacoes", {
            method: "GET"
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao buscar transações:", errorData);
            alert(`Erro ao buscar transações: ${errorData.error || response.statusText}`);
            return [];
        }
        const transacoes = await response.json();
        return transacoes.map(transacao => ({
            id: transacao.Id,
            nome: transacao.Nome,
            tipo: transacao.Tipo,
            categoria: transacao.Categoria,
            valor: `R$ ${parseFloat(transacao.Valor).toFixed(2)}`,
            data: transacao.Data
        }));
    } catch (error) {
        console.error("Erro:", error);
        alert("Ocorreu um erro ao buscar as transações.");
        return [];
    }
};

const renderizarTransacoes = (transacoes) => {
    const transacoesLista = document.getElementById("transacoes-lista");
    transacoesLista.innerHTML = "";
    transacoes.forEach((transacao) => {
        const novaLinha = document.createElement("tr");
        novaLinha.dataset.id = transacao.id;
        novaLinha.innerHTML = `
            <td>${transacao.nome}</td>
            <td>${transacao.tipo}</td>
            <td>${transacao.categoria}</td>
            <td class="${transacao.tipo === "Receita" ? "valor-receita" : "valor-despesa"}">${transacao.valor}</td>
            <td>${transacao.data}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger btn-delete"><i class="bi bi-trash"></i></button>
            </td>
        `;
        transacoesLista.appendChild(novaLinha);
    });
    atualizarSaldoTotal();
};

const excluirTransacao = async (linha) => {
    const id = linha.dataset.id;
    if (!confirm("Tem certeza de que deseja excluir esta transação?")) {
        return;
    }

    try {
        const response = await fetchComToken(`/api/deletar_transacao/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao excluir transação:", errorData);
            alert(`Erro ao excluir transação: ${errorData.error || response.statusText}`);
            return;
        }
        linha.remove();
        alert("Transação excluída com sucesso.");
        const transacoesAtualizadas = await fetchTransacoes();
        renderizarTransacoes(transacoesAtualizadas);
    } catch (error) {
        console.error("Erro:", error);
        alert("Falha ao excluir a transação.");
    }
};

function atualizarSaldoTotal() {
    let totalReceitas = 0;
    let totalDespesas = 0;

    document.querySelectorAll("#transacoes-lista tr").forEach((linha) => {
        let tipo = linha.cells[1].textContent.trim();
        let valorTexto = linha.cells[3].textContent.trim().replace("R$", "").replace(",", ".");
        let valor = parseFloat(valorTexto);

        if (tipo === "Receita") {
            totalReceitas += valor;
        } else if (tipo === "Despesa") {
            totalDespesas += valor;
        }
    });

    let saldoTotal = totalReceitas - totalDespesas;
    let saldoElement = document.getElementById("total-balance");

    saldoElement.textContent = `Saldo Total: R$ ${Math.abs(saldoTotal).toFixed(2)}`;

    if (saldoTotal >= 0) {
        saldoElement.classList.remove("negative");
        saldoElement.classList.add("positive");
    } else {
        saldoElement.classList.remove("positive");
        saldoElement.classList.add("negative");
    }
}