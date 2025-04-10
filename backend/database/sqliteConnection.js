const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function getUserDb(userId) {
    const dbPath = path.join(__dirname, `${userId}.db`);
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco do usuário:', err);
        } else {
            console.log(`Conectado ao banco do usuário: ${userId}`);
        }
    });
}

module.exports = getUserDb;