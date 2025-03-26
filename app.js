const express = require('express');
const path = require('path');

// Conectar ao MongoDB
require('./backend/database/db');
require('dotenv').config();

const transacaoRouter = require('./backend/transacoes.js');
const authRouter = require('./backend/auth.js');
const { verificarToken } = require('./backend/middleware/auth');

const app = express();
const port = 5555;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definição de rotas
app.use('/api', transacaoRouter);
app.use('/auth', authRouter);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'transacoes.html'));
});

// Iniciar o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
