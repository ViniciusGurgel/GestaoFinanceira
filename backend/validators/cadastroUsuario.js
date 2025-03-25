const Joi = require('joi');

// valida o dominio do email
const emailValidator = Joi.string().email().custom((value, helpers) => {
    if (!value.endsWith('@gmail.com')) {
        return helpers.message('O e-mail deve ter o domínio @sempreceub.com');
    }
    return value;
});

const schema = Joi.object({
    Name: Joi.string()
        .min(7)
        .max(70)
        .required()
        .messages({
            'string.empty': 'O nome completo deve ser preenchido',
            'string.min': 'O nome completo deve ter pelo menos 7 caracteres',
            'string.max': 'O nome completo deve ter no máximo 70 caracteres',
            'any.required': "O nome completo é obrigatório para o registro"
        }),

    Username: Joi.string()
        .alphanum()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.empty': 'O nome de usuário deve ser preenchido',
            'string.min': 'O nome de usuário deve ter pelo menos 3 caracteres',
            'string.max': 'O nome de usuário deve ter no máximo 50 caracteres',
            'any.required': "O nome de usuário é obrigatório para o registro"
        }),

    Email: emailValidator.required()
        .messages({
            'string.empty': 'O e-mail deve ser preenchido',
            'any.required': "O e-mail é obrigatório para o registro"
        }),

    Password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{3,30}$/)
        .required()
        .messages({
            'string.empty': 'A senha deve ser preenchida',
            'string.pattern.base': 'A senha deve ter entre 3 e 30 caracteres um numero e um caractere especial.',
            'any.required': "A senha é obrigatória para o registro"
            
        }),

    PasswordConfirm: Joi.string()
        .required()
        .valid(Joi.ref('Password'))
        .messages({
            'any.only': 'As senhas devem ser iguais',
            'string.empty': 'A confirmação da senha deve ser preenchida',
            'any.required': "A senha de confirmação é obrigatória para o registro"
        })
}).with('Password', 'PasswordConfirm');


const validateAndDisplay = async (body) => {
    try {
        // valida o corpo
        await schema.validateAsync(body, { abortEarly: false });
        return { success: true };
    } catch (err) {
        // entrega os erros
        return { success: false, errors: err.details.map(detail => detail.message) };
    }
};

module.exports = { validateAndDisplay };