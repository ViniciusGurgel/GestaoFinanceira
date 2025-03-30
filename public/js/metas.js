document.addEventListener("DOMContentLoaded", function () {
    const goalsList = document.getElementById("goals-list");
    const goalsCards = document.getElementById("goals-cards");
    const goalForm = document.getElementById("goalForm");

    // Lista de metas
    let goals = [
        { id: 1, title: "Festival Rock in Rio", saved: 0, goal: 500, minMonthly: 50, monthsLeft: 10 },
        { id: 2, title: "Viagem para Europa", saved: 300, goal: 2000, minMonthly: 200, monthsLeft: 9 },
        { id: 3, title: "Novo Notebook", saved: 800, goal: 3000, minMonthly: 250, monthsLeft: 12 }
    ];

    function renderGoals() {
        // Limpa a tabela e os cards antes de renderizar
        goalsList.innerHTML = "";
        goalsCards.innerHTML = "";

        goals.forEach((goal, index) => {
            const remaining = goal.goal - goal.saved;
            const progress = (goal.saved / goal.goal) * 100;
            const monthsProgress = ((12 - goal.monthsLeft) / 12) * 100; // Progresso baseado nos meses restantes

            // Adiciona à tabela
            let row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${goal.title}</td>
                    <td>R$ ${goal.goal.toFixed(2)}</td>
                    <td>${goal.monthsLeft} meses</td>
                    <td class="text-center">
                        <div class="d-flex justify-content-center gap-1">
                            <button class="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center" onclick="openEditModal(${index})" title="Editar" style="width: 70px; background-color: #0100ffa3;">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center" onclick="deleteGoal(${index})" title="Excluir" style="width: 70px; background-color: #ff0000ba;">
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
                            <h5>${goal.title}</h5>
                        </div>
                        <div class="card-body text-center">
                            <!-- Gráfico Semi-Donut -->
                            <canvas id="semiDonutChart-${index}" width="100" height="50"></canvas>
                            <h3 class="mt-3">R$${goal.saved} / R$${goal.goal}</h3>

                            <table class="table table-borderless mt-3">
                                <tbody>
                                    <tr><td>Contribuição Mínima Mensal</td><td>R$${goal.minMonthly}</td></tr>
                                    <tr><td>Total Guardado</td><td>R$${goal.saved}</td></tr>
                                    <tr><td>Restante para Guardar</td><td>R$${remaining}</td></tr>
                                </tbody>
                            </table>

                            <!-- Barra de progresso para o tempo restante -->
                            <div class="progress-container mt-3" style="width: 100%; background-color: #f1f1f1; border-radius: 10px; overflow: hidden; height: 20px;">
                                <div class="progress-bar" style="width: ${monthsProgress}%; height: 100%; background-color: #ffcc00; transition: width 1.5s ease-in-out;"></div>
                            </div>
                            <p class="mt-2">Tempo Restante: ${goal.monthsLeft} meses</p>
                        </div>
                    </div>
                </div>
            `;
            goalsCards.innerHTML += card;

            // Renderiza o gráfico Semi-Donut
            setTimeout(() => {
                const ctx = document.getElementById(`semiDonutChart-${index}`).getContext("2d");
                new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Guardado", "Restante"],
                        datasets: [
                            {
                                data: [goal.saved, remaining],
                                backgroundColor: ["#4caf50", "#ccc"],
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        rotation: -90, // Começa no topo
                        circumference: 180, // Mostra apenas metade do donut
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false, // Remove a legenda
                            },
                        },
                    },
                });
            }, 0);

            // Animação da barra de progresso
            setTimeout(() => {
                const progressBar = document.querySelectorAll(".progress-bar")[index];
                progressBar.style.width = `${progress}%`;
            }, 100); // Delay para a animação
        });

        // Reinitialize Swiper
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
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
        });
    }

    // Função para abrir o modal de edição
    window.openEditModal = function (index) {
        document.getElementById("editGoalIndex").value = index;
        document.getElementById("editGoalTitle").value = goals[index].title;
        document.getElementById("editGoalValue").value = goals[index].goal;
        document.getElementById("editGoalSaved").value = goals[index].saved;
        const editModal = new bootstrap.Modal(document.getElementById("editGoalModal"));
        editModal.show();
    };

    // Função para salvar alterações no modal de edição
    document.getElementById("editGoalForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const index = document.getElementById("editGoalIndex").value;
        goals[index].title = document.getElementById("editGoalTitle").value;
        goals[index].goal = parseFloat(document.getElementById("editGoalValue").value);
        goals[index].saved = parseFloat(document.getElementById("editGoalSaved").value);
        renderGoals();
        bootstrap.Modal.getInstance(document.getElementById("editGoalModal")).hide();
    });

    // Função para excluir uma meta
    window.deleteGoal = function (index) {
        if (confirm("Tem certeza que deseja excluir esta meta?")) {
            goals.splice(index, 1);
            renderGoals();
        }
    };

    // Captura evento de submissão do formulário de criação
    goalForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("goalCategory").value;
        const goal = parseFloat(document.getElementById("goalValue").value);
        const monthsLeft = parseInt(document.getElementById("goalDate").value.split("-")[1]); // Exemplo de cálculo
        const minMonthly = (goal / monthsLeft).toFixed(2);

        if (title && goal && monthsLeft) {
            goals.push({ id: Date.now(), title, saved: 0, goal, minMonthly, monthsLeft });
            renderGoals();
            goalForm.reset();
            bootstrap.Modal.getInstance(document.getElementById("addGoalModal")).hide();
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
