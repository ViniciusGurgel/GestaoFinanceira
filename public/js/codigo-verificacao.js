const inputs = document.querySelectorAll('.verification-code-input');

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.slice(0, 1);
        }
        if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
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
    const num = num1 + num2 + num3 + num4 + num5 + num6;
    
    const data = { num };
    
    // console.log('Dados a serem enviados:', data);  // Adicione este log

    
    const response = await fetch('http://localhost:5555/registro/Codigo-verificacao', {
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
        alert('Erro ao cadastrar aluno: ' + errorData.message);
    }
});

document.getElementById("CodeConfirmForm").addEventListener("submit", function(event) {
    event.preventDefault();
    window.location.href = "login.html"; 
});