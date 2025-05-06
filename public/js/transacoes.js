document.addEventListener("DOMContentLoaded", async () => {
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
    const toggleThemeButton = document.getElementById("toggleTheme");
    const body = document.body;      
    toggleThemeButton.addEventListener("click", () => {
        if (body.classList.contains("light-theme")) {
            body.classList.remove("light-theme");
            body.classList.add("dark-theme");
            toggleThemeButton.textContent = "☀️ Tema Claro";
        } else {
            body.classList.remove("dark-theme");
            body.classList.add("light-theme");
            toggleThemeButton.textContent = "🌙 Tema Escuro";
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
    atualizarEstilosTabela();
}

function configurarFiltros() {
    const clearFiltersButton = document.getElementById("clear-filters");
    const filterMonth = document.getElementById("filter-month");
    const filterYear = document.getElementById("filter-year");
    const applyFiltersButton = document.getElementById("apply-filters");

    clearFiltersButton.addEventListener("click", () => {
        filterMonth.value = "";
        filterYear.value = "";
        applyFiltersButton.classList.remove("active");
    });

    applyFiltersButton.addEventListener("click", () => {
        applyFiltersButton.classList.add("active");
    });
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

    document.querySelector('[href="#todas"]').addEventListener("click", () => {
        renderizarTransacoes(transacoesOriginais);
        atualizarSaldoTotal();
    });

    document.querySelector('[href="#receitas"]').addEventListener("click", () => {
        const receitas = transacoesOriginais.filter((t) => t.tipo === "Receita");
        renderizarTransacoes(receitas);
        atualizarSaldoTotal();
    });

    document.querySelector('[href="#despesas"]').addEventListener("click", () => {
        const despesas = transacoesOriginais.filter((t) => t.tipo === "Despesa");
        renderizarTransacoes(despesas);
        atualizarSaldoTotal();
    });

    const addTransactionModalButton = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addTransactionModal"]');
    const addTransactionModal = new bootstrap.Modal(document.getElementById("addTransactionModal"));
    addTransactionModalButton.addEventListener("click", () => {
        addTransactionModal.show();
    });

    const addTransactionButton = document.getElementById("addTransactionButton");
    const transactionCategorySelect = document.getElementById("transactionCategory");

    addTransactionButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const tipo = document.getElementById("transactionType").value;
        const categoria = transactionCategorySelect.value;
        const valor = parseFloat(document.getElementById("transactionValue").value);
        const data = document.getElementById("transactionDate").value;

        if (!tipo || !categoria || isNaN(valor) || !data) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const novaTransacao = {
            nome: "Teste",
            tipoTransacaoId: tipo === "receita" ? 1 : 2,
            meioPagamentoId: 1,
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
            window.location.reload();
        
            addTransactionModal.hide();
            addTransactionButton.removeAttribute("data-editing-id");
            addTransactionButton.textContent = "Adicionar Transação";
        
            const transacoesAtualizadas = await fetchTransacoes();
            renderizarTransacoes(transacoesAtualizadas);
        
        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao salvar a transação.");
        }        
    });

    const modal = document.getElementById("addTransactionModal");

    modal.addEventListener("hidden.bs.modal", function () {
        document.getElementById("transactionType").value = "";
        document.getElementById("transactionCategory").value = "";
        document.getElementById("transactionValue").value = "";
        document.getElementById("transactionDate").value = "";

        const addTransactionButton = document.getElementById("addTransactionButton");
        addTransactionButton.textContent = "Adicionar";
        delete addTransactionButton.dataset.editingId;

        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
            backdrop.remove();
        }

        document.body.classList.remove("modal-open");
        document.body.style = "";
    });

    const transacoes = [
        { nome: "Salário Mensal", tipo: "Receita", categoria: "Salário", valor: "R$ 5.000,00", data: "2025-04-05" },
        { nome: "Supermercado", tipo: "Despesa", categoria: "Alimentação", valor: "R$ 450,00", data: "2025-04-06" },
        { nome: "Mensalidade Academia", tipo: "Despesa", categoria: "Saúde", valor: "R$ 120,00", data: "2025-04-07" }
    ];

    transacoes.forEach(transacao => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transacao.nome}</td>
            <td>${transacao.tipo}</td>
            <td>${transacao.categoria}</td>
            <td>${transacao.valor}</td>
            <td>${transacao.data}</td>
            <td>
                <button class="btn btn-sm btn-warning">Editar</button>
                <button class="btn btn-sm btn-danger">Excluir</button>
            </td>
        `;
        transacoesLista.appendChild(row);
    });
}

// Função para editar transação
const editarTransacao = (linha) => {
    const id = linha.dataset.id;
    const tipo = linha.children[0].textContent.trim();
    const categoria = linha.children[1].textContent.trim();
    const valor = linha.children[2].textContent.replace("R$ ", "").trim();
    const data = linha.children[3].textContent.trim();

    document.getElementById("transactionType").value = tipo === "Receita" ? "receita" : "despesa";
    document.getElementById("transactionCategory").value = categoria;
    document.getElementById("transactionValue").value = parseFloat(valor);
    document.getElementById("transactionDate").value = data;

    const addTransactionButton = document.getElementById("addTransactionButton");
    addTransactionButton.dataset.editingId = id;
    addTransactionButton.textContent = "Salvar Alterações";

    addTransactionModal.show();
};

// Lista original de transações
const fetchTransacoes = async () => {
    try {
        const response = await fetchComToken("/api/listar_transacoes",{
            method: "GET"
        });
        console.log("Response:", response);
        if (!response.ok) throw new Error("Erro ao buscar transações");
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
        console.error(error);
        return [];
    }
};

// Função para renderizar a lista de transações
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

// Função para excluir uma transação
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
            throw new Error("Erro ao excluir transação.");
        }
        linha.remove();
        alert("Transação excluída com sucesso.");
        location.reload();
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