async function fetchComToken(url, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado.");

    const headers = {
        ...options.headers,
        "x-auth-token": token,
        "Content-Type": "application/json"
    };

    return fetch(url, { ...options, headers });
}

document.addEventListener("DOMContentLoaded", function() {
    const categoryList = document.getElementById("categoryList");
    const addCategoryButton = document.getElementById("addCategoryButton");

    // Carregar categorias
    function carregarCategorias() {
        fetchComToken('/personalizar/listar_categorias')
            .then(response => response.json())
            .then(categorias => {
                console.log("Dados completos das categorias:", categorias);
                categoryList.innerHTML = '';
                categorias.forEach(categoria => {
                    const li = document.createElement('li');
                    li.className = "list-group-item d-flex align-items-center justify-content-between";
                    li.dataset.categoryId = categoria.Id;
                    
                    li.innerHTML = `
                        <div class="d-flex align-items-center">
                            <span class="category-color" style="width: 20px; height: 20px; background-color: ${categoria.Cor || '#6c757d'}; border-radius: 50%; margin-right: 10px;"></span>
                            ${categoria.Nome}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-primary me-1 edit-category-btn">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-category-btn">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;

                    // Evento para editar
                    li.querySelector('.edit-category-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        editarCategoria(categoria.Id);
                    });

                    // Evento para excluir
                    li.querySelector('.delete-category-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        excluirCategoria(categoria.Id, li);
                    });

                    categoryList.appendChild(li);
                });
            })
            .catch(error => {
                console.error("Erro ao carregar categorias:", error);
                alert("Erro ao carregar categorias");
            });
    }

    // Adicionar categoria
    addCategoryButton.addEventListener('click', () => {
        const nome = prompt("Digite o nome da nova categoria:");
        if (!nome) return;

        fetchComToken('/personalizar/incluir_categoria', {
            method: 'POST',
            body: JSON.stringify({ nome: nome, cor: "#6c757d" })
        })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao adicionar categoria");
            alert("Categoria adicionada com sucesso!");
            carregarCategorias();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao adicionar categoria: " + error.message);
        });
    });

    // Editar categoria
    function editarCategoria(categoriaId) {
        // Primeiro encontre a categoria na lista
        const categoria = Array.from(categoryList.children)
            .find(item => item.dataset.categoryId == categoriaId);
        
        if (!categoria) {
            alert("Categoria não encontrada!");
            return;
        }
    
        // Pegue o nome atual da categoria
        const nomeAtual = categoria.querySelector('div.d-flex.align-items-center').textContent.trim();
        
        const novoNome = prompt("Editar nome da categoria:", nomeAtual);
        if (!novoNome) return;
    
        fetchComToken(`/personalizar/editar_categoria/${categoriaId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                nome: novoNome,
                cor: "#6c757d" // Ou mantenha a cor existente se necessário
            })
        })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao editar categoria");
            return response.json();
        })
        .then(data => {
            // Atualiza apenas o nome na interface sem recarregar tudo
            categoria.querySelector('div.d-flex.align-items-center').innerHTML = `
                <span class="category-color" 
                      style="width: 20px; height: 20px; 
                      background-color: #6c757d; 
                      border-radius: 50%; margin-right: 10px;"></span>
                ${novoNome}
            `;
            alert("Categoria atualizada com sucesso!");
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao editar categoria: " + error.message);
        });
    }

    // Excluir categoria
    function excluirCategoria(id, elemento) {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

        fetchComToken(`/personalizar/deletar_categoria/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao excluir categoria");
            alert("Categoria excluída com sucesso!");
            elemento.remove();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao excluir categoria: " + error.message);
        });
    }

    // Inicializa
    carregarCategorias();
});