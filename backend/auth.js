const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const { validateAndDisplay } = require('./validators/cadastroUsuario'); // Validadores personalizados
const { code, enviarEmail } = require('./enviarEmail');
const fs = require('fs');

const router = express.Router();

const collectionName = 'Usuario';

router.use(express.json());

// Rota POST para criar um novo usuário (email, nome completo, nome de usuário, senha)
router.post('/register', async (req, res) => {
    try {
        let cont = 0;
        const usuario = req.body;
        console.log('Dados recebidos:', usuario);
        const message = [];
        
        // Validação de dados do usuário
        const validator = await validateAndDisplay(usuario);
        if (!validator.success) {
            message.push(validator.errors);
            cont += 1;
        }

        // Verificação de e-mail duplicado
        const emailExistente = await req.db.collection(collectionName).findOne({ Email: usuario.Email });
        if (emailExistente) {
            cont += 1;
            message.push('O e-mail já está registrado.');
        }

        // Verificação de nome de usuário duplicado
        const usernameExistente = await req.db.collection(collectionName).findOne({ UsuarioNome: usuario.UsuarioNome });
        if (usernameExistente) {
            cont += 1;
            message.push('O nome de usuário já está registrado.');
        }

        if (cont > 0) {
            return res.status(400).json({ message: message });
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt();
        usuario.Senha = await bcrypt.hash(usuario.Senha, salt);
        delete usuario.SenhaConfirm;

        // Define a role como 'user'
        usuario.Admin = "0";

        if (req.session.registro) {
            req.session.registro.destroy;
        }

        // Guarda o usuário e o código de confirmação na sessão
        req.session.registro = { usuario: usuario, code: code() };

        res.json({ redirect: '/register/ConfirmCode' });

    } catch (err) {
        console.error('Erro ao pegar os dados:', err);
        res.status(500).json({ message: 'Erro interno ao coletar os dados' });
    }
});

// Rota GET para a página de confirmação do código
router.get('/register/ConfirmCode', (req, res) => {
    if (!req.session.registro) {
        res.redirect("/register");
    } else {
        const filePath = path.join(__dirname, '/public', 'ConfirmCode.html');
        // Definindo as opções do e-mail
        const mailOptions = {
            from: 'ceubconecta@gmail.com',
            to: req.usuario.Email,
            subject: `Seu código de confirmação é ${req.registro.code}`,
            text: 'Confira o código de confirmação.',
            html: `<h1>Código: ${req.session.registro.code}</h1>`
        };
        enviarEmail(mailOptions);

        fs.readFile(filePath, 'utf8', (err, data) => {
            const tags = `<i><h4>Email enviado para: ${req.usuario.Email}</h4></i>`;
            const modifiedData = data.replace('<!--aqui vai as tags trazidos do backend-->', tags);
            res.send(modifiedData);
        });
    }
});

// Rota POST para validar o código de confirmação
router.post('/register/ConfirmCode', async (req, res) => {
    try {
        const { num } = req.body;
        console.log(req.session.registro.code);

        if (num !== req.session.registro.code) {
            return res.status(400).json({ message: "Código incorreto" });
        }

        const user = await req.db.collection(collectionName).findOne({ Email: req.session.registro.usuario.Email });
        if (user) {
            req.session.destroy(err => {
                if (err) {
                    return res.status(401).json({ message: "Erro ao destruir a sessão:", err });
                }
            });
            return res.status(400).json({ message: 'Usuário já registrado.' });
        }

        // Inserir o novo usuário no banco de dados
        await req.db.collection(collectionName).insertOne(req.session.registro.usuario);

        req.session.destroy(err => {
            if (err) {
                return res.status(401).json({ message: "Erro ao destruir a sessão:", err });
            }
        });

        // Resposta de redirecionamento para a página de login
        res.json({ redirect: '/login' });

    } catch (err) {
        console.error('Erro ao processar o código de confirmação:', err);
        res.status(500).json({ message: 'Erro interno ao processar o código' });
    }
});

module.exports = router;
