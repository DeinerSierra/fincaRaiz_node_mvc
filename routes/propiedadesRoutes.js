import express from 'express'; 
import {body} from 'express-validator'
import { admin,crear,guardar,agregarImagen,almacenarImagen,editar,guardarCambios,eliminar,mostrarPropiedad,enviarMensaje,verMensajes,cambiarEstado } from '../controllers/propiedadController.js';
import protegerRutas from '../middleware/protegerRutas.js';
import upload from '../middleware/subirImagen.js';
import identificarUsuario from '../middleware/identificarUsuario.js'
const router = express.Router();
router.get('/mis-propiedades',protegerRutas,admin)
router.get('/propiedades/crear',protegerRutas,crear)
router.post('/propiedades/crear',protegerRutas,
            body('titulo').notEmpty().withMessage('El titulo de la publición es obligatorio'),
            body('descripcion').notEmpty().withMessage('La descripcion esta vacia')
            .isLength({max: 200}).withMessage('La descripcion es muy larga'),
            body('categoria').isNumeric().withMessage('Selecciona una categoria'),
            body('precio').isNumeric().withMessage('Selecciona un rango precios'),
            body('habitaciones').isNumeric().withMessage('Selecciona un numero de habitaciones'),
            body('estacionamiento').isNumeric().withMessage('Selecciona un numero de estacionamiento'),
            body('wc').isNumeric().withMessage('Selecciona un numero de baños'),
            body('lat').notEmpty().withMessage('La latitud es requerida'),
            guardar)
router.get('/propiedades/agregar-imagen/:id',protegerRutas,agregarImagen)
router.post('/propiedades/agregar-imagen/:id',protegerRutas,upload.single('imagen'),almacenarImagen)

router.get('/propiedades/editar/:id',protegerRutas,editar)
router.post('/propiedades/editar/:id',protegerRutas,
            body('titulo').notEmpty().withMessage('El titulo de la publición es obligatorio'),
            body('descripcion').notEmpty().withMessage('La descripcion esta vacia')
            .isLength({max: 200}).withMessage('La descripcion es muy larga'),
            body('categoria').isNumeric().withMessage('Selecciona una categoria'),
            body('precio').isNumeric().withMessage('Selecciona un rango precios'),
            body('habitaciones').isNumeric().withMessage('Selecciona un numero de habitaciones'),
            body('estacionamiento').isNumeric().withMessage('Selecciona un numero de estacionamiento'),
            body('wc').isNumeric().withMessage('Selecciona un numero de baños'),
            body('lat').notEmpty().withMessage('La latitud es requerida'),
            guardarCambios)
router.post('/propiedades/eliminar/:id',protegerRutas, eliminar)
router.put('/propiedades/:id', protegerRutas, cambiarEstado)
//area publica
router.get('/propiedad/:id',identificarUsuario,mostrarPropiedad)
//almacenar los mensajes enviados
router.post('/propiedad/:id',identificarUsuario,
            body('mensaje').isLength({min:10}).withMessage('El mensaje es muy corto agrega mas de 10 caracteres'),
            enviarMensaje)
router.get('/mensajes/:id',protegerRutas,verMensajes)

export default router;