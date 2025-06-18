const express = require('express');
const router = express.Router();
const { verificarToken } = require('./middleware/auth');
const { conectarSQLitePorUsuario } = require('./middleware/sqliteMiddleware');

router.use(verificarToken);
router.use(conectarSQLitePorUsuario);

// Rota para listar metas
router.get('/listar_metas', (req, res) => {
    const db = req.db;
    db.all(`
        SELECT 
            id,
            title,
            saved,
            goal,
            minMonthly,
            monthsLeft
        FROM Metas
        ORDER BY createdAt DESC
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar metas:", err);
            return res.status(500).json({ error: "Erro ao buscar metas" });
        }
        res.json(rows);
    });
});

// Rota para adicionar nova meta
router.post('/adicionar_metas', (req, res) => {
    const db = req.db;
    const { 
        title,
        goal,
        minMonthly,
        monthsLeft
    } = req.body;

    if (!title || !goal || !monthsLeft) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const sql = `
        INSERT INTO Metas 
        (title, goal, minMonthly, monthsLeft) 
        VALUES (?, ?, ?, ?)
    `;
    const params = [title, goal, minMonthly || (goal/monthsLeft), monthsLeft];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Erro ao adicionar meta:", err);
            return res.status(500).json({ error: "Erro ao adicionar meta" });
        }
        
        res.json({ 
            message: "Meta adicionada com sucesso!", 
            id: this.lastID,
            title,
            saved: 0,
            goal,
            minMonthly: minMonthly || (goal/monthsLeft),
            monthsLeft
        });
    });
});

// Rota para deletar meta
router.delete('/deletar_metas/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.run(`DELETE FROM Metas WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error("Erro ao excluir meta:", err);
            return res.status(500).json({ error: "Erro ao excluir meta" });
        }
        res.json({ message: "Meta excluída com sucesso!" });
    });
});

// Rota para alterar meta
router.put('/alterar_metas/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { 
        title,
        saved,
        goal,
        monthsLeft
    } = req.body;

    if (!title || !goal || !monthsLeft) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const sql = `
        UPDATE Metas 
        SET 
            title = ?,
            saved = ?,
            goal = ?,
            monthsLeft = ?
        WHERE id = ?
    `;
    const params = [title, saved || 0, goal, monthsLeft, id];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Erro ao editar meta:", err);
            return res.status(500).json({ error: "Erro ao editar meta" });
        }
        res.json({ 
            message: "Meta atualizada com sucesso!",
            id,
            title,
            saved: saved || 0,
            goal,
            monthsLeft
        });
    });
});

module.exports = router;