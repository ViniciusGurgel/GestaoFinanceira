document.addEventListener("DOMContentLoaded", function () {
    // Alternar Tema Escuro/Claro
    const themeButton = document.getElementById("toggleTheme");
    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    // Gerenciar Categorias
    const categoryList = document.getElementById("categoryList");
    const newCategoryInput = document.getElementById("newCategory");
    const addCategoryButton = document.getElementById("addCategory");

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
});
