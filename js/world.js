( function ( $, L, prettySize ) {
	var map, heat,
		heatOptions = {
			tileOpacity: 1,
			heatOpacity: 1,
			radius: 25,
			blur: 15
		};

	// Start at the beginning
	stageOne();

	function stageOne () {

		// Initialize the map
		map = L.map( 'map' ).setView( [0,0], 2 );
		L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: 'location-history-visualizer is open source and available <a href="https://github.com/theopolisme/location-history-visualizer">on GitHub</a>. Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.',
			maxZoom: 18,
			minZoom: 2
		} ).addTo( map );


		d3.json("js/Records.json", function(error, data) {
			// First, change tabs
			$( 'body' ).addClass( 'working' );
			$( '#intro' ).addClass( 'hidden' );
			$( '#working' ).removeClass( 'hidden' );
			$( '#message' ).removeClass( 'hidden' );
			if (error)
				throw error;

			// stageTwo( data );
			heat = L.heatLayer( [], heatOptions ).addTo( map );



			var locations = data.locations;
			var SCALAR_E7 = 0.0000001; // Since Google Takeout stores latlngs as integers
			var latlngs = [];
			for (var j = 0; j < locations.length; j++){
				var latitude = locations[j].latitudeE7 * SCALAR_E7,
					longitude = locations[j].longitudeE7 * SCALAR_E7;
				if ( latitude > 180 ) latitude = latitude - (2 ** 32) * SCALAR_E7;
				if ( longitude > 180 ) longitude = longitude - (2 ** 32) * SCALAR_E7;

				latlngs.push( [ latitude, longitude ] );
			}
			heat._latlngs = latlngs;
			stageTwo( latlngs.length );
		});



	}


	function stageTwo ( numberProcessed ) {

		$( 'body' ).addClass( 'map-active' );
		$( '#done' ).fadeOut();
		activateControls();

		function activateControls () {
			var $tileLayer = $( '.leaflet-tile-pane' ),
				$heatmapLayer = $( '.leaflet-heatmap-layer' ),
				originalHeatOptions = $.extend( {}, heatOptions ); // for reset

			// Update values of the dom elements
			function updateInputs () {
				var option;
				for ( option in heatOptions ) {
					if ( heatOptions.hasOwnProperty( option ) ) {
						document.getElementById( option ).value = heatOptions[option];
					}
				}
			}

			updateInputs();

			$( '.control' ).change( function () {
				switch ( this.id ) {
					case 'tileOpacity':
						$tileLayer.css( 'opacity', this.value );
						break;
					case 'heatOpacity':
						$heatmapLayer.css( 'opacity', this.value );
						break;
					default:
						heatOptions[ this.id ] = Number( this.value );
						heat.setOptions( heatOptions );
						break;
				}
			} );

			$( '#reset' ).click( function () {
				$.extend( heatOptions, originalHeatOptions );
				updateInputs();
				heat.setOptions( heatOptions );
				// Reset opacity too
				$heatmapLayer.css( 'opacity', originalHeatOptions.heatOpacity );
				$tileLayer.css( 'opacity', originalHeatOptions.tileOpacity );
			} );
			$( '#reset' ).click();
		}
	}



}( jQuery, L, prettySize ) );
