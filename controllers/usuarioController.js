import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

import Usuario from '../models/Usuario.js';
import {genearId,generarJWT} from '../helpers/tokens.js';
import { emailRegistro,recuperarPassword } from '../helpers/email.js';
const forumlarioLogin = (req, res) =>{
    res.render('auth/login',{
        pagina:'Iniciar Sesion',
        csrfToken: req.csrfToken(),//genera el csrf token en el formulario
    })
}
const autenticar =  async(req, res) =>{
    await check('email').notEmpty().withMessage('El email no puede ir vacio').run(req);
    await check('email').isEmail().withMessage('Verifica la estructura del email').run(req);
    await check('password').notEmpty().withMessage('Es password es obligatorio').run(req);
    
    let resultado = validationResult(req);
    //Verificar que el resultado de las validaciones este vacio
    if (!resultado.isEmpty()) {
        //hay errores
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:resultado.array(),
        })
    }
    //verificar que el email y evitar usuarios no exista ingrese
    const existeUsuario = await Usuario.findOne({where:{email:req.body.email}})
    console.log(existeUsuario)
    if (!existeUsuario) {
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:[{msg:'El usuario no existe'}],
        })
        
    }
    if (!existeUsuario.confirmado) {
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:[{msg:'La cuenta no confirmada revisa tu email y confirma la cuenta'}],
        })
        
    }
    //verificar el password
    if (!existeUsuario.verificarPassword(req.body.password)) {
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:[{msg:'El password es incorrecto intenta de nuevo'}],
        })
    }
    //Si el password es correcto lo autenticamos con json webtoken
    const token = generarJWT({id:existeUsuario.id,nombre:existeUsuario.nombre});
    //almacenar el token de autenticacion en los cookies
    return res.cookie('_token',token,{httpOnly:true, //secure:true
                        }).redirect('/mis-propiedades');
    

}
const forumlarioRegistro = (req, res) =>{
    res.render('auth/registro',{
        pagina:'Crear Cuenta',
        csrfToken: req.csrfToken(),//genera el csrf token en el formulario
    })
}

const registrar = async (req, res) =>{
    //validar los datos del formulario
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req);
    await check('email').notEmpty().withMessage('El email no puede ir vacio').run(req);
    await check('email').isEmail().withMessage('Verifica la estructura del email').run(req);
    await check('password').isLength({min:6}).withMessage('Es password debe contener minimo 6 caracteres').run(req);
    await check('r_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Los passwords no coinciden')
    .run(req);
    let resultado = validationResult(req);

    //Verificar que el resultado de las validaciones este vacio
    if (!resultado.isEmpty()) {
        //hay errores
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:resultado.array(),
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email,
                
            }
        })
    }
    //verificar que el email y evitar usuarios duplicados
    const existeUsuario = await Usuario.findOne({where:{email:req.body.email}})
    if (existeUsuario) {
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:[{msg:'El usuario ya existe'}],
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email,
                
            }
        })
        
    }
    //alamcenar el usuario
    const usuario = await Usuario.create({
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        token:genearId()
    });
    //enviar un email de confirmacion
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })
    //Mostrar un mensaje de confirmacion de registro
    res.render('templates/mensaje',{
        pagina:'Cuenta Creada con Exito',
        mensaje:'Hemos enviado un email de confirmación de tu cuenta'
    })
    
}
const confirmarCuenta = async (req, res, next) =>{
    const {token} = req.params;
    //Verificar el token
    const usuario = await Usuario.findOne({where:{token}});//Busscamos el usuario con ese token recuperado de la url
    //Si no hay un usuario
    if (!usuario) {
        return res.render('auth/confirmar-cuenta',{
            pagina:'Error al confirmar tu cuenta',
            mensaje:'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }
    //confirmar la cuenta
    usuario.token = null; //elimiminamos el token una vez el usuario confirme la cuenta
    usuario.confirmado = true;
    usuario.save(); //almacenamos los cambios en db
    //Mesnaje cuenta confirmada
    res.render('auth/confirmar-cuenta',{
        pagina:'Tu cuenta ha sido confirmada',
        mensaje:'Hemos confirmado tu cuenta ya puedes iniciar sesion en el siguiente enlace',
        
    })
    next();

}
const forumlarioOlvidePassword = (req, res) =>{
    res.render('auth/olvide',{
        pagina:'Recupera tu acceso a FincaRaiz',
        csrfToken: req.csrfToken()//genera el csrf token en el formulario
    })
}
const resetPassword = async (req, res)=>{
    //validar los datos del formulario
    
    await check('email').notEmpty().withMessage('El email no puede ir vacio').run(req);
    await check('email').isEmail().withMessage('Verifica la estructura del email').run(req);
    
    let resultado = validationResult(req);

    //Verificar que el resultado de las validaciones este vacio
    if (!resultado.isEmpty()) {
        //hay errores
        return res.render('auth/olvide',{
            pagina:'Recupera tu acceso a FincaRaiz',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores: resultado.array()
        })
    }
    //Buscar el usuario con el email obtenido del formulario olvide
    const {email} = req.body;
    const usuario = await Usuario.findOne({where:{email}});
    //Si no encontramos el usuario enviamos un mensaje a la misma vista
    if (!usuario) {
        //hay errores
        return res.render('auth/olvide',{
            pagina:'Recupera tu acceso a FincaRaiz',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores: [{msg:`El usuario con email ${email} no existe`}]
        })
    }
    //El caso que exista el usario generamos un nuevo token para restaurar la contraseña
    usuario.token = genearId();
    await usuario.save();
    //Enviamos un email con las intrucciones de cambio
    recuperarPassword({//Funcion de email para envio de correo
        email,
        nombre: usuario.nombre,
        token: usuario.token
    })
    //Mostrar un mensaje 
    res.render('templates/mensaje',{
        pagina:'Reestable tu password',
        mensaje:'Hemos enviado un email con las intrucciones'
    })
    
}
const comprobarToken = async (req, res) =>{
    const {token} = req.params;
    //Verificar el token
    const usuario = await Usuario.findOne({where:{token}});//Busscamos el usuario con ese token recuperado de la url
    //Si no hay un usuario
    if (!usuario) {
        return res.render('auth/confirmar-cuenta',{
            pagina:'Reestablce tu password',
            mensaje:'Hubo un error al validar la información, intenta de nuevo',
            error: true
        })
    }
    res.render('auth/reset-password',{
        pagina:'Reestablecer Password',
        csrfToken: req.csrfToken(),//genera el csrf token en el formulario
        
    })

}
const nuevoPassword = async (req, res) =>{
    //Validamos los campos
    await check('password').isLength({min:6}).withMessage('Es password debe contener minimo 6 caracteres').run(req);
    await check('r_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Los passwords no coinciden')
    .run(req);
    let resultado = validationResult(req);

    //Verificar que el resultado de las validaciones este vacio
    if (!resultado.isEmpty()) {
        //hay errores
        return res.render('auth/reset-password',{
            pagina:'Reestablecer Password',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            errores:resultado.array(),
        })
    }
    const {token} = req.params;
    const {password} = req.body;
    //Verificar el token
    const usuario = await Usuario.findOne({where:{token}});//Busscamos el usuario con ese token recuperado de la url
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null; //elimiminamos el token una vez el usuario confirme la cuenta
    await usuario.save(); //almacenamos los cambios en db
    res.render('auth/confirmar-cuenta',{
        pagina:'Password reestablecido',
        mensaje:'Hemos actualizado tu passsword ya puedes iniciar sesión',
        
    })
}
const cerrarSesion = async (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}
export {
    forumlarioLogin,
    autenticar,
    forumlarioRegistro,
    forumlarioOlvidePassword,
    registrar,
    confirmarCuenta,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion
}