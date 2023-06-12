import { validationResult } from 'express-validator';
import {unlink} from 'node:fs/promises'
import {Categoria,Precio, Propiedad, Mensaje, Usuario} from "../models/index.js";
import {esVendedor,formatearFecha } from '../helpers/index.js';
const admin = async (req, res)=>{
    //leer el query string
    const {pagina: paginaActual} = req.query;
    const regex = /^[1-9]$/
    if (!regex.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1')
    }
    try {
        const {id} = req.usuario
        //Limites y offset para el paginador
        const limit = 3
        const offset = ((paginaActual * limit) - limit)
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit: limit,
                offset: offset,
                where:{usuarioId:id},
                include:[{model:Categoria, as:'categoria'},{model:Precio, as:'precio'},{model:Mensaje, as:'mensajes'}]
            }),
            Propiedad.count({
                where:{usuarioId:id},
            })
        ])
        res.render('propiedades/admin',{
            pagina:'Mis Propiedades',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })
        
    } catch (error) {
        console.log(error)
    }

    
}
const crear = async (req, res) => {
    //Consultar modelos de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ])
    res.render('propiedades/crear',{
        pagina:'Crear Propiedades',
        csrfToken: req.csrfToken(),//genera el csrf token en el formulario
        categorias,
        precios,
        datos:{}
    })

}
const guardar = async (req, res) => {
    
    //validacion
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        //Consultar modelos de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ])
        return res.render('propiedades/crear',{
            pagina:'Crear Propiedades',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            categorias,
            precios,
            errores: resultado.array(),
            datos:req.body
        })
        
    }
    //extraemos la info del usuario que alamcenamos en el middleware en el req.usuario
    const {id:usuarioId} =req.usuario
    //Crear el registro
    try {
        const propiedadDB = await Propiedad.create({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            habitaciones: req.body.habitaciones,
            estacionamiento: req.body.estacionamiento,
            wc: req.body.wc,
            calle: req.body.calle,
            lat: req.body.lat,
            lng: req.body.lng,
            precioId: req.body.precio,
            categoriaId: req.body.categoria,
            usuarioId,
            imagen:''
        })
        const {id} = propiedadDB;
        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
    }

}
const agregarImagen = async (req, res) => {
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    //validar que no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }
    //validar que que la propiedad pertenesca a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen',{
        pagina:'Agregar Imagen',
        csrfToken: req.csrfToken(),//genera el csrf token en el formulario
        propiedad
    })
}
const almacenarImagen = async (req, res, next) => {
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    //validar que no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }
    //validar que que la propiedad pertenesca a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }
    try {

        //almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename
        console.log(propiedad.imagen)
        propiedad.publicado = 1
        await propiedad.save()
        //La redireccion se hace por medio del archivo agregarImagen.js con dropzone
        res.status(200).json({ message: 'Imagen subida correctamente' });
        next();

    } catch (error) {
        console.log(error)
    }

}
const editar = async (req, res) =>{
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }
    //Consultar modelos de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ])
    res.render('propiedades/editar',{
        pagina:'Editar Propiedad',
        csrfToken: req.csrfToken(),//genera el csrf token en el formulario
        categorias,
        precios,
        datos:propiedad
    })

}
const guardarCambios =async (req, res) => {
    //verificar la validacion de campos
    //validacion
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        //Consultar modelos de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ])
        return res.render('propiedades/editar',{
            pagina:'Editar Propiedad',
            csrfToken: req.csrfToken(),//genera el csrf token en el formulario
            categorias,
            precios,
            errores: resultado.array(),
            datos:req.body
        })
        
    }

    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }
    try {
        const {titulo, descripcion, habitaciones, estacionamiento,wc, calle, lat, lng, precio: precioId,categoria:categoriaId} = req.body
        propiedad.set({
            titulo, descripcion, habitaciones, estacionamiento,wc, calle, lat, lng, precioId,categoriaId
        });
        await propiedad.save();
        res.redirect('/mis-propiedades')
    } catch (error) {
        console.log(error)
    }

}
const eliminar = async (req,res)=>{
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    
    //validar que que la propiedad pertenesca a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }
    //eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`)
    //eliminar la propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades')

}
const mostrarPropiedad = async (req, res) =>{
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id,{
        where:{usuarioId:id},
        include:[{model:Categoria, as:'categoria'},{model:Precio, as:'precio'}]
    });
    if (!propiedad || !propiedad.publicado) {
        return res.redirect('/404')
    }
    //validar que no este publicada
    res.render('propiedades/mostrar',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario, //este viene del middleware identificar usuario
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    })
}
const enviarMensaje = async (req, res) => {
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id,{
        where:{usuarioId:id},
        include:[{model:Categoria, as:'categoria'},{model:Precio, as:'precio'}]
    });
    if (!propiedad) {
        return res.redirect('/404')
    }
    //renderizar los errors
    //validacion
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        return res.render('propiedades/mostrar',{
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario, //este viene del middleware identificar usuario
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })    
    }
    //almacenar el mensaje
    const {mensaje} = req.body;
    const {id: propiedadId} = req.params;
    const {id: usuarioId} = req.usuario;
    await Mensaje.create({mensaje,propiedadId,usuarioId})
    //validar que no este publicada
    //res.redirect('/')
    res.render('propiedades/mostrar',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario, //este viene del middleware identificar usuario
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
    })
}
const verMensajes = async (req, res) => {
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id,{
        include:[
            {
                model:Mensaje, as:'mensajes',
                include:[
                    {model: Usuario.scope('eliminarPassword'), as:'usuario'}
                ]
            }
        ]
    });
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    
    //validar que que la propiedad pertenesca a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }
    res.render('propiedades/mensajes',{
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha 
    })
}
//cambiar es estado de la propiedad
const cambiarEstado = async (req, res) => {
    //extraemos el id de la propiedad que se encuentra en la url
    const {id} = req.params;
    //validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    
    //validar que que la propiedad pertenesca a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }
    //actualizar
    if (propiedad.publicado) {
        propiedad.publicado = 0
    }else{
        propiedad.publicado = 1
    }
    await propiedad.save()
    res.json({
        resultado: true
    })


}
export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}
