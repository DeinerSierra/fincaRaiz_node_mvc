import express from 'express' 
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';
//crear la app
const app = express();
//Habilitar leer datos de formularios
app.use(express.urlencoded({extended: true}))
//Habilitar cookieparser
app.use(cookieParser());
//habilitar CSRF para los formularios
app.use(csrf({cookie:true}))
//Conexion a la db
try {
    await db.authenticate();
    db.sync();//Generar las tablas
    console.log('Conectado a la base de datos correctamente')
} catch (error) {
    console.log(error)
}
//Habilitar el template engine pug
app.set('view engine','pug')
app.set('views','./views')

//Carpeta publica
app.use(express.static('public'))
//Routing
app.use('/',appRoutes)
app.use('/auth',usuarioRoutes)
app.use('/',propiedadesRoutes)
app.use('/api',apiRoutes)



//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`Conectado al puerto ${port}`)
})