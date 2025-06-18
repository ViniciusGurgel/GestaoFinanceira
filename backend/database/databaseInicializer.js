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
        db.run(`INSERT OR IGNORE INTO Metas 
            (title, saved, goal, minMonthly, monthsLeft) VALUES 
            ('Limite Supermercado', 152, 500.00, 50.00, 1),
            ('Economia para Lazer', 50.00, 200.00, 25.00, 2),
            ('Economia para Lazer 2', 52.00, 150.00, 20.00, 2),
            ('Economia para Lazer 3', 50.00, 100.00, 18.00, 3),
            ('Gastos com Saúde', 120.00, 300.00, 60.00, 1)`, (err) => {
            if (err) console.error('Erro ao inserir Metas:', err);
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

        db.run(`CREATE TABLE IF NOT EXISTS Metas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            saved REAL DEFAULT 0,
            goal REAL NOT NULL,
            minMonthly REAL NOT NULL,
            monthsLeft INTEGER NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // 👇 Insere dados logo após criar as tabelas
        inserirDadosIniciais(db);
    });

    db.close(() => {
        console.log(`Banco do usuário ${userId} configurado e fechado.`);
    });
}

module.exports = { inicializarBancoUsuario };
