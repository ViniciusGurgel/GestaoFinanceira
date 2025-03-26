const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/GestaoFinanceira';

mongoose.connect(uri)
    .then(() => console.log('🚀 Conectado ao MongoDB - GestaoFinanceira'))
    .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

module.exports = mongoose;
