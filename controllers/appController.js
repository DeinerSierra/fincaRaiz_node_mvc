import {Sequelize} from 'sequelize'
import {Propiedad, Precio,Categoria} from '../models/index.js';

const inicio = async (req, res)=>{
    const usuario = req.usuario
    
    const [categorias,precios,casas, apartamentos] = await Promise.all([
        Categoria.findAll({row:true}),
        Precio.findAll({row:true}),
        Propiedad.findAll({
            limit: 3, 
            where:{categoriaId: 1},
            include:[{model: Precio, as:'precio'}],
            order:[['createdAt','DESC']]
        }),
        Propiedad.findAll({
            limit: 3, 
            where:{categoriaId: 2},
            include:[{model: Precio, as:'precio'}],
            order:[['createdAt','DESC']]
        }),
    ])
    res.render('inicio',{
        pagina:'Inicio',
        categorias,
        precios,
        casas, 
        apartamentos,
        csrfToken: req.csrfToken(),
        usuario,
        
    })
}
const categoria = async (req, res)=>{
    const {id} = req.params
    //comprobar que la categoria exista
    const categoria = await Categoria.findByPk(id)
    if (!categoria) {
        return res.redirect('/404')
    }
    //obtner las propiedades de esa categoria
    const propiedades = await Propiedad.findAll({
        where: {categoriaId: id},
        include:[{model:Precio, as:'precio'}]
    })
    res.render('categoria',{
        pagina:`${categoria.nombre}s en Venta`,
        propiedades,
        csrfToken: req.csrfToken()

    })
}
const noEncontrado = async (req, res)=>{
    res.render('404',{
        pagina:'No Encontrada',
        csrfToken: req.csrfToken()
    })
}
const buscador = async (req, res)=>{
    const {termino} = req.body
    //validar que el termino de busqueda no este vacio
    if (!termino.trim()) {
        return res.redirect('back')
    }
    //consultar las propiedades
    const propiedades = await Propiedad.findAll({
        where:{
            titulo:{
                [Sequelize.Op.like]:'%'+ termino +'%'
            },

        },
        include:[
            {model: Precio, as: 'precio'}
        ]
    })
    res.render('busqueda',{
        pagina:'Resultados de la Busqueda',
        propiedades,
        csrfToken: req.csrfToken()
    })
}
export {
    inicio,
    categoria,
    noEncontrado,
    buscador,


}