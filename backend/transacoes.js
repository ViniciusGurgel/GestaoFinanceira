const express = require('express');
const router = express.Router();
const { verificarToken } = require('./middleware/auth');
const db = require('./database/sqliteConnection');


router.get('/verificar_token', verificarToken, (req, res) => {
    console.log(req.user);
    res.json({ message: 'Token verificado com sucesso!' });
});

// Rota para obter todas as transações
router.get('/listar_transacoes', (req, res) => {
    db.all(`SELECT Transacao.Id, Transacao.Nome, TipoTransacao.Nome AS Tipo, Categoria.Nome AS Categoria, MeioPagamento.Nome AS MeioPagamento, Transacao.Valor, Transacao.Data 
            FROM Transacao
            JOIN TipoTransacao ON Transacao.TipoTransacaoId = TipoTransacao.Id
            JOIN Categoria ON Transacao.CategoriaId = Categoria.Id
            JOIN MeioPagamento ON Transacao.MeioPagamentoId = MeioPagamento.Id
            ORDER BY Transacao.Data DESC`,
    [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar transações:", err);
            return res.status(500).json({ error: "Erro ao buscar transações" });
        }
        res.json(rows);
    });
});

// Rota para adicionar uma nova transação
router.post('/adicionar_transacao', (req, res) => {
    const { nome, tipoTransacaoId, meioPagamentoId, categoriaId, valor, data } = req.body;
    if (!nome || !tipoTransacaoId || !categoriaId || !meioPagamentoId || !valor || !data) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }

    const sql = `INSERT INTO Transacao (Nome, TipoTransacaoId, CategoriaId, MeioPagamentoId, Valor, Data) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Erro ao adicionar transação:", err);
            return res.status(500).json({ error: "Erro ao adicionar transação" });
        }
        res.json({ message: "Transação adicionada com sucesso!", id: this.lastID });
    });
});

// Rota para deletar uma transação
router.delete('/deletar_transacao/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM Transacao WHERE Id = ?`, [id], function (err) {
        if (err) {
            console.error("Erro ao excluir transação:", err);
            return res.status(500).json({ error: "Erro ao excluir transação" });
        }
        res.json({ message: "Transação excluída com sucesso!" });
    });
});

// Rota para editar uma transação
router.put('/alterar_transacao/:id', (req, res) => {
    const { id } = req.params;
    const {nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data } = req.body;

    if (!nome || !tipoTransacaoId || !categoriaId || !meioPagamentoId || !valor || !data) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }
    console.log("Dados recebidos para atualização:", req.body);
    console.log("ID recebido:", id);

    const sql = `UPDATE Transacao 
             SET Nome = ?, TipoTransacaoId = ?, CategoriaId = ?, MeioPagamentoId = ?, Valor = ?, Data = ? 
             WHERE Id = ?`;

    const params = [nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Erro ao editar transação:", err);
            return res.status(500).json({ error: "Erro ao editar transação" });
        }
        res.json({ message: "Transação atualizada com sucesso!" });
    });
});

module.exports = router;




