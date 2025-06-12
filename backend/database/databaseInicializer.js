const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

function inserirDadosIniciais(db) {
    // Inserir dados nas tabelas
    db.serialize(() => {
        // Tipos de Transação
        db.run(`INSERT OR IGNORE INTO TipoTransacao (Nome) VALUES ('Receita'), ('Despesa')`, (err) => {
            if (err) console.error('Erro ao inserir TipoTransacao:', err);
        });

        // Categorias
        db.run(`INSERT OR IGNORE INTO Categoria (Nome, Cor) VALUES 
                ('Alimentação', '#ff6384'), 
                ('Transporte', '#36a2eb'), 
                ('Lazer', '#ffce56'), 
                ('Educação', '#4bc0c0'),
                ('Saúde', '#9966ff')`, (err) => {
            if (err) console.error('Erro ao inserir Categoria:', err);
        });

        // Meios de Pagamento
        db.run(`INSERT OR IGNORE INTO MeioPagamento (Nome) VALUES 
            ('Dinheiro'), 
            ('Cartão de Crédito'), 
            ('Cartão de Débito'), 
            ('Pix'), 
            ('Boleto')`, (err) => {
            if (err) console.error('Erro ao inserir MeioPagamento:', err);
        });

        // Transações
        db.run(`INSERT OR IGNORE INTO Transacao (Nome, TipoTransacaoId, CategoriaId, MeioPagamentoId, Valor, Data) VALUES 
            ('Compra no supermercado', 2, 1, 3, 150.75, '2024-03-24'),
            ('Salário recebido', 1, 4, 4, 5000.00, '2024-03-01'),
            ('Ingresso para cinema', 2, 3, 2, 50.00, '2024-03-10'),
            ('Mensalidade da academia', 2, 5, 2, 120.00, '2024-03-05')`, (err) => {
            if (err) console.error('Erro ao inserir Transacao:', err);
        });

        // Metas Financeiras
        db.run(`INSERT OR IGNORE INTO MetaFinanceira 
            (CategoriaId, Nome, ValorLimite, ValorAtual, PeriodoInicio, PeriodoFim, TipoMeta, Status) VALUES 
            (1, 'Limite Supermercado', 500.00, 150.75, '2024-03-01', '2024-03-31', 'GASTO', 'ATIVA'),
            (3, 'Economia para Lazer', 200.00, 50.00, '2024-03-01', '2024-03-31', 'ECONOMIA', 'ATIVA'),
            (5, 'Gastos com Saúde', 300.00, 120.00, '2024-03-01', '2024-03-31', 'GASTO', 'ATIVA')`, (err) => {
            if (err) console.error('Erro ao inserir MetaFinanceira:', err);
        });

        // Progresso das Metas (novo)
        db.run(`INSERT OR IGNORE INTO MetaProgresso 
            (MetaId, DataRegistro, ValorAdicionado, TransacaoId) VALUES 
            (1, '2024-03-24', 150.75, 1),
            (2, '2024-03-10', 50.00, 3),
            (3, '2024-03-05', 120.00, 4)`, (err) => {
            if (err) console.error('Erro ao inserir MetaProgresso:', err);
        });

    });
}

function inicializarBancoUsuario(userId) {
    const userDbPath = path.join(__dirname, `${userId}.db`);

    // Garante que a pasta existe
    if (!fs.existsSync(path.dirname(userDbPath))) {
        fs.mkdirSync(path.dirname(userDbPath), { recursive: true });
    }

    const db = new sqlite3.Database(userDbPath, (err) => {
        if (err) {
            console.error(`Erro ao abrir o banco de dados do usuário ${userId}:`, err);
        } else {
            console.log(`Banco de dados criado/conectado para o usuário ${userId}`);
        }
    });

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS TipoTransacao (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome TEXT UNIQUE NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Categoria (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome TEXT UNIQUE NOT NULL,
            Cor TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS MeioPagamento (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome TEXT UNIQUE NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Transacao (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome TEXT,
            TipoTransacaoId INTEGER,
            CategoriaId INTEGER,
            MeioPagamentoId INTEGER,
            Valor REAL,
            Data DATE,
            FOREIGN KEY (TipoTransacaoId) REFERENCES TipoTransacao(Id),
            FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id),
            FOREIGN KEY (MeioPagamentoId) REFERENCES MeioPagamento(Id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS MetaFinanceira (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            CategoriaId INTEGER,
            Nome TEXT NOT NULL,
            ValorLimite REAL NOT NULL,
            ValorAtual REAL DEFAULT 0,
            PeriodoInicio DATE NOT NULL,
            PeriodoFim DATE NOT NULL,
            TipoMeta TEXT CHECK(TipoMeta IN ('GASTO', 'ECONOMIA')) NOT NULL,
            Status TEXT CHECK(Status IN ('ATIVA', 'CONCLUIDA', 'CANCELADA')) DEFAULT 'ATIVA',
            Notificacoes BOOLEAN DEFAULT 1,
            FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id)
        )`);

        // Tabela de Progresso (nova)
        db.run(`CREATE TABLE IF NOT EXISTS MetaProgresso (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            MetaId INTEGER NOT NULL,
            DataRegistro DATE NOT NULL,
            ValorAdicionado REAL NOT NULL,
            TransacaoId INTEGER,
            FOREIGN KEY (MetaId) REFERENCES MetaFinanceira(Id),
            FOREIGN KEY (TransacaoId) REFERENCES Transacao(Id)
        )`);

        db.run(`CREATE INDEX IF NOT EXISTS idx_meta_categoria ON MetaFinanceira(CategoriaId)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_meta_periodo ON MetaFinanceira(PeriodoInicio, PeriodoFim)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_progresso_meta ON MetaProgresso(MetaId)`);

        // 👇 Insere dados logo após criar as tabelas
        inserirDadosIniciais(db);
    });

    db.close(() => {
        console.log(`Banco do usuário ${userId} configurado e fechado.`);
    });
}

module.exports = { inicializarBancoUsuario };
