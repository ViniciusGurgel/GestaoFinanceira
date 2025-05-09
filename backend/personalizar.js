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

// Rota para deletar uma categoria
router.delete('/deletar_categoria/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.run(`DELETE FROM Categoria WHERE Id = ?`, [id], function (err) {
        if (err) {
            console.error("Erro ao excluir categoria:", err);
            return res.status(500).json({ error: "Erro ao excluir categoria" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Categoria não encontrada." });
        }

        res.json({ message: "Categoria excluída com sucesso!" });
    });
});

// Rota para alterar uma categoria
router.put('/alterar_categoria/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: "O nome da categoria é obrigatório." });
    }

    const sql = `UPDATE Categoria SET Nome = ? WHERE Id = ?`;
    const params = [nome, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Erro ao editar categoria:", err);
            return res.status(500).json({ error: "Erro ao editar categoria" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Categoria não encontrada ou nome já está em uso." });
        }

        res.json({ message: "Categoria atualizada com sucesso!" });
    });
});

// Rota para adicionar uma nova categoria
router.post('/incluir_categoria', (req, res) => {
    const db = req.db;
    const { nome, cor } = req.body;

    if (!nome) {
        return res.status(400).json({ error: "O nome da categoria é obrigatório." });
    }
    
    const sql = `INSERT INTO Categoria (Nome, Cor) VALUES (?, ?)`;
    
    db.run(sql, [nome, cor || "#6c757d"], function (err) {
        if (err) {
            console.error("Erro ao inserir categoria:", err);
            return res.status(500).json({ error: "Erro ao inserir categoria" });
        }
    
        res.status(201).json({ message: "Categoria criada com sucesso!", categoriaId: this.lastID });
    });
});

module.exports = router;