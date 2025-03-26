const express = require('express');
const bcrypt = require('bcrypt');
const { validateAndDisplay } = require('./validators/cadastroUsuario'); // Validadores personalizados
const { code, enviarEmail } = require('./utils/enviarEmail');
const Usuario = require('./models/Usuario');

const router = express.Router();
router.use(express.json());

const verificationCodes = new Map();

// Rota para criar conta e validar dados
router.post('/criar_conta', async (req, res) => {
    try {
        let { nome, email, usuarioNome, senha, senhaConfirm } = req.body;
        let erros = [];

        // 1️⃣ Validação dos dados com o validador externo
        const validator = await validateAndDisplay({ nome, email, usuarioNome, senha, senhaConfirm });
        if (!validator.success) {
            erros.push(validator.errors);
        }

        // 2️⃣ Verificação de e-mail duplicado
        const emailExistente = await Usuario.findOne({ Email: email });
        if (emailExistente) {
            erros.push('O e-mail já está registrado.');
        }

        // Se houver erros, retorna resposta com erro
        if (erros.length > 0) {
            return res.status(400).json({ message: erros });
        }

        // 4️⃣ Criptografar a senha antes de salvar
        const salt = await bcrypt.genSalt();
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // 5️⃣ Gerar código de verificação
        const codigoVerificacao = code();
        verificationCodes.set(email, { nome, email, usuarioNome, senha: senhaCriptografada, codigo: codigoVerificacao });

        // 6️⃣ Enviar e-mail com o código
        const mailOptions = {
            from: 'ceubconecta@gmail.com',
            to: email,
            subject: 'Código de Verificação - Financify',
            text: `Olá ${nome},\n\nSeu código de verificação é: ${codigoVerificacao}\n\nDigite esse código no site para concluir seu cadastro.`
        };

        await enviarEmail(mailOptions);
        res.json({ message: "Código de verificação enviado para o seu e-mail.", redirect: '/codigo-verificacao.html' });

    } catch (err) {
        console.error('Erro ao criar conta:', err);
        res.status(500).json({ message: 'Erro interno ao criar conta' });
    }
});

// Rota para verificar o código e criar a conta no banco
router.post('/verificar_codigo', async (req, res) => {
    const { email, codigoInserido } = req.body;

    if (!email || !codigoInserido) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }

    // Verifica se o código está correto
    const userData = verificationCodes.get(email);
    if (!userData) {
        return res.status(400).json({ error: "Código expirado ou inexistente." });
    }

    if (userData.codigo !== codigoInserido) {
        return res.status(400).json({ error: "Código incorreto." });
    }

    try {
        const novoUsuario = new Usuario({
            Nome: userData.nome,
            Email: userData.email,
            Usuario: userData.usuarioNome,
            Senha: userData.senha
        });

        await novoUsuario.save();

        // Remover código de verificação
        verificationCodes.delete(email);
        res.json({ message: "Conta criada com sucesso!" });

    } catch (err) {
        console.error("Erro ao criar conta:", err);
        res.status(500).json({ error: "Erro ao salvar no banco de dados." });
    }
});

module.exports = router;
