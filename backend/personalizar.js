const express = require('express');
const router = express.Router();
const { verificarToken } = require('./middleware/auth');
const { conectarSQLitePorUsuario } = require('./middleware/sqliteMiddleware');

router.use(verificarToken);
router.use(conectarSQLitePorUsuario);


// Rota para listar todas as categorias
router.get('/listar_categorias', (req, res) => {
    const db = req.db;

    db.all(`SELECT * FROM Categoria ORDER BY Nome ASC`, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar categorias:", err);
            return res.status(500).json({ error: "Erro ao buscar categorias" });
        }
        res.json(rows);
    });
});
