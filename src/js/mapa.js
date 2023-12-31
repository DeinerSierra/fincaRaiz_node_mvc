(function() {
    
    const lat = document.querySelector('#lat').value || 4.676194;
    const lng = document.querySelector('#lng').value || -74.070577;
    console.log(lat, lng);
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;
    //Utilizar providers y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    //Colocar el pin
    marker = new L.marker([lat, lng],{
        draggable: true,
        autoPan: true
    }).addTo(mapa);
    //Detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker = e.target;
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));
        //Obtener la informacion de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion,13).run(function(error, resultado){
            marker.bindPopup(resultado.address.LongLabel)
            //llenar los campos calle
            const direccionDiv = document.querySelector('.div-direccion');
            direccionDiv.classList.remove('hidden');
            document.querySelector('.calle').textContent = 'Direccion: '+resultado?.address?.Address || '';
            
            document.querySelector('#calle').value = resultado?.address?.Address || '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ? resultado.latlng.lat : '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ? resultado.latlng.lng : '';
        })
        

    })


})()