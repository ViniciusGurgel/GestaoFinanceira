const nodemailer = require('nodemailer');
const util = require('util');

// configuração do transportador de email (transporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ceubconecta@gmail.com',
    pass: 'kuoxkbsuofqnxpqi'
  }
});


// promisify a função sendMail
const sendMail = util.promisify(transporter.sendMail).bind(transporter);


// função assíncrona para enviar email
async function enviarEmail(mailOptions) {
    try {
        let info = await sendMail(mailOptions);
        console.log('Email enviado:', info.response);
    } catch (error) {
        console.error('Erro ao enviar email:', error);
    }
}

//função gerar code
function code(){
  codigo = '';
  for(let c = 0; c < 6; c++){
      const num = (Math.random() * 9).toFixed(0);
      codigo += num;  
  }
  console.log(codigo);
  return codigo;
}

module.exports = {code, enviarEmail};