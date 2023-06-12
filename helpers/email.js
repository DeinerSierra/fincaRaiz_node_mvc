import nodemailer from 'nodemailer';
const emailRegistro = async(datos) =>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });
    const {email, nombre, token} = datos;
    //enviar el email
    await transport.sendMail({
        from:'FincaRaiz.com',
        to:email,
        subject:'Confirma tu cuenta en FincaRaiz.com',
        text:'Confirma tu cuenta en FincaRaiz.com',
        html:`
            <p>Hola ${nombre}, por favor confirma tu cuenta en FincaRaiz.com</p>
            <p>Para continuar haz click en el enlace <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar-cuenta/${token}">Confirmar Cuenta</a> </p>
            <p>Si no creaste esta cuenta omite este mensaje/p>
        `

    })

}
const recuperarPassword = async(datos) =>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });
    const {email, nombre, token} = datos;
    //enviar el email
    await transport.sendMail({
        from:'FincaRaiz.com',
        to:email,
        subject:'Recuperar password en FincaRaiz.com',
        text:'Recuperar password en FincaRaiz.com',
        html:`
            <p>Hola ${nombre}, recupera tus credenciales de cuenta en FincaRaiz.com</p>
            <p>Para continuar haz click en el enlace <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Password</a> </p>
            <p>Si no realizaste esta petición, omite este mensaje/p>
        `

    })

}
export {
    emailRegistro,
    recuperarPassword
}