$(function() {
	mapboxgl.accessToken = "pk.eyJ1Ijoic3RhbmlzbGF2ZmVsZG1hbiIsImEiOiJjaW1qeDNzcWIwMHZpdmlrdWtzN25rM2V4In0.fHHjC9KgMpEuyayafUAVwA";
	var map = new mapboxgl.Map({
	    container: 'map',
	    style: "mapbox://styles/stanislavfeldman/cisdzostl00022wnvtg7rrrxs",
	    center: [10, 20],
	    zoom: 2,
	    minZoom: 2
	});

	var countries = [
		"Russia",
		"Malaysia",
		"USA",
		"Indonesia",
		"Philippines",
		"Cambodia",
		"Thailand",
		"Netherlands",
		"Spain",
		"China",
		"Vietnam",
		"France",
		"Bahamas",
		"Ukraine",
		"Cyprus",
		"Turkey",
		"Singapore",
		"Belarus",
		"Egypt",
		"Bulgaria",
		"Morocco",
		"Australia",
		"Myanmar",
		"India"
	];
	countries.sort();
	map.on('style.load', function () {
		var markers = [];
		
		function showPlaces(offset, callback) {
			var limit = 250;
			$.get("https://api.foursquare.com/v2/users/self/checkins?offset=" + offset + "&limit=" + limit + "&oauth_token=EWILCTFULERW3FO52ARKGOMK5MN1L2VTK4F0HDEKCHLJROD0&v=20160403", function( data ) {
				var places = _.reduce(data.response.checkins.items, function(results, item) {
					if (item && item.venue && item.venue.categories) {
						var categories = item.venue.categories;
						var icon = null;
						if(categories.length > 0)
							icon = categories[0].icon.prefix + "bg_32" + categories[0].icon.suffix
						var photo = null;
						var photoOriginal = null;
						if(item.photos.count > 0) {
							photo = item.photos.items[0].prefix + "cap300" + item.photos.items[0].suffix;
							photoOriginal = item.photos.items[0].prefix + "original" + item.photos.items[0].suffix;
						}
						var place = { 
							id: item.venue.id,
							name: item.venue.name, 
							location: item.venue.location,
							icon: icon,
							photo: photo,
							photoOriginal: photoOriginal,
							url: "https://foursquare.com/v/" + item.venue.id
						};
						results.push(place);
					}
					return results;
				}, []);
				for (var i = 0; i < places.length; ++i) {
					var place = places[i];
					var address = place.location.formattedAddress;
					var description = "";
					if(address)
						description = address[address.length-1];
					var popup = '<a href="' + place.url +'" target="_blank"><img class="icon" src="' + place.icon + '"></a><a href="' + place.url +'" target="_blank"><h4>' + place.name + '</h4></a><div>' + description + '</div>';
					if(place.photo)
						popup += '</div><a href="' + place.photoOriginal +'" target="_blank"><img class="photo" src="' + place.photo + '"></a>';
					markers.push({
		                "type": "Feature",
		                "geometry": {
		                    "type": "Point",
		                    "coordinates": [place.location.lng, place.location.lat]
		                },
		                "properties": {
		                	"id": place.id,
		                    "description": popup,
		                    "marker-symbol": "monument",
		                    "photo": place.photo
		                }
		            });
				}
				if(places.length > 0)
					showPlaces(offset + limit, callback);
				else {
					markers = _.uniq(markers, true, function(m) {
						return m.properties.photo ? null : m.properties.id
					});
					if(callback)
						callback();
				}
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

			geocoder.on('result', function(ev) {
		        map.flyTo({center: ev.result.center, zoom: 9});
		    });
		    geocoder.on('clear', function(ev) {
		        map.flyTo({center: [10, 20], zoom: 2});
		    });
		});
	});

	var countriesStr = _.reduce(countries, function(memo, country){ return memo + ", " + country; });
	var closed = true
	$("#countries").html("<b>" + countries.length + " countries</b><br>" + countriesStr);
	$("#countries").click(function() {
		$("#countries").html(closed ? "<b>" + countries.length + " countries</b><br>" + countriesStr : "<b>" + countries.length + " countries</b>");
		closed = !closed;
	});
});