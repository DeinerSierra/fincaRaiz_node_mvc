import jwt from 'jsonwebtoken'
import {Usuario} from "../models/index.js";
const protegerRutas = async(req, res, next) => {
    //Verificar si hay un token generado por jsonwebtoken
    const {_token} = req.cookies
    if (!_token) {
        return redirect('/auth/login')
    }
    //comprobar el token
    try {
        const decode = jwt.verify(_token,process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decode.id)//Buscamos el usuario logueado con el token obtenido
        //almacenar el usuario en el Req
        if (usuario) {
            req.usuario = usuario;
            return next();
        } else {
            return res.redirect('/auth/login')
        }
        return next()
    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login')
    }
    
}
export default protegerRutas;