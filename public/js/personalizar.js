document.addEventListener("DOMContentLoaded", function () {


    const editButton = document.getElementById("editButton"); 
    const saveButton = document.getElementById("saveButton"); 
    const inputs = document.querySelectorAll("form input");

    // Bloqueia os campos inicialmente
    inputs.forEach(input => input.setAttribute("readonly", true));

    // Habilita a edição ao clicar no botão "Editar"
    editButton.addEventListener("click", function () {
        inputs.forEach(input => input.removeAttribute("readonly"));
        saveButton.disabled = false; // Habilita o botão "Salvar"
        editButton.disabled = true; // Desabilita o botão "Editar"
    });

    // Salva as alterações e bloqueia os campos novamente
    saveButton.addEventListener("click", function () {
        inputs.forEach(input => input.setAttribute("readonly", true));
        saveButton.disabled = true; // Desabilita o botão "Salvar"
        editButton.disabled = false; // Habilita o botão "Editar"
        alert("Alterações salvas com sucesso!");
    });

    // Desabilita o botão "Salvar" inicialmente
    saveButton.disabled = true;

    
    // Alternar Tema Escuro/Claro
    const themeButton = document.getElementById("toggleTheme");
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        let theme = "light";
        if (document.body.classList.contains("dark-mode")) {
            theme = "dark";
        }
        localStorage.setItem("theme", theme);
    });

    const darkThemeButton = document.getElementById("darkThemeButton");
    const lightThemeButton = document.getElementById("lightThemeButton");

    // Função para aplicar o tema escuro
    darkThemeButton.addEventListener("click", function () {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
    });

    // Função para aplicar o tema claro
    lightThemeButton.addEventListener("click", function () {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
    });

    function saveCategoriesToStorage() {
        const categories = [];
        document.querySelectorAll("#categoryList li").forEach((li) => {
            const name = li.querySelector(".d-flex").textContent.trim();
            const color = li.querySelector(".category-color").style.backgroundColor;
            categories.push({ name, color });
        });
        localStorage.setItem("categories", JSON.stringify(categories));
    }
    
    function loadCategoriesFromStorage() {
        const categories = JSON.parse(localStorage.getItem("categories")) || [];
        categories.forEach(({ name, color }) => {
            
        });
    }
    
    document.addEventListener("DOMContentLoaded", function () {
        loadCategoriesFromStorage();
    });
    

    // Gerenciar Categorias
    const categoryList = document.getElementById("categoryList");
    const newCategoryInput = document.getElementById("newCategory");
    const saveCategoryButton = document.getElementById("saveCategoryButton");
    const categoryNameInput = document.getElementById("categoryName");
    const categoryColorInput = document.getElementById("categoryColor");
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");
    const categoryToDeleteNameElement = document.getElementById("categoryToDeleteName");
    const categoryToDeleteColorElement = document.getElementById("categoryToDeleteColor");
    let categoryToDelete = null; // Armazena a categoria a ser excluída

    addCategoryButton.addEventListener("click", function () {
        const category = newCategoryInput.value.trim();
        if (category) {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.textContent = category;
            categoryList.appendChild(li);
            newCategoryInput.value = "";
        }
    });

    // Função para adicionar uma nova categoria
    saveCategoryButton.addEventListener("click", function () {
        const categoryName = categoryNameInput.value.trim();
        const categoryColor = categoryColorInput.value;

        if (categoryName) {
            // Cria o item da categoria
            const newCategoryItem = document.createElement("li");
            newCategoryItem.className = "list-group-item d-flex align-items-center justify-content-between";

            // Adiciona a cor e o nome da categoria
            newCategoryItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="category-color" style="width: 20px; height: 20px; background-color: ${categoryColor}; border-radius: 50%; display: inline-block; margin-right: 10px;"></span>
                    ${categoryName}
                </div>
                <button class="btn btn-sm btn-danger delete-category-btn">x</button>
            `;

            // Adiciona o evento de exclusão ao botão "x"
            newCategoryItem.querySelector(".delete-category-btn").addEventListener("click", function () {
                categoryToDelete = newCategoryItem; // Armazena o item da categoria
                const categoryName = categoryToDelete.querySelector(".d-flex").textContent.trim(); // Obtém o nome da categoria
                const categoryColor = categoryToDelete.querySelector(".category-color").style.backgroundColor; // Obtém a cor da categoria

                // Exibe o nome e a cor no modal
                categoryToDeleteNameElement.textContent = categoryName;
                categoryToDeleteColorElement.style.backgroundColor = categoryColor;

                const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
                confirmDeleteModal.show(); // Exibe o modal de confirmação
            });

            // Adiciona o item à lista
            categoryList.appendChild(newCategoryItem);

            // Limpa os campos de entrada e fecha o modal
            categoryNameInput.value = "";
            categoryColorInput.value = "#6c757d"; // Reseta para a cor padrão
            const addCategoryModal = bootstrap.Modal.getInstance(document.getElementById("addCategoryModal"));
            addCategoryModal.hide();
        } else {
            alert("Por favor, insira um nome para a categoria.");
        }
    });

    // Adiciona funcionalidade de exclusão para categorias existentes
    document.querySelectorAll(".delete-category-btn").forEach((button) => {
        button.addEventListener("click", function () {
            categoryToDelete = button.closest("li"); // Armazena o item da categoria
            const categoryName = categoryToDelete.querySelector(".d-flex").textContent.trim(); // Obtém o nome da categoria
            const categoryColor = categoryToDelete.querySelector(".category-color").style.backgroundColor; // Obtém a cor da categoria

            // Exibe o nome e a cor no modal
            categoryToDeleteNameElement.textContent = categoryName;
            categoryToDeleteColorElement.style.backgroundColor = categoryColor;

            const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
            confirmDeleteModal.show(); // Exibe o modal de confirmação
        });
    });

    // Confirma a exclusão da categoria
    confirmDeleteButton.addEventListener("click", function () {
        if (categoryToDelete) {
            categoryToDelete.remove(); // Remove a categoria da lista
            categoryToDelete = null; // Reseta a variável
            const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
            confirmDeleteModal.hide(); // Fecha o modal
        }
    });

    // Alterar Nome de Usuário
    const updateUsernameButton = document.getElementById("updateUsername");
    updateUsernameButton.addEventListener("click", function () {
        const newUsername = document.getElementById("newUsername").value.trim();
        if (newUsername) {
            alert(`Nome de usuário alterado para: ${newUsername}`);
        }
    });

    // Alterar Senha
    const updatePasswordButton = document.getElementById("updatePassword");
    updatePasswordButton.addEventListener("click", function () {
        const newPassword = document.getElementById("newPassword").value.trim();
        if (newPassword) {
            alert("Senha alterada com sucesso!");
        }
    });

    const profileImage = document.querySelector(".profile-image");
    const profileImageInput = document.getElementById("profileImageInput");
    const saveProfileImageButton = document.getElementById("saveProfileImageButton");

    saveProfileImageButton.addEventListener("click", function () {
        const file = profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result; // Atualiza a imagem no card de usuário
                const modal = bootstrap.Modal.getInstance(document.getElementById("profileModal"));
                modal.hide(); // Fecha o modal
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecione uma imagem.");
        }
    });

    const editCategoryButtons = document.querySelectorAll(".edit-category-btn");
    const editCategoryNameInput = document.getElementById("editCategoryName");
    const editCategoryColorInput = document.getElementById("editCategoryColor");
    let categoryToEdit = null;

    // Abrir o modal de edição com os dados da categoria
    editCategoryButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            const categoryItem = event.target.closest("li");
            const categoryName = categoryItem.querySelector("div.d-flex.align-items-center").textContent.trim();
            const categoryColor = categoryItem.querySelector(".category-color").style.backgroundColor;

            categoryToEdit = categoryItem; // Salva a referência da categoria que está sendo editada
            editCategoryNameInput.value = categoryName; // Preenche o campo com o nome da categoria
            editCategoryColorInput.value = rgbToHex(categoryColor); // Preenche o campo com a cor da categoria
        });
    });

    // Salvar as alterações da categoria
    const saveEditCategoryButton = document.getElementById("saveEditCategoryButton");
    saveEditCategoryButton.addEventListener("click", function () {
        if (categoryToEdit) {
            const newCategoryName = editCategoryNameInput.value.trim();
            const newCategoryColor = editCategoryColorInput.value;

            if (newCategoryName) {
                categoryToEdit.querySelector("div.d-flex.align-items-center").textContent = newCategoryName;
                categoryToEdit.querySelector(".category-color").style.backgroundColor = newCategoryColor;

                const editCategoryModal = bootstrap.Modal.getInstance(document.getElementById("editCategoryModal"));
                editCategoryModal.hide();
            } else {
                alert("Por favor, insira um nome válido para a categoria.");
            }
        }
    });

    // Função para converter RGB para HEX
    function rgbToHex(rgb) {
        const rgbValues = rgb.match(/\d+/g);
        return `#${rgbValues.map(value => parseInt(value).toString(16).padStart(2, "0")).join("")}`;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Edição do Card de Usuário
    const editUserButton = document.getElementById("editUserButton");
    const saveUserButton = document.getElementById("saveUserButton");
    const userInputs = document.querySelectorAll("form input");

    // Bloqueia os campos inicialmente
    userInputs.forEach(input => input.setAttribute("readonly", true));

    // Habilita a edição ao clicar no botão "Editar" do card de usuário
    editUserButton.addEventListener("click", function () {
        userInputs.forEach(input => input.removeAttribute("readonly"));
        saveUserButton.disabled = false; // Habilita o botão "Salvar"
        editUserButton.disabled = true; // Desabilita o botão "Editar"
    });

    // Salva as alterações e bloqueia os campos novamente
    saveUserButton.addEventListener("click", function () {
        userInputs.forEach(input => input.setAttribute("readonly", true));
        saveUserButton.disabled = true; // Desabilita o botão "Salvar"
        editUserButton.disabled = false; // Habilita o botão "Editar"
        alert("Alterações salvas com sucesso!");
    });

    // Desabilita o botão "Salvar" inicialmente
    saveUserButton.disabled = true;

    // Edição de Categorias
    const editCategoryButtons = document.querySelectorAll(".edit-category-btn");
    const editCategoryNameInput = document.getElementById("editCategoryName");
    const editCategoryColorInput = document.getElementById("editCategoryColor");
    let categoryToEdit = null;

    // Abrir o modal de edição com os dados da categoria
    editCategoryButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            const categoryItem = event.target.closest("li");
            const categoryName = categoryItem.querySelector("div.d-flex.align-items-center").textContent.trim();
            const categoryColor = categoryItem.querySelector(".category-color").style.backgroundColor;

            categoryToEdit = categoryItem; // Salva a referência da categoria que está sendo editada
            editCategoryNameInput.value = categoryName; // Preenche o campo com o nome da categoria
            editCategoryColorInput.value = rgbToHex(categoryColor); // Preenche o campo com a cor da categoria
        });
    });

    // Salvar as alterações da categoria
    const saveEditCategoryButton = document.getElementById("saveEditCategoryButton");
    saveEditCategoryButton.addEventListener("click", function () {
        if (categoryToEdit) {
            const newCategoryName = editCategoryNameInput.value.trim();
            const newCategoryColor = editCategoryColorInput.value;

            if (newCategoryName) {
                categoryToEdit.querySelector("div.d-flex.align-items-center").textContent = newCategoryName;
                categoryToEdit.querySelector(".category-color").style.backgroundColor = newCategoryColor;

                const editCategoryModal = bootstrap.Modal.getInstance(document.getElementById("editCategoryModal"));
                editCategoryModal.hide();
            } else {
                alert("Por favor, insira um nome válido para a categoria.");
            }
        }
    });

    // Função para converter RGB para HEX
    function rgbToHex(rgb) {
        const rgbValues = rgb.match(/\d+/g);
        return `#${rgbValues.map(value => parseInt(value).toString(16).padStart(2, "0")).join("")}`;
    }
});
