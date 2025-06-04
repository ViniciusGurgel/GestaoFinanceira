const express = require('express');
const router = express.Router();
const { verificarToken } = require('./middleware/auth');
const { conectarSQLitePorUsuario } = require('./middleware/sqliteMiddleware');

router.use(verificarToken);
router.use(conectarSQLitePorUsuario);

router.get('/relatorio_completo', (req, res) => {
    const db = req.db;
    const { periodoInicio, periodoFim } = req.query;

    console.log("📥 Recebido período:", periodoInicio, periodoFim);

    if (!periodoInicio || !periodoFim) {
        return res.status(400).json({ error: "Informe periodoInicio e periodoFim." });
    }

    const dados = {
        totalTransacoes: 0,
        totalGasto: 0,
        categoriaComMaiorGasto: "-",
        dataMaisRecente: "-",
        graficoCategorias: [],
        graficoDistribuicao: [],
        transacoes: []
    };

    const promessas = [];

    // Total de transações e total gasto
    promessas.push(new Promise((resolve, reject) => {
        db.get(`
            SELECT COUNT(*) AS total, 
                   SUM(Valor) AS totalGasto 
            FROM Transacao 
            WHERE Data BETWEEN ? AND ? 
              AND TipoTransacaoId = (SELECT Id FROM TipoTransacao WHERE Nome = 'Despesa')
        `, [periodoInicio, periodoFim], (err, row) => {
            if (err) return reject(err);
            dados.totalTransacoes = row.total || 0;
            dados.totalGasto = row.totalGasto || 0;
            console.log("✅ Total de transações:", dados.totalTransacoes, "Total gasto:", dados.totalGasto);
            resolve();
        });
    }));

    // Categoria com maior gasto
    promessas.push(new Promise((resolve, reject) => {
        db.get(`
            SELECT Categoria.Nome, SUM(Transacao.Valor) AS total 
            FROM Transacao 
            JOIN Categoria ON Transacao.CategoriaId = Categoria.Id 
            WHERE Transacao.Data BETWEEN ? AND ? 
              AND TipoTransacaoId = (SELECT Id FROM TipoTransacao WHERE Nome = 'Despesa')
            GROUP BY Categoria.Id 
            ORDER BY total DESC 
            LIMIT 1
        `, [periodoInicio, periodoFim], (err, row) => {
            if (err) return reject(err);
            if (row) {
                dados.categoriaComMaiorGasto = row.Nome;
                console.log("✅ Categoria com maior gasto:", row.Nome);
            } else {
                console.log("ℹ️ Nenhuma categoria com gasto encontrada.");
            }
            resolve();
        });
    }));

    // Data mais recente
    promessas.push(new Promise((resolve, reject) => {
        db.get(`
            SELECT MAX(Data) AS ultimaData 
            FROM Transacao 
            WHERE Data BETWEEN ? AND ?
        `, [periodoInicio, periodoFim], (err, row) => {
            if (err) return reject(err);
            if (row && row.ultimaData) {
                dados.dataMaisRecente = row.ultimaData;
                console.log("✅ Data mais recente:", row.ultimaData);
            } else {
                console.log("ℹ️ Nenhuma transação encontrada no período.");
            }
            resolve();
        });
    }));

    // Gráfico - Gastos por Categoria
    promessas.push(new Promise((resolve, reject) => {
        db.all(`
            SELECT Categoria.Nome AS categoria, SUM(Transacao.Valor) AS total 
            FROM Transacao 
            JOIN Categoria ON Transacao.CategoriaId = Categoria.Id 
            WHERE Transacao.Data BETWEEN ? AND ?
              AND TipoTransacaoId = (SELECT Id FROM TipoTransacao WHERE Nome = 'Despesa')
            GROUP BY Categoria.Id
        `, [periodoInicio, periodoFim], (err, rows) => {
            if (err) return reject(err);
            dados.graficoCategorias = rows.map(r => ({ categoria: r.categoria, total: r.total }));
            console.log("✅ Gráfico categorias:", dados.graficoCategorias);
            resolve();
        });
    }));

    // Gráfico - Distribuição de Gastos
    promessas.push(new Promise((resolve, reject) => {
        db.all(`
            SELECT MeioPagamento.Nome AS meio, SUM(Transacao.Valor) AS total 
            FROM Transacao 
            JOIN MeioPagamento ON Transacao.MeioPagamentoId = MeioPagamento.Id
            WHERE Transacao.Data BETWEEN ? AND ?
              AND TipoTransacaoId = (SELECT Id FROM TipoTransacao WHERE Nome = 'Despesa')
            GROUP BY MeioPagamento.Id
        `, [periodoInicio, periodoFim], (err, rows) => {
            if (err) return reject(err);
            dados.graficoDistribuicao = rows.map(r => ({ meio: r.meio, total: r.total }));
            console.log("✅ Gráfico distribuição:", dados.graficoDistribuicao);
            resolve();
        });
    }));

    // Lista de transações
    promessas.push(new Promise((resolve, reject) => {
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
            WHERE Transacao.Data BETWEEN ? AND ?
            ORDER BY Transacao.Data DESC
        `, [periodoInicio, periodoFim], (err, rows) => {
            if (err) return reject(err);
            dados.transacoes = rows;
            console.log("✅ Transações:", rows.length, "transações encontradas.");
            resolve();
        });
    }));

    Promise.all(promessas)
        .then(() => {
            console.log("🎉 Relatório completo gerado com sucesso.");
            res.json(dados);
        })
        .catch(err => {
            console.error("❌ Erro no relatório completo:", err);
            res.status(500).json({ error: "Erro ao gerar relatório completo." });
        });
});


module.exports = router;
