function fnGeneraMarcador( sDomicilio, sDescripcion, map ){
	var sDomicilio = sDomicilio.replace(' ', '+');
	$.ajax({
		url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+sDomicilio+'&key=AIzaSyD-48MSvZ4YtD79Gb4hdsCmKTS2wQId4Ls',
		dataType: 'json',
		success: function(data){
			var sDireccion = data.results[0].formatted_address;
			console.log( sDireccion );
			var marker = new google.maps.Marker({
				position: data.results[0].geometry.location,
				map: map
			});

			var infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.setContent(sDireccion+'<br>Delitos cometidos: '+sDescripcion);
				infowindow.open(map, this);
			});
		}
	});
}
function fnCargarMapa(){
	var uluru = {lat: 19.3910038, lng: -99.2837006};
	var map = new google.maps.Map(document.getElementById('resultado'), {
		zoom: 11,
		center: uluru
	});
	var aLugares = [];
	$("#elementos tr").each(function(){
		var oInputColonia = $(this).find('td:eq(0)').text();
		var oInputDelegacion = $(this).find('td:eq(1)').text();
		var oInputValor = $(this).find('td:eq(2)').text();
		aLugares.push({
			colonia: oInputColonia,
			delegacion: oInputDelegacion,
			descripcion: oInputValor
		});
	});

	for(var i=0; i<aLugares.length; i++){
		var tempPlace = aLugares[i];
		fnGeneraMarcador( tempPlace.colonia+','+tempPlace.delegacion, tempPlace.descripcion, map );
	}
}