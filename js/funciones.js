function fnDelRow( elemento ){
	var row = $(elemento).parent().parent();
	row.remove();
}

function fnAlerta( sContenido ){
	return $( '<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+sContenido+'</div>' );
}

function fnGeneraJsonDesdeTabla(){
	var jGeneral = { "name": "CDMX", "size": 0, "children":[] };
	var tempJsonDelegaciones = {};
	$("#elementos tr").each(function(){
		var sInputColonia = $(this).find('td:eq(0)').text();
		var sInputDelegacion = $(this).find('td:eq(1)').text();
		var sInputValor = $(this).find('td:eq(2)').text();
		var jColonia = { "name": sInputColonia, "size": parseInt( sInputValor ) };
		if( typeof tempJsonDelegaciones[ sInputDelegacion] == "undefined" ){
			tempJsonDelegaciones[ sInputDelegacion ] = { "size": 0, "children": []};
		}
		tempJsonDelegaciones[ sInputDelegacion ].children.push( jColonia );
		tempJsonDelegaciones[ sInputDelegacion ].size += jColonia.size;
	});
	$.each(tempJsonDelegaciones, function( sDelegacion, oVal ){
		jGeneral.size += oVal.size;
		jGeneral.children.push({
			"name": sDelegacion,
			"size": oVal.size,
			"children": oVal.children
		});
	});
	console.log(jGeneral);
	return jGeneral;
}

function fnGeneraJsonDesdeTabla_lineaTiempo(){
	var aJsonGeneral = [];
	var tempJsonColonia = {};
	$("#elementos tr").each(function(){
		var sInputColonia = $(this).find('td:eq(0)').text();
		var sInputDelegacion = $(this).find('td:eq(1)').text();
		var sInputDelitos = $(this).find('td:eq(2)').text();
		var sInputPoblacion = $(this).find('td:eq(3)').text();
		var sInputAnio = $(this).find('td:eq(4)').text();
		//if( aJsonGeneral.length == 0 ){
			/*aJsonGeneral.push({
				"colonia": sInputColonia,
				"delegacion": sInputDelegacion,
				"poblacion": [ [ sInputAnio, sInputPoblacion ] ],
				"delitos": [ [ sInputAnio, sInputDelitos ] ]
			});*/
		//}
		/*for( var i=0; i<aJsonGeneral.length; i++ ){
			var pos = aJsonGeneral[i];
			if( pos.colonia == sInputColonia && pos.delegacion == sInputDelegacion ){
				pos.poblacion.push( [ sInputAnio, sInputPoblacion ] );
				pos.delitos.push( [ sInputAnio, sInputDelitos ] );
			} else{
				aJsonGeneral.push({
					"colonia": sInputColonia,
					"delegacion": sInputDelegacion,
					"poblacion": [ [ sInputAnio, sInputPoblacion ] ],
					"delitos": [ [ sInputAnio, sInputDelitos ] ]
				});
			}
		}*/
		/*if( typeof tempJsonColonia[ sInputColonia ] == "undefined" ){
			tempJsonColonia[ sInputColonia ] = { "poblacion": [], "delitos": [] };
		}
		tempJsonColonia[ sInputColonia ].poblacion.push([ sInputAnio, sInputPoblacion ]);
		tempJsonColonia[ sInputColonia ].delitos.push([ sInputAnio, sInputDelitos ]);*/
	});
	console.log(aJsonGeneral);
}

$("#btnBuscar").click(function(){
	var sTipo = $("input[name=tipoGrafico]:checked").val();
	if( typeof sTipo == "undefined" ){
		$("#tipoRespuesta").before( fnAlerta("Debe seleccionar un tipo de respuesta") );
	} else {
		$(".alert").alert('close');
		$("#resultado").html('');
		switch( sTipo ){
			case "mapa":
				d3.selectAll("svg > *").html('');
				$("#resultado").show();
				fnCargarMapa();
				break;
			case "circulos":
				d3.selectAll("svg > *").html('');
				$("#resultado").hide();
				fnGraficar();
				break;
			case "wheel":
				d3.selectAll("svg > *").html('');
				$("#resultado").hide();
				fnGraficarWheel();
				break;
			case "lineaTiempo":
				d3.selectAll("svg > *").html('');
				$("#resultado").hide();
				fnGeneraJsonDesdeTabla_lineaTiempo();
				/*fnGraphTimeLine(
					[
						{
							"colonia": "Del Valle",
							"delegacion": "Benito Juárez",
							"poblacion": [
								[
									1820,
									381000000
								],
								[
									1821,
									383711494
								],
								[
									1822,
									386442286
								],
								[
									1823,
									389192512
								],
								[
									1824,
									391962310
								]
							],
							"delitos": [
								[
									1800,
									32
								],
								[
									1850,
									32
								],
								[
									1856,
									26
								],
								[
									1864,
									31
								],
								[
									1871,
									32
								]
							]
						},
						{
							"colonia": "Florida",
							"delegacion": "Álvaro Obregón",
							"poblacion": [
								[
									1820,
									24905000
								],
								[
									1821,
									25260000
								],
								[
									1822,
									25620000
								],
								[
									1823,
									25969000
								],
								[
									1824,
									26307000
								]
							],
							"delitos": [
								[
									1800,
									38.37
								],
								[
									1875,
									38.37
								],
								[
									1885,
									39.44
								],
								[
									1895,
									42.38
								],
								[
									1905,
									45.45
								]
							]
						}
					]
					);*/

				break;
			default: break;
		}
	}
});

$("#btnAdd").click(function(){
	$("#formDialog").modal("show");
});

$("#addRegistro").click(function(){
	var sColonia = $("#inputColonia").val();
	var sDelegacion = $("#inputDelegacion").val();
	var sDelito = $("#inputValor").val();
	var sPoblacion = $("#inputPoblacion").val();
	var sAnio = $("#inputAnio").val();
	if( sColonia != "" && sDelegacion != "" && sDelito != "" && sPoblacion != "" && sAnio != "" ){
		if( /^[[0-9]+$/i.test(sDelito) && /^[[0-9]+$/i.test(sPoblacion) && /^[[0-9]+$/i.test(sAnio) ){
			$("#elementos").append('<tr><td>'+sColonia+'</td><td>'+sDelegacion+'</td><td>'+sDelito+'</td><td>'+sPoblacion+'</td><td>'+sAnio+'</td><td><button onclick="fnDelRow(this)" class="btn btn-danger btn-xs">Eliminar</button></td></tr>');
			$("#inputColonia").val('');
			$("#inputDelegacion").val('');
			$("#inputValor").val('');
			$("#formDialog").modal("hide");
			$(".alert").alert('close');
		} else {
			$(".form-horizontal").before( fnAlerta( 'Los campos Delitos cometidos, Población y Año deben ser solo números' ) );
		}
	} else {
		$(".form-horizontal").before( fnAlerta( 'Debe llenar todos los campos' ) );
	}
});