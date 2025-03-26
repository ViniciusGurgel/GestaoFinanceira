const inputs = document.querySelectorAll('.verification-code-input');

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        // Limitar a entrada apenas a números
        if (!/^\d$/.test(e.target.value)) {
            e.target.value = '';  // Limpa o valor caso não seja numérico
        }

        // Se o campo atual tiver 1 caractere, move o foco para o próximo campo
        if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        // Se pressionar backspace, move o foco para o campo anterior
        if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

document.getElementById('CodeConfirmForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const num1 = document.getElementById('num1').value;
    const num2 = document.getElementById('num2').value;
    const num3 = document.getElementById('num3').value;
    const num4 = document.getElementById('num4').value;
    const num5 = document.getElementById('num5').value;
    const num6 = document.getElementById('num6').value;
    const codigoInserido = num1 + num2 + num3 + num4 + num5 + num6;
    
    const email = localStorage.getItem("email");

    const data = {email,codigoInserido };
    
    const response = await fetch('/auth/verificar_codigo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        const responseData = await response.json();
        window.location.href = responseData.redirect;
    } else {
        const errorData = await response.json();
        alert('Erro ao cadastrar Usuario: ' + errorData.message);
    }
});