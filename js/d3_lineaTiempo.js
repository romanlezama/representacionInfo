function fnGraphTimeLine( data ){

	/**
	 * Encuentro el año menor y el mayor de todo el array para establecer los rangos del gráfico
	 */
	var minMaxArray = function( aData ){
		var iAnioMin, iAnioMax;
		for( var i=0; i<aData.length; i++ ){
			var iAnio = aData[i][0];
			iAnioMin = ( iAnioMin < iAnio ) ? iAnioMin : iAnio;
			iAnioMax = ( iAnioMax > iAnio ) ? iAnioMax : iAnio;
		}
		return {
			min: iAnioMin,
			max: iAnioMax
		};
	};

	var anioMinino, anioMaximo;
	for(var j=0; j<data.length; j++){
		var colonia = data[j];
		var oMinMaxDel = minMaxArray( colonia.delitos );
		var oMinMaxPob = minMaxArray( colonia.poblacion );
		var tempMin = ( oMinMaxDel.min < oMinMaxPob.min ) ? oMinMaxDel.min : oMinMaxPob.min;
		anioMinino = ( anioMinino < tempMin ) ? anioMinino : tempMin;
		var tempMax = ( oMinMaxDel.max > oMinMaxPob.max ) ? oMinMaxDel.max : oMinMaxPob.max;
		anioMaximo = ( anioMaximo > tempMax ) ? anioMaximo : tempMax;
	}

	/**
	 * Varios accesorios que especifican las cuatro dimensiones del dato a visualizar.
	 */
	function x( d ){ return d.anio; } // Devuelve el valor del año de un punto dado
	function y( d ){ return d.delitos; }
	function radius( d ){ return d.poblacion; }
	function key( d ){ return d.colonia; }
	function color( d ){ return d.delegacion; } // Devuelve la región para pintarla de un color

	/**
	 * Dimensiones del gráfico
	 */
	var margin = { top: 19.5, right: 19.5, bottom: 19.5, left: 39.5 },
		width = 960 - margin.right,
		height = 500 - margin.top - margin.bottom;

	/**
	 * Varias escalas. Estos dominios hacen suposiciones de datos, naturalmente.
	 */
	var xScale = d3.scale.linear().domain( [anioMinino, anioMaximo+5] ).range( [0, width] ),
		yScale = d3.scale.linear().domain( [10, 85] ).range( [height, 0] ),
		radiusScale = d3.scale.sqrt().domain( [0, 5e8] ).range( [0, 40] ),
		colorScale = d3.scale.category10();

	/**
	 * Los ejes X e Y
	 */
	var xAxis = d3.svg.axis().orient( "bottom" ).scale( xScale ).ticks( 12, d3.format( "d" ) ),
		yAxis = d3.svg.axis().scale( yScale ).orient( "left" );

	/** 
	 * Crear el contenedor SVG y establece el origen
	 */
	var svg = d3.select( "body" ).append( "svg" )
			.attr( "width", width + margin.left + margin.right )
			.attr( "height", height + margin.top + margin.bottom )
		.append( "g" )
			.attr( "transform", "translate( " + margin.left + ", " + margin.top + " )" );

	/**
	 * Agrega el eje de las X
	 */
	svg.append( "g" )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + height + ")" )
		.call( xAxis );

	/**
	 * Agrega el eje de las Y
	 */
	svg.append( "g" )
		.attr( "class", "y axis" )
		.call( yAxis );

	/**
	 * Agrega una etiqueta al eje X
	 */
	svg.append( "text" )
		.attr( "class", "x label" )
		.attr( "text-anchor", "end" )
		.attr( "x", width )
		.attr( "y", height - 6 )
		.text( "Años" );

	/**
	 * Agrega una etiqueta al eje de las Y
	 */
	svg.append( "text" )
		.attr( "class", "y label" )
		.attr( "text-anchor", "end" )
		.attr( "y", 6 )
		.attr( "dy", ".75em" )
		.attr( "transform", "rotate(-90)" )
		.text( "Delitos cometidos" );

	/**
	 * Agrega la etiqueta del año; el valor es establecido en la transición
	 */
	var label = svg.append( "text" )
		.attr( "class", "year label" )
		.attr( "text-anchor", "end" )
		.attr( "y", height - 24 )
		.attr( "x", width )
		.text( anioMinino );

	/** 
	 * Se cargan los datos del json
	 */
	// Una bisectriz desde muchos datos de naciones son escasamente definidos.
	var bisect = d3.bisector( function( d ){ return d[ 0 ]; } );
	// Se agrega un punto por nacion. Se inicializa los datos en anioMinino y se establecen los colores
	var dot = svg.append( "g" )
			.attr( "class", "dots" )
		.selectAll( ".dot" )
			.data( interpolateData( anioMinino ) )
		.enter().append( "circle" )
			.attr( "class", "dot" )
			.style( "fill", function( d ){ return colorScale( color( d ) ); } )
			.call( position )
			.sort( order );

	// Se agrega un título
	dot.append( "title" )
		.text( function(d){ 
			return d.colonia; 
		} );

	// Agregar una cubierta para la etiqueta del año
	var box = label.node().getBBox();
	var overlay = svg.append( "rect" )
		.attr( "class", "overlay" )
		.attr( "x", box.x )
		.attr( "y", box.y )
		.attr( "width", box.width )
		.attr( "height", box.height )
		.on( "mouseover", enableInteraction );

	// Inicia una transición que interpola los datos basados en el año
	svg.transition()
		.duration( 30000 )
		.ease( "linear" )
		.tween( "year", tweenYear )
		.each( "end", enableInteraction );

	// Posiciones de los puntos basado en los datos. Recibe un array con los círculos generados para cada punto.
	function position( dot ){
		dot .attr( "cx", function( d ){ return xScale( x(d) ); } )
			.attr( "cy", function( d ){ return yScale( y(d) ); } )
			.attr( "r", function( d ){ return radiusScale( radius(d) ); } );
	}

	// Define un orden de clasificación para que los puntos más pequeños se dibujen en la parte superior
	function order( a, b ){
		return radius( b ) - radius( a );
	} 

	// Después de que termina la transición, se podrá mover el mouse para cambiar el año
	function enableInteraction(){
		var yearScale = d3.scale.linear()
			.domain( [anioMinino, anioMaximo] )
			.range( [box.x + 10, box.x + box.width -10] )
			.clamp( true );
		// Cancelar la transición actual, si hay alguna
		svg.transition().duration( 0 );

		overlay
			.on( "mouseover", mouseover )
			.on( "mouseout", mouseout )
			.on( "mousemove", mousemove )
			.on( "touchmove", mousemove );

		function mouseover(){
			label.classed( "active", true );
		}

		function mouseout(){
			label.classed( "active", false );
		}

		function mousemove(){
			displayYear( yearScale.invert( d3.mouse( this )[0] ) );
		}
	}

	// Interpola el cuadro completo por la primera interpolación del año, y luego los datos.
	// Para los datos interpolados, los puntos y etiquetas son re-dibujados.
	function tweenYear(){
		var year = d3.interpolateNumber( anioMinino, anioMaximo );
		return function( t ){ displayYear( year(t) ); };
	}

	// Actualiza la pantalla para mostrar el año especificado
	function displayYear( year ){
		dot.data( interpolateData( year ), key ).call( position ).sort( order );
		label.text( Math.round( year ) );
	}

	// Interpola el conjunto de datos para un año dado
	function interpolateData( year ){
		return data.map( function( d ){
			// d contiene el json de cada posición en el arreglo 
			return {
				colonia: d.colonia,
				delegacion: d.delegacion,
				//income: interpolateValues( d.income, year ),
				anio: year,
				poblacion: interpolateValues( d.poblacion, year ),
				delitos: interpolateValues( d.delitos, year )
			};
		} );
	}

	// Encuentra ( y posiblemente interpola ) el valor de un año especificado
	function interpolateValues( values, year ){
		var i = bisect.left( values, year, 0, values.length - 1 ),
			a = values[ i ];
		if( i > 0 ){
			var b = values[ i-1 ],
				t = ( year - a[0] ) / ( b[0] - a[0] );
			return a[1] * (1-t) + b[1] * t;
		}
		return a[1];
	}
}

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