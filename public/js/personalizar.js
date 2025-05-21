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

// Modal para adicionar/editar categorias
function criarModalCategoria(categoria = null) {
    // Remove modal existente se houver
    const modalExistente = document.getElementById('categoryModal');
    if (modalExistente) modalExistente.remove();

    const modalHTML = `
    <div class="modal fade" id="categoryModal" tabindex="-1" aria-labelledby="categoryModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="categoryModalLabel">${categoria ? 'Editar' : 'Nova'} Categoria</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="categoryForm">
                        <div class="mb-3">
                            <label for="categoryName" class="form-label">Nome da Categoria</label>
                            <input type="text" class="form-control" id="categoryName" 
                                   value="${categoria?.Nome || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="categoryColor" class="form-label">Cor da Categoria</label>
                            <input type="color" class="form-control form-control-color" id="categoryColor" 
                                   value="${categoria?.Cor || '#6c757d'}" title="Escolha uma cor">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="saveCategoryBtn">Salvar</button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    
    return new Promise((resolve) => {
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            const nome = document.getElementById('categoryName').value.trim();
            const cor = document.getElementById('categoryColor').value;
            
            if (!nome) {
                alert('Por favor, insira um nome para a categoria');
                return;
            }
            
            modal.hide();
            resolve({ nome, cor });
        });
        
        modal.show();
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const categoryList = document.getElementById("categoryList");
    const addCategoryButton = document.getElementById("addCategoryButton");

    // Carregar categorias
    function carregarCategorias() {
        fetchComToken('/personalizar/listar_categorias')
            .then(response => {
                if (!response.ok) throw new Error("Erro ao carregar categorias");
                return response.json();
            })
            .then(categorias => {
                categoryList.innerHTML = '';
                
                if (categorias.length === 0) {
                    categoryList.innerHTML = '<li class="list-group-item text-muted">Nenhuma categoria cadastrada</li>';
                    return;
                }

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
                            <button class="btn btn-sm btn-primary me-1 edit-category-btn" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-category-btn" title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;

                    // Evento para editar
                    li.querySelector('.edit-category-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        editarCategoria(categoria);
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
                categoryList.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar categorias: ${error.message}</li>`;
            });
    }

    // Adicionar categoria
    addCategoryButton.addEventListener('click', async () => {
        try {
            const { nome, cor } = await criarModalCategoria();
            
            const response = await fetchComToken('/personalizar/incluir_categoria', {
                method: 'POST',
                body: JSON.stringify({ nome, cor })
            });

            if (!response.ok) throw new Error("Erro ao adicionar categoria");
            
            // Feedback visual
            addCategoryButton.innerHTML = '<i class="bi bi-check-circle"></i> Categoria adicionada!';
            setTimeout(() => {
                addCategoryButton.innerHTML = 'Adicionar Categoria';
            }, 2000);
            
            carregarCategorias();
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao adicionar categoria: " + error.message);
        }
    });

    // Editar categoria
    async function editarCategoria(categoria) {
        try {
            const { nome, cor } = await criarModalCategoria(categoria);
            
            const response = await fetchComToken(`/personalizar/editar_categoria/${categoria.Id}`, {
                method: 'PUT',
                body: JSON.stringify({ nome, cor })
            });

            if (!response.ok) throw new Error("Erro ao editar categoria");
            
            // Atualiza a categoria na lista
            const categoriaElement = document.querySelector(`li[data-category-id="${categoria.Id}"]`);
            if (categoriaElement) {
                categoriaElement.querySelector('div.d-flex.align-items-center').innerHTML = `
                    <span class="category-color" 
                          style="width: 20px; height: 20px; 
                          background-color: ${cor}; 
                          border-radius: 50%; margin-right: 10px;"></span>
                    ${nome}
                `;
                
                // Feedback visual
                const editBtn = categoriaElement.querySelector('.edit-category-btn');
                editBtn.innerHTML = '<i class="bi bi-check"></i>';
                setTimeout(() => {
                    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
                }, 1500);
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao editar categoria: " + error.message);
        }
    }

    // Excluir categoria
    async function excluirCategoria(id, elemento) {
        if (!confirm("Tem certeza que deseja excluir esta categoria?\nEsta ação não pode ser desfeita.")) return;

        try {
            const response = await fetchComToken(`/personalizar/deletar_categoria/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error("Erro ao excluir categoria");
            
            // Animação de remoção
            elemento.classList.add('fade-out');
            setTimeout(() => {
                elemento.remove();
                
                // Se não houver mais categorias, mostra mensagem
                if (categoryList.children.length === 0) {
                    categoryList.innerHTML = '<li class="list-group-item text-muted">Nenhuma categoria cadastrada</li>';
                }
            }, 300);
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao excluir categoria: " + error.message);
        }
    }

    // Inicializa
    carregarCategorias();
});