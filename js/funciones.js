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
	var aFinal = [];
	var tempJsonDelegaciones = {};
	$("#elementos tr").each(function(){
		var sInputColonia = $(this).find('td:eq(0)').text();
		var sInputDelegacion = $(this).find('td:eq(1)').text();
		var sInputDelitos = $(this).find('td:eq(2)').text();
		var sInputPoblacion = $(this).find('td:eq(3)').text();
		var sInputAnio = $(this).find('td:eq(4)').text();
		// Creo un json temporal agrupando las colonias en su delegación correspondiente
		var jColonia = { "name": sInputColonia, "anio": parseInt( sInputAnio ), "delitos": parseInt( sInputDelitos ), "poblacion": parseInt( sInputPoblacion ) };
		if( typeof tempJsonDelegaciones[ sInputDelegacion] == "undefined" ){
			tempJsonDelegaciones[ sInputDelegacion ] = { "colonias": []};
		}
		tempJsonDelegaciones[ sInputDelegacion ].colonias.push( jColonia );
	});
	// Agrupo los delitos, población y año según su colonia
	var fnGetPosColonia = function(ar, col, del){
		for(var j=0; j<ar.length; j++){
			var temp = ar[j];
			if(temp.colonia == col && temp.delegacion == del)
				return j;
		}
		return -1;
	};
	$.each(tempJsonDelegaciones, function(sDelegacion, oColonias){
		var aColonias = oColonias.colonias;
		for(var i=0; i<aColonias.length; i++){
			var colonia = aColonias[i];
			var posColonia = fnGetPosColonia( aFinal, colonia.name, sDelegacion );
			if( posColonia == -1 ){
				aFinal.push({colonia: colonia.name, delegacion: sDelegacion, poblacion: [[colonia.anio, colonia.poblacion]], delitos:[[colonia.anio, colonia.delitos]]});
			} else{
				aFinal[ posColonia ].poblacion.push([colonia.anio, colonia.poblacion]);
				aFinal[ posColonia ].delitos.push([colonia.anio, colonia.delitos]);
			}
		}
	});
	fnGraphTimeLine( aFinal, "#divLineaTiempo" );
}

$("#btnMapa").click(function(){
	var etop = $('#resultado').offset().top;
	$(window).scrollTop(etop);
	fnCargarMapa();
});

$("#btnGraficos").click(function(){
	d3.selectAll("svg > *").html('');
	$("#divCirculo").html('');
	$("#divWheel").html('');
	$("#divLineaTiempo").html('');
	fnGraficar();
	fnGraficarWheel();
	fnGeneraJsonDesdeTabla_lineaTiempo();
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