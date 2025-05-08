let addTransactionModal;

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
    const selectCategoria = document.getElementById("transactionCategory");

    try {
        const response = await fetchComToken("/personalizar/listar_categorias", { method: "GET" });
        if (!response.ok) throw new Error("Erro ao buscar categorias.");

        const categorias = await response.json();
        selectCategoria.innerHTML = '';

        categorias.forEach((categoria) => {
            const option = document.createElement("option");
            option.value = categoria.Id;
            option.textContent = categoria.Nome;
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
            body.classList.replace("light-theme", "dark-theme");
            toggleThemeButton.innerHTML = '<i id="themeIcon" class="bi bi-moon-stars"></i> <span id="themeText">Tema Escuro</span>';
        } else {
            body.classList.replace("dark-theme", "light-theme");
            toggleThemeButton.innerHTML = '<i id="themeIcon" class="bi bi-sun"></i> <span id="themeText">Tema Claro</span>';
        }
        atualizarEstilosTabela();
    });

    function atualizarEstilosTabela() {
        const tabela = document.querySelector(".table");
        body.classList.contains("dark-theme") ? tabela.classList.add("table-dark") : tabela.classList.remove("table-dark");
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    body.classList.add(savedTheme + "-theme");
    toggleThemeButton.innerHTML = savedTheme === "dark"
        ? '<i id="themeIcon" class="bi bi-moon-stars"></i> <span id="themeText">Tema Escuro</span>'
        : '<i id="themeIcon" class="bi bi-sun"></i> <span id="themeText">Tema Claro</span>';
    atualizarEstilosTabela();
}

function configurarFiltros() {
    const clearFiltersButton = document.getElementById("clear-filters");
    const filterMonth = document.getElementById("filter-month");
    const filterYear = document.getElementById("filter-year");
    const applyFiltersButton = document.getElementById("apply-filters");

    clearFiltersButton.addEventListener("click", async () => {
        filterMonth.value = "";
        filterYear.value = "";
        applyFiltersButton.classList.remove("active");
        const transacoesOriginais = await fetchTransacoes();
        renderizarTransacoes(transacoesOriginais);
    });

    applyFiltersButton.addEventListener("click", async () => {
        applyFiltersButton.classList.add("active");
        const transacoesOriginais = await fetchTransacoes();
        const selectedMonth = parseInt(filterMonth.value);
        const selectedYear = parseInt(filterYear.value);

        const transacoesFiltradas = transacoesOriginais.filter((transacao) => {
            const data = new Date(transacao.data);
            return (!selectedMonth || data.getMonth() + 1 === selectedMonth) &&
                   (!selectedYear || data.getFullYear() === selectedYear);
        });

        renderizarTransacoes(transacoesFiltradas);
    });
}

function configurarEventosMenu() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-link');

    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.endsWith(href)) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
            item.style.pointerEvents = 'none';
            item.setAttribute('tabindex', '-1');
        } else {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            item.removeAttribute('tabindex');
            item.style.pointerEvents = '';
        }
    });
}

function configurarEventosTransacoes(transacoesOriginais) {
    const transacoesLista = document.getElementById("transacoes-lista");
    const transactionForm = document.getElementById("transactionForm");

    transacoesLista.addEventListener("click", function (event) {
        const target = event.target;
        if (target.closest(".btn-edit")) editarTransacao(target.closest("tr"));
        if (target.closest(".btn-delete")) excluirTransacao(target.closest("tr"));
    });

    document.querySelector('[href="#todas"]').addEventListener("click", async () => {
        renderizarTransacoes(await fetchTransacoes());
    });

    document.querySelector('[href="#receitas"]').addEventListener("click", async () => {
        const receitas = (await fetchTransacoes()).filter(t => t.tipo === "Receita");
        renderizarTransacoes(receitas);
    });

    document.querySelector('[href="#despesas"]').addEventListener("click", async () => {
        const despesas = (await fetchTransacoes()).filter(t => t.tipo === "Despesa");
        renderizarTransacoes(despesas);
    });

    document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addTransactionModal"]')
        .addEventListener("click", () => {
            transactionForm.reset();
            document.getElementById("addTransactionButton").textContent = "Adicionar Transação";
            document.getElementById("addTransactionButton").removeAttribute("data-editing-id");
            addTransactionModal.show();
        });

    const addTransactionButton = document.getElementById("addTransactionButton");

    transactionForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = transactionName.value;
        const tipo = transactionType.value;
        const categoria = transactionCategory.value;
        const valor = parseFloat(transactionValue.value);
        const data = transactionDate.value;

        if (!nome || !tipo || !categoria || isNaN(valor) || !data) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const novaTransacao = {
            nome, tipoTransacaoId: tipo === "receita" ? 1 : 2,
            meioPagamentoId: 1, categoriaId: categoria,
            valor, data
        };

        try {
            const id = addTransactionButton.dataset.editingId;
            const response = await fetchComToken(id ? `/api/alterar_transacao/${id}` : "/api/adicionar_transacao", {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(novaTransacao)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Erro ao salvar: ${errorData.error || response.statusText}`);
                return;
            }

            const transacoesAtualizadas = await fetchTransacoes();
            renderizarTransacoes(transacoesAtualizadas);
            addTransactionModal.hide();

            mostrarAlerta(id ? 'alertaEdicao' : 'alertaAdicao');

            transactionForm.reset();
            addTransactionButton.removeAttribute("data-editing-id");
            addTransactionButton.textContent = "Adicionar Transação";

        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao salvar a transação.");
        }
    });

    document.getElementById("addTransactionModal").addEventListener("hidden.bs.modal", () => {
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

    transactionName.value = nome;
    transactionType.value = tipoTexto === "Receita" ? "receita" : "despesa";
    transactionCategory.value = categoria;
    transactionValue.value = parseFloat(valorTexto);
    transactionDate.value = data;

    const addTransactionButton = document.getElementById("addTransactionButton");
    addTransactionButton.dataset.editingId = id;
    addTransactionButton.textContent = "Salvar Alterações";

    addTransactionModal.show();
};

const excluirTransacao = async (linha) => {
    const id = linha.dataset.id;
    if (!confirm("Tem certeza de que deseja excluir esta transação?")) return;

    try {
        const response = await fetchComToken(`/api/deletar_transacao/${id}`, { method: "DELETE" });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Erro ao excluir: ${errorData.error || response.statusText}`);
            return;
        }

        linha.remove();
        mostrarAlerta('alertaExclusao');

        const transacoesAtualizadas = await fetchTransacoes();
        renderizarTransacoes(transacoesAtualizadas);
    } catch (error) {
        console.error("Erro:", error);
        alert("Falha ao excluir a transação.");
    }
};

const fetchTransacoes = async () => {
    try {
        const response = await fetchComToken("/api/listar_transacoes", { method: "GET" });
        if (!response.ok) {
            const errorData = await response.json();
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

function atualizarSaldoTotal() {
    let totalReceitas = 0;
    let totalDespesas = 0;

    document.querySelectorAll("#transacoes-lista tr").forEach((linha) => {
        let tipo = linha.cells[1].textContent.trim();
        let valorTexto = linha.cells[3].textContent.trim().replace("R$", "").replace(",", ".");
        let valor = parseFloat(valorTexto);

        if (tipo === "Receita") totalReceitas += valor;
        else if (tipo === "Despesa") totalDespesas += valor;
    });

    let saldoTotal = totalReceitas - totalDespesas;
    let saldoElement = document.getElementById("total-balance");
    saldoElement.textContent = `Saldo Total: R$ ${Math.abs(saldoTotal).toFixed(2)}`;

    saldoElement.classList.toggle("positive", saldoTotal >= 0);
    saldoElement.classList.toggle("negative", saldoTotal < 0);
}

// 🔔 Função genérica para exibir alertas
function mostrarAlerta(id) {
    const alerta = document.getElementById(id);
    alerta.classList.remove('d-none');
    alerta.classList.add('show');
    setTimeout(() => {
        alerta.classList.remove('show');
        alerta.classList.add('d-none');
    }, 1750);
}
