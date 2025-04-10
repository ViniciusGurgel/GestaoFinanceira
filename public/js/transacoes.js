document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "login.html";
    }
    fetch('/api/verificar_token', {
        method: 'GET',
        headers: {
            'x-auth-token': token
        }
    })
    .then(response => {
        if (!response.ok) {
            window.location.href = "login.html";
        }
    })
    .catch(err => {
        console.error("Erro ao verificar o token:", err);
        window.location.href = "login.html";
    });
});


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


document.addEventListener("DOMContentLoaded", async function () {

    // Alternar entre tema claro e escuro
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
    });

    // Definir filtros
    const clearFiltersButton = document.getElementById("clear-filters");
    const filterMonth = document.getElementById("filter-month");
    const filterYear = document.getElementById("filter-year");
    const applyFiltersButton = document.getElementById("apply-filters");
    const totalBalanceElement = document.getElementById("total-balance");
    const transacoesLista = document.getElementById("transacoes-lista");

    clearFiltersButton.addEventListener("click", () => {
        filterMonth.value = "";
        filterYear.value = "";
        applyFiltersButton.classList.remove("active");
    });

    applyFiltersButton.addEventListener("click", () => {
        applyFiltersButton.classList.add("active");
    });


    // Função para editar transação
    const editarTransacao = (linha) => {
        const id = linha.dataset.id;
        const tipo = linha.children[0].textContent.trim();
        const categoria = linha.children[1].textContent.trim();
        const valor = linha.children[2].textContent.replace("R$ ", "").trim();
        const data = linha.children[3].textContent.trim();

        // Preencher o modal com os dados existentes da transação
        document.getElementById("transactionType").value = tipo === "Receita" ? "receita" : "despesa";
        document.getElementById("transactionCategory").value = categoria;
        document.getElementById("transactionValue").value = parseFloat(valor);
        document.getElementById("transactionDate").value = data;

        // Adicionar um atributo temporário ao botão para indicar modo de edição
        const addTransactionButton = document.getElementById("addTransactionButton");
        addTransactionButton.dataset.editingId = id;
        addTransactionButton.textContent = "Salvar Alterações";

        // Exibir o modal
        addTransactionModal.show();
    };

    // Mostrar o modal quando o botão é clicado
    const addTransactionModalButton = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addTransactionModal"]');
    const addTransactionModal = new bootstrap.Modal(document.getElementById("addTransactionModal"));
    addTransactionModalButton.addEventListener("click", () => {
        addTransactionModal.show();
    });

    // Função para adicionar transação
    const addTransactionButton = document.getElementById("addTransactionButton");
    const transactionCategorySelect = document.getElementById("transactionCategory");

    addTransactionButton.addEventListener("click", async (event) => {
        event.preventDefault();

        // Obter os dados do formulário
        const tipo = document.getElementById("transactionType").value;
        const categoria = transactionCategorySelect.value; // Obtém o valor selecionado no select
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
            categoriaId: categoria, // Envia o valor selecionado no select
            valor: valor,
            data: data
        };

        try {
            let response;
            const id = addTransactionButton.dataset.editingId;
            if (id) {
                // Editar
                response = await fetchComToken(`/api/alterar_transacao/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(novaTransacao)
                });
            } else {
                // Adicionar
                response = await fetchComToken("/api/adicionar_transacao", {
                    method: "POST",
                    body: JSON.stringify(novaTransacao)
                });
            }
            window.location.reload();
        
            // Fechar o modal e resetar o botão
            addTransactionModal.hide();
            addTransactionButton.removeAttribute("data-editing-id"); // Remove o atributo de edição
            addTransactionButton.textContent = "Adicionar Transação"; // Reseta o texto do botão
        
            // Atualizar a lista de transações
            const transacoesAtualizadas = await fetchTransacoes();
            renderizarTransacoes(transacoesAtualizadas);
        
        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao salvar a transação.");
        }        
    });

    // Lista original de transações
    const fetchTransacoes = async () => {
        try {
            const response = await fetchComToken("/api/listar_transacoes");
            if (!response.ok) throw new Error("Erro ao buscar transações");
            const transacoes = await response.json();
            return transacoes.map(transacao => ({
                id: transacao.Id,
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
        transacoesLista.innerHTML = "";
        transacoes.forEach((transacao) => {
            const novaLinha = document.createElement("tr");
            novaLinha.dataset.id = transacao.id;
            novaLinha.innerHTML = `
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


    // Adicionar eventos aos botões de editar e excluir
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

    // Inicializar com a lista original
    const transacoesOriginais = await fetchTransacoes();
    renderizarTransacoes(transacoesOriginais);

    // Recarregar lista original ao clicar na aba "Todas"
    document.querySelector('[href="#todas"]').addEventListener("click", () => {
        renderizarTransacoes(transacoesOriginais);
        atualizarSaldoTotal();
    });

    // Recarregar lista de receitas
    document.querySelector('[href="#receitas"]').addEventListener("click", () => {
        const receitas = transacoesOriginais.filter((t) => t.tipo === "Receita");
        renderizarTransacoes(receitas);
        atualizarSaldoTotal();
    });

    // Recarregar lista de despesas
    document.querySelector('[href="#despesas"]').addEventListener("click", () => {
        const despesas = transacoesOriginais.filter((t) => t.tipo === "Despesa");
        renderizarTransacoes(despesas);
        atualizarSaldoTotal();
    });

    

    const modal = document.getElementById("addTransactionModal");

    modal.addEventListener("hidden.bs.modal", function () {
        // Remove manualmente o backdrop caso ele permaneça
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

        document.body.classList.remove("modal-open"); // Remove a classe que impede o scroll
        document.body.style = "";

    });

     // Obtém o caminho da URL atual
     const currentPath = window.location.pathname;

     // Obtém todos os itens de menu
     const menuItems = document.querySelectorAll('.menu-link');
 
     // Remove a classe "active" de todos os itens e desativa o link da página atual
     menuItems.forEach(item => {
         item.classList.remove('active');
         item.removeAttribute('aria-current');
         item.removeAttribute('tabindex');
         item.style.pointerEvents = ''; // Reativa o link
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
});


function atualizarSaldoTotal() {
    let totalReceitas = 0;
    let totalDespesas = 0;

    // Seleciona todas as linhas da tabela
    document.querySelectorAll("#transacoes-lista tr").forEach((linha) => {
        let tipo = linha.cells[0].textContent.trim(); // "Receita" ou "Despesa"
        let valorTexto = linha.cells[2].textContent.trim().replace("R$", "").replace(",", ".");
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

    // Adiciona classes para mudar a cor do saldo
    if (saldoTotal >= 0) {
        saldoElement.classList.remove("negative");
        saldoElement.classList.add("positive");
    } else {
        saldoElement.classList.remove("positive");
        saldoElement.classList.add("negative");
    }
}