const express = require('express');
const router = express.Router();
const { verificarToken } = require('./middleware/auth');
const { conectarSQLitePorUsuario } = require('./middleware/sqliteMiddleware');

// Aplica os middlewares a todas as rotas abaixo
router.use(verificarToken);
router.use(conectarSQLitePorUsuario);

// Rota para verificar o token
router.get('/verificar_token', (req, res) => {
    res.json({ message: 'Token verificado com sucesso!' });
});

// Rota para obter todas as transações
router.get('/listar_transacoes', (req, res) => {
    const db = req.db;
    db.all(`
        SELECT Transacao.Id, Transacao.Nome, 
               TipoTransacao.Nome AS Tipo, 
               Categoria.Nome AS Categoria, 
               MeioPagamento.Nome AS MeioPagamento, 
               Transacao.Valor, Transacao.Data 
        FROM Transacao
        JOIN TipoTransacao ON Transacao.TipoTransacaoId = TipoTransacao.Id
        JOIN Categoria ON Transacao.CategoriaId = Categoria.Id
        JOIN MeioPagamento ON Transacao.MeioPagamentoId = MeioPagamento.Id
        ORDER BY Transacao.Data DESC
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar transações:", err);
            return res.status(500).json({ error: "Erro ao buscar transações" });
        }
        res.json(rows);
    });
});

// Rota para adicionar uma nova transação
router.post('/adicionar_transacao', (req, res) => {
    const db = req.db;
    const { nome, tipoTransacaoId, meioPagamentoId, categoriaId, valor, data } = req.body;

    if (!nome || !tipoTransacaoId || !categoriaId || !meioPagamentoId || !valor || !data) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }

    const sql = `
        INSERT INTO Transacao 
        (Nome, TipoTransacaoId, CategoriaId, MeioPagamentoId, Valor, Data) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
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
    const db = req.db;
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
    const db = req.db;
    const { id } = req.params;
    const { nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data } = req.body;

    if (!nome || !tipoTransacaoId || !categoriaId || !meioPagamentoId || !valor || !data) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }

    const sql = `
        UPDATE Transacao 
        SET Nome = ?, TipoTransacaoId = ?, CategoriaId = ?, MeioPagamentoId = ?, Valor = ?, Data = ? 
        WHERE Id = ?
    `;
    const params = [nome, tipoTransacaoId, categoriaId, meioPagamentoId, valor, data, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Erro ao editar transação:", err);
            return res.status(500).json({ error: "Erro ao editar transação" });
        }
        res.json({ message: "Transação atualizada com sucesso!" });
    });
});

router.get('/grafico_transacoes', (req, res) => {
    const db = req.db;
    db.all(`
        SELECT strftime('%Y-%m', Transacao.Data) AS mes, 
               SUM(CASE WHEN TipoTransacao.Nome = 'Receita' THEN Transacao.Valor ELSE 0 END) AS total_receitas,
               SUM(CASE WHEN TipoTransacao.Nome = 'Despesa' THEN Transacao.Valor ELSE 0 END) AS total_despesas
        FROM Transacao
        JOIN TipoTransacao ON Transacao.TipoTransacaoId = TipoTransacao.Id
        GROUP BY strftime('%Y-%m', Transacao.Data)
        ORDER BY mes DESC
        LIMIT 12
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar transações:", err);
            return res.status(500).json({ error: "Erro ao buscar transações para o gráfico." });
        }

        // Formatando os dados para o gráfico
        const meses = rows.map(row => row.mes);
        const receitas = rows.map(row => row.total_receitas);
        const despesas = rows.map(row => row.total_despesas);

        res.json({
            meses,
            receitas,
            despesas,
        });
    });
});

router.get('/grafico_categorias', (req, res) => {
    const db = req.db;
    db.all(`
        SELECT Categoria.Nome AS categoria, SUM(Transacao.Valor) AS total_despesas
        FROM Transacao
        JOIN Categoria ON Transacao.CategoriaId = Categoria.Id
        WHERE Transacao.TipoTransacaoId = (SELECT Id FROM TipoTransacao WHERE Nome = 'Despesa')
        GROUP BY Categoria.Nome
        ORDER BY total_despesas DESC
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar categorias de despesas:", err);
            return res.status(500).json({ error: "Erro ao buscar categorias de despesas." });
        }

        const categorias = rows.map(row => row.categoria);
        const despesas = rows.map(row => row.total_despesas);

        res.json({
            categorias,
            despesas,
        });
    });
});

router.get('/evolucao_transacoes', (req, res) => {
    const { periodoInicio, periodoFim } = req.query;
    const db = req.db;
    
    const sql = `
        SELECT strftime('%Y-%m', Transacao.Data) AS mes, 
               SUM(CASE WHEN TipoTransacao.Nome = 'Receita' THEN Transacao.Valor ELSE 0 END) AS total_receitas,
               SUM(CASE WHEN TipoTransacao.Nome = 'Despesa' THEN Transacao.Valor ELSE 0 END) AS total_despesas
        FROM Transacao
        JOIN TipoTransacao ON Transacao.TipoTransacaoId = TipoTransacao.Id
        WHERE Transacao.Data BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m', Transacao.Data)
        ORDER BY mes DESC
    `;
    
    db.all(sql, [periodoInicio, periodoFim], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar evolução das transações:", err);
            return res.status(500).json({ error: "Erro ao buscar evolução das transações." });
        }

        const meses = rows.map(row => row.mes);
        const receitas = rows.map(row => row.total_receitas);
        const despesas = rows.map(row => row.total_despesas);

        res.json({
            meses,
            receitas,
            despesas,
        });
    });
});

router.get('/ultimas_transacoes', (req, res) => {
    const db = req.db;
    
    db.all(`
        SELECT Transacao.Id, Transacao.Nome, 
               TipoTransacao.Nome AS Tipo, 
               Categoria.Nome AS Categoria, 
               MeioPagamento.Nome AS MeioPagamento, 
               Transacao.Valor, Transacao.Data 
        FROM Transacao
        JOIN TipoTransacao ON Transacao.TipoTransacaoId = TipoTransacao.Id
        JOIN Categoria ON Transacao.CategoriaId = Categoria.Id
        JOIN MeioPagamento ON Transacao.MeioPagamentoId = MeioPagamento.Id
        ORDER BY Transacao.Data DESC
        LIMIT 5
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar as últimas transações:", err);
            return res.status(500).json({ error: "Erro ao buscar as últimas transações." });
        }
        res.json(rows);
    });
});


module.exports = router;
