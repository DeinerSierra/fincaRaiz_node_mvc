import express from 'express'
import {forumlarioLogin,autenticar,forumlarioRegistro,forumlarioOlvidePassword,registrar,confirmarCuenta,resetPassword,comprobarToken,nuevoPassword,cerrarSesion} from '../controllers/usuarioController.js'
const router = express.Router();
router.get('/login',forumlarioLogin)
router.post('/login',autenticar)
router.post('/cerrar-sesion',cerrarSesion)

router.get('/registro',forumlarioRegistro)
router.post('/registro',registrar)
router.get('/confirmar-cuenta/:token',confirmarCuenta)

router.get('/olvide-password',forumlarioOlvidePassword)
router.post('/olvide-password',resetPassword)
//almacenar el nuevo password
router.get('/olvide-password/:token',comprobarToken)
router.post('/olvide-password/:token',nuevoPassword)
export default router;