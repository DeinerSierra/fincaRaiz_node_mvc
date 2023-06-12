(function() {
    const cambiarEstadoBotones = document.querySelectorAll('cambiar-estado')
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    cambiarEstadoBotones.forEach(boton=>{
        boton.addEventListener('click',cambiarEstadoPropiedad)
    })
    async function cambiarEstadoPropiedad(e){
        const {propiedadId: id} = e.target.dataset
        try {
            const url = `/propiedades/${id}`
            const respuesta = await fetch(url,{
                method:'PUT',
                headers:{'CSRF-token':token}
            })
            const {resultado} = await respuesta.json()
            if (resultado) {
                if(e.target.classList.contains('bg-red-800')){
                    e.target.classList.add('bg-green-800')
                    e.target.classList.remove('bg-red-800')
                    e.target.textContent = 'Publicado'
                }else{
                    e.target.classList.remove('bg-green-800')
                    e.target.classList.add('bg-red-800')
                    e.target.textContent = 'No Publicado'
                }
            }

        } catch (error) {
            console.log(error)
        }
    }
})()