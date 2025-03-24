const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Define o caminho do banco de dados
const dbPath = path.join(__dirname, 'local.db');

// Verifica se o banco já existe
const dbExists = fs.existsSync(dbPath);

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err);
    } else {
        console.log('Banco de dados conectado');
    }
});

// Criação das tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS TipoTransacao (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Categoria (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS MeioPagamento (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Transacao (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT,
        TipoTransacaoId INTEGER ,
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
        CategoriaId INTEGER NOT NULL,
        ValorLimite REAL NOT NULL,
        PeriodoInicio DATE NOT NULL,
        PeriodoFim DATE NOT NULL,
        FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id)
    )`);
});

db.close(() => {
    console.log('Banco de dados configurado e fechado');
});
