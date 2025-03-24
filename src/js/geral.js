

let userName = 'João'; 
document.getElementById('user-name').textContent = userName;


document.addEventListener("DOMContentLoaded", function () {
    const addTransactionModal = new bootstrap.Modal(document.getElementById("addTransactionModal"));

    document.querySelector('[data-bs-target="#addTransactionModal"]').addEventListener("click", function () {
        addTransactionModal.show();
    });
});
