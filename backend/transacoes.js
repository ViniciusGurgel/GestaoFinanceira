const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('./database/sqliteConnection');

// Rota para obter todas as transações
router.get('/transacoes', (req, res) => {
    db.all(`SELECT Transacao.Id, Transacao.Nome, TipoTransacao.Nome AS Tipo, Categoria.Nome AS Categoria, MeioPagamento.Nome AS MeioPagamento, Transacao.Valor, Transacao.Data 
            FROM Transacao
            JOIN TipoTransacao ON Transacao.TipoTransacaoId = TipoTransacao.Id
            JOIN Categoria ON Transacao.CategoriaId = Categoria.Id
            JOIN MeioPagamento ON Transacao.MeioPagamentoId = MeioPagamento.Id`, 
    [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar transações:", err);
            return res.status(500).json({ error: "Erro ao buscar transações" });
        }
        res.json(rows);
    });
});

// Rota para adicionar uma nova transação
router.post('/transacoes', (req, res) => {
    const { nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data } = req.body;

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
router.delete('/transacoes/:id', (req, res) => {
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
router.put('/transacoes/:id', (req, res) => {
    const { id } = req.params;
    const { nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data } = req.body;

    if (!nome || !tipoTransacaoId || !categoriaId || !meioPagamentoId || !valor || !data) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }

    const sql = `UPDATE Transacao SET Nome = ?, TipoTransacaoId = ?, CategoriaId = ?, MeioPagamentoId = ?, Valor = ?, Data = ? WHERE Id = ?`;
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




