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

document.addEventListener("DOMContentLoaded", function () {
    const categoryList = document.getElementById("categoryList");
    const newCategoryInput = document.getElementById("newCategory");
    const saveCategoryButton = document.getElementById("saveCategoryButton");
    const categoryNameInput = document.getElementById("categoryName");
    const categoryColorInput = document.getElementById("categoryColor");
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");
    const categoryToDeleteNameElement = document.getElementById("categoryToDeleteName");
    const categoryToDeleteColorElement = document.getElementById("categoryToDeleteColor");
    const editCategoryNameInput = document.getElementById("editCategoryName");
    const editCategoryColorInput = document.getElementById("editCategoryColor");
    const saveEditCategoryButton = document.getElementById("saveEditCategoryButton");
    const editButton = document.getElementById("editButton");
    const saveButton = document.getElementById("saveButton");
    const updateUsernameButton = document.getElementById("updateUsername");
    const updatePasswordButton = document.getElementById("updatePassword");
    const editUserButton = document.getElementById("editUserButton");
    const saveUserButton = document.getElementById("saveUserButton");
    const profileImage = document.querySelector(".profile-image");
    const profileImageInput = document.getElementById("profileImageInput");
    const saveProfileImageButton = document.getElementById("saveProfileImageButton");
    const themeButton = document.getElementById("toggleTheme");
    const darkThemeButton = document.getElementById("darkThemeButton");
    const lightThemeButton = document.getElementById("lightThemeButton");

    let categoryToDelete = null;
    let categoryToEdit = null;

    // Função auxiliar
    function rgbToHex(rgb) {
        const rgbValues = rgb.match(/\d+/g);
        return `#${rgbValues.map(v => parseInt(v).toString(16).padStart(2, "0")).join("")}`;
    }

    // Carregar categorias
    fetchComToken('/personalizar/listar_categorias')
        .then(response => response.json())
        .then(categorias => {
            categorias.forEach(categoria => {
                const li = document.createElement('li');
                li.className = "list-group-item d-flex align-items-center justify-content-between";
                li.setAttribute("data-bs-toggle", "modal");
                li.setAttribute("data-bs-target", "#editCategoryModal");
                li.setAttribute("data-category-name", categoria.Nome);
                li.style.cursor = "pointer";

                li.innerHTML = `
                    <div class="d-flex align-items-center">
                        <span class="category-color" style="width: 20px; height: 20px; background-color: ${categoria.Cor || '#6c757d'}; border-radius: 50%; display: inline-block; margin-right: 10px;"></span>
                        ${categoria.Nome}
                    </div>
                    <button class="btn btn-sm btn-danger delete-category-btn" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal">
                        <i class="bi bi-trash"></i>
                    </button>
                `;

                li.querySelector(".delete-category-btn").addEventListener("click", function (e) {
                    e.stopPropagation();
                    categoryToDelete = li;
                    categoryToDeleteNameElement.textContent = categoria.Nome;
                    categoryToDeleteColorElement.style.backgroundColor = categoria.Cor || "#6c757d";
                    new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
                });

                li.addEventListener("click", function () {
                    categoryToEdit = li;
                    editCategoryNameInput.value = categoria.Nome;
                    editCategoryColorInput.value = categoria.Cor || "#6c757d";
                });

                categoryList.appendChild(li);
            });
        })
        .catch(error => console.error("Erro ao carregar categorias:", error));

    // Tema
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });

    darkThemeButton.addEventListener("click", () => {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
    });

    lightThemeButton.addEventListener("click", () => {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
    });

    // Adicionar categoria
    saveCategoryButton.addEventListener("click", function () {
        const categoryName = categoryNameInput.value.trim();
        const categoryColor = categoryColorInput.value;
    
        if (!categoryName) return alert("Por favor, insira um nome para a categoria.");
    
        fetchComToken('/personalizar/incluir_categoria', {
            method: 'POST',
            body: JSON.stringify({ nome: categoryName, cor: categoryColor })
        })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao adicionar categoria");
            return response.json();
        })
        .then(data => {
            // Atualiza a UI
            const newCategoryItem = document.createElement("li");
            newCategoryItem.className = "list-group-item d-flex align-items-center justify-content-between";
            newCategoryItem.setAttribute("data-category-id", data.categoriaId);
            newCategoryItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="category-color" style="width: 20px; height: 20px; background-color: ${categoryColor}; border-radius: 50%; display: inline-block; margin-right: 10px;"></span>
                    ${categoryName}
                </div>
                <button class="btn btn-sm btn-danger delete-category-btn" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal">
                    <i class="bi bi-trash"></i>
                </button>
            `;
    
            newCategoryItem.querySelector(".delete-category-btn").addEventListener("click", function (e) {
                e.stopPropagation();
                categoryToDelete = newCategoryItem;
                categoryToDeleteNameElement.textContent = categoryName;
                categoryToDeleteColorElement.style.backgroundColor = categoryColor;
                new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
            });
    
            newCategoryItem.addEventListener("click", function () {
                categoryToEdit = newCategoryItem;
                editCategoryNameInput.value = categoryName;
                editCategoryColorInput.value = categoryColor;
            });
    
            categoryList.appendChild(newCategoryItem);
            categoryNameInput.value = "";
            categoryColorInput.value = "#6c757d";
            bootstrap.Modal.getInstance(document.getElementById("addCategoryModal")).hide();
        })
        .catch(error => alert("Erro ao salvar categoria: " + error.message));
    });
    

    confirmDeleteButton.addEventListener("click", function () {
        if (categoryToDelete) {
            const categoryId = categoryToDelete.getAttribute("data-category-id");
    
            fetchComToken(`/personalizar/deletar_categoria/${categoryId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) throw new Error("Erro ao deletar categoria");
                return response.json();
            })
            .then(data => {
                categoryToDelete.remove();
                categoryToDelete = null;
                bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal")).hide();
            })
            .catch(error => alert("Erro ao excluir categoria: " + error.message));
        }
    });

    // Editar categoria
    saveEditCategoryButton.addEventListener("click", function () {
        if (!categoryToEdit) return;
        const newCategoryName = editCategoryNameInput.value.trim();
        const newCategoryColor = editCategoryColorInput.value;

        if (!newCategoryName) return alert("Por favor, insira um nome válido para a categoria.");

        categoryToEdit.querySelector("div.d-flex.align-items-center").textContent = newCategoryName;
        categoryToEdit.querySelector(".category-color").style.backgroundColor = newCategoryColor;

        bootstrap.Modal.getInstance(document.getElementById("editCategoryModal")).hide();
    });

    // Edição de perfil
    const inputs = document.querySelectorAll("form input");
    inputs.forEach(input => input.setAttribute("readonly", true));
    saveButton.disabled = true;

    editButton.addEventListener("click", function () {
        inputs.forEach(input => input.removeAttribute("readonly"));
        saveButton.disabled = false;
        editButton.disabled = true;
    });

    saveButton.addEventListener("click", function () {
        inputs.forEach(input => input.setAttribute("readonly", true));
        saveButton.disabled = true;
        editButton.disabled = false;
        alert("Alterações salvas com sucesso!");
    });

    editUserButton.addEventListener("click", function () {
        inputs.forEach(input => input.removeAttribute("readonly"));
        saveUserButton.disabled = false;
        editUserButton.disabled = true;
    });

    saveUserButton.addEventListener("click", function () {
        inputs.forEach(input => input.setAttribute("readonly", true));
        saveUserButton.disabled = true;
        editUserButton.disabled = false;
        alert("Alterações salvas com sucesso!");
    });

    // Atualizar nome de usuário
    updateUsernameButton.addEventListener("click", function () {
        const newUsername = document.getElementById("newUsername").value.trim();
        if (newUsername) alert(`Nome de usuário alterado para: ${newUsername}`);
    });

    // Atualizar senha
    updatePasswordButton.addEventListener("click", function () {
        const newPassword = document.getElementById("newPassword").value.trim();
        if (newPassword) alert("Senha alterada com sucesso!");
    });

    // Imagem de perfil
    saveProfileImageButton.addEventListener("click", function () {
        const file = profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
                bootstrap.Modal.getInstance(document.getElementById("profileModal")).hide();
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecione uma imagem.");
        }
    });
});
