/*
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const verificarToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado! Token não encontrado.' });
    }

    try {
        // Verificando e decodificando o token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;  // Adicionando os dados do usuário ao objeto `req`
        next();  // Token válido, continua para a próxima rota
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado. Por favor, faça login novamente.' });
    }
};

module.exports = { verificarToken };
*/