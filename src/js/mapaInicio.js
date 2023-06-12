(function(){
    const lat = 4.676194;
    const lng = -74.070577;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);
    let markers = new L.FeatureGroup().addTo(mapa)

    let propiedades = [];
    //Filtros
    const filtros = {
        categoria: '',
        precio: '',
    }
    const categoriasSelect = document.querySelector('#categorias')
    console.log(categoriasSelect)
    const preciosSelect = document.querySelector('#precios')
    console.log(preciosSelect)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    //filtrado de cotegorias y precios
    categoriasSelect.addEventListener('change', e =>{
        filtros.categoria = e.target.value;
        filtrarPropiedades();
    })
    preciosSelect.addEventListener('change', e =>{
        filtros.precio = e.target.value;
        filtrarPropiedades();
    })
    //Consultamos la api 
    const obtenerPropiedades = async () =>{
        try {
            //Consulta
            const url ='/api/propiedades'
            const respuesta = await fetch(url)
            propiedades = await respuesta.json()
            //llamdo de la funcion que itera los resultados
            mostrarPropiedades(propiedades)
        } catch (error) {
            console.log(error)
        }
    }
    const mostrarPropiedades = propiedades =>{
        //Limpiar los markers previos
        markers.clearLayers()
        propiedades.forEach(propiedad => {
            //agregar los pines con la informacion de todas las propiedades
            const marker = new L.marker([propiedad?.lat, propiedad?.lng],{
                autoPan: true
            }).addTo(mapa).bindPopup(`
                <p class="text-red-700 font-bold">Categoria: ${propiedad.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen Propiedad">
                <p class="text-red-700 font-bold">Precio: ${propiedad.precio.precio}</p>
                <a href="/propiedad/${propiedad.id}">Ver Propiedad</a>
                
            `)
            markers.addLayer(marker)
        });
    }
    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio)
        mostrarPropiedades(resultado)
        console.log(resultado)
    }
    const filtrarCategoria = (propiedad) => {
        return filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad
    }
    const filtrarPrecio = (propiedad) => {
        return filtros.precio ? propiedad.precioId === filtros.precio : propiedad
    }
    obtenerPropiedades();
})()