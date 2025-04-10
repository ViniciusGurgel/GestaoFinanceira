const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function conectarSQLitePorUsuario(req, res, next) {
    const userId = req.user?.userId; // `req.user` vem do middleware de autenticação

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const dbPath = path.join(__dirname, '../database', `${userId}.db`);
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco do usuário:', err);
            return res.status(500).json({ error: 'Erro ao conectar ao banco de dados do usuário.' });
        }
    });

    req.db = db;

    res.on('finish', () => {
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar o banco:', err);
            }
        });
    });

    next();
}

function getUserDb(userId) {
    const dbPath = path.join(__dirname, '../database', `${userId}.db`);
    console.log(dbPath);
    return new sqlite3.Database(dbPath);
}

module.exports = { conectarSQLitePorUsuario ,  getUserDb};
