const mongoose = require('mongoose');

// Conectar ao MongoDB local
mongoose.connect('mongodb://localhost:27017/GestaoFinanceira', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Evento para verificar conexão bem-sucedida
mongoose.connection.on('connected', () => {
    console.log('✅ Conectado ao MongoDB: GestaoFinanceira');
});

// Evento para verificar erro na conexão
mongoose.connection.on('error', (err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
});

module.exports = mongoose;