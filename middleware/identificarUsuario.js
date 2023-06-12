import jwt from 'jsonwebtoken';
import Usuario  from '../models/Usuario.js';

const identificarUsuario = async (req, res, next) => {
    //Buscar un token en las cookies
    const token = req.cookies._token
    if (!token) {
        req.usuario = null
        return next();
    }
    //comprobar el token
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decode.id)//Buscamos el usuario logueado con el token obtenido
        //almacenar el usuario en el Req
        if (usuario) {
            req.usuario = usuario;
            
        } 
        return next()
        
    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login');
    }
    next()
}
export default identificarUsuario;