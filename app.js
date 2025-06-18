const express = require('express');
const path = require('path');

// Conectar ao MongoDB
require('./backend/database/db');
require('dotenv').config();

const transacaoRouter = require('./backend/transacoes.js');
const authRouter = require('./backend/auth.js');
const personalizarRouter = require('./backend/personalizar.js');
const realtorioRouter = require('./backend/relatorio.js');
const metasRouter = require('./backend/metas.js');

const app = express();
const port = 5555;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definição de rotas
app.use('/api', transacaoRouter);
app.use('/auth', authRouter);
app.use('/personalizar', personalizarRouter);
app.use('/relatorio', realtorioRouter);
app.use('/metas', metasRouter);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Iniciar o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
