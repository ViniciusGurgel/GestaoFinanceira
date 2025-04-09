const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    Nome: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Usuario: { type: String, required: true, unique: true },
    Senha: { type: String, required: true }
}, { collection: 'Usuario' });

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario; 