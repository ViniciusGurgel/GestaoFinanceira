document.addEventListener("DOMContentLoaded", function () {
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

    // Lidar com a submissão do formulário de transação
    const transactionForm = document.getElementById("transactionForm");
    transactionForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Capturar valores do formulário
        const tipo = document.getElementById("transactionType").value;
        const categoria = document.getElementById("transactionCategory").value;
        const valor = parseFloat(document.getElementById("transactionValue").value).toFixed(2);
        const data = document.getElementById("transactionDate").value;

        if (!categoria || isNaN(valor) || !data) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        // Criar uma nova linha na tabela de transações
        const tabela = document.getElementById("transacoes-lista");
        const novaLinha = document.createElement("tr");

        novaLinha.innerHTML = `
            <td>${tipo === "receita" ? "Receita" : "Despesa"}</td>
            <td>${categoria}</td>
            <td class="${tipo === "receita" ? "valor-receita" : "valor-despesa"}">R$ ${valor}</td>
            <td>${data}</td>
            <td>
                <button class="btn btn-sm btn-primary"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
            </td>
        `;

        // Adiciona a linha à tabela
        tabela.appendChild(novaLinha);

        // Fechar o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("addTransactionModal"));
        modal.hide();

        // Resetar o formulário
        transactionForm.reset();
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

    const updateTotalBalance = (balance) => {
        totalBalanceElement.textContent = `Saldo Total: R$ ${balance.toFixed(2)}`;
        if (balance < 0) {
            totalBalanceElement.classList.remove("positive");
            totalBalanceElement.classList.add("negative");
        } else {
            totalBalanceElement.classList.remove("negative");
            totalBalanceElement.classList.add("positive");
        }
    };

    // Exemplo de cálculo do saldo total
    const saldoTotal = 2850; // Substitua pelo cálculo real
    updateTotalBalance(saldoTotal);

    // Recarregar abas Receitas e Despesas
    document.querySelector('[href="#receitas"]').addEventListener("click", () => {
        transacoesLista.innerHTML = `
            <tr>
                <td>Receita</td>
                <td>Salário</td>
                <td class="valor-receita">R$ 3000,00</td>
                <td>2024-02-20</td>
                <td>
                    <button class="btn btn-sm btn-primary"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });

    document.querySelector('[href="#despesas"]').addEventListener("click", () => {
        transacoesLista.innerHTML = `
            <tr>
                <td>Despesa</td>
                <td>Alimentação</td>
                <td class="valor-despesa">R$ 150,00</td>
                <td>2024-01-15</td>
                <td>
                    <button class="btn btn-sm btn-primary"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });

    // Mostrar o modal quando o botão é clicado
    const addTransactionModalButton = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addTransactionModal"]');
    addTransactionModalButton.addEventListener("click", () => {
        const modal = new bootstrap.Modal(document.getElementById("addTransactionModal"));
        modal.show();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const fetchTransacoes = () => {
        fetch('/api/transacoes') 
            .then(response => response.json())
            .then(data => {
                const transacoesLista = document.getElementById("transacoes-lista");
                transacoesLista.innerHTML = '';

                data.forEach(transacao => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${transacao.Tipo}</td>
                        <td>${transacao.Categoria}</td>
                        <td class="${transacao.Tipo === 'Receita' ? 'valor-receita' : 'valor-despesa'}">R$ ${parseFloat(transacao.Valor).toFixed(2)}</td>
                        <td>${transacao.Data}</td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-edit"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger btn-delete"><i class="bi bi-trash"></i></button>
                        </td>
                    `;
                    transacoesLista.appendChild(row);
                });
            })
            .catch(error => console.error("Error loading transactions:", error));
    };

    fetchTransacoes();

});

document.addEventListener("DOMContentLoaded", function () {
    const transacoesLista = document.getElementById("transacoes-lista");

    // Função para editar uma transação
    const editarTransacao = (linha) => {
        const tipo = linha.children[0].textContent.trim();
        const categoria = linha.children[1].textContent.trim();
        const valor = linha.children[2].textContent.trim().replace("R$ ", "").replace(",", ".");
        const data = linha.children[3].textContent.trim();

        // Preencher o modal com os dados da transação
        document.getElementById("transactionType").value = tipo === "Receita" ? "receita" : "despesa";
        document.getElementById("transactionCategory").value = categoria;
        document.getElementById("transactionValue").value = parseFloat(valor);
        document.getElementById("transactionDate").value = data;

        // Abrir o modal
        const modal = new bootstrap.Modal(document.getElementById("addTransactionModal"));
        modal.show();

        // Atualizar a transação ao salvar
        const transactionForm = document.getElementById("transactionForm");
        transactionForm.onsubmit = function (event) {
            event.preventDefault();

            linha.children[0].textContent = document.getElementById("transactionType").value === "receita" ? "Receita" : "Despesa";
            linha.children[1].textContent = document.getElementById("transactionCategory").value;
            linha.children[2].textContent = `R$ ${parseFloat(document.getElementById("transactionValue").value).toFixed(2)}`;
            linha.children[3].textContent = document.getElementById("transactionDate").value;

            modal.hide();
            transactionForm.reset();
        };
    };

    // Função para excluir uma transação
    const excluirTransacao = (linha) => {
        if (confirm("Tem certeza de que deseja excluir esta transação?")) {
            linha.remove();
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
});