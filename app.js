const express = require('express');
const path = require('path');
const transacaoRouter  = require('./backend/transacoes.js')


const app = express();
const port = 5555;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'transacoes.html'));
});

app.use('/api', transacaoRouter);



app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
  });