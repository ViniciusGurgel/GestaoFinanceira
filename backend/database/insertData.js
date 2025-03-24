const db = require('./sqliteConnection');

// Inserir dados nas tabelas
db.serialize(() => {
    // Inserindo Tipos de Transação
    db.run(`INSERT INTO TipoTransacao (Nome) VALUES ('Receita'), ('Despesa')`, (err) => {
        if (err) console.error('Erro ao inserir TipoTransacao:', err);
    });

    // Inserindo Categorias
    db.run(`INSERT INTO Categoria (Nome) VALUES 
        ('Alimentação'), 
        ('Transporte'), 
        ('Lazer'), 
        ('Educação'),
        ('Saúde')`, (err) => {
        if (err) console.error('Erro ao inserir Categoria:', err);
    });

    // Inserindo Meios de Pagamento
    db.run(`INSERT INTO MeioPagamento (Nome) VALUES 
        ('Dinheiro'), 
        ('Cartão de Crédito'), 
        ('Cartão de Débito'), 
        ('Pix'), 
        ('Boleto')`, (err) => {
        if (err) console.error('Erro ao inserir MeioPagamento:', err);
    });

    // Inserindo Transações
    db.run(`INSERT INTO Transacao (Nome, TipoTransacaoId, CategoriaId, MeioPagamentoId, Valor, Data) VALUES 
        ('Compra no supermercado', 2, 1, 3, 150.75, '2024-03-24'),
        ('Salário recebido', 1, 4, 4, 5000.00, '2024-03-01'),
        ('Ingresso para cinema', 2, 3, 2, 50.00, '2024-03-10'),
        ('Mensalidade da academia', 2, 5, 2, 120.00, '2024-03-05')`, (err) => {
        if (err) console.error('Erro ao inserir Transacao:', err);
    });

    // Inserindo Metas Financeiras
    db.run(`INSERT INTO MetaFinanceira (CategoriaId, ValorLimite, PeriodoInicio, PeriodoFim) VALUES 
        (1, 500.00, '2024-03-01', '2024-03-31'),
        (3, 200.00, '2024-03-01', '2024-03-31'),
        (5, 300.00, '2024-03-01', '2024-03-31')`, (err) => {
        if (err) console.error('Erro ao inserir MetaFinanceira:', err);
    });
});

db.close(() => {
    console.log('Dados inseridos com sucesso!');
});
