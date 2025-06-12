const express = require('express');
const router = express.Router();
const { verificarToken } = require('./middleware/auth');
const { conectarSQLitePorUsuario } = require('./middleware/sqliteMiddleware');

router.use(verificarToken);
router.use(conectarSQLitePorUsuario);

// Rota para listar todas as metas
router.get('/listar_metas', (req, res) => {
    const db = req.db;
    db.all(`
        SELECT 
            m.Id, 
            m.Nome, 
            m.ValorLimite, 
            m.ValorAtual, 
            m.PeriodoInicio, 
            m.PeriodoFim, 
            m.TipoMeta, 
            m.Status,
            m.Notificacoes,
            c.Nome AS CategoriaNome,
            c.Cor AS CategoriaCor,
            ROUND((m.ValorAtual / m.ValorLimite) * 100, 2) AS Progresso
        FROM MetaFinanceira m
        LEFT JOIN Categoria c ON m.CategoriaId = c.Id
        ORDER BY m.PeriodoFim DESC
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar metas:", err);
            return res.status(500).json({ error: "Erro ao buscar metas" });
        }
        res.json(rows);
    });
});

// Rota para adicionar nova meta
router.post('/adicionar_meta', (req, res) => {
    const db = req.db;
    const { 
        nome, 
        categoriaId, 
        valorLimite, 
        periodoInicio, 
        periodoFim, 
        tipoMeta, 
        notificacoes 
    } = req.body;

    if (!nome || !valorLimite || !periodoInicio || !periodoFim || !tipoMeta) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const sql = `
        INSERT INTO MetaFinanceira 
        (Nome, CategoriaId, ValorLimite, ValorAtual, PeriodoInicio, PeriodoFim, TipoMeta, Status, Notificacoes) 
        VALUES (?, ?, ?, 0, ?, ?, ?, 'ATIVA', ?)
    `;
    const params = [nome, categoriaId, valorLimite, periodoInicio, periodoFim, tipoMeta, notificacoes || 1];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Erro ao adicionar meta:", err);
            return res.status(500).json({ error: "Erro ao adicionar meta" });
        }
        
        // Inserir registro inicial no progresso
        db.run(`
            INSERT INTO MetaProgresso 
            (MetaId, DataRegistro, ValorAdicionado) 
            VALUES (?, ?, 0)
        `, [this.lastID, new Date().toISOString().split('T')[0]], (err) => {
            if (err) console.error("Erro ao registrar progresso inicial:", err);
        });

        res.json({ 
            message: "Meta adicionada com sucesso!", 
            id: this.lastID 
        });
    });
});

// Rota para deletar uma meta
router.delete('/deletar_meta/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.serialize(() => {
        // Primeiro deleta o progresso associado
        db.run(`DELETE FROM MetaProgresso WHERE MetaId = ?`, [id], (err) => {
            if (err) {
                console.error("Erro ao excluir progresso da meta:", err);
                return res.status(500).json({ error: "Erro ao excluir meta" });
            }
            
            // Depois deleta a meta
            db.run(`DELETE FROM MetaFinanceira WHERE Id = ?`, [id], function(err) {
                if (err) {
                    console.error("Erro ao excluir meta:", err);
                    return res.status(500).json({ error: "Erro ao excluir meta" });
                }
                res.json({ message: "Meta excluída com sucesso!" });
            });
        });
    });
});

// Rota para editar uma meta
router.put('/alterar_meta/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { 
        nome, 
        categoriaId, 
        valorLimite, 
        periodoInicio, 
        periodoFim, 
        tipoMeta, 
        status, 
        notificacoes 
    } = req.body;

    if (!nome || !valorLimite || !periodoInicio || !periodoFim || !tipoMeta) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const sql = `
        UPDATE MetaFinanceira 
        SET 
            Nome = ?, 
            CategoriaId = ?, 
            ValorLimite = ?, 
            PeriodoInicio = ?, 
            PeriodoFim = ?, 
            TipoMeta = ?, 
            Status = ?, 
            Notificacoes = ?
        WHERE Id = ?
    `;
    const params = [
        nome, 
        categoriaId, 
        valorLimite, 
        periodoInicio, 
        periodoFim, 
        tipoMeta, 
        status || 'ATIVA', 
        notificacoes || 1, 
        id
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Erro ao editar meta:", err);
            return res.status(500).json({ error: "Erro ao editar meta" });
        }
        res.json({ message: "Meta atualizada com sucesso!" });
    });
});

// Rota para obter o progresso de uma meta
router.get('/progresso_meta/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.all(`
        SELECT 
            p.DataRegistro, 
            p.ValorAdicionado,
            t.Nome AS TransacaoNome,
            t.Valor AS TransacaoValor
        FROM MetaProgresso p
        LEFT JOIN Transacao t ON p.TransacaoId = t.Id
        WHERE p.MetaId = ?
        ORDER BY p.DataRegistro DESC
    `, [id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar progresso da meta:", err);
            return res.status(500).json({ error: "Erro ao buscar progresso da meta" });
        }
        res.json(rows);
    });
});

// Rota para adicionar valor ao progresso da meta
router.post('/adicionar_progresso/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { valor, transacaoId } = req.body;

    if (!valor) {
        return res.status(400).json({ error: "Informe o valor a ser adicionado." });
    }

    db.serialize(() => {
        // Atualiza o valor atual da meta
        db.run(`
            UPDATE MetaFinanceira 
            SET ValorAtual = ValorAtual + ? 
            WHERE Id = ?
        `, [valor, id], function(err) {
            if (err) {
                console.error("Erro ao atualizar meta:", err);
                return res.status(500).json({ error: "Erro ao atualizar meta" });
            }

            // Registra no histórico de progresso
            db.run(`
                INSERT INTO MetaProgresso 
                (MetaId, DataRegistro, ValorAdicionado, TransacaoId) 
                VALUES (?, ?, ?, ?)
            `, [id, new Date().toISOString().split('T')[0], valor, transacaoId || null], (err) => {
                if (err) {
                    console.error("Erro ao registrar progresso:", err);
                    return res.status(500).json({ error: "Erro ao registrar progresso" });
                }

                // Verifica se a meta foi atingida
                db.get(`
                    SELECT ValorAtual, ValorLimite FROM MetaFinanceira WHERE Id = ?
                `, [id], (err, meta) => {
                    if (err) {
                        console.error("Erro ao verificar meta:", err);
                        return res.json({ 
                            message: "Progresso adicionado, mas não foi possível verificar conclusão da meta",
                            id: id 
                        });
                    }

                    if (meta.ValorAtual >= meta.ValorLimite) {
                        db.run(`
                            UPDATE MetaFinanceira 
                            SET Status = 'CONCLUIDA' 
                            WHERE Id = ?
                        `, [id]);
                    }

                    res.json({ 
                        message: "Progresso adicionado com sucesso!", 
                        id: id 
                    });
                });
            });
        });
    });
});

// Rota para obter metas próximas do limite
router.get('/metas_alertas', (req, res) => {
    const db = req.db;
    
    db.all(`
        SELECT 
            m.Id,
            m.Nome,
            m.ValorLimite,
            m.ValorAtual,
            m.TipoMeta,
            c.Nome AS CategoriaNome,
            c.Cor AS CategoriaCor,
            ROUND((m.ValorAtual / m.ValorLimite) * 100, 2) AS Progresso
        FROM MetaFinanceira m
        LEFT JOIN Categoria c ON m.CategoriaId = c.Id
        WHERE m.Status = 'ATIVA' 
        AND m.Notificacoes = 1
        AND (
            (m.TipoMeta = 'GASTO' AND m.ValorAtual >= m.ValorLimite * 0.8) OR
            (m.TipoMeta = 'ECONOMIA' AND m.ValorAtual <= m.ValorLimite * 0.5)
        )
        ORDER BY Progresso DESC
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar metas para alertas:", err);
            return res.status(500).json({ error: "Erro ao buscar metas para alertas" });
        }
        res.json(rows);
    });
});

// Rota para obter resumo das metas
router.get('/resumo_metas', (req, res) => {
    const db = req.db;
    
    db.get(`
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN Status = 'ATIVA' THEN 1 ELSE 0 END) AS ativas,
            SUM(CASE WHEN Status = 'CONCLUIDA' THEN 1 ELSE 0 END) AS concluidas,
            SUM(CASE WHEN Status = 'CANCELADA' THEN 1 ELSE 0 END) AS canceladas
        FROM MetaFinanceira
    `, [], (err, row) => {
        if (err) {
            console.error("Erro ao buscar resumo de metas:", err);
            return res.status(500).json({ error: "Erro ao buscar resumo de metas" });
        }
        res.json(row);
    });
});

// Rota para obter metas por status
router.get('/metas_por_status', (req, res) => {
    const db = req.db;
    
    db.all(`
        SELECT 
            Status,
            COUNT(*) AS quantidade,
            SUM(ValorLimite) AS valor_total
        FROM MetaFinanceira
        GROUP BY Status
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar metas por status:", err);
            return res.status(500).json({ error: "Erro ao buscar metas por status" });
        }
        res.json(rows);
    });
});

module.exports = router;