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
	console.log(JSON.stringify(jGeneral));
	return jGeneral;
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