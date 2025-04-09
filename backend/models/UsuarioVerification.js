const mongoose = require('mongoose');

const usuarioVerificationSchema = new mongoose.Schema({
    Email: { type: String, required: true, unique: true },
    Codigo: { type: String, required: true },
    EnviadoEm: { type: Date, required: true },
}, { collection: 'UsuarioVerification' });

const UsuarioVerification = mongoose.model('UsuarioVerification', usuarioVerificationSchema);

module.exports = UsuarioVerification;