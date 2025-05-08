
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateAndDisplay } = require('./validators/cadastroUsuario'); // Validadores personalizados
const { code, enviarEmail } = require('./utils/enviarEmail');
const Usuario = require('./models/Usuario');
const { inicializarBancoUsuario } = require('./database/databaseInicializer');
const { getUserDb } = require('./middleware/sqliteMiddleware');


const router = express.Router();
router.use(express.json());

const verificationCodes = new Map();

//Rota pra fazer login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (email === 'admin' && senha === 'admin') {
        try {
            // Simula a geração de um token JWT para o admin
            const token = jwt.sign({ userId: 'admin', email: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const userDb = getUserDb('admin');
            userDb.close();

            // Retorna o token JWT gerado
            return res.json({ token });
        } catch (err) {
            console.error("Erro ao gerar o token para o admin:", err);
            return res.status(500).json({ error: "Erro interno ao gerar o token de admin." });
        }
    }

    if (!email || !senha) {
        return res.status(400).json({ error: "Por favor, forneça o email e a senha." });
    }

    try {
        const usuario = await Usuario.findOne({ Email: email });
        if (!usuario) {
            return res.status(400).json({ error: "Usuário não encontrado." });
        }
        const senhaCorreta = await bcrypt.compare(senha, usuario.Senha);
        if (!senhaCorreta) {
            return res.status(400).json({ error: "Senha incorreta." });
        }


        const token = jwt.sign({ userId: usuario._id, email: usuario.Email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const userDb = getUserDb(usuario._id);
        userDb.close();

        // Retornar o token JWT
        res.json({ token });

    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.status(500).json({ error: "Erro interno ao fazer login." });
    }
});

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

        inicializarBancoUsuario(novoUsuario._id);

        // Remover código de verificação
        verificationCodes.delete(email);
        res.json({ message: "Conta criada com sucesso!", redirect: "/login.html" });

    } catch (err) {
        console.error("Erro ao criar conta:", err);
        res.status(500).json({ error: "Erro ao salvar no banco de dados." });
    }
});

// Rota protegida para buscar informações do usuário logado
router.get('/usuario_info', verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.userId).select('-Senha'); // remove a senha da resposta

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(usuario);
    } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err);
        res.status(500).json({ error: "Erro interno ao buscar dados do usuário." });
    }
});

module.exports = router;
