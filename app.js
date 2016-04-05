$(function() {
	mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhbmlzbGF2ZmVsZG1hbiIsImEiOiJjaW1qeDNzcWIwMHZpdmlrdWtzN25rM2V4In0.fHHjC9KgMpEuyayafUAVwA';
	var map = new mapboxgl.Map({
	    container: 'map',
	    style: 'mapbox://styles/stanislavfeldman/cimkplo510022zpmcm7f1fkb3',
	    center: [10, 20],
	    zoom: 2,
	    minZoom: 2
	});

	var countries = ["Malaysia", "Russia", "United States", "Indonesia", "Philippines", "Cambodia", "Thailand", "Netherlands", "Spain", "China", "Vietnam", "France", "Bahamas", "Ukraine", "Cyprus", "Turkey", "Singapore", "Belarus", "Egypt", "Bulgaria", "Morocco"];
	countries.sort();
	map.on('style.load', function () {
		var markers = [];
		
		function showPlaces(offset, callback) {
			var limit = 250;
			$.get("https://api.foursquare.com/v2/users/self/checkins?offset=" + offset + "&limit=" + limit + "&oauth_token=EWILCTFULERW3FO52ARKGOMK5MN1L2VTK4F0HDEKCHLJROD0&v=20160403", function( data ) {
				places = _.map(data.response.checkins.items, function(item){
					var categories = item.venue.categories;
					var icon = null;
					if(categories.length > 0)
						icon = categories[0].icon.prefix + "44" + categories[0].icon.suffix
					return { 
						name: item.venue.name, 
						location: item.venue.location,
						icon: icon
					}; 
				});
				for (var i = 0; i < places.length; ++i) {
					var place = places[i];
					var address = place.location.formattedAddress;
					var description = "";
					if(address)
						description = address[address.length-1];
					markers.push({
		                "type": "Feature",
		                "geometry": {
		                    "type": "Point",
		                    "coordinates": [place.location.lng, place.location.lat]
		                },
		                "properties": {
		                    "description": '<h4>' + place.name + '</h4>' + description,
		                    "marker-symbol": "monument"
		                }
		            });
				}
				if(places.length > 0)
					showPlaces(offset + limit, callback);
				else if(callback)
					callback();
			});
		}

		showPlaces(0, function() {
			// adding markers
			map.addSource("markers", {
		        "type": "geojson",
		        "data": {
		            "type": "FeatureCollection",
		            "features": markers
		        }
		    });
			map.addLayer({
		        "id": "markers",
		        "type": "symbol",
		        "source": "markers",
		        "layout": {
		            "icon-image": "marker-15",
		            "icon-allow-overlap": true
		        }
		    });

			// popups
			var popup = new mapboxgl.Popup({
			    closeButton: false,
			    closeOnClick: false
			});
			map.on('mousemove', function(e) {
			    var features = map.queryRenderedFeatures(e.point, { layers: ['markers'] });
			    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
			    if (!features.length) {
			        popup.remove();
			        return;
			    }
			    var feature = features[0];
			    popup.setLngLat(feature.geometry.coordinates)
			        .setHTML(feature.properties.description)
			        .addTo(map);
			});

		    var geocoder = new mapboxgl.Geocoder();
			map.addControl(geocoder);

			addSearchPointLayer();
			geocoder.on('result', function(ev) {
		        map.getSource('single-point').setData(ev.result.geometry);
		        map.flyTo({center: ev.result.center, zoom: 9});
		    });
		    geocoder.on('clear', function(ev) {
		        map.removeSource('single-point');
		        addSearchPointLayer();
		        map.flyTo({center: [10, 20], zoom: 2});
		    });

		    function addSearchPointLayer() {
		    	map.addSource('single-point', {
			        "type": "geojson",
			        "data": {
			            "type": "FeatureCollection",
			            "features": []
			        }
			    });
				map.addLayer({
			        "id": "point",
			        "source": "single-point",
			        "type": "circle",
			        "paint": {
			            "circle-radius": 10,
			            "circle-color": "#007cbf"
			        }
			    });
		    }
		});
	});

	var countriesStr = _.reduce(countries, function(memo, country){ return memo + ", " + country; });
	$("#countries").html("Visited countries (" + countries.length + "):<br>" + countriesStr);
});