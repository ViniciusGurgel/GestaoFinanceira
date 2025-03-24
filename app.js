const express = require('express');



const transacao = require('./backend/transacoes.js')

const app = express();
const port = 5555;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use('/', transacao);



app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
  });