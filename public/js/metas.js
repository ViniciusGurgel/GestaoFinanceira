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
    const goalsList = document.getElementById("goals-list");
    const goalsCards = document.getElementById("goals-cards");
    const goalForm = document.getElementById("goalForm");
    
    // Lista de metas (será preenchida pelo backend)
    let goals = [];

    // Função para carregar metas do backend
    async function carregarMetas() {
        try {
            const response = await fetchComToken('/metas/listar_metas');
            
            if (!response.ok) {
                throw new Error('Erro ao carregar metas');
            }
            
            goals = await response.json();
            renderGoals();
            
        } catch (error) {
            console.error('Erro ao carregar metas:', error);
            mostrarAlerta('Erro ao carregar metas', 'danger');
        }
    }

    // Função para renderizar as metas com tratamento seguro de números
    function renderGoals() {
        goalsList.innerHTML = "";
        goalsCards.innerHTML = "";

        goals.forEach((goal, index) => {
            // Garante que os valores numéricos sejam tratados corretamente
            const saved = parseFloat(goal.saved) || 0;
            const goalValue = parseFloat(goal.goal) || 0;
            const minMonthly = parseFloat(goal.minMonthly) || 0;
            const monthsLeft = parseInt(goal.monthsLeft) || 1;
            
            const remaining = Math.max(0, goalValue - saved);
            const progress = goalValue > 0 ? (saved / goalValue) * 100 : 0;
            const monthsProgress = ((12 - monthsLeft) / 12) * 100;

            // Adiciona à tabela
            let row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${goal.title || 'Sem título'}</td>
                    <td>R$ ${goalValue.toFixed(2)}</td>
                    <td>${monthsLeft} meses</td>
                    <td class="text-center">
                        <div class="d-flex justify-content-center gap-1">
                            <button class="btn btn-outline-primary btn-sm" onclick="openEditModal(${index})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteGoal(${index})" title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            goalsList.innerHTML += row;

            // Adiciona aos cards no carrossel
            let card = `
                <div class="swiper-slide">
                    <div class="card border-0 shadow">
                        <div class="card-header text-white text-center" style="background-color:rgba(103, 89, 195, 0.88);">
                            <h5>${goal.title || 'Sem título'}</h5>
                        </div>
                        <div class="card-body text-center">
                            <canvas id="semiDonutChart-${index}" width="100" height="50"></canvas>
                            <h3 class="mt-3">R$${saved.toFixed(2)} / R$${goalValue.toFixed(2)}</h3>
                            <table class="table table-borderless mt-3">
                                <tbody>
                                    <tr><td>Contribuição Mínima Mensal</td><td>R$${minMonthly.toFixed(2)}</td></tr>
                                    <tr><td>Total Guardado</td><td>R$${saved.toFixed(2)}</td></tr>
                                    <tr><td>Restante para Guardar</td><td>R$${remaining.toFixed(2)}</td></tr>
                                </tbody>
                            </table>
                            <div class="d-flex align-items-center mt-3">
                                <i class="bi bi-alarm me-2"></i>
                                <div class="progress-container" style="width: 100%; background-color: #f1f1f1; border-radius: 10px; overflow: hidden; height: 20px;">
                                    <div class="progress-bar" style="width: ${monthsProgress}%; height: 100%; background-color: #4caf50;"></div>
                                </div>
                            </div>
                            <p class="mt-2">Tempo Restante: ${monthsLeft} meses</p>
                        </div>
                    </div>
                </div>
            `;
            goalsCards.innerHTML += card;

            // Renderiza o gráfico
            setTimeout(() => {
                const ctx = document.getElementById(`semiDonutChart-${index}`)?.getContext("2d");
                if (ctx) {
                    new Chart(ctx, {
                        type: "doughnut",
                        data: {
                            labels: ["Guardado", "Restante"],
                            datasets: [{
                                data: [saved, remaining],
                                backgroundColor: ["#4caf50", "#ccc"],
                                borderWidth: 1,
                            }],
                        },
                        options: {
                            rotation: -90,
                            circumference: 180,
                            responsive: true,
                            plugins: { legend: { display: false } },
                        },
                    });
                }
            }, 0);
        });

        // Reinitialize Swiper
        if (typeof Swiper !== 'undefined') {
            new Swiper(".mySwiper", {
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: 3, spaceBetween: 30 },
                },
            });
        }
    }

    // Carrega as metas quando a página é aberta
    carregarMetas();
    // Função para abrir o modal de edição
    window.openEditModal = function(index) {
        const meta = goals[index];
        
        document.getElementById("editGoalIndex").value = index;
        document.getElementById("editGoalId").value = meta.id;
        document.getElementById("editGoalTitle").value = meta.title;
        document.getElementById("editGoalValue").value = meta.goal;
        document.getElementById("editGoalSaved").value = meta.saved;
        document.getElementById("editGoalMonths").value = meta.monthsLeft;
        
        const editModal = new bootstrap.Modal(document.getElementById("editGoalModal"));
        editModal.show();
    };

    // Função para salvar alterações no modal de edição
    document.getElementById("editGoalForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const index = document.getElementById("editGoalIndex").value;
    const id = document.getElementById("editGoalId").value;
    const title = document.getElementById("editGoalTitle").value;
    const goal = parseFloat(document.getElementById("editGoalValue").value);
    const saved = parseFloat(document.getElementById("editGoalSaved").value);
    const monthsLeft = parseInt(document.getElementById("editGoalMonths").value);
    
    try {
        const response = await fetchComToken(`/metas/alterar_metas/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                title,
                goal,
                saved,
                monthsLeft
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar meta');
        
        const metaAtualizada = await response.json();
        goals[index] = metaAtualizada;
        
        renderGoals();
        bootstrap.Modal.getInstance(document.getElementById("editGoalModal")).hide();
        mostrarAlerta('Meta atualizada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao atualizar meta:', error);
        mostrarAlerta('Erro ao atualizar meta', 'danger');
    }
    });

    // Função para excluir uma meta
    window.deleteGoal = async function (index) {
        if (confirm("Tem certeza que deseja excluir esta meta?")) {
            goals.splice(index, 1); // Remove a meta da lista
            renderGoals();          // Re-renderiza a tabela e os cards
            mostrarAlerta('alertaExclusao'); // Exibe alerta de exclusão
        }

        const id = goals[index].id;

        try {
            const response = await fetchComToken(`/metas/deletar_metas/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Erro ao excluir meta');

            // Remove a meta da lista local
            goals.splice(index, 1);
            renderGoals();

            mostrarAlerta('Meta excluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir meta:', error);
            mostrarAlerta('Erro ao excluir meta', 'danger');
        }
    };

    // Captura evento de submissão do formulário de criação
    goalForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("goalTitle").value;
        const goal = parseFloat(document.getElementById("goalValue").value);
        const saved = parseFloat(document.getElementById("goalSaved").value) || 0;
        const monthsLeft = parseInt(document.getElementById("goalMonths").value);
        const minMonthly = goal / monthsLeft;

        try {
            const response = await fetchComToken('/metas/adicionar_metas', {
                method: 'POST',
                body: JSON.stringify({ 
                    title,
                    goal,
                    saved,
                    monthsLeft,
                    minMonthly
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Erro ao criar meta');

            const novaMeta = await response.json();
            goals.unshift(novaMeta);
            renderGoals();

            goalForm.reset();
            bootstrap.Modal.getInstance(document.getElementById("addGoalModal")).hide();
            mostrarAlerta('Meta criada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar meta:', error);
            mostrarAlerta('Erro ao criar meta: ' + error.message, 'danger');
        }
    });

    // Renderizar metas ao carregar a página
    renderGoals();

    // Gerenciamento de perfil
    const profileForm = document.getElementById("profileForm");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileDescription = document.getElementById("profileDescription");
    const profileImage = document.getElementById("profileImage");
    const userNameElement = document.querySelector(".user-name");
    const userDescriptionElement = document.querySelector(".user-description");
    const profileImageElement = document.querySelector(".profile-image");

    // Carregar informações do perfil do localStorage
    const loadProfile = () => {
        const profile = JSON.parse(localStorage.getItem("profile")) || {};
        if (profile.name) userNameElement.textContent = profile.name;
        if (profile.email) profileEmail.value = profile.email;
        if (profile.description) userDescriptionElement.textContent = profile.description;
        if (profile.image) profileImageElement.src = profile.image;
    };

    // Salvar informações do perfil no localStorage
    const saveProfile = (name, email, description, image) => {
        const profile = { name, email, description, image };
        localStorage.setItem("profile", JSON.stringify(profile));
        loadProfile();
    };

    // Manipular envio do formulário
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = profileName.value;
        const email = profileEmail.value;
        const description = profileDescription.value;
        let image = profileImageElement.src;

        // Atualizar imagem se um novo arquivo for selecionado
        if (profileImage.files && profileImage.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                image = e.target.result;
                saveProfile(name, email, description, image);
                const modal = bootstrap.Modal.getInstance(document.getElementById("profileModal"));
                modal.hide();
            };
            reader.readAsDataURL(profileImage.files[0]);
        } else {
            saveProfile(name, email, description, image);
            const modal = bootstrap.Modal.getInstance(document.getElementById("profileModal"));
            modal.hide();
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        const openModalButton = document.getElementById("openModalButton");
    
        if (openModalButton) {
            openModalButton.addEventListener("click", function () {
                var myModal = new bootstrap.Modal(document.getElementById("addGoalModal"));
                myModal.show();
            });
        } else {
            console.error("Elemento #openModalButton não encontrado!");
        }
    });

    // Carregar perfil ao iniciar
    loadProfile();
});
